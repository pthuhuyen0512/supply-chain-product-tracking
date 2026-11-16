import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import type { ContractTransactionResponse } from "ethers";
import { artifacts, config, network } from "hardhat";

// Opt in explicitly so ordinary correctness tests do not overwrite gas evidence.
const version = process.env.GAS_VERSION;
assert.ok(
  version === undefined || version === "before" || version === "after",
  "GAS_VERSION must be before or after",
);

const gasSuite = version === undefined ? describe.skip : describe;

gasSuite(`SupplyChain gas measurement: ${version ?? "set GAS_VERSION to run"}`, function () {
  it("records receipt gas for deployment and the complete product lifecycle", async function () {
    const contractName = version === "after" ? "SupplyChainV2" : "SupplyChain";
    const artifact = await artifacts.readArtifact(contractName);
    const buildInfoId = await artifacts.getBuildInfoId(contractName);
    assert.ok(buildInfoId, "Compile the selected contract before measuring gas");
    const buildInfoPath = await artifacts.getBuildInfoPath(buildInfoId);
    assert.ok(buildInfoPath);
    const buildInfo = JSON.parse(await readFile(buildInfoPath, "utf8"));
    const settings = buildInfo.input.settings;
    // This experiment compares contract code, not different compiler settings.
    assert.equal(buildInfo.solcVersion, "0.8.34", "Use the agreed Solidity version");
    assert.equal(settings.evmVersion, "paris", "Use EVM Paris for both runs");
    assert.notEqual(settings.optimizer?.enabled, true, "Use --build-profile default (optimizer off)");

    // A new simulated chain prevents existing Ganache products/roles affecting gas.
    const connection = await network.create();
    try {
      const { ethers, networkHelpers } = connection;
      const [admin, producer, distributor, retailer, customer] = await ethers.getSigners();
      // Keep timestamp calldata/log contents and lifecycle conditions reproducible.
      await networkHelpers.time.setNextBlockTimestamp(2_000_000_000);
      const rows: {
        operation: string;
        gasUsed: string;
        transactionHash: string;
        blockNumber: number;
      }[] = [];

      async function record(operation: string, tx: ContractTransactionResponse) {
        const receipt = await tx.wait();
        assert.ok(receipt, `${operation}: missing transaction receipt`);
        assert.equal(receipt.status, 1, `${operation}: failed transaction`);
        rows.push({
          operation,
          gasUsed: receipt.gasUsed.toString(),
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
        });
      }

      const deployed = await ethers.deployContract(contractName, [], admin);
      await deployed.waitForDeployment();
      const deploymentTx = deployed.deploymentTransaction();
      assert.ok(deploymentTx);
      await record("deploy", deploymentTx);

      // Both versions must preserve the successful-call ABI. Use its typed interface;
      // V2's error ABI is deliberately not used to assert V2 rejection behavior here.
      const contract = await ethers.getContractAt("SupplyChain", await deployed.getAddress(), admin);
      assert.equal(await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), admin.address), true);
      for (const [operation, role, account] of [
        ["grant_producer", await contract.PRODUCER_ROLE(), producer.address],
        ["grant_distributor", await contract.DISTRIBUTOR_ROLE(), distributor.address],
        ["grant_retailer", await contract.RETAILER_ROLE(), retailer.address],
        ["grant_customer", await contract.CUSTOMER_ROLE(), customer.address],
      ] as const) {
        await record(operation, await contract.grantRole(role, account));
        assert.equal(await contract.hasRole(role, account), true);
      }

      const input = { productId: "PRODUCT-001", name: "Sample Product", origin: "Sample Origin" };
      await record("create_product", await contract.connect(producer).createProduct(input.productId, input.name, input.origin));
      const created = await contract.getProduct(input.productId);
      assert.equal(created.name, input.name);
      assert.equal(created.origin, input.origin);
      assert.equal(created.exists, true);
      assert.equal(created.currentHolder, producer.address);
      assert.equal(created.stage, 1n);
      assert.equal((await contract.getHistory(input.productId)).length, 1);

      let stage = 1n;
      for (const [sender, receiver] of [
        [producer, distributor], [distributor, retailer], [retailer, customer],
      ] as const) {
        await record(`handover_${stage}`, await contract.connect(sender).handoverProduct(input.productId, receiver.address));
        stage++;
        const product = await contract.getProduct(input.productId);
        assert.equal(product.stage, stage);
        assert.equal(product.currentHolder, receiver.address);
        assert.equal(product.name, input.name);
        assert.equal(product.origin, input.origin);
        assert.equal(product.createdAt, created.createdAt);
        const history = await contract.getHistory(input.productId);
        assert.equal(history.length, Number(stage));
        const entry = history[history.length - 1];
        assert.equal(entry.from, sender.address);
        assert.equal(entry.to, receiver.address);
        assert.equal(entry.stage, stage);
        const block = await ethers.provider.getBlock(rows[rows.length - 1].blockNumber);
        assert.ok(block);
        assert.equal(entry.timestamp, BigInt(block.timestamp));
      }
      assert.equal(rows.length, 9);

      const sourcePath = resolve(config.paths.root, artifact.sourceName);
      const result = {
        measuredAt: new Date().toISOString(),
        version,
        contractName,
        sourceName: artifact.sourceName,
        sourceSha256: createHash("sha256").update(await readFile(sourcePath)).digest("hex"),
        buildInfoId,
        compiler: buildInfo.solcVersion,
        compilerLongVersion: buildInfo.solcLongVersion,
        compilerSettings: settings,
        network: "Isolated Hardhat simulated blockchain; not Ganache",
        chainId: (await ethers.provider.getNetwork()).chainId.toString(),
        rpcClient: await ethers.provider.send("web3_clientVersion", []),
        nodeVersion: process.version,
        contractAddress: await deployed.getAddress(),
        deployedBytecodeBytes: (artifact.deployedBytecode.length - 2) / 2,
        input,
        accounts: { admin: admin.address, producer: producer.address, distributor: distributor.address, retailer: retailer.address, customer: customer.address },
        initialState: "Fresh chain and contract; each participant role granted once; one new product",
        measurement: "Successful transaction receipt.gasUsed (gas units), not estimates or fees",
        measurements: rows,
      };
      const outputDirectory = resolve(config.paths.root, "docs", "gas", version!);
      await mkdir(outputDirectory, { recursive: true });
      await writeFile(resolve(outputDirectory, "gas.json"), JSON.stringify(result, null, 2) + "\n", "utf8");
      const csv = ["operation,gasUsed,transactionHash,blockNumber", ...rows.map((row) => `${row.operation},${row.gasUsed},${row.transactionHash},${row.blockNumber}`)].join("\n") + "\n";
      await writeFile(resolve(outputDirectory, "measurements.csv"), csv, "utf8");
      await writeFile(resolve(outputDirectory, "run.txt"), [
        `Contract: ${contractName}`, `Source SHA256: ${result.sourceSha256}`,
        `Compiler: ${buildInfo.solcLongVersion}; EVM: ${settings.evmVersion}; optimizer: disabled`,
        result.network, result.measurement, "", csv,
        "Lifecycle assertions: PASS. This measurement does not replace the full correctness test suite.",
      ].join("\n") + "\n", "utf8");
      console.table(rows.map(({ operation, gasUsed }) => ({ operation, gasUsed })));
      console.log(`Saved gas.json, measurements.csv and run.txt to ${outputDirectory}`);
    } finally {
      await connection.close();
    }
  });
});

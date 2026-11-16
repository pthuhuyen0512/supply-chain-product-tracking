import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Contract, FetchRequest, JsonRpcProvider, ZeroHash, getAddress } from "ethers";

const root = fileURLToPath(new URL("../", import.meta.url));
const futureId = "SupplyChainV2Module#SupplyChainV2";
const configPath = path.join(root, "frontend/src/config/deployment.local.json");

async function readJson(filename) {
  try {
    return JSON.parse(await fs.readFile(filename, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read valid JSON: ${filename}`, { cause: error });
  }
}

function checkArtifact(artifact, label) {
  if (artifact.contractName !== "SupplyChainV2" ||
      artifact.sourceName !== "contracts/SupplyChain_ver2.sol" ||
      !Array.isArray(artifact.abi) || artifact.abi.length === 0 ||
      !/^0x[0-9a-f]+$/i.test(artifact.deployedBytecode ?? "")) {
    throw new Error(`${label}: invalid SupplyChainV2 artifact; compile and deploy first.`);
  }
}

let provider;
try {
  // Resolve the project's actual Hardhat configuration instead of duplicating its RPC.
  process.chdir(root);
  const { default: hre } = await import("hardhat");
  const network = hre.config.networks.ganache;
  if (network?.type !== "http") throw new Error("Missing HTTP ganache network configuration.");
  const rpcUrl = await network.url.getUrl();
  const url = new URL(rpcUrl);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
      !["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Export only supports a local Ganache RPC without URL credentials.");
  }
  const request = new FetchRequest(rpcUrl);
  request.timeout = 5000;
  provider = new JsonRpcProvider(request, undefined, { batchMaxCount: 1 });
  const client = await provider.send("web3_clientVersion", []);
  if (typeof client !== "string" || !/ganache/i.test(client)) {
    throw new Error("Configured RPC is not a Ganache client.");
  }
  const chainId = BigInt(await provider.send("eth_chainId", [])).toString();
  const deploymentDir = path.join(hre.config.paths.ignition, "deployments", `chain-${chainId}`);
  const addresses = await readJson(path.join(deploymentDir, "deployed_addresses.json"));
  const contractAddress = getAddress(addresses[futureId]);
  const artifact = await readJson(path.join(root, "artifacts/contracts/SupplyChain_ver2.sol/SupplyChainV2.json"));
  const deployedArtifact = await readJson(path.join(deploymentDir, "artifacts", `${futureId}.json`));
  checkArtifact(artifact, "Current artifact");
  checkArtifact(deployedArtifact, "Ignition artifact");
  if (JSON.stringify(artifact.abi) !== JSON.stringify(deployedArtifact.abi) ||
      artifact.deployedBytecode.toLowerCase() !== deployedArtifact.deployedBytecode.toLowerCase()) {
    throw new Error("Current artifact differs from deployment. Check build profile/source and deploy before export.");
  }
  const code = await provider.getCode(contractAddress);
  if (code === "0x" || code.toLowerCase() !== deployedArtifact.deployedBytecode.toLowerCase()) {
    throw new Error("On-chain bytecode does not match Ignition artifact. Check workspace/journal; do not reset automatically.");
  }
  const journal = (await fs.readFile(path.join(deploymentDir, "journal.jsonl"), "utf8"))
    .trim().split(/\r?\n/).map((line) => JSON.parse(line));
  const init = journal.find((entry) => entry.type === "DEPLOYMENT_INITIALIZE");
  const execution = journal.find((entry) => entry.futureId === futureId &&
    entry.type === "DEPLOYMENT_EXECUTION_STATE_INITIALIZE");
  const confirmed = journal.findLast((entry) => entry.futureId === futureId &&
    entry.type === "TRANSACTION_CONFIRM" &&
    entry.receipt?.contractAddress?.toLowerCase() === contractAddress.toLowerCase());
  if (String(init?.chainId) !== chainId || !execution?.from || !confirmed?.hash) {
    throw new Error("Deployment journal lacks matching chain/deployer/confirmed deployment transaction.");
  }
  const receipt = await provider.getTransactionReceipt(confirmed.hash);
  const deployer = getAddress(execution.from);
  if (!receipt || receipt.status !== 1 || receipt.contractAddress !== contractAddress ||
      getAddress(receipt.from) !== deployer || receipt.blockHash !== confirmed.receipt.blockHash) {
    throw new Error("Deployment receipt does not match this chain and journal.");
  }
  const contract = new Contract(contractAddress, artifact.abi, provider);
  const adminRole = await contract.DEFAULT_ADMIN_ROLE();
  const deployerIsAdmin = await contract.hasRole(adminRole, deployer);
  if (adminRole !== ZeroHash || !deployerIsAdmin) {
    throw new Error("Deployer is not the current DEFAULT_ADMIN_ROLE holder.");
  }
  const output = { contractName: "SupplyChainV2", contractAddress, rpcUrl, chainId };
  // Validate every input before replacing generated files. Repeated exports are deterministic.
  const abiPath = path.join(root, "frontend/src/abi/SupplyChain.json");
  await fs.mkdir(path.dirname(abiPath), { recursive: true });
  await fs.mkdir(path.dirname(configPath), { recursive: true });
  await fs.writeFile(abiPath, JSON.stringify(artifact.abi, null, 2) + "\n", "utf8");
  await fs.writeFile(configPath, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(JSON.stringify({ ...output, client, deployer, adminRole, deployerIsAdmin,
    transactionHash: receipt.hash, blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(), bytecodeBytes: (code.length - 2) / 2,
    abiEntries: artifact.abi.length }, null, 2));
} catch (error) {
  console.error(`Export failed: ${error.message}`);
  if (error.cause) console.error(`Cause: ${error.cause.message}`);
  console.error("Existing generated files may be stale and are not validated by this failed run. Fix inputs and run npm.cmd run export:frontend successfully before using them.");
  process.exitCode = 1;
} finally {
  provider?.destroy();
}

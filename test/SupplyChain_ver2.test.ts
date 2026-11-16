import assert from "node:assert/strict";
import { expect } from "chai";
import { network } from "hardhat";

// Isolated Hardhat network: no Ganache, MetaMask or private keys required.
const { ethers, networkHelpers } = await network.create();

const ID = "COFFEE-001";
const NAME = "Arabica Da Lat";
const ORIGIN = "Da Lat, Viet Nam";
const KEY = ethers.id(ID);
const Stage = { None: 0n, Produced: 1n, AtDistributor: 2n, AtRetailer: 3n, Delivered: 4n };

// Convert ethers tuple results into plain nested arrays for value comparison.
function plain(value: unknown): unknown {
  return Array.isArray(value) ? Array.from(value, plain) : value;
}

async function deployFixture() {
  const [admin, producer, distributor, retailer, customer, outsider] = await ethers.getSigners();
  const supplyChain = await ethers.deployContract("SupplyChainV2");
  await supplyChain.waitForDeployment();
  const roles = {
    admin: await supplyChain.DEFAULT_ADMIN_ROLE(),
    producer: await supplyChain.PRODUCER_ROLE(),
    distributor: await supplyChain.DISTRIBUTOR_ROLE(),
    retailer: await supplyChain.RETAILER_ROLE(),
    customer: await supplyChain.CUSTOMER_ROLE(),
  };
  for (const [role, account] of [
    [roles.producer, producer.address],
    [roles.distributor, distributor.address],
    [roles.retailer, retailer.address],
    [roles.customer, customer.address],
  ]) {
    await (await supplyChain.grantRole(role, account)).wait();
  }
  return { supplyChain, admin, producer, distributor, retailer, customer, outsider, roles };
}

async function productFixture() {
  const context = await deployFixture();
  await (await context.supplyChain.connect(context.producer).createProduct(ID, NAME, ORIGIN)).wait();
  return context;
}

describe("SupplyChainV2", function () {
  describe("Role registration and access control", function () {
    it("assigns the deployer as admin without granting producer privileges", async function () {
      const { supplyChain, admin, roles } = await networkHelpers.loadFixture(deployFixture);
      assert.equal(await supplyChain.hasRole(roles.admin, admin.address), true);
      assert.equal(await supplyChain.hasRole(roles.producer, admin.address), false);
      for (const role of Object.values(roles)) {
        assert.equal(await supplyChain.getRoleAdmin(role), roles.admin);
      }
      const events = await supplyChain.queryFilter(supplyChain.filters.RoleGranted(roles.admin));
      assert.equal(events.length, 1);
      assert.equal(events[0].args.account, admin.address);
      assert.equal(events[0].args.sender, admin.address);
    });

    for (const roleName of ["producer", "distributor", "retailer", "customer"] as const) {
      it(`allows admin to grant and revoke ${roleName}, emitting correct events`, async function () {
        const { supplyChain, admin, outsider, roles } = await networkHelpers.loadFixture(deployFixture);
        const role = roles[roleName];
        await expect(supplyChain.grantRole(role, outsider.address))
          .to.emit(supplyChain, "RoleGranted").withArgs(role, outsider.address, admin.address);
        assert.equal(await supplyChain.hasRole(role, outsider.address), true);
        await expect(supplyChain.revokeRole(role, outsider.address))
          .to.emit(supplyChain, "RoleRevoked").withArgs(role, outsider.address, admin.address);
        assert.equal(await supplyChain.hasRole(role, outsider.address), false);
      });
    }

    it("rejects role grants and revocations by a non-admin", async function () {
      const { supplyChain, outsider, producer, roles } = await networkHelpers.loadFixture(deployFixture);
      await expect(supplyChain.connect(outsider).grantRole(roles.producer, outsider.address))
        .to.be.revertedWithCustomError(supplyChain, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, roles.admin);
      await expect(supplyChain.connect(outsider).revokeRole(roles.producer, producer.address))
        .to.be.revertedWithCustomError(supplyChain, "AccessControlUnauthorizedAccount")
        .withArgs(outsider.address, roles.admin);
      assert.equal(await supplyChain.hasRole(roles.producer, outsider.address), false);
      assert.equal(await supplyChain.hasRole(roles.producer, producer.address), true);
    });

    it("rejects registration of the zero address and unknown roles", async function () {
      const { supplyChain, outsider, roles } = await networkHelpers.loadFixture(deployFixture);
      await expect(supplyChain.grantRole(roles.producer, ethers.ZeroAddress))
        .to.be.revertedWithCustomError(supplyChain, "InvalidAccount");
      await expect(supplyChain.grantRole(ethers.id("UNKNOWN_ROLE"), outsider.address))
        .to.be.revertedWithCustomError(supplyChain, "InvalidRole");
    });
  });

  describe("Product creation and public lookup", function () {
    it("stores product data and creation history with the actual block timestamp", async function () {
      const { supplyChain, producer, outsider } = await networkHelpers.loadFixture(deployFixture);
      const timestamp = BigInt(await networkHelpers.time.latest()) + 60n;
      await networkHelpers.time.setNextBlockTimestamp(timestamp);
      await expect(supplyChain.connect(producer).createProduct(ID, NAME, ORIGIN))
        .to.emit(supplyChain, "ProductCreated").withArgs(KEY, ID, producer.address, timestamp);
      const product = await supplyChain.connect(outsider).getProduct(ID);
      assert.equal(product.name, NAME);
      assert.equal(product.origin, ORIGIN);
      assert.equal(product.currentHolder, producer.address);
      assert.equal(product.stage, Stage.Produced);
      assert.equal(product.createdAt, timestamp);
      assert.equal(product.exists, true);
      const history = await supplyChain.connect(outsider).getHistory(ID);
      assert.equal(history.length, 1);
      assert.deepEqual(Array.from(history[0]), [ethers.ZeroAddress, producer.address, timestamp, Stage.Produced]);
    });

    it("rejects creation by an unregistered account and admin without producer role", async function () {
      const { supplyChain, outsider, admin, roles } = await networkHelpers.loadFixture(deployFixture);
      for (const account of [outsider, admin]) {
        await expect(supplyChain.connect(account).createProduct(ID, NAME, ORIGIN))
          .to.be.revertedWithCustomError(supplyChain, "AccessControlUnauthorizedAccount")
          .withArgs(account.address, roles.producer);
      }
      assert.equal((await supplyChain.getProduct(ID)).exists, false);
      assert.equal((await supplyChain.getHistory(ID)).length, 0);
    });

    for (const [label, id, name, origin, error] of [
      ["ID", "", NAME, ORIGIN, "EmptyProductId"],
      ["name", ID, "", ORIGIN, "EmptyName"],
      ["origin", ID, NAME, "", "EmptyOrigin"],
    ]) {
      it(`rejects an empty product ${label}`, async function () {
        const { supplyChain, producer } = await networkHelpers.loadFixture(deployFixture);
        await expect(supplyChain.connect(producer).createProduct(id, name, origin))
          .to.be.revertedWithCustomError(supplyChain, error);
        assert.equal((await supplyChain.getProduct(id)).exists, false);
        assert.equal((await supplyChain.getHistory(id)).length, 0);
      });
    }

    it("rejects duplicate IDs without overwriting product data or history", async function () {
      const { supplyChain, producer } = await networkHelpers.loadFixture(productFixture);
      const before = await supplyChain.getProduct(ID);
      const history = await supplyChain.getHistory(ID);
      await expect(supplyChain.connect(producer).createProduct(ID, "Replacement", "Other origin"))
        .to.be.revertedWithCustomError(supplyChain, "ProductExists");
      assert.deepEqual(plain(await supplyChain.getProduct(ID)), plain(before));
      assert.deepEqual(plain(await supplyChain.getHistory(ID)), plain(history));
    });

    it("returns absent product data and empty history for an unknown ID", async function () {
      const { supplyChain, outsider } = await networkHelpers.loadFixture(deployFixture);
      const product = await supplyChain.connect(outsider).getProduct("UNKNOWN");
      assert.deepEqual(Array.from(product), ["", "", ethers.ZeroAddress, Stage.None, 0n, false]);
      assert.equal((await supplyChain.connect(outsider).getHistory("UNKNOWN")).length, 0);
    });

    it("keeps products and their histories independent", async function () {
      const { supplyChain, producer, distributor } = await networkHelpers.loadFixture(productFixture);
      await supplyChain.connect(producer).createProduct("COFFEE-002", "Robusta", "Dak Lak");
      const second = await supplyChain.getProduct("COFFEE-002");
      const secondHistory = await supplyChain.getHistory("COFFEE-002");
      await supplyChain.connect(producer).handoverProduct(ID, distributor.address);
      assert.deepEqual(plain(await supplyChain.getProduct("COFFEE-002")), plain(second));
      assert.deepEqual(plain(await supplyChain.getHistory("COFFEE-002")), plain(secondHistory));
      assert.equal((await supplyChain.getProduct(ID)).stage, Stage.AtDistributor);
    });
  });

  describe("Handover and complete supply chain history", function () {
    it("tracks all three handovers, exact events, timestamps and public history", async function () {
      const { supplyChain, producer, distributor, retailer, customer, outsider } =
        await networkHelpers.loadFixture(productFixture);
      const created = await supplyChain.getProduct(ID);
      const expectedHistory = [[ethers.ZeroAddress, producer.address, created.createdAt, Stage.Produced]];
      for (const [sender, receiver, stage] of [
        [producer, distributor, Stage.AtDistributor],
        [distributor, retailer, Stage.AtRetailer],
        [retailer, customer, Stage.Delivered],
      ] as const) {
        const timestamp = BigInt(await networkHelpers.time.latest()) + 60n;
        await networkHelpers.time.setNextBlockTimestamp(timestamp);
        await expect(supplyChain.connect(sender).handoverProduct(ID, receiver.address))
          .to.emit(supplyChain, "ProductTransferred")
          .withArgs(KEY, sender.address, receiver.address, stage, timestamp);
        const product = await supplyChain.connect(outsider).getProduct(ID);
        assert.equal(product.currentHolder, receiver.address);
        assert.equal(product.stage, stage);
        assert.equal(product.name, NAME);
        assert.equal(product.origin, ORIGIN);
        assert.equal(product.createdAt, created.createdAt);
        assert.equal(product.exists, true);
        expectedHistory.push([sender.address, receiver.address, timestamp, stage]);
        const history = await supplyChain.connect(outsider).getHistory(ID);
        assert.deepEqual(history.map((entry) => Array.from(entry)), expectedHistory);
      }
    });

    it("rejects handover of a nonexistent product", async function () {
      const { supplyChain, producer, distributor } = await networkHelpers.loadFixture(deployFixture);
      await expect(supplyChain.connect(producer).handoverProduct(ID, distributor.address))
        .to.be.revertedWithCustomError(supplyChain, "ProductNotFound");
    });

    it("rejects an unregistered sender and a registered non-holder", async function () {
      const { supplyChain, outsider, retailer, distributor } = await networkHelpers.loadFixture(productFixture);
      for (const sender of [outsider, retailer]) {
        await expect(supplyChain.connect(sender).handoverProduct(ID, distributor.address))
          .to.be.revertedWithCustomError(supplyChain, "NotCurrentHolder");
      }
    });

    it("rejects the zero address and self-transfer even with multiple roles", async function () {
      const { supplyChain, producer, roles } = await networkHelpers.loadFixture(productFixture);
      await expect(supplyChain.connect(producer).handoverProduct(ID, ethers.ZeroAddress))
        .to.be.revertedWithCustomError(supplyChain, "InvalidReceiver");
      await supplyChain.grantRole(roles.distributor, producer.address);
      await expect(supplyChain.connect(producer).handoverProduct(ID, producer.address))
        .to.be.revertedWithCustomError(supplyChain, "CannotTransferToSelf");
    });

    // Check each stage independently, including a sender whose role was revoked.
    for (const step of [0, 1, 2]) {
      it(`rejects wrong or unregistered receivers at handover ${step + 1}, preserving state`, async function () {
        const { supplyChain, producer, distributor, retailer, customer, outsider } =
          await networkHelpers.loadFixture(productFixture);
        const senders = [producer, distributor, retailer];
        const receivers = [distributor, retailer, customer];
        for (let i = 0; i < step; i++) {
          await supplyChain.connect(senders[i]).handoverProduct(ID, receivers[i].address);
        }
        const before = await supplyChain.getProduct(ID);
        const history = await supplyChain.getHistory(ID);
        const wrongReceiver = step === 0 ? retailer : producer;
        for (const receiver of [wrongReceiver, outsider]) {
          await expect(supplyChain.connect(senders[step]).handoverProduct(ID, receiver.address))
            .to.be.revertedWithCustomError(supplyChain, ["NotDistributor", "NotRetailer", "NotCustomer"][step]);
          assert.deepEqual(plain(await supplyChain.getProduct(ID)), plain(before));
          assert.deepEqual(plain(await supplyChain.getHistory(ID)), plain(history));
        }
      });

      it(`blocks a revoked sender at handover ${step + 1} until the role is restored`, async function () {
        const { supplyChain, producer, distributor, retailer, customer, roles } =
          await networkHelpers.loadFixture(productFixture);
        const senders = [producer, distributor, retailer];
        const receivers = [distributor, retailer, customer];
        const senderRoles = [roles.producer, roles.distributor, roles.retailer];
        for (let i = 0; i < step; i++) {
          await supplyChain.connect(senders[i]).handoverProduct(ID, receivers[i].address);
        }
        await supplyChain.revokeRole(senderRoles[step], senders[step].address);
        const before = await supplyChain.getProduct(ID);
        const history = await supplyChain.getHistory(ID);
        await expect(supplyChain.connect(senders[step]).handoverProduct(ID, receivers[step].address))
          .to.be.revertedWithCustomError(supplyChain, "AccessControlUnauthorizedAccount")
          .withArgs(senders[step].address, senderRoles[step]);
        assert.deepEqual(plain(await supplyChain.getProduct(ID)), plain(before));
        assert.deepEqual(plain(await supplyChain.getHistory(ID)), plain(history));
        await supplyChain.grantRole(senderRoles[step], senders[step].address);
        await supplyChain.connect(senders[step]).handoverProduct(ID, receivers[step].address);
        assert.equal((await supplyChain.getProduct(ID)).currentHolder, receivers[step].address);
      });
    }

    it("removes the previous holder's ability to transfer after a successful handover", async function () {
      const { supplyChain, producer, distributor, retailer } = await networkHelpers.loadFixture(productFixture);
      await supplyChain.connect(producer).handoverProduct(ID, distributor.address);
      await expect(supplyChain.connect(producer).handoverProduct(ID, retailer.address))
        .to.be.revertedWithCustomError(supplyChain, "NotCurrentHolder");
      assert.equal((await supplyChain.getProduct(ID)).currentHolder, distributor.address);
      assert.equal((await supplyChain.getHistory(ID)).length, 2);
    });

    it("prevents further handovers after customer delivery, even to a registered receiver", async function () {
      const { supplyChain, producer, distributor, retailer, customer } =
        await networkHelpers.loadFixture(productFixture);
      await supplyChain.connect(producer).handoverProduct(ID, distributor.address);
      await supplyChain.connect(distributor).handoverProduct(ID, retailer.address);
      await supplyChain.connect(retailer).handoverProduct(ID, customer.address);
      const before = await supplyChain.getProduct(ID);
      const history = await supplyChain.getHistory(ID);
      await expect(supplyChain.connect(customer).handoverProduct(ID, distributor.address))
        .to.be.revertedWithCustomError(supplyChain, "AlreadyDelivered");
      assert.deepEqual(plain(await supplyChain.getProduct(ID)), plain(before));
      assert.deepEqual(plain(await supplyChain.getHistory(ID)), plain(history));
      assert.equal(history.length, 4);
    });
  });
});

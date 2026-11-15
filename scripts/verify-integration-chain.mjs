// Read-only Ganache assertions, receipt/event audit and eth_call negative checks.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Contract, FetchRequest, JsonRpcProvider, id, ZeroAddress } from 'ethers';
const root = path.resolve(import.meta.dirname, '..');
const read = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const config = await read('frontend/src/config/deployment.local.json');
assert(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(config.rpcUrl).hostname));
const req = new FetchRequest(config.rpcUrl); req.timeout = 5000;
const provider = new JsonRpcProvider(req, undefined, { cacheTimeout: -1, batchMaxCount: 1 });
const contract = new Contract(config.contractAddress, await read('frontend/src/abi/SupplyChain.json'), provider);
const plain = value => JSON.parse(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v));
const same = (a, b) => assert.equal(a.toLowerCase(), b.toLowerCase());
try {
  const client = await provider.send('web3_clientVersion', []); assert.match(client, /Ganache/i);
  assert.equal((await provider.getNetwork()).chainId.toString(), config.chainId);
  assert.notEqual(await provider.getCode(config.contractAddress), '0x');
  const accounts = (await provider.send('eth_accounts', [])).slice(0, 5);
  const [admin, producer, distributor, retailer, customer] = accounts;
  const getters = ['DEFAULT_ADMIN_ROLE', 'PRODUCER_ROLE', 'DISTRIBUTOR_ROLE', 'RETAILER_ROLE', 'CUSTOMER_ROLE'];
  const roles = await Promise.all(getters.map(async (getter, i) => ({ role: getter, address: accounts[i], granted: await contract.hasRole(await contract[getter](), accounts[i]) })));
  assert(roles.every(r => r.granted));
  const roleReceipts = await read('docs/verification/wallet-role-receipts.json');
  for (const saved of roleReceipts) {
    const receipt = await provider.getTransactionReceipt(saved.transactionHash);
    assert.equal(receipt.status, 1); assert.equal(receipt.blockNumber, saved.block);
    assert.equal(receipt.gasUsed.toString(), saved.gasUsed); same(receipt.to, config.contractAddress); same(receipt.from, admin);
    const event = receipt.logs.map(l => { try { return contract.interface.parseLog(l); } catch { return null; } }).find(e => e?.name === 'RoleGranted');
    assert(event); same(event.args.account, saved.account);
    same(event.args.role, await contract[`${saved.role.toUpperCase()}_ROLE`]()); same(event.args.sender, admin);
  }
  const block = await provider.getBlockNumber();
  const productId = (process.argv[2] ?? 'COFFEE-DEMO-001').trim();
  const snapshot = async () => plain({ product: await contract.getProduct(productId), history: await contract.getHistory(productId) });
  const before = await snapshot();
  const product = await contract.getProduct(productId), history = await contract.getHistory(productId);
  assert(product.exists, `Product ${productId} does not yet exist`);
  const events = [...await contract.queryFilter(contract.filters.ProductCreated(id(productId)), 0, block), ...await contract.queryFilter(contract.filters.ProductTransferred(id(productId)), 0, block)].sort((a,b) => a.blockNumber-b.blockNumber || a.index-b.index);
  assert.equal(events.length, history.length);
  const receipts = [];
  for (const [i, event] of events.entries()) {
    const receipt = await provider.getTransactionReceipt(event.transactionHash);
    const mined = await provider.getBlock(receipt.blockNumber);
    const tx = await provider.getTransaction(event.transactionHash);
    assert.equal(receipt.status, 1); same(receipt.to, config.contractAddress);
    assert.equal(BigInt(mined.timestamp), history[i].timestamp);
    assert.equal(event.args.timestamp, history[i].timestamp);
    assert.equal(history[i].stage, BigInt(i+1));
    same(history[i].to, accounts[i+1]); same(history[i].from, i ? accounts[i] : ZeroAddress);
    if (i === 0) {
      assert.equal(event.args.productId, productId); same(event.args.producer, producer);
      assert.equal(product.createdAt, history[0].timestamp); same(receipt.from, producer);
      const decoded = contract.interface.parseTransaction(tx);
      assert.equal(decoded.name, 'createProduct'); assert.equal(decoded.args[0], productId);
      assert.equal(decoded.args[1], product.name); assert.equal(decoded.args[2], product.origin);
    } else {
      same(event.args.from, history[i].from); same(event.args.to, history[i].to);
      same(receipt.from, history[i].from); assert.equal(BigInt(event.args.stage), history[i].stage);
    }
    receipts.push({ event: event.eventName, hash: event.transactionHash, block: receipt.blockNumber, status: receipt.status, gasUsed: receipt.gasUsed.toString(), timestamp: mined.timestamp });
  }
  const negatives = [];
  async function reject(label, action, pattern) {
    let reason;
    try { await action(); } catch (error) { reason = error.reason || error.shortMessage || error.message; }
    assert(reason && pattern.test(reason), `${label}: unexpected result ${reason}`);
    assert.deepEqual(await snapshot(), before);
    negatives.push({ label, method: 'eth_call staticCall; no transaction', reason, stateUnchanged: true });
  }
  await reject('Duplicate product ID', () => contract.createProduct.staticCall(productId, 'Duplicate', 'Da Lat', { from: producer }), /Product exists/);
  await reject('Non-holder handover', () => contract.handoverProduct.staticCall(productId, distributor, { from: admin }), /Not current holder/);
  await reject('Admin without Producer role', () => contract.createProduct.staticCall('STEP08-UNAUTHORIZED', 'Coffee', 'Da Lat', { from: admin }), /AccessControlUnauthorizedAccount/);
  if (Number(product.stage) === 4) await reject('Handover after Delivered', () => contract.handoverProduct.staticCall(productId, retailer, { from: customer }), /Already delivered/);
  const unknownId = `STEP08-UNKNOWN-${block}`;
  assert.equal((await contract.getProduct(unknownId)).exists, false); assert.equal((await contract.getHistory(unknownId)).length, 0);
  assert.deepEqual(await snapshot(), before);
  assert.equal(await provider.getBlockNumber(), block, 'Chain changed during read-only verification; rerun without concurrent transactions');
  let suggestedProductId;
  for (let n = 1; n <= 100; n++) {
    const candidate = `STEP08-DEMO-${String(n).padStart(3, '0')}`;
    if (!(await contract.getProduct(candidate)).exists) { suggestedProductId = candidate; break; }
  }
  assert(suggestedProductId, 'Select an unused integration ID before manual testing');
  const rejectedProductExists = (await contract.getProduct('STEP08-REJECT-001')).exists;
  const report = { checkedAt: new Date().toISOString(), client, config, block, productId, roles, product: { name: product.name, origin: product.origin, holder: product.currentHolder, stage: Number(product.stage), createdAt: product.createdAt.toString() }, history: plain(history), receipts, negatives, fullFlow: Number(product.stage) === 4 && history.length === 4 && events.length === 4, unknownId, suggestedProductId, rejectedProductExists, noTransactionsBroadcast: true };
  const output = process.argv[2] ? 'integration-chain-replay.json' : 'integration-chain.json';
  await fs.writeFile(path.join(root, 'docs/verification', output), JSON.stringify(report, null, 2)+'\n');
  console.log(JSON.stringify(report, null, 2));
} finally { provider.destroy(); }

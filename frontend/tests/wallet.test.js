import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { WalletSession, ROLE_GETTERS, handoverPermission, readableError, requiredText, walletAddress } from '../src/services/wallet.js';
import { contractInterface } from '../src/services/blockchain.js';

const A = '0x1111111111111111111111111111111111111111';
const B = '0x2222222222222222222222222222222222222222';
const C = '0x3333333333333333333333333333333333333333';
const CONFIG = { rpcUrl: 'http://127.0.0.1:7545', chainId: '1337', contractAddress: C };
const IDS = Object.fromEntries(Object.keys(ROLE_GETTERS).map((role, i) => [role, '0x' + i.toString(16).padStart(64, '0')]));
const tick = () => new Promise((resolve) => setImmediate(resolve));
function fixture(roleNames = ['Admin']) {
  const eth = new EventEmitter();
  const requests = [], writes = [];
  eth.accounts = [A]; eth.chain = '0x539'; eth.code = '0x6000';
  eth.request = async ({ method, params }) => {
    requests.push(method);
    if (['eth_accounts', 'eth_requestAccounts'].includes(method)) return eth.accounts;
    if (method === 'eth_chainId') return eth.chain;
    if (method === 'eth_getCode') return eth.code;
    if (method === 'wallet_switchEthereumChain') { eth.chain = params[0].chainId; eth.emit('chainChanged', eth.chain); return null; }
    throw new Error('Unexpected test RPC: ' + method);
  };
  const reader = { ...Object.fromEntries(Object.entries(ROLE_GETTERS).map(([name, getter]) => [getter, async () => IDS[name]])),
    hasRole: async (role) => roleNames.some((name) => IDS[name] === role),
    getProduct: async () => ({ exists: true, stage: 1n, currentHolder: A }),
  };
  const readProvider = { getCode: async () => '0x6000', getNetwork: async () => ({ chainId: 1337n }), getTransactionReceipt: async () => null, destroy() {} };
  let wait = async () => ({ status: 1, hash: '0xabc', gasUsed: 12345n, blockNumber: 2 });
  const session = new WalletSession(CONFIG, { ethereum: eth, reader, readProvider,
    makeBrowser: () => ({ getSigner: async (address) => ({ address }), destroy() {} }),
    makeWriter: (signer) => Object.fromEntries(['grantRole', 'createProduct', 'handoverProduct'].map((method) => {
      const fn = async (...args) => { writes.push({ method, args, from: signer.address }); return { hash: '0xabc', wait: (...params) => wait(...params) }; };
      fn.staticCall = async () => {};
      return [method, fn];
    })),
  });
  return { session, eth, reader, requests, writes, setWait: (callback) => { wait = callback; } };
}

test('input validation trims text and rejects empty/zero/invalid addresses', () => {
  assert.equal(requiredText(' COFFEE-001 ', 'Product ID'), 'COFFEE-001');
  assert.throws(() => requiredText('  ', 'Origin'), /Origin is required/);
  assert.equal(walletAddress(` ${B} `), B);
  for (const input of ['', '0x123', '0x0000000000000000000000000000000000000000']) assert.throws(() => walletAddress(input));
});
test('Admin is not automatically Producer; grants use actual bytes32 getters', async () => {
  const f = fixture(); await f.session.connect();
  assert.deepEqual(f.session.state.roles, ['Admin']);
  await assert.rejects(f.session.transact('createProduct', { productId: 'P', name: 'N', origin: 'O' }), /Producer role/);
  assert.equal(f.writes.length, 0);
  const receipt = await f.session.transact('grantRole', { role: 'PRODUCER_ROLE', account: ` ${B} ` });
  assert.equal(f.writes[0].args[0], IDS.Producer);
  assert.equal(receipt.gasUsed, '12345');
  await assert.rejects(f.session.transact('grantRole', { role: 'DEFAULT_ADMIN_ROLE', account: B }), /supported participant role/);
  f.session.destroy();
});
test('multiple roles are supported and creation arguments are trimmed', async () => {
  const f = fixture(['Admin', 'Producer']); await f.session.connect();
  assert.deepEqual(f.session.state.roles, ['Admin', 'Producer']);
  await f.session.transact('createProduct', { productId: ' P ', name: ' N ', origin: ' O ' });
  assert.deepEqual(f.writes[0].args, ['P', 'N', 'O']); f.session.destroy();
});
test('role revocation after connection is rechecked before requesting a signature', async () => {
  const f = fixture(['Producer']); await f.session.connect();
  f.reader.hasRole = async () => false;
  await assert.rejects(f.session.transact('createProduct', { productId: 'P', name: 'N', origin: 'O' }), /Producer role/);
  assert.equal(f.writes.length, 0); f.session.destroy();
});
test('account and network events invalidate the writer synchronously; no automatic permission request', async () => {
  const f = fixture(); await f.session.connect(); const old = f.session.writer;
  f.eth.accounts = [B]; f.eth.emit('accountsChanged', [B]);
  assert.equal(f.session.writer, null);
  await tick(); await tick();
  assert.equal(f.session.state.address, B); assert.notEqual(f.session.writer, old);
  f.eth.chain = '0x1'; f.eth.emit('chainChanged', '0x1'); assert.equal(f.session.writer, null);
  await tick(); assert.equal(f.session.state.status, 'wrong-network');
  await f.session.switchNetwork(); assert.equal(f.session.state.status, 'ready');
  f.eth.accounts = []; f.eth.emit('accountsChanged', []); await tick();
  assert.equal(f.session.writer, null); assert.equal(f.session.state.status, 'disconnected');
  f.eth.accounts = [A]; f.eth.emit('accountsChanged', [A]); await tick();
  assert.equal(f.requests.filter((m) => m === 'eth_requestAccounts').length, 1);
  assert.equal(f.session.writer, null); f.session.destroy();
});
test('a slow stale role response cannot overwrite the newly selected account', async () => {
  const f = fixture(); await f.session.connect();
  let release; const gate = new Promise((resolve) => { release = resolve; });
  f.reader.hasRole = async (_id, address) => { if (address === A) await gate; return true; };
  const oldSync = f.session.sync(); await tick();
  f.eth.accounts = [B]; f.eth.emit('accountsChanged', [B]); await tick(); await tick();
  assert.equal(f.session.state.address, B);
  release(); await oldSync; assert.equal(f.session.state.address, B); f.session.destroy();
});
test('wrong MetaMask RPC or an account change without an event cannot send a transaction', async () => {
  const f = fixture(); await f.session.connect(); f.eth.code = '0x';
  await assert.rejects(f.session.transact('grantRole', { role: 'PRODUCER_ROLE', account: B }), /same contract/);
  assert.equal(f.writes.length, 0);
  f.eth.code = '0x6000'; await f.session.connect(); f.eth.accounts = [B];
  await assert.rejects(f.session.transact('grantRole', { role: 'PRODUCER_ROLE', account: C }), /account or network changed/);
  assert.equal(f.writes.length, 0); f.session.destroy();
});
test('handover requires holder, active sender role, next recipient role and a different address', async () => {
  assert.match(handoverPermission({ exists: true, stage: 1n, currentHolder: A }, B, ['Producer']), /current holder/);
  assert.match(handoverPermission({ exists: true, stage: 1n, currentHolder: A }, A, []), /Producer/);
  assert.match(handoverPermission({ exists: true, stage: 4n, currentHolder: A }, A, ['Customer']), /delivered/);
  const f = fixture(['Producer']); await f.session.connect();
  await assert.rejects(f.session.transact('handoverProduct', { productId: 'P', receiver: A }), /yourself/);
  await assert.rejects(f.session.transact('handoverProduct', { productId: 'P', receiver: B }), /Distributor role/);
  f.reader.hasRole = async (id) => [IDS.Producer, IDS.Distributor].includes(id);
  await f.session.transact('handoverProduct', { productId: ' P ', receiver: B });
  assert.deepEqual(f.writes[0].args, ['P', B]); f.session.destroy();
});
test('pending transactions prevent duplicates and failures restore the busy flag', async () => {
  const f = fixture(); await f.session.connect();
  let release; f.setWait(() => new Promise((resolve) => { release = resolve; }));
  const pending = f.session.transact('grantRole', { role: 'PRODUCER_ROLE', account: B });
  while (!release) await tick();
  await assert.rejects(f.session.transact('grantRole', { role: 'PRODUCER_ROLE', account: B }), /already in progress/);
  release({ status: 1, hash: '0xabc', gasUsed: 1n, blockNumber: 3 }); await pending;
  assert.equal(f.writes.length, 1); assert.equal(f.session.busy, false);
  f.setWait(async () => ({ status: 0, gasUsed: 0n }));
  await assert.rejects(f.session.transact('grantRole', { role: 'PRODUCER_ROLE', account: B }), /failed on-chain/);
  assert.equal(f.session.busy, false); f.session.destroy();
});
test('custom errors, rejection and insufficient funds have readable English messages', () => {
  assert.match(readableError({ code: 4001 }), /rejected in MetaMask/);
  assert.match(readableError({ code: 'INSUFFICIENT_FUNDS' }), /test ETH/);
  const data = contractInterface.encodeErrorResult('AccessControlUnauthorizedAccount', [A, IDS.Producer]);
  assert.match(readableError({ data }), /required on-chain role/);
});

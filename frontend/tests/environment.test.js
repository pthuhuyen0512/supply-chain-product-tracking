import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDeployment } from '../src/config/validate.js';
import { checkConnection } from '../src/services/blockchain.js';

const config = { rpcUrl: 'http://127.0.0.1:7545', chainId: '1337', contractAddress: '0x1111111111111111111111111111111111111111' };
function rpcFixture(overrides = {}) {
  return async (_url, options) => {
    const { method, id } = JSON.parse(options.body);
    assert.ok(['web3_clientVersion', 'eth_chainId', 'eth_getCode'].includes(method), 'No wallet or transaction RPC is allowed in step 05');
    const result = { web3_clientVersion: 'Ganache/test', eth_chainId: '0x539', eth_getCode: '0x6000', ...overrides }[method];
    return { ok: true, json: async () => ({ jsonrpc: '2.0', id, result }) };
  };
}

test('missing, malformed and unusable configurations have distinct safe results', () => {
  assert.equal(validateDeployment(undefined).code, 'CONFIG_MISSING');
  for (const raw of ['{broken', null, {}, { ...config, contractAddress: '0x0000000000000000000000000000000000000000' }, { ...config, chainId: 1337 }, { ...config, rpcUrl: 'https://example.com' }]) {
    assert.equal(validateDeployment(raw).code, 'CONFIG_INVALID');
  }
  assert.deepEqual(validateDeployment(JSON.stringify(config)), { ok: true, value: config });
});
test('valid local Ganache with contract passes using read-only requests', async () => {
  assert.equal((await checkConnection(config, { fetcher: rpcFixture() })).bytecodeBytes, 2);
});
test('node unreachable is distinguished from missing contract', async () => {
  await assert.rejects(checkConnection(config, { fetcher: async () => { throw new Error('offline'); } }), { code: 'RPC_UNAVAILABLE' });
  await assert.rejects(checkConnection(config, { fetcher: rpcFixture({ eth_getCode: '0x' }) }), { code: 'CONTRACT_MISSING' });
});
test('wrong Chain ID and wrong client are rejected before accepting a contract', async () => {
  await assert.rejects(checkConnection(config, { fetcher: rpcFixture({ eth_chainId: '0x1' }) }), { code: 'CHAIN_MISMATCH' });
  await assert.rejects(checkConnection(config, { fetcher: rpcFixture({ web3_clientVersion: 'Other node' }) }), { code: 'CLIENT_MISMATCH' });
});
test('invalid JSON-RPC, HTTP errors and malformed responses are rejected', async () => {
  await assert.rejects(checkConnection(config, { fetcher: async () => ({ ok: false, status: 503 }) }), { code: 'RPC_UNAVAILABLE' });
  await assert.rejects(checkConnection(config, { fetcher: async () => ({ ok: true, json: async () => ({ jsonrpc: '2.0', id: 999, result: 'Ganache/test' }) }) }), { code: 'RPC_INVALID' });
  await assert.rejects(checkConnection(config, { fetcher: rpcFixture({ eth_chainId: '1337' }) }), { code: 'RPC_INVALID' });
  await assert.rejects(checkConnection(config, { fetcher: rpcFixture({ eth_getCode: 'bad code' }) }), { code: 'RPC_INVALID' });
});
test('an unresponsive request is bounded by the abort signal', async () => {
  // Keep a referenced timer because AbortSignal.timeout uses an unreferenced timer in Node.
  const keepAlive = setTimeout(() => {}, 1000);
  try {
    await assert.rejects(checkConnection(config, { timeoutMs: 15, fetcher: async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })) }), { code: 'RPC_UNAVAILABLE' });
  } finally { clearTimeout(keepAlive); }
});

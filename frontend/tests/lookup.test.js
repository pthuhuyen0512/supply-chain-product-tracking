import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductId, createProductReader, mapProduct, displayTimestamp } from '../src/services/products.js';
import { CameraController, cameraError } from '../src/services/camera.js';

const A = '0x1111111111111111111111111111111111111111';
const ZERO = '0x0000000000000000000000000000000000000000';
const tick = () => new Promise((resolve) => setImmediate(resolve));
test('public reader initializes with the exported decimal chain ID and real ethers provider', () => {
  const reader = createProductReader({ rpcUrl: 'http://127.0.0.1:7545', chainId: '1337', contractAddress: A });
  reader.destroy();
});
test('manual and QR IDs are trimmed, case-sensitive literal strings', () => {
  assert.equal(normalizeProductId(' Coffee-001 '), 'Coffee-001');
  assert.equal(normalizeProductId(' https://example.com/<script> '), 'https://example.com/<script>');
  assert.throws(() => normalizeProductId('  '), /non-empty/);
});
test('public reads use the original ID and a single block without any wallet', async () => {
  const calls = [];
  const provider = { getBlockNumber: async () => 9 };
  const contract = {
    getProduct: async (...args) => { calls.push(['product', ...args]); return { exists: true, name: 'Coffee', origin: 'Da Lat', currentHolder: A, stage: 1n, createdAt: 1794766509n }; },
    getHistory: async (...args) => { calls.push(['history', ...args]); return [{ from: ZERO, to: A, stage: 1n, timestamp: 1794766509n }]; },
  };
  const result = await createProductReader({}, { provider, contract, verify: async () => {} }).lookup(' Coffee-001 ');
  assert.deepEqual(calls, [['product', 'Coffee-001', { blockTag: 9 }], ['history', 'Coffee-001', { blockTag: 9 }]]);
  assert.equal(result.productId, 'Coffee-001'); assert.equal(result.createdAt, '1794766509'); assert.equal(result.history[0].initialized, true);
});
test('unknown IDs return null and partial/equal-timestamp history is preserved in array order', () => {
  assert.equal(mapProduct('unknown', { exists: false }, []), null);
  const history = [{ from: ZERO, to: A, stage: 1n, timestamp: 10n }, { from: A, to: A, stage: 2n, timestamp: 10n }];
  const mapped = mapProduct('P', { exists: true, name: 'N', origin: 'O', currentHolder: A, stage: 2n, createdAt: 10n }, history);
  assert.deepEqual(mapped.history.map((row) => row.stage), [1, 2]); assert.equal(mapped.history.length, 2);
});
test('timestamp conversion uses seconds and guards the supported date range', () => {
  assert.equal(displayTimestamp('10').iso, '1970-01-01T00:00:10.000Z');
  assert.equal(displayTimestamp('18446744073709551615').iso, '');
});
function cameraFixture(options = {}) {
  const states = [], errors = [], decoded = [], calls = [];
  let callback;
  const scanner = {
    start: async (_constraints, _config, onSuccess) => { calls.push('start'); callback = onSuccess; if (options.start) await options.start(); },
    stop: async () => { calls.push('stop'); if (options.stop) await options.stop(); },
    clear: () => calls.push('clear'),
  };
  const controller = new CameraController({ createScanner: async () => scanner, onState: (state) => states.push(state), onError: (error) => errors.push(error), onDecoded: (id) => decoded.push(id), releaseTracks: () => calls.push('release') });
  return { controller, states, errors, decoded, calls, decode: (text) => callback(text) };
}
test('scanner prevents duplicate starts and releases the camera before one decode callback', async () => {
  const f = cameraFixture(); await f.controller.start(); await f.controller.start();
  assert.equal(f.calls.filter((call) => call === 'start').length, 1);
  f.decode(' P '); f.decode(' P '); await f.controller.queue; await tick();
  assert.deepEqual(f.decoded, ['P']); assert.equal(f.calls.filter((call) => call === 'stop').length, 1); assert.ok(f.calls.includes('release')); assert.equal(f.controller.state, 'idle');
});
test('stop during startup cancels the pending start and duplicate stops share cleanup', async () => {
  let release; const gate = new Promise((resolve) => { release = resolve; });
  const f = cameraFixture({ start: () => gate }); const starting = f.controller.start(); await tick();
  const stopping = f.controller.stop(); assert.equal(f.controller.stop(), stopping);
  release(); await starting; await stopping;
  assert.equal(f.controller.state, 'idle'); assert.equal(f.calls.filter((call) => call === 'stop').length, 1);
  f.decode('late'); await tick(); assert.deepEqual(f.decoded, []);
});
test('permission denial is reported and leaves the scanner ready for a retry', async () => {
  const f = cameraFixture({ start: async () => { throw Object.assign(new Error('denied'), { name: 'NotAllowedError' }); } });
  await f.controller.start(); assert.equal(f.controller.state, 'idle'); assert.match(f.errors[0], /Camera access was denied/); assert.ok(f.calls.includes('release'));
  assert.match(cameraError({ name: 'NotFoundError' }), /No camera/);
});
test('empty QR is ignored and disposal suppresses callbacks and restarts', async () => {
  const f = cameraFixture(); await f.controller.start(); f.decode(' '); f.decode(' '); assert.equal(f.errors.length, 1);
  await f.controller.dispose(); f.decode('P'); await tick(); assert.deepEqual(f.decoded, []); assert.equal(await f.controller.start(), false);
});

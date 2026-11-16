import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const gasPath = path.join(root, 'docs/gas');
const before = JSON.parse(await readFile(path.join(gasPath, 'before/gas.json'), 'utf8'));
const after = JSON.parse(await readFile(path.join(gasPath, 'after/gas.json'), 'utf8'));

assert.equal(before.version, 'before');
assert.equal(after.version, 'after');
for (const key of ['compilerLongVersion', 'compilerSettings', 'network', 'chainId', 'rpcClient', 'nodeVersion', 'input', 'accounts', 'initialState', 'measurement']) {
  assert.deepEqual(before[key], after[key], `Incomparable measurement conditions: ${key}`);
}
for (const result of [before, after]) {
  const hash = createHash('sha256').update(await readFile(path.join(root, result.sourceName))).digest('hex');
  assert.equal(hash, result.sourceSha256, `Source changed since measurement: ${result.sourceName}`);
}
assert.equal(before.measurements.length, 9);
assert.equal(after.measurements.length, 9);
assert.deepEqual(before.measurements.map(r => r.operation), after.measurements.map(r => r.operation));

// Contract names differ in internalType metadata, while callable ABI must match.
const callableAbis = [];
for (const result of [before, after]) {
  const artifact = JSON.parse(await readFile(path.join(root, 'artifacts', result.sourceName, `${result.contractName}.json`), 'utf8'));
  callableAbis.push(JSON.parse(JSON.stringify(
    artifact.abi.filter(entry => entry.type !== 'error'),
    (key, value) => key === 'internalType' ? undefined : value,
  )));
}
assert.deepEqual(callableAbis[0], callableAbis[1], 'Successful-call/event ABI changed');

const rows = before.measurements.map((original, i) => {
  const baseline = BigInt(original.gasUsed);
  const optimized = BigInt(after.measurements[i].gasUsed);
  assert.ok(baseline > 0n);
  const reduction = baseline - optimized;
  return {
    operation: original.operation,
    before_gas: baseline.toString(),
    after_gas: optimized.toString(),
    reduction_gas: reduction.toString(),
    reduction_percent: (Number(reduction) / Number(baseline) * 100).toFixed(4),
  };
});
const csv = ['operation,before_gas,after_gas,reduction_gas,reduction_percent', ...rows.map(r => Object.values(r).join(','))].join('\n') + '\n';
await writeFile(path.join(gasPath, 'gas_analysis.csv'), csv, 'utf8');
console.table(rows);
console.log(`Runtime bytecode: ${before.deployedBytecodeBytes} -> ${after.deployedBytecodeBytes} bytes`);
console.log('Conditions and source hashes match. Saved docs/gas/gas_analysis.csv');

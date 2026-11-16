import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { percentChange, summarizePairs, formatWei } from '../src/gas-comparison.js';

const data = JSON.parse(readFileSync(new URL('../src/data/gas-comparison.json', import.meta.url), 'utf8'));

test('matched receipt totals preserve Wei and calculate V2 changes against V1', () => {
  const totals = summarizePairs(data.matched_pairs);
  assert.equal(data.matched_pairs.length, 9);
  assert.equal(totals.v1Gas, 3120968);
  assert.equal(totals.v2Gas, 2770148);
  assert.equal(totals.v1FeeWei, 17061638125000000n);
  assert.equal(totals.v2FeeWei, 14777931549405433n);
  assert.equal(percentChange(totals.v1Gas, totals.v2Gas).toFixed(4), '-11.2407');
  assert.equal(percentChange(totals.v1FeeWei, totals.v2FeeWei).toFixed(4), '-13.3850');
  assert.equal(formatWei(totals.v1FeeWei - totals.v2FeeWei), '0.002283706575594567');
});

test('percentage direction distinguishes savings, unchanged values and increases', () => {
  assert.equal(percentChange(100, 80), -20);
  assert.equal(percentChange(100, 120), 20);
  assert.equal(percentChange(100, 100), 0);
  assert.equal(percentChange(0, 10), null);
  assert.equal(formatWei(1n), '0.000000000000000001');
});

test('full V1 snapshot includes extra runs; product differences equal calldata differences', () => {
  const complete = summarizePairs([...data.matched_pairs, ...data.additional_v1]);
  assert.equal(complete.v1Gas, 3852324);
  assert.equal(complete.v1FeeWei, 31688758125000000n);
  const products = data.matched_pairs.filter(row => row.group === 'Product workflow');
  assert.equal(products.length, 4);
  for (const row of products) {
    assert.equal(row.v1Gas - row.v2Gas, 48);
    assert.equal(row.v1CalldataGas - row.v2CalldataGas, 48);
  }
});

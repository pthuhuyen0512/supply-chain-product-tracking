export const percentChange = (v1, v2) => Number(v1) === 0 ? null : (Number(v2) - Number(v1)) / Number(v1) * 100;

// Sum receipt fees in integer Wei before converting for display or percentages.
export function summarizePairs(rows) {
  return rows.reduce((total, row) => ({
    v1Gas: total.v1Gas + row.v1Gas,
    v2Gas: total.v2Gas + row.v2Gas,
    v1FeeWei: total.v1FeeWei + BigInt(row.v1FeeWei),
    v2FeeWei: total.v2FeeWei + BigInt(row.v2FeeWei),
  }), { v1Gas: 0, v2Gas: 0, v1FeeWei: 0n, v2FeeWei: 0n });
}

export function formatWei(value) {
  const wei = BigInt(value);
  const digits = (wei < 0n ? -wei : wei).toString().padStart(19, '0');
  return `${wei < 0n ? '-' : ''}${digits.slice(0, -18)}.${digits.slice(-18)}`;
}

import data from './data/gas-comparison.json';
import { percentChange, summarizePairs, formatWei } from './gas-comparison.js';
import './gas-comparison.css';

const gas = value => Number(value).toLocaleString('en-US');
const eth = value => Number(value).toFixed(9).replace(/0+$/, '').replace(/\.$/, '');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const delta = (v1, v2) => {
  const change = percentChange(v1, v2);
  if (change === null) return '<span class="gas-delta neutral">N/A</span>';
  return `<span class="gas-delta ${change < 0 ? 'saving' : change > 0 ? 'increase' : 'neutral'}">${change < 0 ? '↓ −' : change > 0 ? '↑ +' : ''}${Math.abs(change).toFixed(4)}%<small>${change < 0 ? 'less than V1' : change > 0 ? 'more than V1' : 'unchanged'}</small></span>`;
};

export function initializeGasComparison() {
  const section = document.createElement('section');
  section.id = 'gas-comparison';
  section.className = 'section-block gas-comparison';
  section.setAttribute('aria-labelledby', 'gas-heading');
  section.innerHTML = `
    <div class="section-heading"><div><p class="eyebrow">MEASURED ON GANACHE</p><h2 id="gas-heading">Gas comparison <span>V1 → V2</span></h2></div><span class="tag">Snapshot · 16 Nov 2026</span></div>
    <p class="gas-intro">Compare the same nine functions: deployment, four role grants, product creation and three handovers. V1 blocks 1–9 · V2 blocks 17–25.</p>
    <div class="gas-metrics" id="gas-metrics"></div>
    <div class="gas-toolbar"><div class="gas-switch" role="group" aria-label="Comparison scope"><button type="button" data-scope="matched" aria-pressed="true">Matched workflows</button><button type="button" data-scope="snapshots" aria-pressed="false">Snapshot scope</button></div><p>Change = (V2 − V1) / V1 × 100</p></div>
    <div id="gas-matched">
      <article class="card gas-panel"><div class="gas-panel-heading"><div><h3>Compare individual functions</h3><p>Percentages use V1 as the baseline. Select a transaction to inspect its receipts.</p></div><div class="gas-controls"><label>Function group<select id="gas-group"><option>All functions</option><option>Deployment</option><option>Role grants</option><option>Product workflow</option></select></label><label>Measure<select id="gas-measure"><option value="gas">Gas used</option><option value="fee">Actual fee · ETH</option></select></label></div></div>
        <div class="gas-legend"><span><i class="v1"></i>Version 1</span><span><i class="v2"></i>Version 2</span></div><div id="gas-chart"></div>
        <div class="gas-table-scroll"><table class="gas-table"><caption>Matched transaction pairs · changes in V2 relative to V1</caption><thead><tr><th scope="col">Function / receipt</th><th scope="col">V1 gas</th><th scope="col">V2 gas</th><th scope="col" class="gas-change-col">Gas change %</th><th scope="col">V1 fee · ETH</th><th scope="col">V2 fee · ETH</th><th scope="col" class="gas-change-col">Fee change %</th></tr></thead><tbody id="gas-pairs"></tbody></table></div>
      </article>
      <div class="two-columns gas-support"><article class="card gas-panel"><p class="eyebrow">ISOLATE GAS QUANTITY</p><h3>Fees at the same gas price</h3><p>Modeled fees using the measured gas totals and a common price.</p><label for="gas-price">Common gas price: <output id="gas-price-value">20 Gwei</output></label><input id="gas-price" type="range" min="1" max="40" step="1" value="20"><div id="gas-modeled" class="gas-modeled" aria-live="polite"></div></article>
      <article class="card gas-panel"><p class="eyebrow">READ THE DIFFERENCE CORRECTLY</p><h3>Where the savings come from</h3><div id="gas-drivers"></div><p>Deployment gas price also fell: <strong>1.875 → 1.121031899 Gwei</strong>.</p><p>Each product operation saves <strong>48 gas</strong> because its product ID has four fewer nonzero calldata bytes (15 → 11 bytes). This sample does not establish lower execution gas for these functions.</p></article></div>
    </div>
    <div id="gas-snapshots" hidden><article class="card gas-panel"><h3>Workload size changes the total</h3><p>V1 contains 16 transactions; V2 contains 9. Complete snapshot totals describe different workloads and must not be interpreted as an efficiency saving rate.</p><div class="gas-table-scroll"><table class="gas-table"><caption>Exact totals by comparison scope</caption><thead><tr><th scope="col">Scope</th><th scope="col">Version</th><th scope="col">Transactions</th><th scope="col">Gas used</th><th scope="col">Fee · ETH</th></tr></thead><tbody id="gas-scope-totals"></tbody></table></div><details class="gas-extra"><summary>Additional V1 runs · 7 transactions</summary><p>Blocks 10–13 repeat a full workflow; blocks 14–16 stop at Retailer. These are excluded from the matched nine. Block 14 also differs in product name and origin.</p><div id="gas-extra-pairs"></div></details></article></div>
    <details class="gas-source"><summary>Data source & methodology</summary><p>Fixed snapshots from 16 November 2026, imported from 1Compare/gas_comparison_web/src/data.json. These values do not update with the connected chain.</p><ul>${data.source.files.map(file => `<li>${escape(file)}</li>`).join('')}</ul><p>Actual fee = receipt gas used × effective gas price. Matched fee totals are summed from integer Wei receipts; percentages are calculated from totals, not averaged. Full receipt amounts are available below each transaction.</p></details>
  `;
  document.querySelector('main footer').before(section);
  const find = selector => section.querySelector(selector);
  const total = summarizePairs(data.matched_pairs);
  find('#gas-metrics').innerHTML = `
    <article class="gas-metric featured"><p>Total gas change</p>${delta(total.v1Gas, total.v2Gas)}<div><span>V1 <strong>${gas(total.v1Gas)}</strong></span><span>V2 <strong>${gas(total.v2Gas)}</strong></span></div><footer>${gas(total.v1Gas - total.v2Gas)} gas saved · matched 9</footer></article>
    <article class="gas-metric featured"><p>Actual fee change</p>${delta(total.v1FeeWei, total.v2FeeWei)}<div><span>V1 <strong>${eth(formatWei(total.v1FeeWei))} ETH</strong></span><span>V2 <strong>${eth(formatWei(total.v2FeeWei))} ETH</strong></span></div><footer>Includes the deployment gas price difference</footer></article>
    <article class="gas-metric"><p>Actual ETH saved</p><strong class="gas-saved">${eth(formatWei(total.v1FeeWei - total.v2FeeWei))}<small>ETH</small></strong><p>Across the same nine functions</p><footer>Gas quantity and gas price both affect fees</footer></article>`;

  function receipt(row) {
    return `<details class="gas-receipt"><summary>${escape(row.function)}</summary><p>Fee payer: ${escape(row.payer)}</p><code>${escape(row.wallet)}</code>${['v1', 'v2'].map((v, i) => `<div><strong>V${i + 1} · block ${row[`${v}Block`]}</strong><code>${escape(row[`${v}Hash`])}</code><p>${gas(row[`${v}Gas`])} gas × ${row[`${v}GasPrice`]} Gwei</p><code>${formatWei(row[`${v}FeeWei`])} ETH</code></div>`).join('')}</details>`;
  }

  function renderFunctions() {
    const group = find('#gas-group').value;
    const measure = find('#gas-measure').value;
    const rows = data.matched_pairs.filter(row => group === 'All functions' || row.group === group);
    const value = (row, v) => measure === 'gas' ? row[`${v}Gas`] : Number(formatWei(row[`${v}FeeWei`]));
    const max = Math.max(...rows.flatMap(row => [value(row, 'v1'), value(row, 'v2')]));
    find('#gas-chart').innerHTML = rows.map(row => `<div class="gas-chart-row"><div class="gas-chart-label"><strong>${escape(row.function)}</strong>${delta(value(row, 'v1'), value(row, 'v2'))}</div><div class="gas-bars">${['v1', 'v2'].map((v, i) => `<div class="gas-bar-line"><span>V${i + 1}</span><div class="gas-bar-track"><div class="gas-bar ${v}" style="width:${value(row, v) / max * 100}%"></div></div><strong>${measure === 'gas' ? gas(value(row, v)) : eth(value(row, v))}</strong></div>`).join('')}</div></div>`).join('');
    find('#gas-pairs').innerHTML = rows.map(row => `<tr><th scope="row">${receipt(row)}</th><td>${gas(row.v1Gas)}</td><td>${gas(row.v2Gas)}</td><td class="gas-change-col">${delta(row.v1Gas, row.v2Gas)}</td><td>${eth(formatWei(row.v1FeeWei))}</td><td>${eth(formatWei(row.v2FeeWei))}</td><td class="gas-change-col">${delta(row.v1FeeWei, row.v2FeeWei)}</td></tr>`).join('');
  }
  function renderModeled() {
    const price = Number(find('#gas-price').value);
    find('#gas-price-value').textContent = `${price} Gwei`;
    find('#gas-modeled').innerHTML = `<div><span>V1</span><strong>${eth(total.v1Gas * price / 1e9)} ETH</strong></div><div><span>V2</span><strong>${eth(total.v2Gas * price / 1e9)} ETH</strong></div>${delta(total.v1Gas, total.v2Gas)}`;
  }
  find('#gas-drivers').innerHTML = data.savings_breakdown.map(row => `<div class="gas-driver"><span>${escape(row.source)}</span><strong>${eth(row.fee)} ETH</strong></div>`).join('');
  find('#gas-scope-totals').innerHTML = data.scope_totals.map(row => {
    // Reconcile matched/product scopes from exact receipts rather than rounded source totals.
    const pairs = row.scope === 'Matched 9' ? data.matched_pairs : row.scope === 'Product workflow' ? data.matched_pairs.filter(pair => pair.group === 'Product workflow') : row.version === 'V2' ? data.matched_pairs : [...data.matched_pairs, ...data.additional_v1];
    const totals = summarizePairs(pairs);
    const v = row.version.toLowerCase();
    return `<tr><th scope="row">${escape(row.scope)}</th><td>${row.version}</td><td>${row.count}</td><td>${gas(totals[`${v}Gas`])}</td><td>${formatWei(totals[`${v}FeeWei`])}</td></tr>`;
  }).join('');
  find('#gas-extra-pairs').innerHTML = data.additional_v1.map(receipt).join('');
  section.querySelectorAll('[data-scope]').forEach(button => button.addEventListener('click', () => {
    const snapshots = button.dataset.scope === 'snapshots';
    find('#gas-matched').hidden = snapshots;
    find('#gas-snapshots').hidden = !snapshots;
    section.querySelectorAll('[data-scope]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  find('#gas-group').addEventListener('change', renderFunctions);
  find('#gas-measure').addEventListener('change', renderFunctions);
  find('#gas-price').addEventListener('input', renderModeled);
  renderFunctions();
  renderModeled();
}

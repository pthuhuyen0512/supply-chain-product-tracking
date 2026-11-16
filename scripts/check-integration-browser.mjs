// Isolated Edge test profile, never the user's Edge profile or actual MetaMask.
// Supply an existing Playwright module path as the first argument; no installs.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const root = path.resolve(import.meta.dirname, '..');
const config = JSON.parse(await fs.readFile(path.join(root, 'frontend/src/config/deployment.local.json'), 'utf8'));
let rpcId = 0;
async function rpc(method, params = []) {
  const result = await (await fetch(config.rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }) })).json();
  if (result.error) throw new Error(result.error.message); return result.result;
}
const blockBefore = await rpc('eth_blockNumber');
const accounts = (await rpc('eth_accounts')).slice(0, 5);
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const checks = [], errors = [];
let context;
async function check(name, action) {
  await action(); checks.push({ name, status: 'pass' }); console.log(`PASS ${name}`);
}
try {
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('#network-label').filter({ hasText: 'Ganache connected' }).waitFor();
  await check('No injected wallet: reads enabled, writes disabled', async () => {
    assert.equal(await page.evaluate(() => typeof window.ethereum), 'undefined');
    assert(await page.locator('#connect-wallet').isDisabled());
    assert(await page.locator('#create-form button[type=submit]').isDisabled());
    assert.match(await page.locator('#wallet-hint').innerText(), /not detected/i);
  });
  async function lookup(value) { await page.locator('#lookup-id').fill(value); await page.locator('#lookup-form button').click(); }
  await check('Public lookup matches Delivered and all four timeline events', async () => {
    await lookup(' COFFEE-DEMO-001 '); await page.locator('#product-result h3').filter({ hasText: 'Da Lat Arabica' }).waitFor();
    assert.match(await page.locator('#product-result').innerText(), /Delivered/);
    assert.match((await page.locator('#product-result').innerText()).toLowerCase(), new RegExp(accounts[4].toLowerCase()));
    assert.equal(await page.locator('#product-result .timeline li').count(), 4);
    await page.screenshot({ path: path.join(root, 'docs/verification/integration-public-lookup.png'), fullPage: true });
  });
  await check('Unknown product clears previous details and timeline', async () => {
    await lookup('STEP08-UNKNOWN-9'); await page.locator('#lookup-hint').filter({ hasText: 'No product was found' }).waitFor();
    assert.equal(await page.locator('#product-result').innerText(), '');
  });
  await lookup('COFFEE-DEMO-001'); await page.locator('.timeline li').first().waitFor();
  await check('Temporary RPC outage is simulated in browser only and recovers', async () => {
    await page.route(config.rpcUrl, route => route.abort());
    await lookup('COFFEE-DEMO-001'); await page.locator('#lookup-hint').filter({ hasText: /unable|unavailable|reach|connect/i }).waitFor();
    assert.equal(await page.locator('#product-result').innerText(), '');
    await page.unroute(config.rpcUrl); await lookup('COFFEE-DEMO-001'); await page.locator('.timeline li').first().waitFor();
  });
  await check('Generated QR is decoded by actual html5-qrcode image decoder', async () => {
    await page.locator('#qr-product-id').fill(' COFFEE-DEMO-001 '); await page.locator('#generate-qr').click(); await page.locator('#qr-image').waitFor();
    const dataUrl = await page.locator('#qr-image').getAttribute('src');
    await page.locator('#lookup-id').fill('clear-result');
    await page.locator('#qr-file').setInputFiles({ name: 'product.png', mimeType: 'image/png', buffer: Buffer.from(dataUrl.split(',')[1], 'base64') });
    await page.locator('#product-result h3').filter({ hasText: 'Da Lat Arabica' }).waitFor();
    assert.equal(await page.locator('#lookup-id').inputValue(), 'COFFEE-DEMO-001');
  });
  await context.close();
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(({ accounts, rpcUrl }) => {
    const listeners = {};
    const state = { accounts: [accounts[0]], chainId: '0x539', permissionRequests: 0, rejectedSends: 0 };
    window.__testWallet = { state, change(index, chain = state.chainId) {
      state.accounts = index === null ? [] : [accounts[index]]; state.chainId = chain;
      for (const fn of listeners.accountsChanged ?? []) fn(state.accounts);
      for (const fn of listeners.chainChanged ?? []) fn(chain);
    } };
    window.ethereum = { isMetaMask: true, on(event, handler) { (listeners[event] ??= []).push(handler); },
      removeListener(event, handler) { listeners[event] = (listeners[event] ?? []).filter(fn => fn !== handler); },
      async request({ method, params = [] }) {
        if (method === 'eth_requestAccounts') { state.permissionRequests++; return state.accounts; }
        if (method === 'eth_accounts') return state.accounts;
        if (method === 'eth_chainId') return state.chainId;
        if (method === 'eth_sendTransaction') { state.rejectedSends++; throw Object.assign(new Error('Test-only user rejection'), { code: 4001 }); }
        const allow = ['eth_call', 'eth_getCode', 'eth_estimateGas', 'eth_blockNumber', 'eth_getBlockByNumber', 'eth_gasPrice', 'eth_getBalance', 'eth_getTransactionCount', 'eth_maxPriorityFeePerGas'];
        if (!allow.includes(method)) throw new Error(`Unsupported read-only test request: ${method}`);
        const json = await (await fetch(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) })).json();
        if (json.error) throw json.error; return json.result;
      },
    };
  }, { accounts, rpcUrl: config.rpcUrl });
  const walletPage = await context.newPage(); walletPage.on('pageerror', e => errors.push(e.message));
  await walletPage.goto('http://127.0.0.1:5173/');
  await walletPage.locator('#network-label').filter({ hasText: 'Ganache connected' }).waitFor();
  await check('Installed but unconnected wallet does not request access automatically', async () => {
    assert.equal(await walletPage.evaluate(() => window.__testWallet.state.permissionRequests), 0);
    assert(await walletPage.locator('#role-form button[type=submit]').isDisabled());
  });
  await walletPage.locator('#connect-wallet').click(); await walletPage.locator('#connect-wallet').filter({ hasText: 'MetaMask connected' }).waitFor();
  await check('Admin roles read from real Ganache and independent of Producer', async () => {
    assert(await walletPage.locator('#create-form button[type=submit]').isDisabled());
    assert(await walletPage.locator('#role-form button[type=submit]').isEnabled());
  });
  async function change(index, chain) {
    await walletPage.evaluate(({ index, chain }) => window.__testWallet.change(index, chain), { index, chain });
  }
  await check('Wrong chain disables writes and switching back recovers', async () => {
    await change(0, '0x1'); await walletPage.locator('#wallet dd').first().filter({ hasText: 'Wrong network' }).waitFor();
    assert(await walletPage.locator('#role-form button[type=submit]').isDisabled());
    await walletPage.screenshot({ path: path.join(root, 'docs/verification/integration-simulated-wrong-chain.png'), fullPage: true });
    await change(1, '0x539'); await walletPage.locator('#wallet dd').first().filter({ hasText: /^Connected$/ }).waitFor();
    assert(await walletPage.locator('#create-form button[type=submit]').isEnabled());
    assert(await walletPage.locator('#role-form button[type=submit]').isDisabled());
  });
  await check('Duplicate ID is blocked before signing', async () => {
    await walletPage.locator('#create-id').fill('COFFEE-DEMO-001'); await walletPage.locator('#product-name').fill('Duplicate'); await walletPage.locator('#product-origin').fill('Da Lat');
    await walletPage.locator('#create-form button[type=submit]').click(); await walletPage.locator('#transaction-message').filter({ hasText: /Product exists/i }).waitFor();
    assert.equal(await walletPage.evaluate(() => window.__testWallet.state.rejectedSends), 0);
  });
  await check('Simulated rejected signature restores controls and broadcasts nothing', async () => {
    await walletPage.locator('#create-id').fill('STEP08-REJECT-001'); await walletPage.locator('#create-form button[type=submit]').click();
    await walletPage.locator('#transaction-message').filter({ hasText: /rejected/i }).waitFor();
    await walletPage.waitForFunction(() => !document.querySelector('#create-form button[type=submit]').disabled);
    assert(await walletPage.locator('#create-form button[type=submit]').isEnabled());
    assert.equal(await walletPage.evaluate(() => window.__testWallet.state.rejectedSends), 1);
  });
  await check('Non-holder cannot hand over delivered demo product', async () => {
    await walletPage.locator('#handover-id').fill('COFFEE-DEMO-001'); await walletPage.locator('.product-check').click();
    await walletPage.locator('#handover-preview').filter({ hasText: 'Stage: Delivered' }).waitFor();
    assert(await walletPage.locator('#handover-form button[type=submit]').isDisabled());
    assert.match(await walletPage.locator('#handover-form .field-hint').innerText(), /Only the current holder/);
  });
  await check('Customer holder cannot advance beyond Delivered', async () => {
    await change(4, '0x539'); await walletPage.locator('#wallet dd').first().filter({ hasText: /^Connected$/ }).waitFor();
    await walletPage.locator('.product-check').click();
    await walletPage.locator('#handover-form .field-hint').filter({ hasText: /already been delivered/ }).waitFor();
    assert(await walletPage.locator('#handover-form button[type=submit]').isDisabled());
    assert.match(await walletPage.locator('#handover-form .field-hint').innerText(), /already been delivered/);
  });
  await check('Empty accounts disconnect without requesting permissions again', async () => {
    const requests = await walletPage.evaluate(() => window.__testWallet.state.permissionRequests);
    await change(null, '0x539'); await walletPage.locator('#wallet dd').first().filter({ hasText: 'Not connected' }).waitFor();
    assert.equal(await walletPage.evaluate(() => window.__testWallet.state.permissionRequests), requests);
    assert(await walletPage.locator('#create-form button[type=submit]').isDisabled());
  });
  assert.equal(await rpc('eth_blockNumber'), blockBefore);
  assert.deepEqual(errors, []);
} catch (error) {
  checks.push({ name: 'Runner failure', status: 'fail', error: error.stack }); process.exitCode = 1; console.error(error.message);
} finally {
  await context?.close(); await browser.close();
  await fs.writeFile(path.join(root, 'docs/verification/integration-browser.json'), JSON.stringify({ checkedAt: new Date().toISOString(), browser: 'Microsoft Edge headless isolated test profile', checks, errors, blockBefore, blockAfter: await rpc('eth_blockNumber'), actualMetaMaskUsed: false, physicalCameraUsed: false, transactionsBroadcast: 0 }, null, 2)+'\n');
}

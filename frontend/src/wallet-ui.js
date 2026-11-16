import { WalletSession, ROLE_GETTERS, STAGES, handoverPermission, readableError } from './services/wallet.js';

export function initializeWalletUI(deployment) {
  const $ = (selector) => document.querySelector(selector);
  const forms = { grantRole: $('#role-form'), createProduct: $('#create-form'), handoverProduct: $('#handover-form') };
  const hints = Object.fromEntries(Object.entries(forms).map(([key, form]) => [key, form.querySelector('.field-hint')]));
  const walletValues = $('#wallet').querySelectorAll('dd');
  const connect = $('#connect-wallet');
  const walletHint = $('#wallet-hint');
  const controls = document.createElement('div'); controls.className = 'wallet-controls';
  controls.innerHTML = '<button id="switch-network" class="button light" hidden type="button">Switch to Ganache</button><button id="refresh-wallet" class="wallet-link" type="button" hidden>Refresh roles</button><button id="disconnect-wallet" class="wallet-link" type="button" hidden>Disconnect from this page</button>';
  walletHint.after(controls);
  const notice = document.createElement('section'); notice.id = 'transaction-status'; notice.className = 'transaction-panel';
  notice.setAttribute('role', 'status'); notice.setAttribute('aria-live', 'polite'); notice.hidden = true;
  notice.innerHTML = '<h3 id="transaction-heading"></h3><p id="transaction-message"></p><dl><div><dt>Transaction hash</dt><dd id="transaction-hash">—</dd></div><div><dt>Gas used</dt><dd id="transaction-gas">—</dd></div></dl>';
  $('#operations').before(notice);
  const inspection = document.createElement('p'); inspection.id = 'handover-preview'; inspection.className = 'notice'; inspection.setAttribute('aria-live', 'polite');
  $('#handover-id').after(inspection);
  const inspectButton = document.createElement('button'); inspectButton.type = 'button'; inspectButton.className = 'text-button product-check'; inspectButton.textContent = 'Check holder and stage';
  inspection.after(inspectButton);
  const demoPanel = document.createElement('section'); demoPanel.className = 'card demo-panel'; demoPanel.id = 'demo-checklist';
  demoPanel.innerHTML = '<div class="section-heading"><div><p class="eyebrow">LOCAL DEMO CHECKLIST</p><h2>Prepare participant roles</h2></div></div><p>These public addresses are read from the current Ganache workspace. Each role requires a separate Admin transaction in MetaMask.</p><div id="demo-roles"></div><p id="demo-product" class="field-hint"></p>';
  $('#participants').parentElement.after(demoPanel);

  let environmentReady = false, busy = false, walletWorking = false;
  let product = null, productId = '', productCheck = 0, demoRun = 0, inputTimer;
  let session;
  const injected = window.ethereum?.providers?.find((provider) => provider.isMetaMask) ?? (window.ethereum?.isMetaMask ? window.ethereum : undefined);
  function showError(error) {
    notice.hidden = false; notice.className = 'transaction-panel warning';
    $('#transaction-heading').textContent = 'Action could not be completed';
    $('#transaction-message').textContent = readableError(error);
    $('#transaction-hash').textContent = '—'; $('#transaction-gas').textContent = '—';
    notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function render() {
    const state = session?.state ?? { status: 'disconnected', roles: [] };
    const ready = environmentReady && state.status === 'ready' && !busy && !walletWorking;
    walletValues[0].textContent = ({ ready: 'Connected', syncing: 'Refreshing…', connecting: 'Waiting for MetaMask…', 'wrong-network': 'Wrong network', error: 'Connection error', disconnected: 'Not connected' })[state.status];
    walletValues[1].textContent = state.address ?? '—';
    walletValues[1].title = state.address ?? '';
    walletValues[2].textContent = state.roles.length ? state.roles.join(', ') : state.status === 'ready' ? 'No supply chain roles' : 'Not checked';
    connect.disabled = !deployment.ok || !environmentReady || !injected || busy || walletWorking || ['ready', 'syncing', 'connecting', 'wrong-network'].includes(state.status);
    connect.textContent = state.status === 'ready' ? 'MetaMask connected' : 'Connect MetaMask';
    $('#switch-network').hidden = state.status !== 'wrong-network';
    $('#switch-network').disabled = busy || walletWorking || !environmentReady;
    $('#refresh-wallet').hidden = !session?.selected;
    $('#refresh-wallet').disabled = busy || walletWorking;
    $('#disconnect-wallet').hidden = !session?.selected;
    $('#disconnect-wallet').disabled = busy;
    walletHint.textContent = !deployment.ok ? 'Export a valid deployment configuration first.' :
      !injected ? 'MetaMask was not detected. Open this page in a browser with the MetaMask extension enabled.' :
      state.error || (!environmentReady ? 'Check the local blockchain connection first.' :
        state.status === 'ready' ? 'Roles are read from the contract. Admin does not automatically include Producer.' : 'Choose the account in MetaMask, then connect. No private key is requested.');
    forms.grantRole.querySelector('button[type=submit]').disabled = !ready || !state.roles.includes('Admin');
    forms.createProduct.querySelector('button[type=submit]').disabled = !ready || !state.roles.includes('Producer');
    const denied = handoverPermission(product, state.address, state.roles);
    forms.handoverProduct.querySelector('button[type=submit]').disabled = !ready || !product || !!denied;
    hints.grantRole.textContent = !ready ? 'Connect a wallet on the verified Ganache network.' : state.roles.includes('Admin') ? 'Choose a participant and confirm the role grant in MetaMask.' : 'Only an on-chain Admin can grant roles.';
    hints.createProduct.textContent = !ready ? 'Connect a wallet on the verified Ganache network.' : state.roles.includes('Producer') ? 'All fields are required. Confirm creation in MetaMask.' : 'The active wallet needs the Producer role.';
    hints.handoverProduct.textContent = !ready ? 'Connect a wallet on the verified Ganache network.' : !product ? 'Enter a product ID and check its holder and stage.' : denied || 'The current holder can advance this product to the next stage.';
    inspectButton.disabled = !environmentReady || busy;
    for (const form of Object.values(forms)) {
      for (const input of form.querySelectorAll('input,select')) input.disabled = busy;
      form.setAttribute('aria-busy', String(busy));
    }
    demoPanel.querySelectorAll('button').forEach((button) => { button.disabled = busy; });
  }
  async function inspectProduct() {
    const request = ++productCheck;
    product = null; productId = $('#handover-id').value.trim(); render();
    if (!session || !environmentReady || !productId) { inspection.textContent = ''; return; }
    inspection.textContent = 'Checking the current holder and stage…';
    try {
      const result = await session.product(productId);
      if (request !== productCheck) return;
      product = result;
      inspection.textContent = result.exists ? `Stage: ${STAGES[Number(result.stage)]}. Current holder: ${result.currentHolder}` : 'Product not found.';
    } catch (error) { if (request === productCheck) inspection.textContent = readableError(error); }
    if (request === productCheck) render();
  }
  async function refreshDemo() {
    const request = ++demoRun;
    if (!session || !environmentReady) return;
    try {
      const accounts = await session.readProvider.send('eth_accounts', []);
      if (accounts.length < 5) throw new Error('This checklist requires five public Ganache accounts.');
      const ids = await session.roleIds();
      if (!await session.reader.hasRole(ids.Admin, accounts[0])) throw new Error('The first Ganache account is not the current Admin. Use the recorded deployer.');
      const roles = ['Producer', 'Distributor', 'Retailer', 'Customer'];
      const statuses = await Promise.all(roles.map((role, i) => session.reader.hasRole(ids[role], accounts[i + 1])));
      if (request !== demoRun) return;
      const list = $('#demo-roles'); list.replaceChildren();
      roles.forEach((role, i) => {
        const row = document.createElement('div'); row.className = 'demo-role-row';
        const name = document.createElement('strong'); name.textContent = role;
        const address = document.createElement('code'); address.textContent = accounts[i + 1];
        const status = document.createElement('span'); status.className = statuses[i] ? 'tag public' : 'tag'; status.textContent = statuses[i] ? 'Granted on-chain' : 'Not granted';
        const use = document.createElement('button'); use.type = 'button'; use.className = 'text-button'; use.textContent = 'Use in form';
        use.addEventListener('click', () => {
          $('#participant-address').value = accounts[i + 1]; $('#participant-role').value = ROLE_GETTERS[role];
          $('#participants').scrollIntoView({ behavior: 'smooth', block: 'center' }); $('#participant-address').focus();
        });
        row.append(name, address, status, use); list.append(row);
      });
      if (!$('#participant-address').value) {
        const next = Math.max(0, statuses.indexOf(false));
        $('#participant-address').value = accounts[next + 1]; $('#participant-role').value = ROLE_GETTERS[roles[next]];
      }
      if (!$('#create-id').value) {
        let suggested;
        for (let i = 1; i <= 20; i++) {
          const candidate = `COFFEE-DEMO-${String(i).padStart(3, '0')}`;
          if (!(await session.product(candidate)).exists) { suggested = candidate; break; }
        }
        if (suggested && request === demoRun) {
          $('#create-id').value = suggested; $('#product-name').value ||= 'Da Lat Arabica'; $('#product-origin').value ||= 'Da Lat, Vietnam';
          $('#handover-id').value ||= suggested;
          $('#demo-product').textContent = `Suggested unused product ID: ${suggested}. Create it as Producer after all four roles have been granted.`;
        }
      }
      render();
    } catch (error) { if (request === demoRun) $('#demo-roles').textContent = readableError(error); }
  }
  if (deployment.ok) session = new WalletSession(deployment.value, { ethereum: injected, onChange: () => { render(); } });

  async function walletAction(action) {
    if (walletWorking || busy) return;
    walletWorking = true; render();
    try { await action(); } catch (error) { showError(error); }
    finally { walletWorking = false; render(); }
  }
  connect.addEventListener('click', () => void walletAction(() => session.connect()));
  $('#switch-network').addEventListener('click', () => void walletAction(() => session.switchNetwork()));
  $('#refresh-wallet').addEventListener('click', () => void walletAction(() => session.sync()));
  $('#disconnect-wallet').addEventListener('click', () => session.disconnect());
  $('#handover-id').addEventListener('input', () => {
    clearTimeout(inputTimer); ++productCheck; product = null; inspection.textContent = ''; render();
    inputTimer = setTimeout(() => void inspectProduct(), 350);
  });
  inspectButton.addEventListener('click', () => void inspectProduct());
  for (const [action, form] of Object.entries(forms)) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy || form.querySelector('button[type=submit]').disabled || !environmentReady) return;
      busy = true; render();
      const input = Object.fromEntries(new FormData(form));
      // FormData excludes disabled inputs, so capture values directly while pending.
      for (const field of form.querySelectorAll('input,select')) input[field.name] = field.value;
      const labels = { grantRole: 'Role grant', createProduct: 'Product creation', handoverProduct: 'Product handover' };
      notice.hidden = false;
      notice.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try {
        await session.transact(action, input, (progress) => {
          notice.className = `transaction-panel ${progress.phase === 'failed' ? 'warning' : progress.phase === 'confirmed' ? 'success' : ''}`;
          $('#transaction-heading').textContent = `${labels[action]} · ${progress.phase}`;
          $('#transaction-message').textContent = ({ checking: 'Checking the wallet, network, permissions, and contract simulation…', signing: 'Review and confirm this transaction in MetaMask.', pending: 'Transaction submitted. Waiting for an on-chain receipt…', confirmed: `Confirmed in block ${progress.blockNumber}.`, failed: progress.message })[progress.phase];
          $('#transaction-hash').textContent = progress.hash || '—'; $('#transaction-gas').textContent = progress.gasUsed || '—';
        });
        if (action === 'createProduct') $('#handover-id').value = input.productId.trim();
        await refreshDemo();
        await inspectProduct();
      } catch { /* Session emitted the detailed error and any submitted hash. */ }
      finally { busy = false; render(); }
    });
  }
  render();
  return {
    setEnvironmentReady(value) {
      environmentReady = value;
      if (!value) { ++demoRun; ++productCheck; product = null; }
      render();
      if (value) { void refreshDemo(); if ($('#handover-id').value) void inspectProduct(); }
    },
  };
}

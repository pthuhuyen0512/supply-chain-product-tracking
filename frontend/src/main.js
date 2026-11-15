import './style.css';
import { deployment } from './config/index.js';
import { checkConnection } from './services/blockchain.js';
import { initializeWalletUI } from './wallet-ui.js';
import { initializeLookupUI } from './lookup-ui.js';

const paths = {
  box: '<path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v8M7.5 5.5l9 5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  wallet: '<path d="M20 8V5H5a2 2 0 0 0 0 4h16v12H5a2 2 0 0 1-2-2V7"/><path d="M21 12h-5v5h5"/>',
  scan: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 12h18"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;

document.querySelector('#app').innerHTML = `
  <a class="skip-link" href="#main">Skip to main content</a>
  <aside class="sidebar">
    <a class="brand" href="#overview" aria-label="Trace — Overview"><span class="brand-symbol">${icon('box')}</span><span>trace<span class="brand-dot">.</span></span></a>
    <div class="workspace-label">SUPPLY CHAIN MANAGEMENT</div>
    <nav aria-label="Main navigation">
      <a class="nav-link active" href="#overview">${icon('grid')}Overview</a>
      <a class="nav-link" href="#lookup">${icon('search')}Product lookup</a>
      <a class="nav-link" href="#operations">${icon('box')}Operations</a>
      <a class="nav-link" href="#participants">${icon('shield')}Access control</a>
      <a class="nav-link" href="#qr">${icon('scan')}QR & camera</a>
    </nav>
    <div class="sidebar-bottom"><span class="small-label">LOCAL TEST ENVIRONMENT</span><div><span class="dot"></span>Local Ganache</div><p>Product records on the project’s local blockchain.</p><span class="sidebar-foot">DS441A · TEAM 05</span></div>
  </aside>
  <div class="page-shell">
    <header class="topbar"><div class="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div><span class="tag">Product traceability · Step 07</span></header>
    <main id="main">
      <section id="overview" class="intro">
        <div><p class="eyebrow">FROM ORIGIN TO CUSTOMER</p><h1>Every product,<br>a traceable journey<span>.</span></h1><p class="intro-copy">Track product origins and every handover.<br class="desktop-break"> One shared history across the supply chain.</p></div>
        <div class="intro-seal">${icon('box')}<span>PRODUCT<br><strong>TRACEABILITY</strong></span></div>
      </section>
      <section class="journey" aria-label="Supply chain stages">
        <div><span class="step-number">01</span><span>Producer<small>Create & originate</small></span></div>${icon('arrow')}
        <div><span class="step-number">02</span><span>Distributor<small>Receive & distribute</small></span></div>${icon('arrow')}
        <div><span class="step-number">03</span><span>Retailer<small>Receive & retail</small></span></div>${icon('arrow')}
        <div><span class="step-number">04</span><span>Customer<small>Final delivery</small></span></div>
      </section>
      <section class="connection-strip" aria-label="Environment status">
        <div class="connection-heading"><span id="network-dot" class="dot pending"></span><strong id="network-label">Checking network…</strong></div>
        <span id="chain-label">Chain ID: —</span><span class="connection-divider"></span><span class="contract-label">Contract <code id="contract-short">—</code></span>
        <button id="check-network" class="text-button" type="button">${icon('refresh')}Check again</button>
      </section>
      <div id="network-message" class="notice" role="status" aria-live="polite">Verifying the RPC, Chain ID, and contract bytecode.</div>
      <div id="export-help" class="notice warning" hidden>Check Ganache and the deployment, run <code>npm.cmd run export:frontend</code> from the repository root, then reload this page.</div>
      <section class="primary-grid">
        <article id="lookup" class="card lookup-card">
          <div class="card-heading"><div><p class="eyebrow">OPEN TO EVERYONE</p><h2>Trace a product</h2></div><span class="tag public">Public</span></div>
          <p class="card-description">Look up a product by its ID. No wallet connection required.</p>
          <form id="lookup-form"><label for="lookup-id">Product ID</label><div class="search-row"><div class="search-input">${icon('search')}<input id="lookup-id" name="productId" placeholder="Enter an ID, e.g. COFFEE-001" autocomplete="off" maxlength="128"></div><button class="button" type="submit" disabled aria-describedby="lookup-hint">Look up ${icon('arrow')}</button></div></form>
          <p id="lookup-hint" class="field-hint">Read product details and handover history directly from Ganache.</p>
          <div class="empty-state" id="product-result" aria-live="polite"><span class="empty-icon">${icon('box')}</span><h3>Every journey starts with a product ID</h3><p>Look up a product ID to see its origin, current holder, and recorded handover history.</p></div>
          <div class="lookup-bottom">${icon('shield')}Product data is read directly from the smart contract.</div>
        </article>
        <article class="card wallet-card" id="wallet"><span class="wallet-icon">${icon('wallet')}</span><h2>Your workspace</h2><p>Connect MetaMask to view your roles<br>and perform authorized operations.</p><dl class="wallet-details"><div><dt>Wallet status</dt><dd>Not connected</dd></div><div><dt>Address</dt><dd>—</dd></div><div><dt>On-chain roles</dt><dd>Not checked</dd></div></dl><button id="connect-wallet" class="button light" disabled aria-describedby="wallet-hint">${icon('wallet')}Connect MetaMask</button><p id="wallet-hint" class="wallet-hint">Connect MetaMask to view your on-chain roles.</p></article>
      </section>
      <section id="operations" class="section-block">
        <div class="section-heading"><div><p class="eyebrow">SUPPLY CHAIN OPERATIONS</p><h2>Product operations</h2></div><span class="tag public">MetaMask signing</span></div>
        <div class="two-columns">
          <article class="card operation-card"><div class="operation-title"><span class="mini-icon">${icon('box')}</span><div><h3>Create product</h3><p>For Producers</p></div></div><form id="create-form"><label for="create-id">Product ID</label><input id="create-id" name="productId" placeholder="COFFEE-001" autocomplete="off"><label for="product-name">Product name</label><input id="product-name" name="name" placeholder="e.g. Da Lat Arabica"><label for="product-origin">Origin</label><input id="product-origin" name="origin" placeholder="e.g. Da Lat, Vietnam"><button class="button full" type="submit" disabled>Create product ${icon('arrow')}</button><p class="field-hint">Connect a wallet on the verified Ganache network.</p></form></article>
          <article class="card operation-card"><div class="operation-title"><span class="mini-icon">${icon('arrow')}</span><div><h3>Hand over product</h3><p>For the current holder</p></div></div><form id="handover-form"><label for="handover-id">Product ID</label><input id="handover-id" name="productId" placeholder="Enter the product ID" autocomplete="off"><label for="receiver">Recipient wallet address</label><input id="receiver" name="receiver" placeholder="0x…" autocomplete="off" spellcheck="false"><div class="handover-note">${icon('shield')}<p>Handovers advance to the next stage. Both sender and recipient must have the required roles.</p></div><button class="button full" type="submit" disabled>Hand over product ${icon('arrow')}</button><p class="field-hint">Connect a wallet on the verified Ganache network.</p></form></article>
        </div>
      </section>
      <section class="two-columns section-block">
        <article class="card operation-card" id="participants"><div class="card-heading"><div><p class="eyebrow">ADMINISTRATION</p><h2>Grant participant role</h2></div>${icon('shield')}</div><p class="card-description">An Admin grants supply chain roles to participant wallets.</p><form id="role-form"><label for="participant-address">Wallet address</label><input id="participant-address" name="account" placeholder="0x…" autocomplete="off" spellcheck="false"><label for="participant-role">Role</label><select id="participant-role" name="role"><option value="PRODUCER_ROLE">Producer</option><option value="DISTRIBUTOR_ROLE">Distributor</option><option value="RETAILER_ROLE">Retailer</option><option value="CUSTOMER_ROLE">Customer</option></select><button class="button full" type="submit" disabled>Grant role</button><p class="field-hint">Only an on-chain Admin can grant roles.</p></form></article>
        <article class="card operation-card" id="qr" aria-label="Product QR and camera"></article>
      </section>
      <footer><span class="footer-brand">trace.</span><span>Blockchain Project · Team 05</span><span>Local blockchain · Transactions require wallet confirmation</span></footer>
    </main>
  </div>`;

// A disabled submit button must never permit an implicit Enter-key submission.
document.querySelectorAll('form').forEach((form) => form.addEventListener('submit', (event) => event.preventDefault()));

const checkButton = document.querySelector('#check-network');
try {
const walletUI = initializeWalletUI(deployment);
const lookupUI = initializeLookupUI(deployment);
const message = document.querySelector('#network-message');
const help = document.querySelector('#export-help');
const networkLabel = document.querySelector('#network-label');
const dot = document.querySelector('#network-dot');
if (deployment.ok) {
  const { contractAddress, chainId } = deployment.value;
  document.querySelector('#chain-label').textContent = `Chain ID: ${chainId}`;
  const addressElement = document.querySelector('#contract-short');
  addressElement.textContent = `${contractAddress.slice(0, 6)}…${contractAddress.slice(-4)}`;
  addressElement.title = contractAddress;
  addressElement.setAttribute('aria-label', `Contract address ${contractAddress}`);
}

async function refreshNetwork() {
  walletUI.setEnvironmentReady(false);
  lookupUI.invalidateEnvironment();
  checkButton.disabled = true;
  checkButton.setAttribute('aria-busy', 'true');
  message.className = 'notice';
  dot.className = 'dot pending';
  networkLabel.textContent = 'Checking network…';
  message.textContent = 'Verifying the RPC, Chain ID, and contract bytecode.';
  help.hidden = true;
  try {
    if (!deployment.ok) throw deployment;
    const result = await checkConnection(deployment.value);
    networkLabel.textContent = 'Ganache connected';
    dot.className = 'dot';
    message.className = 'notice success';
    message.textContent = `Chain ID ${result.chainId} and contract bytecode verified. Connect MetaMask to perform authorized operations.`;
    walletUI.setEnvironmentReady(true);
  } catch (error) {
    dot.className = 'dot error';
    networkLabel.textContent = 'Environment not ready';
    message.className = 'notice warning';
    message.textContent = error.message || 'Unable to check the environment. Please try again.';
    help.hidden = !['CONFIG_MISSING', 'CONFIG_INVALID', 'CONTRACT_MISSING'].includes(error.code);
  } finally {
    checkButton.disabled = false;
    checkButton.removeAttribute('aria-busy');
  }
}

checkButton.addEventListener('click', refreshNetwork);
void refreshNetwork();

const navLinks = [...document.querySelectorAll('.nav-link')];
const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => {
    const active = link.hash === `#${visible.target.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-10% 0px -45% 0px', threshold: [0, 0.2, 0.6] });
['overview', 'lookup', 'operations', 'participants', 'qr'].forEach((id) => observer.observe(document.getElementById(id)));
} catch (error) {
  document.querySelector('#network-label').textContent = 'Application error';
  document.querySelector('#network-dot').className = 'dot error';
  document.querySelector('#network-message').textContent = `Application startup failed: ${error.message}`;
  document.querySelector('#network-message').className = 'notice warning';
  console.error(error);
}

import QRCode from 'qrcode';
import { createProductReader, normalizeProductId, PRODUCT_STAGES, displayTimestamp, lookupError } from './services/products.js';
import { CameraController } from './services/camera.js';

export function initializeLookupUI(deployment) {
  const $ = (selector) => document.querySelector(selector);
  const form = $('#lookup-form'), input = $('#lookup-id'), button = form.querySelector('button');
  const result = $('#product-result'), hint = $('#lookup-hint');
  const reader = deployment.ok ? createProductReader(deployment.value) : null;
  let requestId = 0, qrRequest = 0, fileBusy = false;
  $('#qr').innerHTML = `<div class="card-heading"><div><p class="eyebrow">SCAN TO TRACE</p><h2>QR & camera</h2></div><span class="tag public">Product ID only</span></div>
    <label for="qr-product-id">Product ID for QR code</label><input id="qr-product-id" value="COFFEE-DEMO-001" autocomplete="off">
    <button id="generate-qr" class="button secondary full" type="button">Generate QR code</button>
    <div id="qr-output" hidden><img id="qr-image" alt="Product QR code"><p id="qr-payload"></p><a id="download-qr" class="text-button" download="trace-product-qr.png">Download QR image</a></div>
    <p id="qr-message" class="field-hint" role="status" aria-live="polite">The QR contains only the product ID. Product existence is checked during lookup.</p>
    <div class="camera-actions"><button id="open-camera" class="button secondary" type="button">Open camera</button><button id="stop-camera" class="button secondary" type="button" disabled>Stop camera</button></div>
    <div id="scanner-view"></div><div id="file-scanner-view" class="file-scanner-view" aria-hidden="true"></div>
    <label for="qr-file">Scan QR image</label><input id="qr-file" type="file" accept="image/*">
    <p id="camera-message" class="field-hint" role="status" aria-live="polite">Camera is off. Access is requested only when you click Open camera.</p>`;
  const qrInput = $('#qr-product-id'), qrImage = $('#qr-image'), qrOutput = $('#qr-output');
  const cameraMessage = $('#camera-message');
  input.value = 'COFFEE-DEMO-001';
  input.removeAttribute('maxlength');
  button.disabled = !deployment.ok;
  hint.textContent = deployment.ok ? 'Reads directly from Ganache. No wallet connection or transaction is required.' : deployment.message + ' Run the export command shown above.';
  result.querySelector('p').textContent = 'Look up a product ID to see its origin, current holder, and recorded handover history.';
  let camera;
  const element = (tag, text, className) => {
    const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node;
  };
  function clearResult() { result.replaceChildren(); result.className = 'lookup-result'; }
  function renderProduct(product) {
    const heading = element('div', undefined, 'product-heading');
    heading.append(element('h3', product.name), element('span', PRODUCT_STAGES[product.stage] ?? 'Unknown stage', 'tag public'));
    const details = element('dl', undefined, 'product-details');
    for (const [label, value] of [['Product ID', product.productId], ['Origin', product.origin], ['Current holder', product.holder], ['Created at', displayTimestamp(product.createdAt).text]]) {
      const row = element('div'); row.append(element('dt', label), element('dd', value)); details.append(row);
    }
    result.append(heading, details, element('h3', 'Handover history', 'history-heading'));
    const list = element('ol', undefined, 'timeline');
    for (const entry of product.history) {
      const item = element('li');
      item.append(element('h4', entry.initialized ? 'Product initialized' : PRODUCT_STAGES[entry.stage] ?? 'Unknown stage'));
      const date = displayTimestamp(entry.timestamp), time = element('time', date.text);
      if (date.iso) time.dateTime = date.iso;
      item.append(time);
      if (!entry.initialized) item.append(element('p', `From: ${entry.from}`));
      item.append(element('p', `${entry.initialized ? 'Initial holder' : 'To'}: ${entry.to}`));
      list.append(item);
    }
    result.append(list, element('p', `${product.history.length} recorded ${product.history.length === 1 ? 'event' : 'events'} · Times shown in your local time zone.`, 'field-hint'));
  }
  async function lookup(raw) {
    const request = ++requestId; clearResult(); clearQR(); hint.className = 'field-hint';
    try {
      if (!deployment.ok) throw new Error(deployment.message + ' Run npm.cmd run export:frontend from the repository root.');
      const id = normalizeProductId(raw); input.value = id; qrInput.value = id;
      button.disabled = true; form.setAttribute('aria-busy', 'true'); hint.textContent = 'Reading product and history from Ganache…';
      const product = await reader.lookup(id);
      if (request !== requestId) return;
      if (!product) { hint.textContent = `No product was found for ID: ${id}`; return; }
      renderProduct(product);
      hint.textContent = 'Product and history verified from the same block. No wallet was required.';
      qrInput.value = id; clearQR();
    } catch (error) {
      if (request !== requestId) return;
      hint.className = 'field-hint lookup-warning'; hint.textContent = lookupError(error);
    } finally {
      if (request === requestId) { button.disabled = !deployment.ok; form.removeAttribute('aria-busy'); }
    }
  }
  function clearQR() {
    ++qrRequest; qrOutput.hidden = true; qrImage.removeAttribute('src'); $('#download-qr').removeAttribute('href'); $('#qr-payload').textContent = '';
    $('#qr-message').textContent = 'The QR contains only the product ID. Product existence is checked during lookup.';
  }
  form.addEventListener('submit', (event) => { event.preventDefault(); void lookup(input.value); });
  input.addEventListener('input', () => {
    ++requestId; clearResult(); clearQR(); qrInput.value = input.value; button.disabled = !deployment.ok; form.removeAttribute('aria-busy');
    hint.className = 'field-hint'; hint.textContent = deployment.ok ? 'Press Look up to read this product ID.' : deployment.message;
  });
  qrInput.addEventListener('input', () => { clearQR(); $('#qr-message').textContent = 'Generate a QR code for the current product ID.'; });
  $('#generate-qr').addEventListener('click', async () => {
    clearQR(); const request = qrRequest; $('#generate-qr').disabled = true;
    try {
      const id = normalizeProductId(qrInput.value); qrInput.value = id;
      const url = await QRCode.toDataURL(id, { width: 512, margin: 4, errorCorrectionLevel: 'M' });
      if (request !== qrRequest) return;
      qrImage.src = url; qrImage.alt = `QR code containing product ID ${id}`; $('#qr-payload').textContent = id;
      $('#download-qr').href = url; qrOutput.hidden = false; $('#qr-message').textContent = 'QR ready. Download it or display it on another screen for the webcam test.';
    } catch (error) { if (request === qrRequest) $('#qr-message').textContent = `Unable to generate QR: ${error.message}`; }
    finally { $('#generate-qr').disabled = false; }
  });
  const releaseTracks = () => {
    for (const video of $('#scanner-view').querySelectorAll('video')) for (const track of video.srcObject?.getTracks?.() ?? []) track.stop();
  };
  function cameraControls() {
    $('#open-camera').disabled = fileBusy || camera.state !== 'idle';
    $('#stop-camera').disabled = fileBusy || !['starting', 'running'].includes(camera.state);
    $('#qr-file').disabled = fileBusy || camera.state !== 'idle';
  }
  async function scanResult(id) {
    cameraMessage.textContent = 'QR decoded. Camera released. Looking up the decoded text as a product ID.';
    input.value = id; await lookup(id); $('#lookup').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  async function makeScanner(id) {
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');
    return new Html5Qrcode(id, { formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false });
  }
  camera = new CameraController({ createScanner: () => makeScanner('scanner-view'), releaseTracks,
    onState: (state) => {
      cameraControls();
      cameraMessage.textContent = ({ idle: 'Camera is off.', starting: 'Waiting for camera permission and startup…', running: 'Camera is on. Hold a product QR code in front of the webcam.', stopping: 'Stopping the camera…' })[state];
    }, onDecoded: scanResult, onError: (message) => { cameraMessage.textContent = message; },
  });
  $('#open-camera').addEventListener('click', () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { cameraMessage.textContent = 'Camera access requires a supported browser on localhost or HTTPS.'; return; }
    void camera.start();
  });
  $('#stop-camera').addEventListener('click', () => { void camera.stop().catch(() => { cameraMessage.textContent = 'Camera tracks were released, but the scanner reported a cleanup error. Reload before retrying.'; }); });
  $('#qr-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0]; if (!file || fileBusy) return;
    fileBusy = true; cameraControls(); let fileScanner;
    try {
      await camera.stop(); cameraMessage.textContent = 'Reading the selected QR image…';
      fileScanner = await makeScanner('file-scanner-view');
      const id = normalizeProductId(await fileScanner.scanFile(file, false));
      await scanResult(id);
    } catch { cameraMessage.textContent = 'No valid product QR could be read from this image. Choose a clear QR image or enter the ID manually.'; }
    finally { try { fileScanner?.clear(); } catch { /* No camera stream is used for file scanning. */ } event.target.value = ''; fileBusy = false; cameraControls(); }
  });
  const stopForNavigation = () => { releaseTracks(); void camera.stop().catch(() => {}); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopForNavigation(); });
  window.addEventListener('pagehide', stopForNavigation);
  window.addEventListener('hashchange', () => { if (location.hash !== '#qr') stopForNavigation(); });
  document.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', () => { if (link.hash !== '#qr') stopForNavigation(); }));
  const cameraVisibility = new IntersectionObserver((entries) => {
    if (entries.some((entry) => !entry.isIntersecting) && ['starting', 'running'].includes(camera.state)) stopForNavigation();
  });
  cameraVisibility.observe($('#qr'));
  cameraControls();
  return {
    invalidateEnvironment() { ++requestId; clearResult(); clearQR(); button.disabled = !deployment.ok; form.removeAttribute('aria-busy'); hint.textContent = deployment.ok ? 'Checking the blockchain connection. You can retry lookup after verification.' : deployment.message; },
  };
}

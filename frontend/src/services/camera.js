import { normalizeProductId } from './products.js';

export function cameraError(error) {
  const name = error?.name ?? '';
  const text = String(error?.message ?? error);
  if (/NotAllowed|PermissionDenied|permission|denied/i.test(name + ' ' + text)) return 'Camera access was denied. Allow camera access for this site in Edge, then try again.';
  if (/NotFound|DevicesNotFound|not found|no camera/i.test(name + ' ' + text)) return 'No camera was found. Connect a webcam or use Scan QR image.';
  if (/NotReadable|TrackStart|in use|busy/i.test(name + ' ' + text)) return 'The camera could not be opened. Close other applications using it and try again.';
  return 'Unable to start the camera. Check the device and site permission, or use Scan QR image.';
}

// All library operations are serialized. A stop requested while permission/start is
// pending invalidates the start immediately and releases its stream when it resolves.
export class CameraController {
  constructor({ createScanner, onState = () => {}, onDecoded = () => {}, onError = () => {}, releaseTracks = () => {} }) {
    Object.assign(this, { createScanner, onState, onDecoded, onError, releaseTracks });
    this.state = 'idle'; this.queue = Promise.resolve(); this.intent = 0;
    this.scanner = null; this.started = false; this.accepted = false; this.disposed = false;
  }
  setState(state) { this.state = state; this.onState(state); }
  enqueue(action) { const task = this.queue.then(action); this.queue = task.catch(() => {}); return task; }
  async cleanup() {
    const scanner = this.scanner;
    this.scanner = null;
    try { if (this.started && scanner) await scanner.stop(); }
    finally {
      this.started = false; this.releaseTracks();
      try { scanner?.clear(); } catch { /* Tracks are already stopped, even if the library cannot clear its view. */ }
    }
  }
  start() {
    if (this.disposed || this.state !== 'idle' || this.stopTask) return Promise.resolve(false);
    const intent = ++this.intent;
    this.accepted = false; this.invalidReported = false; this.setState('starting');
    return this.enqueue(async () => {
      try {
        this.scanner = await this.createScanner();
        if (intent !== this.intent || this.disposed) { await this.cleanup(); return false; }
        await this.scanner.start({ facingMode: 'environment' }, {
          fps: 8, qrbox: (width, height) => ({ width: Math.floor(Math.min(width, height) * 0.7), height: Math.floor(Math.min(width, height) * 0.7) }),
        }, (text) => this.accept(text, intent), () => {});
        this.started = true;
        if (intent !== this.intent || this.disposed) { await this.cleanup(); return false; }
        this.setState('running'); return true;
      } catch (error) {
        try { await this.cleanup(); } catch { /* releaseTracks is always called by cleanup. */ }
        if (intent === this.intent && !this.disposed) { this.setState('idle'); this.onError(cameraError(error)); }
        return false;
      } finally {
        if (this.state === 'starting') this.setState('idle');
      }
    });
  }
  accept(raw, intent) {
    if (intent !== this.intent || this.accepted || this.disposed) return;
    let id;
    try { id = normalizeProductId(raw); }
    catch (error) { if (!this.invalidReported) { this.invalidReported = true; this.onError(error.message); } return; }
    this.accepted = true;
    void this.stop().then(() => { if (!this.disposed) return this.onDecoded(id); }).catch((error) => this.onError(error.message));
  }
  stop() {
    if (this.stopTask) return this.stopTask;
    ++this.intent; this.accepted = true;
    if (this.state === 'idle' && !this.scanner) return Promise.resolve();
    this.setState('stopping');
    this.stopTask = this.enqueue(async () => {
      try { await this.cleanup(); }
      finally { this.setState('idle'); }
    }).finally(() => { this.stopTask = null; });
    return this.stopTask;
  }
  async dispose() { this.disposed = true; await this.stop(); }
}

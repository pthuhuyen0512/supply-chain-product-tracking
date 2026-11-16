import { BrowserProvider, Contract, FetchRequest, JsonRpcProvider, ZeroAddress, getAddress } from 'ethers';
import abi from '../abi/SupplyChain.json' with { type: 'json' };
import { contractInterface } from './blockchain.js';

export const ROLE_GETTERS = { Admin: 'DEFAULT_ADMIN_ROLE', Producer: 'PRODUCER_ROLE', Distributor: 'DISTRIBUTOR_ROLE', Retailer: 'RETAILER_ROLE', Customer: 'CUSTOMER_ROLE' };
export const STAGES = ['Not found', 'Produced', 'At distributor', 'At retailer', 'Delivered'];
const NEXT_ROLES = { 1: ['Producer', 'Distributor'], 2: ['Distributor', 'Retailer'], 3: ['Retailer', 'Customer'] };
const CONTRACT_ERRORS = {
  InvalidAccount: 'The account receiving a role cannot be the zero address.',
  InvalidRole: 'This role is not supported.',
  EmptyProductId: 'Product ID is required.',
  EmptyName: 'Product name is required.',
  EmptyOrigin: 'Origin is required.',
  ProductExists: 'Product exists: this product ID has already been used.',
  ProductNotFound: 'Product not found.',
  NotCurrentHolder: 'Only the current holder can hand over this product.',
  InvalidReceiver: 'The recipient cannot be the zero address.',
  CannotTransferToSelf: 'You cannot hand over a product to yourself.',
  NotDistributor: 'The recipient needs the Distributor role.',
  NotRetailer: 'The recipient needs the Retailer role.',
  NotCustomer: 'The recipient needs the Customer role.',
  AlreadyDelivered: 'This product has already been delivered and cannot be handed over again.',
  AccessControlUnauthorizedAccount: 'The wallet does not have the required on-chain role. Refresh roles and select the correct account.',
  AccessControlBadConfirmation: 'The wallet confirmation address is incorrect.',
};

export function requiredText(value, label) {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${label} is required.`);
  return text;
}
export function walletAddress(value) {
  try {
    const address = getAddress(String(value ?? '').trim());
    if (address === ZeroAddress) throw new Error();
    return address;
  } catch { throw new Error('Enter a valid, non-zero wallet address.'); }
}
export function handoverPermission(product, address, roles) {
  if (!product?.exists) return 'Product not found.';
  if (product.currentHolder.toLowerCase() !== address?.toLowerCase()) return 'Only the current holder can hand over this product.';
  const next = NEXT_ROLES[Number(product.stage)];
  if (!next) return 'This product has already been delivered.';
  if (!roles.includes(next[0])) return `The current holder needs the ${next[0]} role.`;
  return null;
}

export function readableError(error) {
  const code = error?.code ?? error?.info?.error?.code ?? error?.error?.code;
  if (code === 4001 || code === 'ACTION_REJECTED') return 'The request was rejected in MetaMask. No new confirmation was received.';
  if (code === -32002) return 'A request is already open in MetaMask. Complete or reject that request first.';
  if (code === 4900 || code === 4901) return 'MetaMask is disconnected. Check the selected network and reconnect.';
  if (code === 'INSUFFICIENT_FUNDS') return 'This wallet needs more local test ETH to pay for gas.';
  if (code === 'TRANSACTION_REPLACED' && error.cancelled) return 'The transaction was cancelled or replaced in the wallet.';
  if (code === 'TIMEOUT') return 'Confirmation timed out. The transaction may still be pending; check its hash before retrying.';
  // ethers may decode the revert itself; Ganache/MetaMask can nest raw data.
  if (CONTRACT_ERRORS[error?.revert?.name]) return CONTRACT_ERRORS[error.revert.name];
  const candidates = [error?.data, error?.info?.error?.data, error?.error?.data];
  for (const candidate of candidates) {
    const data = typeof candidate === 'string' ? candidate : candidate?.result ?? candidate?.data ?? candidate?.originalError?.data;
    if (typeof data !== 'string' || !data.startsWith('0x')) continue;
    try {
      const parsed = contractInterface.parseError(data);
      if (CONTRACT_ERRORS[parsed?.name]) return CONTRACT_ERRORS[parsed.name];
      if (parsed?.name === 'Error') return `Contract rejected the operation: ${parsed.args[0]}`;
    } catch { /* Use a safe text fallback below. */ }
  }
  if (error?.reason) return `Contract rejected the operation: ${error.reason}`;
  if (['NETWORK_ERROR', 'SERVER_ERROR', 'OFFCHAIN_FAULT'].includes(code)) return 'The RPC or wallet network is unavailable. Check Ganache and the selected network.';
  return error?.shortMessage || error?.message || 'The operation failed. Please check the wallet and try again.';
}

export class WalletSession {
  constructor(config, { ethereum, onChange = () => {}, reader, readProvider, makeBrowser, makeWriter } = {}) {
    this.config = config;
    this.ethereum = ethereum;
    this.onChange = onChange;
    const request = new FetchRequest(config.rpcUrl); request.timeout = 5000;
    this.readProvider = readProvider ?? new JsonRpcProvider(request, undefined, { batchMaxCount: 1, cacheTimeout: -1, pollingInterval: 1500 });
    this.reader = reader ?? new Contract(config.contractAddress, abi, this.readProvider);
    this.makeBrowser = makeBrowser ?? ((injected) => new BrowserProvider(injected, 'any', { cacheTimeout: -1 }));
    this.makeWriter = makeWriter ?? ((signer) => new Contract(config.contractAddress, abi, signer));
    this.epoch = 0;
    this.selected = false;
    this.busy = false;
    this.state = { status: 'disconnected', address: null, roles: [], chainId: null, error: null };
    this.handlers = {
      accountsChanged: () => this.handleChange(),
      chainChanged: () => this.handleChange(),
      disconnect: () => { this.selected = false; this.invalidate('disconnected'); },
    };
    for (const [event, handler] of Object.entries(this.handlers)) this.ethereum?.on?.(event, handler);
  }
  invalidate(status = 'syncing') {
    this.epoch += 1;
    this.writer = null;
    this.browser = null;
    this.state = { status, address: null, roles: [], chainId: null, error: null };
    this.onChange(this.state);
    return this.epoch;
  }
  handleChange() {
    this.invalidate(this.selected ? 'syncing' : 'disconnected');
    if (this.selected) void this.sync().catch(() => {});
  }
  async roleIds() {
    return Object.fromEntries(await Promise.all(Object.entries(ROLE_GETTERS).map(async ([name, getter]) => [name, await this.reader[getter]()] )));
  }
  async rolesFor(address) {
    const ids = await this.roleIds();
    const pairs = await Promise.all(Object.entries(ids).map(async ([name, id]) => [name, await this.reader.hasRole(id, address)]));
    return pairs.filter(([, allowed]) => allowed).map(([name]) => name);
  }
  async connect() {
    if (!this.ethereum) throw new Error('MetaMask was not found. Open this page in a browser with MetaMask enabled.');
    if (this.state.status === 'connecting') return;
    this.selected = true;
    const epoch = this.invalidate('connecting');
    try {
      await this.ethereum.request({ method: 'eth_requestAccounts' });
      // The approval can itself emit accountsChanged; sync the current state either way.
      return await this.sync();
    } catch (error) {
      if (epoch === this.epoch) { this.selected = false; this.invalidate('disconnected'); }
      throw error;
    }
  }
  async sync() {
    if (!this.selected || !this.ethereum) return;
    const epoch = this.invalidate('syncing');
    try {
      const [accounts, hex] = await Promise.all([
        this.ethereum.request({ method: 'eth_accounts' }), this.ethereum.request({ method: 'eth_chainId' }),
      ]);
      if (epoch !== this.epoch) return;
      if (!accounts.length) { this.selected = false; this.invalidate('disconnected'); return; }
      const address = getAddress(accounts[0]);
      const chainId = BigInt(hex).toString();
      if (chainId !== this.config.chainId) {
        this.state = { status: 'wrong-network', address, chainId, roles: [], error: 'Select the configured Ganache network before sending transactions.' };
        this.onChange(this.state); return;
      }
      const browser = this.makeBrowser(this.ethereum);
      const signer = await browser.getSigner(address);
      const roles = await this.rolesFor(address);
      if (epoch !== this.epoch) { browser.destroy?.(); return; }
      // Check again after asynchronous signer/role creation, even if an event was missed.
      const [latestAccounts, latestChain] = await Promise.all([
        this.ethereum.request({ method: 'eth_accounts' }), this.ethereum.request({ method: 'eth_chainId' }),
      ]);
      if (epoch !== this.epoch) { browser.destroy?.(); return; }
      if (latestAccounts[0]?.toLowerCase() !== address.toLowerCase() || BigInt(latestChain).toString() !== chainId) {
        browser.destroy?.(); this.invalidate('disconnected'); return;
      }
      this.browser = browser;
      this.writer = this.makeWriter(signer);
      this.state = { status: 'ready', address, chainId, roles, error: null };
      this.onChange(this.state);
    } catch (error) {
      if (epoch === this.epoch) {
        this.state = { ...this.state, status: 'error', error: readableError(error) };
        this.onChange(this.state);
      }
      throw error;
    }
  }
  disconnect() { this.selected = false; this.invalidate('disconnected'); }
  async switchNetwork() {
    if (!this.ethereum) throw new Error('MetaMask was not found.');
    const chainId = `0x${BigInt(this.config.chainId).toString(16)}`;
    this.invalidate('syncing');
    try {
      try { await this.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] }); }
      catch (error) {
        if ((error.code ?? error.data?.originalError?.code) !== 4902) throw error;
        await this.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId, chainName: 'Ganache Local', rpcUrls: [this.config.rpcUrl], nativeCurrency: { name: 'Test Ether', symbol: 'ETH', decimals: 18 } }] });
        await this.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
      }
      if (this.selected) await this.sync(); else this.invalidate('disconnected');
    } catch (error) { if (this.selected) await this.sync().catch(() => {}); throw error; }
  }
  async assertCurrent(snapshot) {
    if (snapshot.epoch !== this.epoch || this.writer !== snapshot.writer) throw new Error('Wallet changed. Review the active account and try again.');
    const [accounts, hex, walletCode, rpcCode, rpcNetwork] = await Promise.all([
      this.ethereum.request({ method: 'eth_accounts' }), this.ethereum.request({ method: 'eth_chainId' }),
      this.ethereum.request({ method: 'eth_getCode', params: [this.config.contractAddress, 'latest'] }), this.readProvider.getCode(this.config.contractAddress), this.readProvider.getNetwork(),
    ]);
    if (snapshot.epoch !== this.epoch || this.writer !== snapshot.writer) throw new Error('Wallet changed. Review the active account and try again.');
    if (accounts[0]?.toLowerCase() !== snapshot.address.toLowerCase() || BigInt(hex).toString() !== this.config.chainId || rpcNetwork.chainId.toString() !== this.config.chainId) {
      this.invalidate('disconnected'); throw new Error('The active wallet account or network changed. Reconnect before sending.');
    }
    if (walletCode === '0x' || walletCode?.toLowerCase() !== rpcCode.toLowerCase()) {
      this.invalidate('error'); throw new Error('MetaMask and the configured RPC do not have the same contract. Check the RPC URL in MetaMask.');
    }
  }
  async product(id) { return this.reader.getProduct(requiredText(id, 'Product ID')); }
  async transact(action, input, onProgress = () => {}) {
    if (this.busy) throw new Error('A transaction is already in progress.');
    if (this.state.status !== 'ready' || !this.writer) throw new Error('Connect the correct wallet and Ganache network first.');
    this.busy = true;
    const snapshot = { epoch: this.epoch, writer: this.writer, address: this.state.address };
    let hash;
    try {
      onProgress({ phase: 'checking', action });
      await this.assertCurrent(snapshot);
      const ids = await this.roleIds();
      let method, args;
      if (action === 'grantRole') {
        const roleName = Object.keys(ROLE_GETTERS).find((name) => name !== 'Admin' && ROLE_GETTERS[name] === input.role);
        if (!roleName) throw new Error('Choose a supported participant role.');
        const account = walletAddress(input.account);
        if (!await this.reader.hasRole(ids.Admin, snapshot.address)) throw new Error('Only an on-chain Admin can grant roles.');
        method = 'grantRole'; args = [ids[roleName], account];
      } else if (action === 'createProduct') {
        args = [requiredText(input.productId, 'Product ID'), requiredText(input.name, 'Product name'), requiredText(input.origin, 'Origin')];
        if (!await this.reader.hasRole(ids.Producer, snapshot.address)) throw new Error('The active wallet needs the Producer role to create products.');
        method = 'createProduct';
      } else if (action === 'handoverProduct') {
        const id = requiredText(input.productId, 'Product ID');
        const to = walletAddress(input.receiver);
        if (to.toLowerCase() === snapshot.address.toLowerCase()) throw new Error('You cannot hand over a product to yourself.');
        const product = await this.product(id);
        const roles = await this.rolesFor(snapshot.address);
        const denied = handoverPermission(product, snapshot.address, roles);
        if (denied) throw new Error(denied);
        const nextRole = NEXT_ROLES[Number(product.stage)][1];
        if (!await this.reader.hasRole(ids[nextRole], to)) throw new Error(`The recipient needs the ${nextRole} role.`);
        method = 'handoverProduct'; args = [id, to];
      } else throw new Error('Unknown operation.');
      await this.assertCurrent(snapshot);
      // Simulate using the actual signer before opening a signing request.
      await snapshot.writer[method].staticCall(...args);
      await this.assertCurrent(snapshot);
      onProgress({ phase: 'signing', action });
      const tx = await snapshot.writer[method](...args);
      hash = tx.hash;
      onProgress({ phase: 'pending', action, hash });
      let receipt;
      try { receipt = await tx.wait(1, 120000); }
      catch (error) {
        if (error.code === 'TRANSACTION_REPLACED' && !error.cancelled) receipt = error.receipt;
        else {
          // A chain switch can interrupt BrowserProvider polling. Verify any mined
          // receipt on the configured local RPC; never infer success from a hash.
          receipt = await this.readProvider.getTransactionReceipt(hash).catch(() => null);
          if (!receipt) throw error;
        }
      }
      if (!receipt || receipt.status !== 1) throw new Error('The transaction failed on-chain.');
      const result = { phase: 'confirmed', action, hash: receipt.hash ?? hash, gasUsed: receipt.gasUsed.toString(), blockNumber: receipt.blockNumber };
      onProgress(result);
      return result;
    } catch (error) {
      onProgress({ phase: 'failed', action, hash, message: readableError(error) });
      throw error;
    } finally {
      this.busy = false;
      if (this.selected) await this.sync().catch(() => {});
    }
  }
  destroy() {
    this.disconnect();
    for (const [event, handler] of Object.entries(this.handlers)) this.ethereum?.removeListener?.(event, handler);
    this.readProvider.destroy?.();
  }
}

import { Contract, FetchRequest, JsonRpcProvider, Network, ZeroAddress } from 'ethers';
import abi from '../abi/SupplyChain.json' with { type: 'json' };
import { checkConnection } from './blockchain.js';

export const PRODUCT_STAGES = ['Not found', 'Produced', 'At distributor', 'At retailer', 'Delivered'];
export function normalizeProductId(raw) {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('Enter a non-empty product ID.');
  return raw.trim();
}
export function displayTimestamp(seconds) {
  try {
    const value = BigInt(seconds);
    if (value < 0n || value > 8640000000000n) return { text: 'Timestamp outside the supported date range', iso: '' };
    const date = new Date(Number(value) * 1000);
    return { text: date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium' }), iso: date.toISOString() };
  } catch { return { text: 'Timestamp unavailable', iso: '' }; }
}
export function mapProduct(productId, product, history) {
  if (!product.exists) return null;
  return {
    productId, name: product.name, origin: product.origin, holder: product.currentHolder,
    stage: Number(product.stage), createdAt: product.createdAt.toString(),
    history: Array.from(history, (entry) => ({ from: entry.from, to: entry.to,
      stage: Number(entry.stage), timestamp: entry.timestamp.toString(),
      initialized: entry.from.toLowerCase() === ZeroAddress,
    })),
  };
}
export function createProductReader(config, { provider, contract, verify } = {}) {
  if (!provider) {
    const request = new FetchRequest(config.rpcUrl); request.timeout = 5000;
    // checkConnection verifies the actual chain before every read. A configured
    // static network prevents ethers from retrying initial network detection forever
    // if the RPC disappears between that check and the first contract call.
    provider = new JsonRpcProvider(request, new Network('ganache-local', BigInt(config.chainId)), { staticNetwork: true, batchMaxCount: 1, cacheTimeout: -1 });
  }
  const reader = contract ?? new Contract(config.contractAddress, abi, provider);
  return {
    async lookup(raw) {
      const id = normalizeProductId(raw);
      await (verify ?? (() => checkConnection(config)))();
      const block = await provider.getBlockNumber();
      const [product, history] = await Promise.all([
        reader.getProduct(id, { blockTag: block }), reader.getHistory(id, { blockTag: block }),
      ]);
      return mapProduct(id, product, history);
    },
    destroy() { provider.destroy?.(); },
  };
}
export function lookupError(error) {
  if (error?.code === 'TIMEOUT') return 'The RPC request timed out. Check Ganache and try again.';
  if (['NETWORK_ERROR', 'SERVER_ERROR', 'UNKNOWN_ERROR', 'BAD_DATA'].includes(error?.code)) return 'Unable to read the product from Ganache. Check the RPC and deployment, then try again.';
  return error?.message || 'Unable to read the product. Check Ganache and try again.';
}

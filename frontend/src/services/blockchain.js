import { Interface } from 'ethers';
import abi from '../abi/SupplyChain.json' with { type: 'json' };

export const contractInterface = new Interface(abi);

export class ConnectionError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}

// Read-only environment check. Wallet signing is handled separately in wallet.js.
export async function checkConnection(config, { fetcher = fetch, timeoutMs = 5000 } = {}) {
  let id = 0;
  async function rpc(method, params = []) {
    const requestId = ++id;
    let response;
    try {
      response = await fetcher(config.rpcUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new ConnectionError('RPC_UNAVAILABLE', 'Unable to connect to the RPC. Check that Ganache is running and the RPC port is correct.');
    }
    if (!response.ok) throw new ConnectionError('RPC_UNAVAILABLE', `RPC returned HTTP ${response.status}.`);
    let body;
    try { body = await response.json(); } catch {
      throw new ConnectionError('RPC_INVALID', 'RPC did not return valid JSON.');
    }
    if (body?.jsonrpc !== '2.0' || body.id !== requestId || body.error || !Object.hasOwn(body, 'result')) {
      throw new ConnectionError('RPC_INVALID', 'Invalid JSON-RPC response.');
    }
    return body.result;
  }
  const client = await rpc('web3_clientVersion');
  if (typeof client !== 'string' || !/ganache/i.test(client)) {
    throw new ConnectionError('CLIENT_MISMATCH', 'The current RPC client could not be verified as Ganache.');
  }
  const chainHex = await rpc('eth_chainId');
  if (typeof chainHex !== 'string' || !/^0x[0-9a-f]+$/i.test(chainHex)) {
    throw new ConnectionError('RPC_INVALID', 'RPC returned an invalid Chain ID.');
  }
  const chainId = BigInt(chainHex).toString();
  if (chainId !== config.chainId) {
    throw new ConnectionError('CHAIN_MISMATCH', `Wrong network: RPC Chain ID is ${chainId}; the configuration requires ${config.chainId}.`);
  }
  const code = await rpc('eth_getCode', [config.contractAddress, 'latest']);
  if (code === '0x' || code === '0x0') {
    throw new ConnectionError('CONTRACT_MISSING', 'No contract was found at the configured address. The workspace may have changed; check the deployment and export again.');
  }
  if (typeof code !== 'string' || !/^0x(?:[0-9a-f]{2})+$/i.test(code)) {
    throw new ConnectionError('RPC_INVALID', 'RPC returned invalid bytecode.');
  }
  return { client, chainId, contractAddress: config.contractAddress, bytecodeBytes: (code.length - 2) / 2 };
}

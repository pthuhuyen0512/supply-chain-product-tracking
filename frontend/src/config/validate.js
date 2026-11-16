import { isAddress, ZeroAddress } from 'ethers';

export function validateDeployment(raw) {
  if (raw === undefined) return { ok: false, code: 'CONFIG_MISSING', message: 'Deployment configuration is missing.' };
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!value || typeof value !== 'object' || value.contractName !== 'SupplyChainV2' || !isAddress(value.contractAddress) ||
        value.contractAddress.toLowerCase() === ZeroAddress ||
        typeof value.chainId !== 'string' || !/^[1-9]\d*$/.test(value.chainId) ||
        typeof value.rpcUrl !== 'string') throw new Error('Invalid deployment');
    const url = new URL(value.rpcUrl);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
        !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('Invalid local RPC');
    return { ok: true, value: { contractName: value.contractName, contractAddress: value.contractAddress, rpcUrl: value.rpcUrl, chainId: value.chainId } };
  } catch {
    return { ok: false, code: 'CONFIG_INVALID', message: 'Deployment configuration is invalid or belongs to an older contract. Deploy SupplyChainV2 and export again.' };
  }
}

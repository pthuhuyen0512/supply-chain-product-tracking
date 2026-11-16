import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Contract, FetchRequest, JsonRpcProvider, formatEther } from 'ethers';

const root = fileURLToPath(new URL('../', import.meta.url));
let provider;
try {
  const productId = (process.argv[2] ?? 'COFFEE-DEMO-001').trim();
  if (!productId) throw new Error('A non-empty product ID is required.');
  const config = JSON.parse(await fs.readFile(path.join(root, 'frontend/src/config/deployment.local.json'), 'utf8'));
  const abi = JSON.parse(await fs.readFile(path.join(root, 'frontend/src/abi/SupplyChain.json'), 'utf8'));
  const url = new URL(config.rpcUrl);
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('Only the local Ganache RPC is supported.');
  const request = new FetchRequest(config.rpcUrl); request.timeout = 5000;
  provider = new JsonRpcProvider(request, undefined, { batchMaxCount: 1, cacheTimeout: -1 });
  if ((await provider.getNetwork()).chainId.toString() !== config.chainId) throw new Error('RPC Chain ID does not match local configuration.');
  if (await provider.getCode(config.contractAddress) === '0x') throw new Error('Contract not found. Check the workspace and deployment.');
  const contract = new Contract(config.contractAddress, abi, provider);
  const accounts = (await provider.send('eth_accounts', [])).slice(0, 5);
  if (accounts.length !== 5) throw new Error('Five demo accounts are required.');
  const names = ['Admin', 'Producer', 'Distributor', 'Retailer', 'Customer'];
  const getters = ['DEFAULT_ADMIN_ROLE', 'PRODUCER_ROLE', 'DISTRIBUTOR_ROLE', 'RETAILER_ROLE', 'CUSTOMER_ROLE'];
  const roles = await Promise.all(names.map(async (name, i) => ({ name, address: accounts[i], granted: await contract.hasRole(await contract[getters[i]](), accounts[i]), balanceETH: formatEther(await provider.getBalance(accounts[i])) })));
  const raw = await contract.getProduct(productId);
  const history = (await contract.getHistory(productId)).map((entry) => ({ from: entry.from, to: entry.to, timestamp: entry.timestamp.toString(), stage: Number(entry.stage) }));
  const snapshot = {
    checkedAt: new Date().toISOString(), contractAddress: config.contractAddress, chainId: config.chainId,
    block: await provider.getBlockNumber(), roles, productId,
    product: { exists: raw.exists, name: raw.name, origin: raw.origin, currentHolder: raw.currentHolder, stage: Number(raw.stage), createdAt: raw.createdAt.toString() }, history,
    fullFlowOnChain: roles.every((role) => role.granted) && raw.exists && Number(raw.stage) === 4 && history.length === 4 && history.every((entry, i) => entry.stage === i + 1 && entry.to.toLowerCase() === accounts[i + 1].toLowerCase() && entry.from.toLowerCase() === (i === 0 ? '0x0000000000000000000000000000000000000000' : accounts[i]).toLowerCase()),
    evidenceLimit: 'Read-only RPC state does not prove that MetaMask signed transactions. Manual browser confirmation and transaction receipts must be recorded separately.',
  };
  await fs.writeFile(path.join(root, 'docs/verification/wallet-demo-state.json'), JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify(snapshot, null, 2));
} catch (error) {
  console.error(`Demo verification failed: ${error.message}`); process.exitCode = 1;
} finally { provider?.destroy(); }

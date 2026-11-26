# Deployment Configuration

The ABI and configuration example belong in version control; the generated local
configuration must stay ignored. Empty values in
`deployment.example.json` are not usable configuration. Do not use a placeholder address.

Keep Ganache running and execute these commands from the repository root:

```powershell
npx.cmd hardhat compile --build-profile default
npm.cmd run deploy:local
npm.cmd run export:frontend
```

Deployment uses the `default` profile: Solidity 0.8.34, Paris EVM, optimizer disabled.
Keep this profile for baseline gas comparisons. The `production` profile enables
the optimizer with 200 runs and must be recorded separately if used. Ignition picks
production unless a profile is specified, so the npm deploy script explicitly uses default.
Deployment uses Ganache's unlocked accounts; no private key or MetaMask is required.

Export reads the URL from Hardhat configuration, Chain ID from RPC, and the
`SupplyChainV2Module#SupplyChainV2` address from
`ignition/deployments/chain-<Chain ID>/deployed_addresses.json`. ABI comes from the
`artifacts/contracts/SupplyChain_ver2.sol/SupplyChainV2.json` artifact.
It checks artifacts, bytecode, receipt, and Admin access
before writing the ignored `deployment.local.json` and `../abi/SupplyChain.json`.
On failure it exits with code 1 and warns that existing files may be stale. Do not use
them until export succeeds. Do not automatically delete journals or reset Ganache.

The export includes `contractName: "SupplyChainV2"`; configuration from V1 is rejected.
The ABI filename stays `SupplyChain.json` but contains V2 custom errors and tuple types.
V2 uses its own Ignition module ID to preserve the V1 deployment. Grant roles again
and create new products on V2; old roles and product history stay on V1.

After recompiling without contract/profile changes, run export again. If the source,
profile, or workspace changes, inspect the journal and rerun the commands above.
Resolve any Ignition conflict before proceeding; never automatically use `--reset`.

## Optional Configuration Loading

The frontend uses `import.meta.glob("./deployment.local.json", { eager: true,
query: "?raw", import: "default" })` to load optional raw JSON, then parses and
validates it at runtime. Malformed JSON produces a clear message on the page.
A static import would fail on a clean clone without the local file. If the glob is
empty or configuration is invalid, the page displays export instructions and disables
blockchain actions. Frontend tests cover missing and malformed configuration.

Addresses and Chain IDs apply only to the verified workspace. Recheck the environment
and export again after changing machines or workspaces. Keep Ganache running during use.

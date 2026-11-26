# Supply Chain Product Tracking

DS441A - Project 7 - Team 5

A local Ganache application for tracking product custody through Producer -> Distributor -> Retailer -> Customer. The final application deploys **SupplyChainV2**; V1 is retained for regression tests and controlled gas comparison. Readers can enter or scan a product ID to view its timestamped history without connecting a wallet. Writes require MetaMask and the appropriate on-chain role.

## Team

| Member | Student ID | Responsibility |
| --- | --- | --- |
| Phạm Thu Huyền | 29201139715 | Solidity, access control, contract tests, gas measurement and optimization, contract and security report |
| Mai Nam Quốc | 29211145181 | Deployment and ABI export, frontend, MetaMask integration, public lookup, QR/camera, integration evidence, README and frontend report |

Integration, report assembly and the 10-minute demonstration are shared work.

## Review and submission documents

- [Document index](docs/README.md).
- [Group report](DS441A_Team5_Project7_Report.pdf).
- [Contract test report](docs/testing/test_report.md) and [V1/V2 execution log](docs/testing/test_results_v1_v2.txt).
- [Controlled gas analysis](docs/gas/gas_report.md) and [comparison CSV](docs/gas/gas_analysis.csv).
- [Integration evidence](docs/evidence/README.md).

## Repository structure

```text
contracts/                         V1 baseline and final V2 Solidity contracts
test/                              V1/V2 correctness suites and gas measurement
ignition/modules/SupplyChain.ts    Deploys SupplyChainV2
scripts/
  export-frontend.mjs               Exports verified V2 ABI/local configuration
  compare-gas.mjs                   Validates and compares recorded gas results
frontend/
  index.html
  src/                             UI, wallet/RPC services, QR, ABI and config
  tests/                           Frontend service and gas-view tests
  public/
  package.json
  package-lock.json
docs/
  README.md                        Document index
  testing/                         Contract test report and logs
  gas/                             Analysis, comparison and before/after receipts
  evidence/                        Ganache records, V2 screenshots and appendices
hardhat.config.ts
package.json
package-lock.json
tsconfig.json
.gitignore
README.md
DS441A_Team5_Project7_Report.pdf    Shared project report
```

## 1. Prerequisites and installation

Use Node.js 22.13.0 or later, npm, Git, Ganache Desktop and a browser with MetaMask. A webcam is needed for physical QR scanning. The recorded implementation used Node 26.3.0, npm 11.16.0, Hardhat 3.21.2, Solidity 0.8.34, ethers 6.17.0 and Vite 8.3.8. Root dependencies include forge-std from GitHub, so Git and access to GitHub are needed during installation.

Open PowerShell at the repository root. Use `.cmd` if PowerShell blocks npm.ps1/npx.ps1:

```powershell
node --version
npm.cmd --version
git --version
npm.cmd ci
npx.cmd hardhat compile --build-profile default
npx.cmd tsc --noEmit
npx.cmd hardhat test mocha test/SupplyChain.test.ts test/SupplyChain_ver2.test.ts --build-profile default
Set-Location frontend
npm.cmd ci
npm.cmd test
npm.cmd run build
Set-Location ..
```

Stop any running Vite process before reinstalling frontend dependencies on Windows. Contract tests run on an isolated Hardhat blockchain and do not require Ganache or MetaMask. The saved combined contract log records 54 passing tests, 27 for each version.

## 2. Start Ganache

Open a persistent Ethereum workspace with at least five funded test accounts. Keep Ganache running. The configured RPC is `http://127.0.0.1:7545`; update `networks.ganache.url` in [hardhat.config.ts](hardhat.config.ts) if your workspace uses another port.

Read the actual Chain ID and public account addresses:

```powershell
$rpcUrl = 'http://127.0.0.1:7545'
$chainRequest = @{jsonrpc='2.0'; id=1; method='eth_chainId'; params=@()} | ConvertTo-Json -Compress
$chainReply = Invoke-RestMethod -Uri $rpcUrl -Method Post -ContentType 'application/json' -Body $chainRequest
$chainId = [Convert]::ToInt64(($chainReply.result -replace '^0x',''),16)
$chainId
$accountsRequest = @{jsonrpc='2.0'; id=2; method='eth_accounts'; params=@()} | ConvertTo-Json -Compress
$demoAccounts = (Invoke-RestMethod -Uri $rpcUrl -Method Post -ContentType 'application/json' -Body $accountsRequest).result
$demoAccounts | Select-Object -First 5
```

The recorded Ganache environment used Chain ID 1337 and Network ID 5777. These are distinct settings; configure MetaMask with the actual value from `eth_chainId`.

## 3. Deploy V2 and export configuration

With Ganache running, execute at the repository root:

```powershell
npm.cmd run deploy:local
npm.cmd run export:frontend
```

Ignition uses `SupplyChainV2Module#SupplyChainV2`, Ganache's unlocked account and the explicit **default** profile: Solidity 0.8.34, EVM target Paris, compiler optimizer disabled. The deployer receives Admin, not Producer.

Export checks the V2 artifact, Ignition record, live bytecode, transaction receipt and Admin membership before writing:

- `frontend/src/abi/SupplyChain.json`: V2 ABI; the filename is shared by frontend consumers.
- `frontend/src/config/deployment.local.json`: verified contractName, contractAddress, rpcUrl and decimal chainId for this machine.

The [configuration example](frontend/src/config/deployment.example.json) is intentionally empty. Generate the actual local file; do not copy a contract address from another machine's evidence. A clean clone can build without local configuration, but blockchain actions remain disabled until export succeeds. See the [configuration guide](frontend/src/config/README.md).

Keep the same Ganache workspace and Ignition journal for normal restarts. If you intentionally reset Ganache or change contract/compiler profile, verify the active deployment and journal before deploying/exporting again. Do not use `--reset` as a routine setup step. Repeated Ignition deploys may reuse an existing deployment.

## 4. Configure MetaMask and demo accounts

Add a custom network in MetaMask with the Ganache RPC, actual decimal Chain ID, currency ETH and no block explorer. Privately import the Ganache **test** accounts and name them as follows. Account names alone do not grant roles.

| Account | Role | Actions |
| --- | --- | --- |
| Actual deployer, normally Ganache index 0 | Admin | Grants participant roles |
| Index 1 | Producer | Creates products and transfers to Distributor |
| Index 2 | Distributor | Transfers to Retailer |
| Index 3 | Retailer | Transfers to Customer |
| Index 4 | Customer | Receives final delivery |

Use addresses from your own workspace. Never commit private keys or recovery phrases. Admin, Producer, Distributor and Retailer need local test ETH to pay for their transactions. Customer can receive a product and look up its history without sending a transaction or paying gas.

## 5. Run the frontend and demonstrate the lifecycle

```powershell
Set-Location frontend
npm.cmd run dev
```

Open the URL printed by Vite in the MetaMask-enabled browser, normally `http://127.0.0.1:5173/`. Keep the printed port if Vite chooses another one; do not open index.html using file://.

1. Connect Admin and grant the four participant roles to the matching addresses.
2. Switch to Producer and create an unused ID, for example PRODUCT-DEMO-001, with a name and origin.
3. As Producer, transfer to Distributor; as Distributor, transfer to Retailer; as Retailer, transfer to Customer. Confirm each transaction and wait for its receipt.
4. Look up the ID. Verify Delivered, Customer custody and four ordered history entries with timestamps.
5. Generate a QR containing the same product ID. Display it on another screen or print it, allow webcam access, scan it and verify the retrieved history. QR-image upload is also available. A phone displaying the QR does not need access to the computer's localhost.
6. Demonstrate an invalid operation on another product at an appropriate stage, such as Producer sending directly to Retailer. Verify a readable error and unchanged custody/history. Preflight rejection may occur before broadcast, so it may have no transaction hash.

IDs are trimmed by the frontend and remain case-sensitive. The QR stores only the literal product ID. Lookup does not require a wallet signature or transaction fee. A revoked holder must regain the required role before transferring.

## 6. Reproduce gas measurements

The controlled comparison runs on fresh Hardhat simulated chains, independently of frontend/Ganache. Commands replace the corresponding evidence files; retain the current measurements before changing inputs or compiler settings.

```powershell
$env:GAS_VERSION = 'before'
npx.cmd hardhat test mocha test/SupplyChain.gas.ts --build-profile default
$env:GAS_VERSION = 'after'
npx.cmd hardhat test mocha test/SupplyChain.gas.ts --build-profile default
node scripts/compare-gas.mjs
Remove-Item Env:GAS_VERSION
```

The recorded custom-error optimization reduces deployment gas by 14.01% with the compiler optimizer disabled. Successful business transactions have unchanged gas in that controlled experiment. [Ganache snapshot comparisons](docs/evidence/ganache_comparison.pdf) use different recorded transactions and gas prices; they are not interchangeable with the controlled experiment.

The frontend Gas comparison view displays fixed Ganache snapshot data from `frontend/src/data/gas-comparison.json`, not live measurements. Compare matched operations rather than V1's full 16-transaction snapshot against V2's 9-transaction snapshot. The view's percentages use `(V2 - V1) / V1`, whereas the gas report expresses positive savings as `(V1 - V2) / V1`.

## Troubleshooting and limitations

- Missing/invalid configuration or no contract: keep Ganache running, check the RPC and rerun deployment/export for the intended workspace.
- Wrong network or wallet: select the verified Ganache network and the correct account, then reconnect as needed.
- Missing permission: Admin must grant the role on this specific V2 contract. V1 roles and products do not migrate.
- Camera failure: use browser permissions and a localhost address; Stop camera releases the stream. QR-image upload is a fallback, not proof of a physical scan.

The system records submitted origin/custody claims; it cannot authenticate physical goods. Data is public, Admin is trusted, and the receiver does not confirm a handover. There is no payment system, product-list API or public hosting.

Dependency folders, build/cache output, local deployment configuration and Ignition journals stay ignored. Setup steps generate these locally.

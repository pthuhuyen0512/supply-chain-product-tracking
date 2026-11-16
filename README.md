# Trace Supply Chain Product Tracking

DS441A · Project 7 · Team 5

Trace records a product's origin and custody transfers on a local Ganache blockchain.
Registered participants move it through Producer → Distributor → Retailer → Customer.
Anyone using the local website can enter or scan its product ID to see its current
holder and timestamped history without connecting a wallet. All application UI is English.

The contract records submitted claims; it cannot verify physical goods, origin or
delivery. This is a local course demonstration, with no backend or public deployment.

## Team and responsibilities

| Member | Student ID | Responsibility |
| --- | --- | --- |
| Phạm Thu Huyền | 29201139715 | Solidity, access control, contract tests, gas measurement and optimization, contract and security report |
| Mai Nam Quốc | 29211145181 | Deployment and ABI export, frontend, MetaMask integration, public lookup, QR/camera, integration evidence, README and frontend report |

Integration, the final group report and the demo are shared work. At the step 09
review, local Git history contained 8 commits attributed to Huyen. Quoc's local work
has not been committed by this workflow; contributions by both members are not yet
established in Git history.

## Verified environment

The local run on **16 November 2026, Asia/Saigon**, used Windows and Microsoft Edge
with MetaMask. These are observed versions, not claims about every supported version.

| Component | Verified version |
| --- | --- |
| Node.js / npm | 26.3.0 / 11.16.0 |
| Hardhat / Ignition | 3.21.2 / 3.1.9 |
| Solidity / EVM | 0.8.34 / Paris |
| OpenZeppelin Contracts | 5.6.1 |
| ethers | 6.17.0 |
| Vite | 8.3.8 |
| qrcode / html5-qrcode | 1.5.4 / 2.3.8 |
| TypeScript / Mocha / Chai | 6.0.3 / 12.0.3 / 6.3.0 |
| Ganache RPC client | 7.7.3 |

Install Node.js, Git, Ganache Desktop and MetaMask for Edge before setup. A camera
is needed for physical QR scanning. Use the tested Node version for reproduction;
the repository lockfiles determine exact dependencies. Root dependencies include
forge-std from GitHub, so Git and access to that source are required for installation.

## Repository structure

```text
contracts/SupplyChain_ver2.sol                        Active SupplyChainV2 contract
contracts/SupplyChain.sol                             V1 baseline for gas comparison
test/SupplyChain_ver2.test.ts                          V2 contract regression tests
test/SupplyChain.test.ts                              V1 baseline tests
ignition/modules/SupplyChain.ts                       Ignition deployment module
scripts/export-frontend.mjs                           Verified ABI and local configuration export
scripts/verify-integration-chain.mjs                  Read-only receipt and history audit
frontend/                                             Vite HTML, CSS and JavaScript application
frontend/src/services/                                Environment, wallet, product and camera logic
frontend/src/abi/SupplyChain.json                     Exported ABI
frontend/src/config/                                  Example and validated local configuration
docs/verification/                                    Logs, receipts and original screenshots
docs/reports/                                         Manual acceptance Word records
docs/report-quoc.md                   Frontend and integration report section
docs/group-report-inputs.md           Outstanding group inputs
docs/group-report-outline.md          Five-page group report outline
```

## 1 Install dependencies and check the contract

Open PowerShell at the repository root. Use `.cmd` to avoid npm.ps1 execution-policy
errors. Stop an existing Vite process before reinstalling frontend dependencies on
Windows; its native bundler files can otherwise be locked.

```powershell
node --version
npm.cmd --version
git --version
npm.cmd ci
npx.cmd hardhat compile --build-profile default
npx.cmd tsc --noEmit
npx.cmd hardhat test mocha test/SupplyChain.test.ts test/SupplyChain_ver2.test.ts --build-profile default
```

Install the separate frontend dependencies, then return to the repository root:

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd test
npm.cmd run build
Set-Location ..
```

The contract tests use an isolated Hardhat network and do not require Ganache or
MetaMask. The explicit **default** build profile uses optimizer disabled and Paris;
keep it consistent for the V1/V2 source comparison. The production profile enables
optimizer runs 200 and needs a separate, controlled gas comparison.

## 2 Start Ganache and read the actual network

Open or create a persistent Ganache workspace with at least five funded test accounts.
Keep it running throughout the demo. The configured RPC is `http://127.0.0.1:7545`.
If your workspace uses a different loopback endpoint, update `networks.ganache.url`
in [hardhat.config.ts](hardhat.config.ts) before deployment.

Read the Chain ID and public accounts from your own workspace:

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

Chain ID comes from `eth_chainId`; Ganache's Network ID comes from `net_version`.
They are different settings. The verified workspace returned Chain ID **1337**
(`0x539`) and Network ID **5777**. Use your actual Chain ID in MetaMask.

## 3 Deploy and export the frontend configuration

From the repository root, with Ganache running:

```powershell
npm.cmd run deploy:local
npm.cmd run export:frontend
```

The deploy script explicitly selects the ganache network and default build profile.
It uses Ganache's unlocked test accounts; it does not need a key in source or a
MetaMask signature. The account that deploys receives DEFAULT_ADMIN_ROLE.
**Admin is not automatically Producer.**

Export verifies the client, actual Chain ID, deployed bytecode, current/recorded
artifacts, deployment receipt and Admin role before writing:

- `frontend/src/abi/SupplyChain.json`: ABI from the compiled and deployed V2 artifact.
- `frontend/src/config/deployment.local.json`: contractName (`SupplyChainV2`), contractAddress, rpcUrl and decimal
  chainId as a string, for this machine and workspace.

The schema is shown in
[deployment.example.json](frontend/src/config/deployment.example.json), whose empty
values are intentionally unusable. Generate the local file using export; do not
copy an address from another person's screenshot or acceptance log. A deployment
address is not an account address. If export fails, existing generated files can
be stale and should not be used until verification succeeds.

Ignition journals are local under `ignition/deployments/chain-<Chain ID>/`.
The local configuration and journals are ignored by Git. See the
[configuration guide](frontend/src/config/README.md) for the export checks.

### Workspace or deployment changes

The active deployment uses `SupplyChainV2` from `contracts/SupplyChain_ver2.sol`.
Its Ignition ID is `SupplyChainV2Module#SupplyChainV2`, so deploying it alongside
V1 preserves the old journal and contract. Run the deploy and export commands above
to migrate; the frontend rejects old configuration without `contractName: "SupplyChainV2"`.
Export verifies the V2 artifact and on-chain bytecode before writing the new address.
The shared ABI filename remains `SupplyChain.json` for all frontend consumers.

V2 replaces the 14 project revert strings with custom errors. The frontend decodes
them using the V2 ABI and displays English messages, including errors during preflight
and gas estimation. Product fields, events, stage order and QR IDs remain the same.
Grant participant roles again on the new contract and create new demo products;
V1 roles, products and history do not migrate. Previous acceptance evidence below
describes the historical V1 run, not V2 wallet or camera acceptance.
See [the V2 handoff](docs/CONTRACT_INTERFACE_ver2.md) for the full interface.

Preserve the current workspace and journal for normal restarts. If you deliberately
change workspaces or reset Ganache, the old receipts and products may no longer
exist, even if the Chain ID or a redeployed contract address is the same.
Re-read the accounts and network, preserve the old journal in a separately named
archive, and reconcile the active journal with the intended chain before deploying.
Do not delete journals or add Ignition `--reset` to routine setup.

After an intentional contract/profile redeployment, compile with the selected
profile, deploy it consistently, and rerun export. The npm deploy script stays on
default; do not mix a production artifact with that baseline. Export rejects an
artifact/bytecode mismatch. Restart Vite or reload after export, recheck MetaMask
network/accounts and grant roles on the new contract before using write forms.

## 4 Prepare MetaMask accounts

In Edge, configure a custom network using your actual local RPC and decimal Chain
ID, currency ETH and no block explorer. The display name alone does not establish
the RPC port: the accepted run retained the label Localhost 8545 while its verified
endpoint was port 7545.

Privately import the corresponding Ganache **test** accounts into MetaMask and name
them using the table below. Enter test keys directly in MetaMask; never put them
in source, screenshots, logs or chat. Account names do not grant on-chain roles.

| Role name | Account selection for a fresh workspace | Permitted operations |
| --- | --- | --- |
| Admin | Actual deployer, normally Ganache account index 0 | Grant participant roles |
| Producer | Index 1 | Create products and first handover |
| Distributor | Index 2 | Receive first handover and transfer to Retailer |
| Retailer | Index 3 | Receive second handover and transfer to Customer |
| Customer | Index 4 | Receive final delivery; no further handover |

Use the actual public addresses printed by RPC, not fixed addresses from this
machine. The verifier/demo checklist assumes the first five account assignments
above; if using another mapping, adapt that verifier rather than treating its
failure as a contract failure. The deployer's Admin privilege comes from the
constructor; only Admin grants the four participant roles on-chain.

## 5 Run the website and demonstrate the flow

```powershell
Set-Location frontend
npm.cmd run dev
```

Open the URL printed by Vite in **Edge with MetaMask**, normally
`http://127.0.0.1:5173/`. Keep the printed port if 5173 is already occupied. Expect
Ganache connected and the actual Chain ID. The page can open without local config,
but blockchain actions stay disabled with export instructions.

1. Connect Admin using Connect MetaMask. Grant Producer, Distributor, Retailer and
   Customer to the matching addresses; confirm each required grant in MetaMask.
2. Switch to Producer. Create an unused ID such as `DEMO-NEW-001`, name
   `Da Lat Arabica`, origin `Da Lat, Vietnam`. Confirm and wait for Produced.
3. As Producer, hand over to Distributor. Switch to Distributor and hand over to
   Retailer. Switch to Retailer and hand over to Customer. Each transfer is signed
   by the **current holder**, advances one stage and needs the recipient's role.
4. Verify Delivered and Customer holder. A delivered product has four history
   entries: initialization, Distributor, Retailer, Customer. Partial flows have fewer.
5. Use Product lookup with no wallet connection if desired. Generate a QR for the
   same ID, download/display it on another screen and scan with the computer's
   webcam. Allow camera access when prompted; decoding stops the camera and reads
   that product. Stop camera also releases it. Scan QR image is an optional fallback.

IDs are trimmed by the frontend, remain case-sensitive and are passed as original
strings to the contract. QR stores only the product ID; it is not a hosted lookup
URL. A phone displaying the QR image does not need to open the computer's localhost.

See the [wallet guide](docs/wallet-acceptance.md),
[camera guide](docs/lookup-qr-acceptance.md) and
[integration procedure](docs/integration-manual.md) for detailed cases.

## Results and evidence

On 16 November 2026, the recorded verification passed **27 contract tests**,
**25 frontend tests**, **13 isolated Edge browser cases**, root typecheck,
production build and deployment export. See
[the integration matrix](docs/verification/integration.md) and
[raw command output and exit codes](docs/verification/integration-checks.json).

The actual Edge/MetaMask replay created STEP08-DEMO-001 at block 10 and transferred
it at blocks 11–13. Customer holds the Delivered product with four entries.
[The chain audit](docs/verification/integration-chain-replay.json) matches events,
receipts, submitters and block timestamps. Actual signing rejection, duplicate ID,
invalid next recipient, former-holder and Delivered gates, plus physical fresh QR
scan/release have manual evidence in
[the Word acceptance report](docs/reports/step-08-integration-acceptance.docx).
[Earlier acceptance](docs/reports/step-06-metamask-acceptance.docx) covers steps 06–07.

Step 08 was closed within the user-approved scope: **actual-wallet disconnect and
reconnect, and wrong-network return were not run and were waived by the user**.
These behaviors have simulated browser coverage only. Passing Hardhat tests or
mock-provider tests does not prove actual MetaMask or physical camera operation.

For a read-only audit from the root, while the accepted product still exists:

```powershell
node scripts/verify-integration-chain.mjs STEP08-DEMO-001
```

That ID belongs to the recorded run; substitute your completed product ID after a
fresh deployment. The verifier expects the first five account mapping above and
previously recorded grant receipts, so its historical receipt inputs also need to
be recorded for the new run. It never sends a transaction. The full command runner
is `node scripts/check-integration.mjs`; the optional browser runner additionally
requires an existing Playwright module path and is not a runtime dependency.

## Scope and remaining group deliverables

The local app supports grants, creation, sequential handovers and product-ID reads.
It has no product list API, receiver acknowledgement, physical authenticity check
or public hosting. Data is visible on-chain. A revoked current holder cannot
transfer until the required role is restored. No external contract call is made
in the create/handover paths, but the group security analysis remains Huyen's section.

The [Quoc report section](docs/report-quoc.md) and
[five-page group outline](docs/group-report-outline.md) are prepared. **Measured
baseline/optimized gas comparison and the final 4–6-page group report are not yet
complete.** The [input checklist](docs/group-report-inputs.md) lists what Huyen
must supply. Receipt gas from this UI run is supporting baseline evidence, not
proof of an optimization. Clean-copy acceptance and the demo rehearsal belong to
step 10 and have not been claimed complete here.

`.gitignore` excludes root/frontend dependencies, build output, environment files,
generated local configuration and local Ignition journals. Keep lockfiles, the ABI,
the empty config example and reviewed public evidence with the project. No private
keys or recovery phrases belong in the repository.

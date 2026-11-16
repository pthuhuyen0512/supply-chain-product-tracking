# Frontend Deployment and Blockchain Integration

**Contributor:** Mai Nam Quốc — Student ID 29211145181  
**Course:** DS441A — Project 7 — Team 5

<!-- Group assembly notes
This is the condensed English contribution for the shared 4–6-page report.
Place Deployment and architecture in system design, User operations and public
tracing in the frontend section, and Verification and limitations in results.
Reuse the group's architecture figure rather than adding a duplicate.
The optional figure and reference definitions below support assembly; select
the figure only if it fits the shared page budget. Markdown does not establish
the final page count. Renumber headings, figures and citations when merging.
-->

## Deployment and architecture

Trace connects an English web interface to the product custody contract on local Ganache. Quốc implemented deployment integration, the frontend, MetaMask transactions, product lookup, QR processing and setup documentation. Huyền developed the contracts, contract tests and gas optimization; both members contributed to integration. The frontend uses HTML, CSS and JavaScript with Vite 8.3.8, ethers 6.17.0, qrcode 1.5.4 and html5-qrcode 2.3.8, without an application backend. [1]

Hardhat Ignition currently deploys `SupplyChainV2` through `SupplyChainV2Module`. The deployment script selects Solidity 0.8.34, Paris EVM and the default profile with optimizer disabled. The recorded RPC is `http://127.0.0.1:7545`, with Chain ID 1337 and separate Network ID 5777. The deployer receives Admin privileges; Producer must be granted separately. [1]

Before exporting the ABI and local configuration, the export script checks the artifact against the deployment record, live bytecode, successful receipt and deployer’s Admin role. The generated configuration identifies the contract name, address, RPC and Chain ID. Missing or malformed configuration produces setup guidance. V1 and V2 are separate deployments: roles and product histories do not migrate automatically. [1]

## User operations and public tracing

The interface separates product lookup, operations, access control and QR/camera functions. Public reads use `JsonRpcProvider`; writes use MetaMask through `BrowserProvider` and a Signer. Admin grants participant roles, Producer creates a product, and successive holders transfer it through Distributor and Retailer to Customer. The V2 record for `COFFEE v2-1` demonstrates the complete flow. [1, 3]

| Operation | V2 block | Resulting stage | History entries |
| --- | ---: | --- | ---: |
| Producer creates product | 22 | Produced | 1 |
| Producer transfers to Distributor | 23 | AtDistributor | 2 |
| Distributor transfers to Retailer | 24 | AtRetailer | 3 |
| Retailer transfers to Customer | 25 | Delivered | 4 |

Before signing, the application rechecks the account, network, roles, holder and stage, then simulates the call. Pending controls prevent duplicate submission, and success requires a successful receipt. Account or network changes invalidate the previous writer. Readable messages distinguish wallet rejection, RPC failure and contract errors, including V2 custom errors. Solidity remains the authority for access control. [1]

Lookup reads `getProduct` and `getHistory` at the same block without requiring a wallet. IDs are trimmed while preserving case; unknown IDs and failures clear previous results. The timeline preserves contract order and converts blockchain timestamps from seconds to local display time. QR images encode only the product ID. Decoding invokes the same lookup, with camera tracks released after decoding, stopping or leaving the scanning view. QR text is handled as literal data rather than executable HTML or a navigation URL. [1]

## Verification and limitations

The saved V1 step 08 run records 27 passing contract tests, 25 passing frontend service tests and 13 passing isolated Edge checks, alongside successful compile, typecheck, build and export. Manual MetaMask replay reached Delivered; rejected signing, duplicate IDs and invalid recipients were also checked. Physical QR decoding and camera release were accepted for V1. Actual disconnect/reconnect and wrong-network recovery were waived and not run; their coverage was simulated. These results describe the recorded V1 run, not a complete V2 regression result. [2]

V2 snapshots contain nine successful transactions at blocks 17–25: deployment, four role grants, creation and three handovers. The final lookup shows Customer custody and four history entries. Its QR-ready screenshot establishes generation but does not establish a completed physical camera scan. [3]

The system depends on the local Ganache environment and matching deployment configuration. Data is public, Admin registration is trusted, and transfers take effect without recipient acknowledgement. A copied QR does not authenticate physical goods. The implementation provides an accessible interface for recording and inspecting custody; physical authenticity and availability beyond the local environment remain limitations. [1, 3]

<!-- Optional figure for the group report
Use the original V2 lookup image below if a frontend evidence figure is needed.
Keep the text readable and use a single figure number assigned by the group.
Do not present the connected-wallet screenshot as independent proof of wallet-free
lookup; that scenario has separate V1 automated browser evidence.
-->

**Optional figure:** [V2 product timeline](<transaction log/transaction_v2/img/trace product_v2.png>).  
*Suggested caption:* Trace lookup for `COFFEE v2-1`, showing Delivered, the Customer holder and four ordered history entries corresponding to blocks 22–25 on 16 November 2026 (UTC+7). [3]

<!-- Gas section coordination
Keep the detailed gas comparison in Huyen's section instead of duplicating it here.
Gas evidence now exists in reports/comparision_gas_v1_v2.docx and the V1/V2 exports.
The frontend gas comparison view displays fixed snapshots, not live monitoring.
Compare nine matching operations, not the complete 16-transaction V1 snapshot
against nine V2 transactions. Separate gas quantity from effective gas price.
The 48-gas differences in successful product calls match calldata differences
and do not establish lower execution gas. Preserve these caveats when merging.
-->

## Sources for group assembly

1. Implementation and setup: [frontend dependencies](../frontend/package.json), [wallet service](../frontend/src/services/wallet.js), [product reader](../frontend/src/services/products.js), [camera lifecycle](../frontend/src/services/camera.js), [deployment module](../ignition/modules/SupplyChain.ts), [verified export](../scripts/export-frontend.mjs), [compiler configuration](../hardhat.config.ts) and [README](../README.md). Responsibilities follow the [assignment document](../../DS441A_Blockchain_Team5.md).
2. V1 verification: [command records](verification/integration-checks.json), [browser checks](verification/integration-browser.json), [integration acceptance](verification/integration.md), [fresh replay audit](verification/integration-chain-replay.json) and [physical camera acceptance](verification/lookup-qr.md).
3. V2 evidence: [snapshot scope and totals](<transaction log/transaction_v2/summary.json>), [transactions and receipts](<transaction log/transaction_v2/transactions.jsonl>), [original screenshots](<transaction log/transaction_v2/img/>) and [gas comparison report](reports/comparision_gas_v1_v2.docx).

The expanded contribution is available in the [full English report](reports/report-quoc-final.docx).

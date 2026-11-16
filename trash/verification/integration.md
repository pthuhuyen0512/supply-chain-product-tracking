# Step 08 Integration Verification

Date: 16 November 2026, Asia/Saigon. Status: **closed within the user-approved scope**.

Automated checks, the fresh MetaMask product replay, manual negative cases and
physical camera acceptance pass. The user explicitly waived the two remaining
actual-wallet recovery cases: disconnect/reconnect and wrong network/return.
These cases are Not run, waived by user; simulated coverage is recorded separately.
The English report with all ten original screenshots is saved at
docs/reports/step-08-integration-acceptance.docx. Step 09 has not started.

## Environment and commands

- Windows, Node 26.3.0, npm 11.16.0, Microsoft Edge.
- Hardhat default profile: Solidity 0.8.34, EVM Paris, optimizer disabled.
- Ganache 7.7.3, workspace NOISELESS-MAGIC, RPC http://127.0.0.1:7545,
  Chain ID 1337, contract 0x843B273a8c67BcaB604f14fd466162CBdBb556B9.
- Verified chain remains at block 9 after the automated checks. No transactions
  were broadcast, and Ganache was neither stopped nor reset.

`node scripts/check-integration.mjs` writes full stdout, stderr, timestamps,
profile and individual exit codes to [integration-checks.json](integration-checks.json).

| Command | Expected and actual | Status | Exit code |
| --- | --- | --- | --- |
| `npx.cmd hardhat compile --build-profile default` | Compile succeeds; existing artifacts current | PASS | 0 |
| `npx.cmd tsc --noEmit` | Typecheck succeeds | PASS | 0 |
| `npx.cmd hardhat test mocha test/SupplyChain.test.ts --build-profile default` | Isolated Hardhat contract tests; 27 passing | PASS | 0 |
| `frontend: npm.cmd test` | Frontend service tests; 25 passing | PASS | 0 |
| `frontend: npm.cmd run build` | Production bundle succeeds | PASS | 0 |
| `npm.cmd run export:frontend` | Current ABI, bytecode, deployment receipt and Admin verified | PASS | 0 |
| Protected-source git diff check | No changes to contracts, Huyen tests, Hardhat config, root lockfile or deployment module | PASS | 0 |

## Hardhat contract tests

| Case | Method | Expected and actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| Access control | Isolated in-process Hardhat network | Deployer Admin only; grants/revocations and invalid accounts/roles checked | PASS | integration-checks.json, contract test stdout |
| Create and read | Same isolated network | Empty/duplicate IDs rejected, absent IDs return false and empty history, product isolation preserved | PASS | Same log |
| Full handover | Same isolated network | All 3 stages, exact events and block timestamps match | PASS | Same log |
| Unauthorized and invalid receivers | Same isolated network | Wrong role/order, revoked sender, non-holder, self/zero recipient and post-delivery rejected with state preserved | PASS | Same log |

These are contract simulations and do not prove Ganache or MetaMask UI behavior.

## Live Ganache reads and simulations

Run `node scripts/verify-integration-chain.mjs` to reproduce the baseline audit.
The script uses only read RPC requests and `eth_call`, with no signer or send path.

| Case | Method | Expected and actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| RPC and deployment | Live client, chain and bytecode reads | Ganache, Chain ID 1337, deployed code present | PASS | [integration-chain.json](integration-chain.json) |
| All participant roles | Live hasRole plus original grant receipts and RoleGranted events | All 5 expected memberships true; four grants from Admin verified | PASS | integration-chain.json; wallet-role-receipts.json |
| Existing full flow COFFEE-DEMO-001 | Live product/history, event logs, transactions, receipts and block reads | Delivered, Customer holder, 4 ordered entries; submitted name/origin match creation transaction | PASS | integration-chain.json |
| Events and timestamps | Compare each event and history entry to receipt block | Creation block 6 and transfers 7, 8, 9 all status 1; exact sender/recipient/stage/timestamps match | PASS | Receipt references below |
| Duplicate ID | Live createProduct staticCall as Producer | Product exists; product/history unchanged | PASS | integration-chain.json negatives |
| Admin without Producer | Live createProduct staticCall as Admin | AccessControlUnauthorizedAccount; product/history unchanged | PASS | Same report |
| Non-holder handover | Live handoverProduct staticCall as Admin | Not current holder; product/history unchanged | PASS | Same report |
| Post-delivery handover | Live staticCall as Customer to Retailer | Already delivered; product/history unchanged | PASS | Same report |
| Unknown ID | Live getProduct/getHistory | exists false and empty history | PASS | STEP08-UNKNOWN-9 |
| New replay and rejection IDs | Live existence reads | STEP08-DEMO-001 and STEP08-REJECT-001 are unused | PASS | suggestedProductId and rejectedProductExists in report |

The invalid recipient stage check will use STEP08-DEMO-001 **while Produced**.
COFFEE-DEMO-001 is Delivered and is never used to claim a Produced-stage check.

### Baseline receipt references

| Action | Block | Hash |
| --- | --- | --- |
| Create | 6 | `0x49ff26648661e2761355435aa05c5746a090882cd54f13ce06670fb687df085e` |
| Producer to Distributor | 7 | `0x65a678664179a598162d32842deb4b6507466389b4c30e05a3e85922ff84972a` |
| Distributor to Retailer | 8 | `0x36bb11d1128a43bf035d25f7d88888b7f6a9da055d4460fc7644034460f88b19` |
| Retailer to Customer | 9 | `0xd77504cbcf45ec7366c185eba290a2902e6ffdfe3ed4b3db81bc217b15ce2165` |

## Browser checks

An isolated Edge test profile uses real Ganache reads. The injected test wallet
blocks every send and simulates events or rejection. The actual MetaMask extension
and the user's Edge profile are not used by this runner. RPC outage is simulated
by aborting requests inside that test context; Ganache continues running.

Reproduce with `node scripts/check-integration-browser.mjs <path-to-installed-playwright-index.mjs>`.
This run used the existing module under the Windows temporary directory
`trace-frontend-browser-check/node_modules/playwright/index.mjs`; no package was installed.
See [integration-browser.json](integration-browser.json): 13 checks pass, no page errors,
block before and after 9, zero transactions broadcast.

| Case | Method | Expected and actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| No wallet installed | Edge without window.ethereum | Public lookup works; writes locked with installation hint | PASS | integration-browser.json; integration-public-lookup.png |
| Installed but not connected | Simulated injected provider | No automatic access request; writes locked | PASS simulated | integration-browser.json |
| Admin and account change | Simulated accounts with real role reads | Admin grant allowed, creation locked; Producer reverses these gates | PASS simulated | Same report |
| Wrong network and recovery | Simulated chainChanged | Wrong network disables writes; local return recovers | PASS simulated | integration-simulated-wrong-chain.png |
| Duplicate ID | Real eth_call through simulated provider | Product exists before signing; zero send attempts | PASS automated UI | integration-browser.json |
| Signing rejected | Simulated code 4001 | English rejection, buttons recover, no broadcast | PASS simulated | Same report |
| Non-holder and Delivered | Simulated Producer/Customer with real product | Handover locked for non-holder and after delivery | PASS automated UI | Same report |
| Disconnect | Empty-account simulated event | Disconnected, writes locked, no additional access request | PASS simulated | Same report |
| Public product and history | No-wallet real reads | Delivered, Customer, four history entries | PASS | integration-public-lookup.png |
| Unknown product | No-wallet real reads | Not found; previous details/timeline cleared | PASS | integration-browser.json |
| RPC outage and recovery | Request interception only | Error clears old result; restored requests recover lookup | PASS | Same report |
| QR image | Generated image passed through actual html5-qrcode decoder | Exact product ID decoded and lookup completes | PASS | Same report |

Runner assertions were adjusted to the actual contract error text and to wait for
asynchronous role refresh; no application changes were needed during step 08.

## Actual MetaMask and physical camera acceptance

| Case | Method | Expected and actual | Status | Evidence or next action |
| --- | --- | --- | --- | --- |
| Admin grants roles | User in Edge/MetaMask, step 06 | Four grants confirmed, current memberships still true | PASS retained | Original screenshots, grant receipts, Word acceptance report |
| Existing full flow and account switching | User in Edge/MetaMask, step 06 | Creation and all handovers confirmed, roles/gates update | PASS retained | metamask-screenshots and receipt files |
| Wrong recipient role | User in Edge, step 06 Produced product | Direct Producer to Customer rejected before sending | PASS retained | metamask-screenshots/03-invalid-handover-rejected.png |
| Physical QR scan | User camera in Edge, step 07 | Correct product/history displayed | PASS retained | lookup-screenshots/01-physical-camera-lookup.png |
| Automatic and explicit camera stop | User confirmed both, step 07 | Camera indicator off after scan and after Stop camera | PASS retained | User confirmation; combined Word report sections 9 and 10 |
| Real wallet disconnect and reconnect | Not performed; user explicitly waived | Expected behavior has simulated browser coverage only | NOT RUN waived by user | User closure instruction; integration-browser.json for simulated coverage |
| Real wrong network and return | Not performed; user explicitly waived | Expected behavior has simulated browser coverage only | NOT RUN waived by user | User closure instruction; integration-browser.json for simulated coverage |
| Real signing rejection | User rejects a creation request | Screenshot shows rejection, no hash/gas and available Create product button; STEP08-REJECT-001 remains absent with empty history | PASS manual | integration-screenshots/01-signing-rejected.png; integration-manual-batch-a.json |
| Real duplicate ID | User attempts existing COFFEE-DEMO-001 | Screenshot shows Product exists with no hash/gas; original product/history unchanged | PASS manual | integration-screenshots/02-duplicate-id-rejected.png; integration-manual-batch-a.json |
| Real non-holder check in fresh replay | User screenshot after first transfer | Producer creation remains available; handover disabled with Only the current holder can hand over this product | PASS manual UI gate | integration-screenshots/05-producer-to-distributor.png; RPC confirms Distributor holder |
| Fresh product creation | User signs STEP08-DEMO-001 creation | Block 10 status 1, gas 146937, Produced, Producer holder, one history entry; event and block timestamp match | PASS manual and RPC | integration-screenshots/03-new-product-created.png; integration-chain-replay.json |
| Fresh full replay | User signs new product and three handovers | Creation at block 10 and transfers 11 to 13 verified; Delivered, Customer holder, four ordered entries, exact events and timestamps | PASS manual and RPC | integration-screenshots/03-new-product-created.png through 07-retailer-to-customer.png; integration-chain-replay.json |
| Invalid role at Produced in replay | User in Edge before first valid transfer | Customer rejected with The recipient needs the Distributor role; no hash/gas; screenshot still shows Produced and Producer holder | PASS manual preflight | integration-screenshots/04-invalid-customer-recipient.png; only the subsequent valid transfer mined at block 11 |
| Delivered replay and QR | User in Edge, Customer role shown | Handover disabled with This product has already been delivered; STEP08-DEMO-001 lookup shows Customer and all 4 entries; generated fresh QR and QR decoded Camera released message shown | PASS manual | integration-screenshots/08-customer-delivered-gate.png, 09-fresh-product-timeline.png, 10-fresh-qr-camera-released.png |

## Next action and completion gate

Follow [the manual acceptance guide](../integration-manual.md). Signing rejection,
duplicate ID and fresh product creation are accepted. Disconnect/reconnect and
wrong-chain recovery were explicitly waived by the user and are not claimed as
manual passes. The invalid Customer recipient and first valid transfer are now
accepted. The full fresh flow is accepted through final delivery at block 13.
Customer Delivered gating and fresh QR scanning are accepted. No work remains
within the user-approved step 08 scope. Earlier milestone notes below preserve
the status at each verification point; this closure supersedes their pending notes.
Existing granted roles are reused; duplicate grants emit no new RoleGranted event
and do not require repeating the four already accepted grants.

After the new product exists, run
`node scripts/verify-integration-chain.mjs STEP08-DEMO-001`; this writes the separate
integration-chain-replay.json without overwriting the baseline report. A partial
flow reports fullFlow false. Repeat the read-only audit after each manual milestone.

### Fresh creation milestone

The three original user screenshots and their SHA256 manifest are saved under
integration-screenshots. The creation hash is
`0xe38888d9935b3b68690b7cfbf888fd9b37f8abd816ce04ad90ef964a6d02abbc`.
Live receipt and ProductCreated event verification match block 10, status 1, gas
146937 and timestamp 1794770899. STEP08-DEMO-001 contains Da Lat Arabica from
Da Lat, Vietnam, Producer holder and one initialization entry. fullFlow is false
until the three handovers are completed. The rejected ID has no product/history;
COFFEE-DEMO-001 and its history remain identical to the baseline at block 9.

### First fresh handover milestone

The user supplied the invalid-recipient preflight screenshot followed by the
successful Producer to Distributor confirmation. Only one transaction was mined
between creation at block 10 and the valid handover at block 11. The invalid
attempt has no transaction hash or receipt and must not be described as a mined
revert. The creation entry remains intact; the second history entry and event
both match the block 11 timestamp 1794771061, Producer sender, Distributor recipient
and stage 2. Receipt status is 1, gas 87258, hash
`0xddef3d41c66985fa40484aada77af68435a59b2d8288cb1f74a56db4b36c4cc3`.
Current stage is At distributor, holder Distributor, history length 2. Product
name, origin and creation timestamp are unchanged. The post-transfer screenshot
also shows the former holder's handover button disabled. Original images and
hashes are retained under integration-screenshots; updated live audit is in
integration-chain-replay.json. Full flow remains incomplete.

### Second fresh handover milestone

The user's original confirmation screenshot is saved as
integration-screenshots/06-distributor-to-retailer.png with a SHA256 manifest entry.
The live audit verifies receipt status 1 at block 12, gas 87526, transaction
`0xc72371e4cffdf25af3a79fabe5e08372cb2ee92b32f639b34a1c4895560c81bd`.
The transfer event and third history entry match Distributor sender, Retailer
recipient, stage 3 and block timestamp 1794771162. Current state is At retailer,
Retailer holder, history length 3. Product metadata and earlier entries remain
intact. The screenshot shows creation disabled for lack of Producer membership
and handover disabled for the former holder. Final Customer delivery is pending.

### Final fresh delivery milestone

The original user confirmation is saved as
integration-screenshots/07-retailer-to-customer.png with its SHA256 manifest entry.
Live verification confirms block 13, receipt status 1, gas 87794, transaction
`0xbfc1bc3868178b3d2b8b8f00369a23957ceb2cb576afe2f54af95419482a31ae`.
The fourth history entry and ProductTransferred event match Retailer sender,
Customer recipient, stage 4 and receipt block timestamp 1794771228. The product is
Delivered with Customer holder and four ordered history entries; name, origin,
createdAt and earlier entries are intact. integration-chain-replay.json now records
fullFlow true. A live eth_call from Customer after delivery rejects with Already
delivered and leaves state unchanged. This RPC check does not establish that the
user selected Customer and inspected the final UI gate; that manual case remains
pending, along with fresh QR scanning and real network/disconnect recovery.

### Final product gate and fresh QR acceptance

The user supplied three original screenshots, saved as integration-screenshots
08 through 10 with SHA256 manifest entries. The operation form shows Delivered
and a disabled handover button with This product has already been delivered.
The lookup screenshot shows Customer connected and the correct new product ID,
name, origin, holder and four history entries. The displayed local times
02:28:19, 02:31:01, 02:32:42 and 02:33:48 match the audited creation/transfer
timestamps. The QR screenshot contains STEP08-DEMO-001 and displays QR decoded.
Camera released. Looking up the decoded text as a product ID. These establish
the final Customer UI gate and fresh QR camera acceptance. They do not establish
disconnect/reconnect or wrong-network recovery, which remain pending.

No blocking application defect was found. Step 08 is **closed within the
user-approved scope**, with two actual-wallet recovery cases explicitly Not run
and waived. They are not counted as manual passes. Step 09 has not started.

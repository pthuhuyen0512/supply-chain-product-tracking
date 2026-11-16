# Step 06 — Wallet and Transaction Verification

Date: 2026-11-16 (Asia/Saigon).

## Status

Implementation ready; real MetaMask acceptance is pending. No role grant, product creation, or handover has been broadcast by the agent.

## Step 05 recheck before implementation

- Original 6 frontend tests passed; production build exited 0.
- export:frontend exited 0; deployment bytecode, receipt and Admin still verified.
- Contract: 0x843B273a8c67BcaB604f14fd466162CBdBb556B9, Ganache Chain ID 1337.

## Implementation

- BrowserProvider/Signer writes; separate JsonRpcProvider reads.
- Synchronous writer invalidation and generation guards on account/network changes; no repeated eth_requestAccounts after disconnect.
- Actual role getters/hasRole, multiple roles, independent Admin/Producer access.
- Fresh account/network/code and role checks plus staticCall before signing.
- Trimmed required fields, non-zero addresses, holder/stage/role checks, no self-transfer.
- Pending lock, tx.wait receipt, hash/gas string, rejection/RPC/revert/custom-error handling.
- Dynamic data/errors rendered via textContent; no secrets/config stored in localStorage.
- Read-only demo checklist prepares four public role addresses and an unused product ID.

## Automated checks


### frontend: npm.cmd test

Exit code: 0

stdout:

```text

> supply-chain-frontend@1.0.0 test
> node --test tests/*.test.js

✔ missing, malformed and unusable configurations have distinct safe results (5.9456ms)
✔ valid local Ganache with contract passes using read-only requests (1.4786ms)
✔ node unreachable is distinguished from missing contract (1.4851ms)
✔ wrong Chain ID and wrong client are rejected before accepting a contract (0.5442ms)
✔ invalid JSON-RPC, HTTP errors and malformed responses are rejected (0.7278ms)
✔ an unresponsive request is bounded by the abort signal (26.8177ms)
✔ input validation trims text and rejects empty/zero/invalid addresses (7.6487ms)
✔ Admin is not automatically Producer; grants use actual bytes32 getters (5.5461ms)
✔ multiple roles are supported and creation arguments are trimmed (2.1707ms)
✔ role revocation after connection is rechecked before requesting a signature (0.9866ms)
✔ account and network events invalidate the writer synchronously; no automatic permission request (8.3443ms)
✔ a slow stale role response cannot overwrite the newly selected account (2.2536ms)
✔ wrong MetaMask RPC or an account change without an event cannot send a transaction (1.94ms)
✔ handover requires holder, active sender role, next recipient role and a different address (2.3799ms)
✔ pending transactions prevent duplicates and failures restore the busy flag (8.6388ms)
✔ custom errors, rejection and insufficient funds have readable English messages (4.5846ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 626.6416

```

stderr:

```text

```

### frontend: npm.cmd run build

Exit code: 0

stdout:

```text

> supply-chain-frontend@1.0.0 build
> vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 159 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.62 kB │ gzip:   0.37 kB
dist/assets/index-BG3enBxO.css   15.68 kB │ gzip:   4.24 kB
dist/assets/index-CthkqRDU.js   291.42 kB │ gzip: 104.84 kB

✓ built in 270ms

```

stderr:

```text

```

### .: npx.cmd tsc --noEmit

Exit code: 0

stdout:

```text

```

stderr:

```text

```

### .: node --check scripts/verify-wallet-demo.mjs

Exit code: 0

stdout:

```text

```

stderr:

```text

```

### .: git diff --check

Exit code: 0

stdout:

```text

```

stderr:

```text

```

### .: git diff --exit-code -- contracts test hardhat.config.ts tsconfig.json package-lock.json ignition/modules docs/test_results.txt

Exit code: 0

stdout:

```text

```

stderr:

```text

```

## Browser evidence

See wallet-browser.json. Chrome desktop/mobile screenshots: wallet-desktop.png and wallet-mobile.png. The injected test provider forwarded only read calls and deliberately rejected eth_sendTransaction locally; it broadcast zero transactions. It verified Admin/Producer separation, role gating after account changes, wrong-chain recovery, a rejected request, and disconnect without another permission prompt. These tests are not evidence of actual MetaMask confirmation. The first assertion attempt checked the role button before its asynchronous refresh had finished; the test was corrected to wait for enabled controls, then passed.

## Real chain baseline

See wallet-demo-state.json (read-only). Block 1, only Admin has the expected role. Four participant roles are not granted; COFFEE-DEMO-001 does not exist. No full flow has run.

## Manual acceptance — pending

Use docs/wallet-acceptance.md. First connect as Admin, then grant Producer to 0x810A640B6089B12ab3bb7Bde1697752129679828 in the prefilled form. The expected result is a successful receipt and a Granted on-chain Producer row. Then grant the other three roles, create the suggested product as Producer, and complete all three handovers. Record a rejected/invalid operation and account changes separately. Do not mark complete until actual MetaMask receipts and Delivered history have been verified.

Public product lookup, timeline, QR and camera remain deferred to step 07.

Sources consulted: https://docs.ethers.org/v6/api/providers/ and https://docs.metamask.io/metamask-connect/evm/guides/manage-networks/ (primary documentation).

## Step 05 regression with wallet integration: clean configuration

Build with deployment.local.json absent: exit 0.

```text

> supply-chain-frontend@1.0.0 build
> vite build --outDir node_modules/.verification/step06-no-config --emptyOutDir false

vite v8.3.8 building client environment for production...
transforming...
✓ 158 modules transformed.
rendering chunks...
computing gzip size...
node_modules/.verification/step06-no-config/index.html                   0.62 kB │ gzip:   0.37 kB
node_modules/.verification/step06-no-config/assets/index-BG3enBxO.css   15.68 kB │ gzip:   4.24 kB
node_modules/.verification/step06-no-config/assets/index-BVIvjZvr.js   291.25 kB │ gzip: 104.73 kB

✓ built in 283ms


```

Production page without local config opens with English export instructions, wallet/write buttons disabled, and no page error. Config restored byte-for-byte afterward.

## Manual milestone: four roles granted in Microsoft Edge

The user reports completing all four role grants through the website with MetaMask in Edge. The supplied screenshot shows four Granted on-chain rows and Admin connected. Independent RPC verification confirms all four expected role memberships at block 5. All four RoleGranted receipts have status 1; hashes and gas usage are saved in wallet-role-receipts.json. COFFEE-DEMO-001 is still unused. Product creation, handovers and negative/account-change acceptance remain pending.

## Manual milestone: product creation confirmed

The user supplied an Edge/MetaMask screenshot showing Product creation confirmed, block 6. Independent RPC verification confirms COFFEE-DEMO-001 exists with name Da Lat Arabica, origin Da Lat, Vietnam, stage Produced, Producer as holder and one history entry. Creation receipt status 1 and gas used 146937 are recorded in wallet-product-receipts.json. Next: test an invalid direct handover to Customer before the valid Producer-to-Distributor handover.

## Manual milestone: invalid recipient rejected; first handover confirmed

The user supplied screenshots of (1) an invalid direct Producer-to-Customer attempt rejected with The recipient needs the Distributor role, with no hash or gas, and (2) a successful Producer-to-Distributor handover through MetaMask in Edge. The invalid attempt was an application preflight rejection backed by on-chain role checks, not a mined revert. Independent RPC verification confirms stage At distributor, Distributor as holder, and two history entries. The first handover receipt has status 1 at block 7, gas used 87258; see wallet-handover-receipts.json. The previous Producer is correctly blocked from handing over again in the supplied screenshot. Remaining: Distributor-to-Retailer, Retailer-to-Customer, and final account-change acceptance.

## Manual milestone: Distributor-to-Retailer confirmed

The user supplied the confirmed handover screenshot at block 8. Independent read-only verification confirms COFFEE-DEMO-001 is At retailer, Retailer is the holder, and history contains three entries. Receipt status 1, gas used 87526; see wallet-handover-receipts.json. The screenshot shows Producer-only creation disabled after switching accounts. Next and final transfer: Retailer to Customer. Step 06 is still pending the Delivered result.

## Final manual milestone — step 06 complete

The user supplied the final MetaMask website confirmation at block 9. Independent read-only verification confirms all five expected role memberships, COFFEE-DEMO-001 at Delivered (stage 4), Customer as current holder, and four correctly ordered history entries: creation, Distributor, Retailer, Customer. Product name/origin remain unchanged. All three transfer receipts have status 1; the final receipt used 87794 gas. Evidence: wallet-handover-receipts.json and wallet-demo-state.json (fullFlowOnChain=true).

Manual browser evidence across the conversation: four role grants, product creation, all three handovers, account changes with updated role gates, and an invalid direct handover rejected before signing. These were performed by the user using MetaMask in Microsoft Edge; RPC reads independently verify the resulting state and receipts. No terminal account was used to sign the acceptance flow. Real-wallet rejection of a signing prompt and disconnect/wrong-chain recovery were tested with a simulated injected provider only, not manually claimed.

Step 06 meets its completion criteria. Step 07 (public lookup/history UI, QR and camera) has not started.

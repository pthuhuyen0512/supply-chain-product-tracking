# Step 07 Public Lookup Timeline and QR Verification

Date: 16 November 2026 (Asia/Saigon).

Status: implementation and automated checks passed; physical camera acceptance is pending. Step 08 has not started.

## Implementation

Public JsonRpcProvider reads without window.ethereum; original case-sensitive product IDs are trimmed, not hashed. Product and history are pinned to the same block. Unknown IDs, errors and edited inputs clear previous results. BigInt timestamps are converted safely, history array order is preserved, and the zero-address entry is labeled Product initialized.

QR PNG payload contains only the normalized product ID. html5-qrcode camera/file decoders treat every payload as literal text; never navigate to URLs or execute HTML. Camera lifecycle is serialized, starts/stops are guarded, duplicate callbacks are suppressed, and tracks are released after decode/stop/navigation/hidden tab. Scanner library is loaded only when requested.

## Browser evidence

See lookup-browser.json. Microsoft Edge headless without MetaMask verified real Delivered data and four timeline events. The actual image decoder round-tripped the generated PNG. A synthetic canvas MediaStream exercised the real camera decoder, automatic release, explicit stop and navigation cleanup. Synthetic streams and simulated denial are automated tests, not proof of physical webcam operation. Malicious HTML/URL payloads, stale responses and RPC outage are covered. Desktop/mobile screenshots were captured and reviewed.

## Production build without local config

Exit code: 0

```text

> supply-chain-frontend@1.0.0 build
> vite build --outDir node_modules/.verification/step07-no-config --emptyOutDir false

vite v8.3.8 building client environment for production...
transforming...
✓ 214 modules transformed.
rendering chunks...
computing gzip size...
node_modules/.verification/step07-no-config/index.html                   0.62 kB │ gzip:   0.37 kB
node_modules/.verification/step07-no-config/assets/index-FohPSC9N.css   17.91 kB │ gzip:   4.81 kB
node_modules/.verification/step07-no-config/assets/index-CLEeb1cD.js   328.03 kB │ gzip: 118.37 kB
node_modules/.verification/step07-no-config/assets/esm-BGz9Afrm.js     368.47 kB │ gzip: 108.02 kB

✓ built in 406ms


```

Production browser check without deployment.local.json: page opens, export guidance visible, lookup disabled, no page errors. Original configuration restored byte-for-byte.

## frontend: npm.cmd test

Exit code: 0

stdout:

```text

> supply-chain-frontend@1.0.0 test
> node --test tests/*.test.js

✔ missing, malformed and unusable configurations have distinct safe results (4.1241ms)
✔ valid local Ganache with contract passes using read-only requests (0.8519ms)
✔ node unreachable is distinguished from missing contract (0.7039ms)
✔ wrong Chain ID and wrong client are rejected before accepting a contract (0.2456ms)
✔ invalid JSON-RPC, HTTP errors and malformed responses are rejected (0.4744ms)
✔ an unresponsive request is bounded by the abort signal (30.1961ms)
✔ manual and QR IDs are trimmed, case-sensitive literal strings (1.3183ms)
✔ public reads use the original ID and a single block without any wallet (1.0287ms)
✔ unknown IDs return null and partial/equal-timestamp history is preserved in array order (0.2806ms)
✔ timestamp conversion uses seconds and guards the supported date range (22.9409ms)
✔ scanner prevents duplicate starts and releases the camera before one decode callback (3.9942ms)
✔ stop during startup cancels the pending start and duplicate stops share cleanup (0.7121ms)
✔ permission denial is reported and leaves the scanner ready for a retry (0.599ms)
✔ empty QR is ignored and disposal suppresses callbacks and restarts (0.6304ms)
✔ input validation trims text and rejects empty/zero/invalid addresses (3.4049ms)
✔ Admin is not automatically Producer; grants use actual bytes32 getters (4.5452ms)
✔ multiple roles are supported and creation arguments are trimmed (0.8718ms)
✔ role revocation after connection is rechecked before requesting a signature (1.7312ms)
✔ account and network events invalidate the writer synchronously; no automatic permission request (4.5152ms)
✔ a slow stale role response cannot overwrite the newly selected account (1.5392ms)
✔ wrong MetaMask RPC or an account change without an event cannot send a transaction (1.1765ms)
✔ handover requires holder, active sender role, next recipient role and a different address (1.4162ms)
✔ pending transactions prevent duplicates and failures restore the busy flag (4.6045ms)
✔ custom errors, rejection and insufficient funds have readable English messages (2.3771ms)
ℹ tests 24
ℹ suites 0
ℹ pass 24
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 437.4013

```

stderr:

```text

```

## frontend: npm.cmd run build

Exit code: 0

stdout:

```text

> supply-chain-frontend@1.0.0 build
> vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 215 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.62 kB │ gzip:   0.37 kB
dist/assets/index-FohPSC9N.css   17.91 kB │ gzip:   4.81 kB
dist/assets/index-hMjHMEFT.js   328.21 kB │ gzip: 118.48 kB
dist/assets/esm-Di9EW38p.js     368.47 kB │ gzip: 108.02 kB

✓ built in 269ms

```

stderr:

```text

```

## .: npx.cmd tsc --noEmit

Exit code: 0

stdout:

```text

```

stderr:

```text

```

## .: git diff --check

Exit code: 0

stdout:

```text

```

stderr:

```text

```

## .: git diff --exit-code -- contracts test hardhat.config.ts tsconfig.json package-lock.json ignition/modules docs/test_results.txt

Exit code: 0

stdout:

```text

```

stderr:

```text

```

## Manual acceptance pending

Follow docs/lookup-qr-acceptance.md. In Edge, look up COFFEE-DEMO-001 without connecting a wallet, generate/download its QR, show the PNG on a phone/printout to the computer webcam, allow the camera, and verify automatic lookup and camera indicator release. Test Stop camera as well. Prepared PNG: docs/verification/COFFEE-DEMO-001-qr.png. If no camera is available, physical camera acceptance remains unverified. Do not claim file decoding or synthetic MediaStream tests as physical webcam success.

Primary API references: https://scanapp.org/html5-qrcode-docs/docs/apis/classes/Html5Qrcode and https://github.com/soldair/node-qrcode. No dependencies were upgraded.
# Physical webcam acceptance — 2026-11-16

The user confirmed successful QR scanning with the physical camera in Microsoft
Edge and supplied the resulting product lookup screenshot in the conversation.
The screenshot displays COFFEE-DEMO-001, Da Lat Arabica, origin Da Lat, Vietnam,
Delivered, holder 0x9CE98Beb9e0Bacb75cD09B2a6A623cD366805Cd3, and four history
entries in contract order: initialization, Distributor, Retailer, Customer.
This matches the independently verified block 9 contract state.

The screenshot has a connected Admin wallet; it does not independently prove
wallet-free lookup. That scenario has separate automated browser evidence below.
The user subsequently confirmed both automatic camera indicator shutdown after
decoding and shutdown through Stop camera. These are now manual acceptance results.
The original result screenshot is saved in lookup-screenshots with its SHA256 manifest
and embedded in the combined steps 06 and 07 Word acceptance record.
Earlier pending-camera statements below describe the state before this user check.


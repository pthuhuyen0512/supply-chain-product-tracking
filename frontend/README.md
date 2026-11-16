# Trace — Supply Chain Frontend

Vanilla JavaScript + Vite. Run these commands from `frontend/`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the local URL printed by Vite. To test, build, and preview:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

The ABI is stored in `src/abi/SupplyChain.json`. Generate the local configuration
with `npm.cmd run export:frontend` from the **repository root**, after deploying
and verifying Ganache. See `src/config/README.md`. A clone without local configuration
still builds and opens with export instructions. No placeholder contract address is
used. The optional JSON file is imported as raw text, then parsed and validated so
malformed configuration also produces a useful message on the page.

Step 06 implements MetaMask connection, account/network changes, on-chain role
checks, role grants, product creation, and stage-by-stage handovers. Only MetaMask
signs write operations. A separate JsonRpcProvider reads the local chain. Every
operation checks current accounts, Chain IDs, bytecode, permissions, and contract
simulation before asking for a signature. Buttons stay disabled while a transaction
is in progress. The UI displays its hash, confirmed receipt, and gas used.

The local demo checklist reads public Ganache accounts and prepares form inputs.
See [the manual acceptance guide](../docs/wallet-acceptance.md). Automated tests and
an injected test provider do not prove real MetaMask signing; manual acceptance is
recorded separately in `docs/verification/wallet-transactions.md`.

Step 07 implements public product lookup and ordered history without a wallet,
product-ID-only QR generation and PNG download, camera scanning, and QR image scanning.
Unknown IDs and read failures clear previous results. QR payloads are treated as literal
case-sensitive product IDs, never as links to open or code to execute.

Camera access is requested only after Open camera. Scanning stops after one valid
decode, on Stop camera, when the QR section leaves the screen, when the tab is hidden,
or when leaving the page. Physical webcam acceptance is recorded separately from
automated image-decoding and scanner lifecycle tests in `docs/verification/lookup-qr.md`.
See [the camera acceptance guide](../docs/lookup-qr-acceptance.md).

The page does not store configuration or secrets in localStorage. All frontend UI
text and future additions must be in English.

The **Gas comparison** navigation item integrates the comparison from `1Compare/`
using a standalone copy of its reviewed rows in `src/data/gas-comparison.json`.
It works without Ganache or MetaMask. The data is a fixed 16 November 2026 snapshot,
not live RPC data. Large percentage cards and per-function badges show signed
`(V2 - V1) / V1 * 100` changes for gas and actual fees. Function filters, gas/fee
charts, receipt details, a common-price scenario, and full snapshot scopes are
available in the section. Receipt fees are summed as integer Wei; exact scope
totals are recomputed from those receipts to avoid source rounding differences.

For complete installation, Ganache deployment, dynamic account mapping and MetaMask
setup, follow the [root README](../README.md). The latest integration outcome is
[the step 08 matrix](../docs/verification/integration.md): the fresh MetaMask flow and
physical QR acceptance passed. Actual wallet disconnect/reconnect and wrong-network
recovery were waived by the user and not run; their simulated coverage is separate.
The [Quoc report section](../docs/report-quoc.md) describes the implemented design.

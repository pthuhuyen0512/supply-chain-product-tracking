# Supply Chain Frontend

The Vite application uses JavaScript, ethers v6, qrcode and html5-qrcode. See the [root README](../README.md) for dependency installation, Ganache setup, V2 deployment, ABI export and MetaMask configuration.

Run from this directory:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

Public lookup uses an RPC provider. State-changing operations use the current MetaMask signer. The interface supports role grants, product creation, sequential handovers, timestamped history, QR generation, webcam scanning and QR-image upload.

`src/abi/SupplyChain.json` contains the V2 ABI. Generate `src/config/deployment.local.json` using `npm.cmd run export:frontend` from the repository root. The local file stays ignored; without valid configuration the page displays setup instructions instead of enabling blockchain actions. See [configuration details](src/config/README.md).

The Gas comparison view reads a fixed snapshot in `src/data/gas-comparison.json`. Its source records are retained under [docs/evidence/](../docs/evidence/README.md). It is not a live gas monitor.

Use localhost for camera access and allow browser permission. The application releases the camera after decoding, stopping or leaving the scanning view. A successful uploaded-image test does not establish physical-webcam operation. Historical acceptance records are described in the [evidence index](../docs/evidence/README.md).

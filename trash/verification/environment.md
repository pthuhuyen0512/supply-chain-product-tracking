# Ki?m tra m?i tr??ng ? b??c 01

Ng?y ki?m tra: 2026-11-15 (Asia/Saigon).

## git status --short

Started (UTC): 2026-11-15T15:27:18.809Z

Exit code: 0

stdout:

```text
?? docs/quoc-implementation/
?? docs/verification/
```

stderr:

```text
(empty)
```

## git branch --show-current

Started (UTC): 2026-11-15T15:27:18.952Z

Exit code: 0

stdout:

```text
quoc
```

stderr:

```text
(empty)
```

## node --version

Started (UTC): 2026-11-15T15:27:19.049Z

Exit code: 0

stdout:

```text
v26.3.0
```

stderr:

```text
(empty)
```

## npm.cmd --version

Started (UTC): 2026-11-15T15:27:19.135Z

Exit code: 0

stdout:

```text
11.16.0
```

stderr:

```text
(empty)
```

## git --version

Started (UTC): 2026-11-15T15:27:19.829Z

Exit code: 0

stdout:

```text
git version 2.54.0.windows.1
```

stderr:

```text
(empty)
```

## npm.cmd ci

Started (UTC): 2026-11-15T15:27:19.901Z

Exit code: 0

stdout:

```text

added 191 packages, and audited 192 packages in 19s

45 packages are looking for funding
  run `npm fund` for details

16 vulnerabilities (3 moderate, 13 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

stderr:

```text
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated glob@7.1.7: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn allow-scripts 1 package has install scripts not yet covered by allowScripts:
npm warn allow-scripts   esbuild@0.28.2 (postinstall: node install.js)
npm warn allow-scripts
npm warn allow-scripts Run `npm approve-scripts --allow-scripts-pending` to review, or `npm approve-scripts <pkg>` to allow.
```

## npx.cmd hardhat compile

Started (UTC): 2026-11-15T15:28:02.568Z

Exit code: 0

stdout:

```text
Downloading solc 0.8.34
Downloading solc 0.8.34 (WASM build)

Compiled 1 Solidity file with solc 0.8.34 (evm target: paris)
```

stderr:

```text
(empty)
```

## npx.cmd tsc --noEmit

Started (UTC): 2026-11-15T15:28:08.838Z

Exit code: 0

stdout:

```text
(empty)
```

stderr:

```text
(empty)
```

## npx.cmd hardhat test mocha test/SupplyChain.test.ts

Started (UTC): 2026-11-15T15:28:11.486Z

Exit code: 0

stdout:

```text
No contracts to compile

Running Mocha tests


  SupplyChain
    Role registration and access control
      ✔ assigns the deployer as admin without granting producer privileges (106ms)
      ✔ allows admin to grant and revoke producer, emitting correct events
      ✔ allows admin to grant and revoke distributor, emitting correct events
      ✔ allows admin to grant and revoke retailer, emitting correct events
      ✔ allows admin to grant and revoke customer, emitting correct events
      ✔ rejects role grants and revocations by a non-admin
      ✔ rejects registration of the zero address and unknown roles
    Product creation and public lookup
      ✔ stores product data and creation history with the actual block timestamp
      ✔ rejects creation by an unregistered account and admin without producer role
      ✔ rejects an empty product ID
      ✔ rejects an empty product name
      ✔ rejects an empty product origin
      ✔ rejects duplicate IDs without overwriting product data or history
      ✔ returns absent product data and empty history for an unknown ID
      ✔ keeps products and their histories independent
    Handover and complete supply chain history
      ✔ tracks all three handovers, exact events, timestamps and public history
      ✔ rejects handover of a nonexistent product
      ✔ rejects an unregistered sender and a registered non-holder
      ✔ rejects the zero address and self-transfer even with multiple roles
      ✔ rejects wrong or unregistered receivers at handover 1, preserving state
      ✔ blocks a revoked sender at handover 1 until the role is restored
      ✔ rejects wrong or unregistered receivers at handover 2, preserving state
      ✔ blocks a revoked sender at handover 2 until the role is restored
      ✔ rejects wrong or unregistered receivers at handover 3, preserving state
      ✔ blocks a revoked sender at handover 3 until the role is restored
      ✔ removes the previous holder's ability to transfer after a successful handover
      ✔ prevents further handovers after customer delivery, even to a registered receiver


  27 passing (321ms)


```

stderr:

```text
(empty)
```

## Di?n gi?i m?i tr??ng v? ph?m vi

- Cwd: C:\Users\Quoc\Desktop\DTU\Blockchain\Huyen-git\supply-chain-product-tracking. Nh?nh quoc. Tr??c khi t?o log, git status ch? c? docs/quoc-implementation/ ch?a ???c theo d?i.
- Lockfile v3; Hardhat 3.21.2, TypeScript 6.0.3, Mocha 12.0.3, ethers 6.17.0, EDR 0.25.0.
- Source node_modules/hardhat/src/internal/cli/node-version.ts ??t MIN_SUPPORTED_NODE_VERSION=[22,13,0]; Node 26.3.0 ??p ?ng. Engines trong lockfile: Mocha ^20.19.0 || >=22.12.0; EDR >=22. Kh?ng c? l?i phi?n b?n khi th?c thi.
- Test m?i: 27 passing (321ms), tr?n m?ng Hardhat m? ph?ng; kh?ng k?t n?i Ganache ho?c MetaMask.
- npm ci b?o 16 vulnerabilities (3 moderate, 13 high), deprecated inflight/glob v? esbuild install script ch?a ???c ph? duy?t. Kh?ng ch?y audit fix ho?c ??i dependency.
- Chrome t?n t?i t?i C:\Program Files\Google\Chrome\Application\chrome.exe v? ???ng d?n d??i LocalAppData. Ch?a x?c nh?n MetaMask.
- Kh?ng th?y Ganache t?i LocalAppData/Programs/Ganache/Ganache.exe, Program Files/Ganache/Ganache.exe ho?c entry Ganache trong c?c registry uninstall HKCU/HKLM ?? ki?m tra; ch?a lo?i tr? b?n c?i ? n?i kh?c. Kh?ng ch?n ki?m tra b??c 01.
- Kh?ng c? ignition/deployments ? th?i ?i?m ki?m tra. Gi? journal local b? ignore; ?? xu?t l?u t?m t?t c?ng khai ri?ng t?i docs/deployments/ ? b??c 03. Ch?a deploy ho?c t?o frontend.

## npm.cmd ls --depth=0

Exit code: 0

stdout:

```text
supply-chain-product-tracking@1.0.0 C:\Users\Quoc\Desktop\DTU\Blockchain\Huyen-git\supply-chain-product-tracking
├── @nomicfoundation/hardhat-ethers@4.2.2
├── @nomicfoundation/hardhat-ignition@3.1.9
├── @nomicfoundation/hardhat-toolbox-mocha-ethers@4.0.0
├── @openzeppelin/contracts@5.6.1
├── @types/chai-as-promised@8.0.2
├── @types/chai@5.2.3
├── @types/mocha@10.0.10
├── @types/node@22.20.5
├── chai@6.3.0
├── ethers@6.17.0
├── forge-std@1.17.0 (git+ssh://git@github.com/foundry-rs/forge-std.git#f3dae6e6ee381f25eb6a246f7da9b85c91a68219)
├── hardhat@3.21.2
├── mocha@12.0.3
└── typescript@6.0.3

```

stderr:

```text
(empty)
```

## git diff --exit-code -- contracts test package.json package-lock.json hardhat.config.ts tsconfig.json ignition/modules docs/test_results.txt

Exit code: 0

stdout:

```text
(empty)
```

stderr:

```text
(empty)
```

## git diff --check

Exit code: 0

stdout:

```text
(empty)
```

stderr:

```text
(empty)
```

## git check-ignore frontend/node_modules/example frontend/dist/example frontend/src/config/deployment.local.json ignition/deployments/chain-1337/journal.jsonl

Exit code: 0

stdout:

```text
frontend/node_modules/example
frontend/dist/example
frontend/src/config/deployment.local.json
ignition/deployments/chain-1337/journal.jsonl
```

stderr:

```text
(empty)
```

## git status --short

Exit code: 0

stdout:

```text
 M .gitignore
?? docs/quoc-implementation/
?? docs/verification/
```

stderr:

```text
(empty)
```


# Deploy và export — bước 03

Ngày: 15/11/2026 (Asia/Saigon).

Profile được chọn rõ ràng: default, solc 0.8.34, EVM Paris, optimizer disabled; đồng nhất baseline bước 01. Ignition 3.1.9 tự chọn production nếu không truyền --build-profile; vì vậy luôn truyền rõ default cho lần deploy này.

## npx.cmd hardhat compile --build-profile default

Exit code: 0

stdout:

```text
No contracts to compile

```

stderr:

```text

```

## npx.cmd hardhat ignition deploy ignition/modules/SupplyChain.ts --network ganache --build-profile default

Exit code: 0

stdout:

```text
Hardhat Ignition starting for [ SupplyChainModule ]...Hardhat Ignition 🚀

Deploying [ SupplyChainModule ]

Batch #1
  Executing SupplyChainModule#SupplyChain...

Batch #1
  Executing SupplyChainModule#SupplyChain...

Batch #1
  Executed SupplyChainModule#SupplyChain

Batch #1
  Executed SupplyChainModule#SupplyChain

[ SupplyChainModule ] successfully deployed 🚀

Deployed Addresses

SupplyChainModule#SupplyChain - 0x8B52d5D247fa21Af5D471FcD73991fF6Aaf56fda

```

stderr:

```text

```

## npm.cmd run export:frontend

Expected exit: 0; actual exit: 0

stdout:

```text

> supply-chain-product-tracking@1.0.0 export:frontend
> node scripts/export-frontend.mjs

{
  "contractAddress": "0x8B52d5D247fa21Af5D471FcD73991fF6Aaf56fda",
  "rpcUrl": "http://127.0.0.1:7545",
  "chainId": "1337",
  "client": "Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js",
  "deployer": "0x4BAe880df29E1d5A76Fa973be01FbcB363671E83",
  "adminRole": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "deployerIsAdmin": true,
  "transactionHash": "0xa0e691329467367a6e60a959ddc768db7adbae25602b1c9ce894e9642bfc2775",
  "blockNumber": 1,
  "gasUsed": "2502495",
  "bytecodeBytes": 11249,
  "abiEntries": 23
}

```

stderr:

```text

```

## npm.cmd run export:frontend

Expected exit: 0; actual exit: 0

stdout:

```text

> supply-chain-product-tracking@1.0.0 export:frontend
> node scripts/export-frontend.mjs

{
  "contractAddress": "0x8B52d5D247fa21Af5D471FcD73991fF6Aaf56fda",
  "rpcUrl": "http://127.0.0.1:7545",
  "chainId": "1337",
  "client": "Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js",
  "deployer": "0x4BAe880df29E1d5A76Fa973be01FbcB363671E83",
  "adminRole": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "deployerIsAdmin": true,
  "transactionHash": "0xa0e691329467367a6e60a959ddc768db7adbae25602b1c9ce894e9642bfc2775",
  "blockNumber": 1,
  "gasUsed": "2502495",
  "bytecodeBytes": 11249,
  "abiEntries": 23
}

```

stderr:

```text

```

## npm.cmd run export:frontend

Expected exit: 1; actual exit: 1

stdout:

```text

> supply-chain-product-tracking@1.0.0 export:frontend
> node scripts/export-frontend.mjs


```

stderr:

```text
Export failed: Cannot read valid JSON: C:\Users\Quoc\Desktop\DTU\Blockchain\Huyen-git\supply-chain-product-tracking\artifacts\contracts\SupplyChain.sol\SupplyChain.json
Cause: Expected property name or '}' in JSON at position 1 (line 1 column 2)
Existing generated files may be stale and are not validated by this failed run. Fix inputs and run npm.cmd run export:frontend successfully before using them.

```

## npm.cmd run export:frontend

Expected exit: 1; actual exit: 1

stdout:

```text

> supply-chain-product-tracking@1.0.0 export:frontend
> node scripts/export-frontend.mjs


```

stderr:

```text
Export failed: Current artifact: invalid SupplyChain artifact; compile and deploy first.
Existing generated files may be stale and are not validated by this failed run. Fix inputs and run npm.cmd run export:frontend successfully before using them.

```

## npm.cmd run export:frontend

Expected exit: 1; actual exit: 1

stdout:

```text

> supply-chain-product-tracking@1.0.0 export:frontend
> node scripts/export-frontend.mjs


```

stderr:

```text
Export failed: Current artifact differs from deployment. Check build profile/source and deploy before export.
Existing generated files may be stale and are not validated by this failed run. Fix inputs and run npm.cmd run export:frontend successfully before using them.

```

## npm.cmd run export:frontend

Expected exit: 0; actual exit: 0

stdout:

```text

> supply-chain-product-tracking@1.0.0 export:frontend
> node scripts/export-frontend.mjs

{
  "contractAddress": "0x8B52d5D247fa21Af5D471FcD73991fF6Aaf56fda",
  "rpcUrl": "http://127.0.0.1:7545",
  "chainId": "1337",
  "client": "Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js",
  "deployer": "0x4BAe880df29E1d5A76Fa973be01FbcB363671E83",
  "adminRole": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "deployerIsAdmin": true,
  "transactionHash": "0xa0e691329467367a6e60a959ddc768db7adbae25602b1c9ce894e9642bfc2775",
  "blockNumber": 1,
  "gasUsed": "2502495",
  "bytecodeBytes": 11249,
  "abiEntries": 23
}

```

stderr:

```text

```

## node --check scripts/export-frontend.mjs

Expected exit: 0; actual exit: 0

stdout:

```text

```

stderr:

```text

```

## npx.cmd tsc --noEmit

Expected exit: 0; actual exit: 0

stdout:

```text

```

stderr:

```text

```

## git diff --check

Expected exit: 0; actual exit: 0

stdout:

```text

```

stderr:

```text

```

## git diff --exit-code -- contracts test hardhat.config.ts tsconfig.json package-lock.json ignition/modules docs/test_results.txt

Expected exit: 0; actual exit: 0

stdout:

```text

```

stderr:

```text

```

## Kiểm tra bổ sung

- Hai lần export liên tiếp cho cùng file ABI/config (so sánh byte-for-byte).
- ABI xuất ra khớp đầy đủ mảng ABI trong artifact hiện tại.
- invalid artifact JSON: rejected, exit 1, generated files unchanged
- wrong contract artifact: rejected, exit 1, generated files unchanged
- artifact differs from deployment: rejected, exit 1, generated files unchanged
- Artifact thử lỗi được khôi phục nguyên byte bằng finally; lần export sau khôi phục thành công.
- Chưa test Vite/build clone sạch (bước 05); thiết kế glob tùy chọn đã ghi tại frontend/src/config/README.md.
- CLI confirm được xử lý bằng HARDHAT_IGNITION_CONFIRM_DEPLOYMENT=true chỉ trong tiến trình deploy; không dùng --reset.

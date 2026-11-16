# Khôi phục deployment trên workspace mới

Người dùng đã chọn giữ workspace mới.

Kiểm tra trước deploy:

```json
{
  "checkedAt": "2026-11-15T17:31:53.787Z",
  "rpcUrl": "http://127.0.0.1:7545",
  "error": "fetch failed",
  "cause": "ECONNREFUSED"
}
```

`npm.cmd run export:frontend` thoát code 1: connect ECONNREFUSED 127.0.0.1:7545; cảnh báo cấu hình cũ chưa được xác minh.

Chưa di chuyển journal, chưa deploy hoặc sửa config. Cần mở Ganache workspace mới và giữ RPC hoạt động. Khi RPC trở lại: kiểm tra lại 5 địa chỉ, lưu trữ journal cũ nguyên vẹn, deploy profile default và export lại. Không reset Ganache hoặc dùng --reset.

## Khôi phục RPC và deploy

Ganache UI mở nhưng không có listener 7545. Đã dùng Settings → Server xác nhận host/port đúng và Restart workspace NOISELESS-MAGIC, không đổi cấu hình/tài khoản, không reset chain. RPC phản hồi lại với đúng tài khoản mới. Journal cũ chuyển nguyên thư mục sang ignition/deployments/archive-chain-1337-workspace-before-20261116; hash journal được so sánh trước/sau, không đổi.

## npx.cmd hardhat compile --build-profile default

Exit code: 0

stdout:

```text
No contracts to compile

```

stderr:

```text

```
## npm.cmd run deploy:local

Exit code: 0

stdout:

```text

> supply-chain-product-tracking@1.0.0 deploy:local
> hardhat ignition deploy ignition/modules/SupplyChain.ts --network ganache --build-profile default

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

SupplyChainModule#SupplyChain - 0x843B273a8c67BcaB604f14fd466162CBdBb556B9

```

stderr:

```text

```
## npm.cmd run export:frontend

Exit code: 0

stdout:

```text

> supply-chain-product-tracking@1.0.0 export:frontend
> node scripts/export-frontend.mjs

{
  "contractAddress": "0x843B273a8c67BcaB604f14fd466162CBdBb556B9",
  "rpcUrl": "http://127.0.0.1:7545",
  "chainId": "1337",
  "client": "Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js",
  "deployer": "0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec",
  "adminRole": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "deployerIsAdmin": true,
  "transactionHash": "0x7e4212bb316487c9c436a3a65093a18f5ebdd1fb658de19dcedf3cf0ecf4de67",
  "blockNumber": 1,
  "gasUsed": "2502495",
  "bytecodeBytes": 11249,
  "abiEntries": 23
}

```

stderr:

```text

```

## Xác minh sau deploy

Export lại exit code 0, config giống từng byte. Bytecode và receipt khớp journal mới; deployer có DEFAULT_ADMIN_ROLE.

```json
{
  "contractAddress": "0x843B273a8c67BcaB604f14fd466162CBdBb556B9",
  "rpcUrl": "http://127.0.0.1:7545",
  "chainId": "1337",
  "client": "Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js",
  "deployer": "0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec",
  "adminRole": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "deployerIsAdmin": true,
  "transactionHash": "0x7e4212bb316487c9c436a3a65093a18f5ebdd1fb658de19dcedf3cf0ecf4de67",
  "blockNumber": 1,
  "gasUsed": "2502495",
  "bytecodeBytes": 11249,
  "abiEntries": 23,
  "accounts": [
    {
      "role": "Admin / deployer",
      "address": "0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec",
      "balanceETH": "99.995307821875"
    },
    {
      "role": "Producer dự kiến",
      "address": "0x810A640B6089B12ab3bb7Bde1697752129679828",
      "balanceETH": "100.0"
    },
    {
      "role": "Distributor dự kiến",
      "address": "0x3a9f1bC5DE0dA2d1e04BEbBA2c6B29f09ED0AaB7",
      "balanceETH": "100.0"
    },
    {
      "role": "Retailer dự kiến",
      "address": "0x3788b00da52305a37DA455B164B0EBf2a937B4Bd",
      "balanceETH": "100.0"
    },
    {
      "role": "Customer dự kiến",
      "address": "0x9CE98Beb9e0Bacb75cD09B2a6A623cD366805Cd3",
      "balanceETH": "100.0"
    }
  ]
}
```

MetaMask: người dùng đã xác nhận import 5 ví; chưa xác nhận mạng đang chọn và số dư hiển thị trong ví. Chưa nghiệm thu kết nối website.

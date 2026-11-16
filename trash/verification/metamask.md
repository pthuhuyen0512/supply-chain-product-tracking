# Bước 04 — Kiểm tra trước cấu hình ví

```json
{
  "checkedAt": "2026-11-15T16:59:56.097Z",
  "client": "Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js",
  "chainId": "1337",
  "networkId": "5777",
  "block": 1,
  "contractAddress": "0x8B52d5D247fa21Af5D471FcD73991fF6Aaf56fda",
  "bytecodeBytes": 11249,
  "admin": "0x4bae880df29e1d5a76fa973be01fbcb363671e83",
  "adminHasRole": true,
  "balances": [
    {
      "address": "0x4bae880df29e1d5a76fa973be01fbcb363671e83",
      "balanceETH": "99.995307821875"
    },
    {
      "address": "0x5a1fd87e81eca5413953cd7235b732191415fc84",
      "balanceETH": "100.0"
    },
    {
      "address": "0x92a4146c8e84b2309c3a4fd31c440b54d6912273",
      "balanceETH": "100.0"
    },
    {
      "address": "0x521196b96a34f9b2123959d72ae70cd28dc29a6d",
      "balanceETH": "100.0"
    },
    {
      "address": "0xd99ec18711ef7c02673ddfe427e594ec9f54531b",
      "balanceETH": "100.0"
    }
  ]
}
```

RPC/on-chain: đã xác minh. MetaMask: chưa xác nhận thủ công; chưa kiểm tra website nhận tài khoản (bước 06). Chỉ gọi đọc, không cấp quyền hoặc gửi giao dịch. Script exit code: 0.

# Kiểm tra Ganache — bước 02

Thời điểm UTC: 2026-11-15T15:31:17.643Z. Ngày local: 15/11/2026 (Asia/Saigon).

Kết quả: thành công. Timeout mỗi request: 5000 ms; chỉ gọi phương thức đọc.

- RPC: http://127.0.0.1:7545, trùng hardhat.config.ts nên không chỉnh cấu hình.
- Client: Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js; xác nhận Ganache qua web3_clientVersion.
- Chain ID: 0x539 (hex), 1337 (thập phân).
- Network ID: 5777, là giá trị riêng từ net_version.
- Block: 0x0 / 0.
- eth_accounts trả 10 tài khoản; 5 tài khoản đầu hợp lệ và có số dư: 100.0 ETH, 100.0 ETH, 100.0 ETH, 100.0 ETH, 100.0 ETH.
- Bảng địa chỉ/số dư/vai trò dự kiến: docs/local-demo.local.md (Git ignore). Chưa có vai trò nào được cấp bởi bước này.
- Mỗi máy/workspace phải đọc lại RPC, client, Chain ID, Network ID, tài khoản và số dư; không dùng địa chỉ local làm hằng số chung.
- Không đọc khóa, gửi giao dịch, deploy, cấp quyền, tạo sản phẩm hoặc reset workspace.

## Phản hồi JSON-RPC

Địa chỉ công khai được lược bỏ trong bản verification; bản local lưu bảng tương ứng.

```json
[
  {
    "method": "web3_clientVersion",
    "params": [],
    "httpStatus": 200,
    "response": {
      "id": 1,
      "jsonrpc": "2.0",
      "result": "Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js"
    }
  },
  {
    "method": "eth_chainId",
    "params": [],
    "httpStatus": 200,
    "response": {
      "id": 2,
      "jsonrpc": "2.0",
      "result": "0x539"
    }
  },
  {
    "method": "net_version",
    "params": [],
    "httpStatus": 200,
    "response": {
      "id": 3,
      "jsonrpc": "2.0",
      "result": "5777"
    }
  },
  {
    "method": "eth_blockNumber",
    "params": [],
    "httpStatus": 200,
    "response": {
      "id": 4,
      "jsonrpc": "2.0",
      "result": "0x0"
    }
  },
  {
    "method": "eth_accounts",
    "params": [],
    "httpStatus": 200,
    "response": {
      "id": 5,
      "jsonrpc": "2.0",
      "result": "10 public addresses; see ignored local mapping"
    }
  },
  {
    "method": "eth_getBalance",
    "params": [
      "<public address in local mapping>",
      "latest"
    ],
    "httpStatus": 200,
    "response": {
      "id": 6,
      "jsonrpc": "2.0",
      "result": "0x56bc75e2d63100000"
    }
  },
  {
    "method": "eth_getBalance",
    "params": [
      "<public address in local mapping>",
      "latest"
    ],
    "httpStatus": 200,
    "response": {
      "id": 7,
      "jsonrpc": "2.0",
      "result": "0x56bc75e2d63100000"
    }
  },
  {
    "method": "eth_getBalance",
    "params": [
      "<public address in local mapping>",
      "latest"
    ],
    "httpStatus": 200,
    "response": {
      "id": 8,
      "jsonrpc": "2.0",
      "result": "0x56bc75e2d63100000"
    }
  },
  {
    "method": "eth_getBalance",
    "params": [
      "<public address in local mapping>",
      "latest"
    ],
    "httpStatus": 200,
    "response": {
      "id": 9,
      "jsonrpc": "2.0",
      "result": "0x56bc75e2d63100000"
    }
  },
  {
    "method": "eth_getBalance",
    "params": [
      "<public address in local mapping>",
      "latest"
    ],
    "httpStatus": 200,
    "response": {
      "id": 10,
      "jsonrpc": "2.0",
      "result": "0x56bc75e2d63100000"
    }
  }
]
```

Exit code: 0.

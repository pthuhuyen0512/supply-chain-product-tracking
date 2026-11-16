# Ganache transaction export

Đã xuất toàn bộ 16 giao dịch được ghi vào blockchain từ block 0 đến block 16 qua RPC `http://127.0.0.1:7545`, network ID 5777, chain ID 1337. Giao dịch cuối khớp ảnh workspace NOISELESS-MAGIC: `0x15f3fdb938c1bf6bc8782b803e61a3f52b27df2cd9dc69b844cedd306ac0abea`. Thời điểm xuất: 19:51:53 ngày 16/11/2026 (UTC+7).

## File nên đưa cho AI

- `transactions.jsonl`: UTF-8, mỗi dòng là một JSON object cho một giao dịch, sắp xếp block và transaction index tăng dần. Đây là file chính, chứa trường đã chuẩn hóa và bản RPC gốc của transaction/receipt, bao gồm toàn bộ input và event logs.
- `summary.json`: thông tin mạng, phạm vi snapshot, tổng số giao dịch, tổng gas, tổng phí và các kiểm tra tính đầy đủ.
- `blocks.raw.jsonl`: toàn bộ block gốc 0–16, bao gồm full transactions, giúp đối chiếu dữ liệu nguồn.
- `pending.raw.jsonl`: giao dịch đang chờ ở thời điểm đọc; file rỗng vì không có giao dịch đang chờ. Giao dịch chưa được mined chưa có gas used/phí thực tế.

## Trường gas và phí

| Trường | Ý nghĩa |
|---|---|
| `gas_limit` | Gas tối đa giao dịch cho phép dùng |
| `gas_used` | Gas thực sự đã dùng, lấy từ receipt |
| `gas_price_wei` | Giá thực tế của mỗi đơn vị gas, ưu tiên receipt.effectiveGasPrice |
| `gas_price_gwei` | Giá gas thực tế tính bằng Gwei; 1 Gwei = 10^9 Wei |
| `gas_price_source` | Nguồn hoặc công thức xác định giá gas thực tế |
| `transaction_gas_price_wei` | gasPrice gốc trên transaction |
| `max_fee_per_gas_wei` | Trần giá gas của giao dịch EIP-1559, không phải phí thực trả |
| `max_priority_fee_per_gas_wei` | Trần priority fee trên mỗi gas |
| `actual_fee_wei` | `gas_used × gas_price_wei` |
| `actual_fee_eth` | `actual_fee_wei / 10^18` |
| `value_eth` | ETH yêu cầu chuyển trong transaction, tách riêng phí gas |
| `sender_cost_including_value_eth` | Phí gas cộng value nếu giao dịch thành công; không tính các luồng ETH nội bộ hợp đồng |

Các giá trị tiền tệ được lưu dưới dạng chuỗi thập phân để không mất độ chính xác khi AI hoặc JavaScript đọc số nguyên lớn. ETH có đủ 18 chữ số thập phân. `gas_used`, block number, nonce và transaction index là số nguyên JSON. Trường không áp dụng có giá trị `null`.

Các trường còn lại bao gồm hash, địa chỉ gửi/nhận, địa chỉ hợp đồng được tạo, trạng thái, loại transaction, thời gian UTC, nonce, function selector, calldata và event logs. `raw_transaction` và `raw_receipt` giữ nguyên các trường JSON-RPC gốc (số hex). Chưa giải mã calldata/logs theo ABI. Export bao gồm giao dịch cấp blockchain; các internal calls không phải transaction riêng và không được trích từ trace.

## Kết quả và kiểm tra

- 16 giao dịch thành công; 0 thất bại; 0 đang chờ.
- Tổng gas used: **3,852,324**.
- Tổng phí thực tế: **0.031688758125000000 ETH**, tương ứng **31688758125000000 Wei**.
- Đã kiểm tra các block liên tục và liên kết hash, không trùng transaction hash, mỗi transaction có receipt, tổng gas receipt khớp gasUsed của từng block, và hash block cuối không đổi trong quá trình xuất.

Đây là ETH trên blockchain Ganache cục bộ. Phí trên không phải khoản thanh toán trên Ethereum mainnet. Phí gas đã bao gồm base fee và priority fee theo giá thực tế, không cộng base fee lần nữa.

Để xuất snapshot mới từ thư mục Blockchain: `python exports/export_ganache.py`. Script chỉ đọc RPC, không gửi transaction và không xuất private key hay seed phrase.

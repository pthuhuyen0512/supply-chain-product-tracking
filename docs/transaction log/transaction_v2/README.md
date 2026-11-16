# Ganache transaction export v2

File chính để đưa cho AI: **transactions.jsonl** (UTF-8, mỗi dòng một JSON object cho một giao dịch).

Phạm vi gồm **cả giao dịch bắt đầu** `0xc449dad81d78a3b01fe403a4e6eb201bc5448976cd7e064708b22c087972f3d3` ở block 17, transaction index 0, đến hết block 25 tại thời điểm xuất **20:41:03 ngày 16/11/2026 (UTC+7)**. Không bao gồm các giao dịch block 1–16 của phiên trước.

## Kết quả

- RPC: http://127.0.0.1:7545; chain ID 1337; network ID 5777.
- 9 giao dịch, tất cả thành công; không có giao dịch đang chờ tại thời điểm kiểm tra.
- Tổng gas used: **2.770.148**.
- Tổng phí: **0.014777931549405433 ETH** = **14777931549405433 Wei**.
- Thứ tự: block tăng dần, sau đó transaction index tăng dần.

## Trường phí và gas

| Trường | Ý nghĩa |
|---|---|
| gas_used | Gas thực sự tiêu thụ, lấy từ receipt.gasUsed |
| gas_limit | Giới hạn gas giao dịch, không dùng để tính phí thực trả |
| gas_price_wei | Giá gas thực tế, ưu tiên receipt.effectiveGasPrice, đơn vị Wei/gas |
| gas_price_gwei | Giá gas thực tế tính bằng Gwei; 1 Gwei = 10^9 Wei |
| gas_price_source | Nguồn dữ liệu hoặc công thức xác định giá gas |
| actual_fee_wei | gas_used × gas_price_wei |
| actual_fee_eth | actual_fee_wei / 10^18 |
| transaction_gas_price_wei | gasPrice gốc của transaction |
| max_fee_per_gas_wei | Trần giá gas EIP-1559, khác giá gas thực tế |
| max_priority_fee_per_gas_wei | Trần priority fee EIP-1559 |
| value_eth | Giá trị ETH yêu cầu chuyển, tách khỏi phí gas |

Phí thực tế đã bao gồm base fee và priority fee trong effectiveGasPrice; không cộng thêm base fee. Dùng số nguyên Wei để tính, sau đó định dạng ETH với 18 chữ số thập phân. Các giá trị tiền được lưu dạng chuỗi để tránh mất chính xác khi dùng JavaScript hoặc công cụ AI. Các số gas, block, nonce và index là số nguyên JSON.

Mỗi bản ghi còn có hash, địa chỉ ví gửi/nhận, địa chỉ hợp đồng tạo mới, trạng thái, timestamp, nonce, input/calldata, function selector, logs và toàn bộ raw_transaction/raw_receipt. Calldata và logs được giữ nguyên, chưa giải mã ABI. Phạm vi là giao dịch được ghi vào block; internal calls không được xuất thành giao dịch riêng.

## Các file

- transactions.jsonl: dữ liệu chuẩn hóa kèm transaction và receipt gốc; file nên ưu tiên cho AI.
- summary.json: phạm vi snapshot, hash bắt đầu, tổng số giao dịch, tổng gas và tổng phí.
- blocks.raw.jsonl: 9 block gốc từ 17–25, chứa full transactions để đối chiếu.
- pending.raw.jsonl: giao dịch đang chờ; hiện rỗng. Giao dịch chưa mined chưa có gas used hay phí thực tế.
- export_ganache.py: script chỉ đọc JSON-RPC, không gửi giao dịch và không lấy private key/seed phrase. Có thể dùng --output với thư mục mới để xuất lại từ hash bắt đầu.

Đã kiểm tra liên kết block, hash giao dịch không trùng, đủ receipt, tổng gas receipt khớp từng block, hash đầu đúng yêu cầu và hash block cuối không thay đổi trong lúc xuất. Đây là phí ETH trên mạng Ganache cục bộ.

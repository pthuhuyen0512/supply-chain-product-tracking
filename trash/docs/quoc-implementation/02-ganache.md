# Bước 02 — Chuẩn bị blockchain Ganache

## Mục tiêu

Có Ganache local đang chạy, RPC truy cập được, biết Chain ID thật và ít nhất 5 tài khoản có ETH thử nghiệm.

## Bạn cần thao tác thủ công

1. Mở Ganache Desktop, chọn workspace Ethereum đang dùng hoặc tạo workspace riêng cho đồ án.
2. Xem RPC Server, giữ ứng dụng chạy trong suốt các bước sau. Cấu hình repo hiện hướng tới `http://127.0.0.1:7545`; nếu Ganache dùng cổng khác, báo giá trị thật để AI cập nhật.
3. Không reset workspace giữa các bước. Nếu đã reset, báo AI trước khi kiểm tra lại deploy.

AI có thể kiểm tra RPC từ terminal; không cần bạn chép private key. Nếu chưa cài Ganache, AI hướng dẫn nguồn chính thức và đợi bạn cài; không tự thay bằng Hardhat node vì yêu cầu nộp bài là Ganache.

## Prompt giao AI

```text
Thực hiện bước 02. Đọc docs/quoc-implementation/00-START-HERE.md và PROGRESS.md nếu có; xác nhận bước 01 đạt.

1. Kiểm tra RPC cấu hình trong hardhat.config.ts. Thử JSON-RPC với timeout hữu hạn: web3_clientVersion, eth_chainId, net_version, eth_blockNumber, eth_accounts và eth_getBalance.
2. Nếu node chưa chạy, yêu cầu tôi mở Ganache/chọn workspace và cung cấp đúng RPC nếu khác cấu hình. Không chạy vòng lặp chờ vô hạn, không tự reset workspace.
3. Khi truy cập được, xác minh đây là Ganache và hiển thị Chain ID cả hex lẫn thập phân, tách biệt với Network ID. Không gán cứng 5777 hoặc 1337.
4. Chọn 5 địa chỉ local có số dư: Admin dự kiến là deployer thực tế ở bước 03, rồi Producer, Distributor, Retailer, Customer. Ghi địa chỉ công khai và số dư vào docs/local-demo.local.md (được gitignore). Không đọc/lưu khóa.
5. Chỉ chỉnh RPC trong cấu hình project nếu thực tế khác. Tạo docs/verification/ganache.md mô tả phép kiểm tra, client version, Chain ID, kết quả và các dữ liệu môi trường phải lấy lại trên máy khác. Không công bố địa chỉ local là giá trị cố định cho mọi máy.
6. Cập nhật PROGRESS.md và nêu rõ tôi phải giữ Ganache chạy.

Chưa deploy, chưa tự cấp quyền hoặc tạo sản phẩm.
```

## Hoàn thành khi

- RPC phản hồi hợp lệ, client Ganache được xác nhận.
- Có Chain ID thật và 5 tài khoản đủ ETH thử nghiệm.
- Không có khóa cá nhân trong file/log; thông tin local có đường dẫn rõ ràng để bước sau dùng.

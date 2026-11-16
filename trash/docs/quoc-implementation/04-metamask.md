# Bước 04 — Cấu hình MetaMask và tài khoản

## Mục tiêu

MetaMask sử dụng đúng Ganache và có đủ 5 ví trùng với bảng tài khoản local.

## Bạn cần thao tác thủ công

1. Cài/mở MetaMask trong Chrome. Phần thiết lập ví và bí mật do bạn tự xử lý.
2. Thêm mạng local bằng RPC và Chain ID thật AI đưa từ bước 02; ký hiệu tiền ETH.
3. Trong Ganache, tự lấy private key của từng tài khoản thử nghiệm rồi nhập trực tiếp vào MetaMask. Không gửi khóa vào chat, không lưu trong repo.
4. Đặt tên Admin, Producer, Distributor, Retailer, Customer theo bảng AI chuẩn bị. Địa chỉ Admin phải đúng ví đã deploy.
5. Chọn mạng Ganache, kiểm tra địa chỉ/số dư hiển thị. Việc đặt tên ví chưa cấp quyền on-chain; cấp quyền sẽ làm trên web ở bước 06.

## Prompt giao AI

```text
Thực hiện bước 04. Đọc 00-START-HERE.md, PROGRESS.md và cấu hình/bảng tài khoản local từ các bước trước.

1. Kiểm tra lại RPC, Chain ID, contract bytecode và Admin để tránh hướng dẫn trên dữ liệu đã cũ.
2. Đưa cho tôi bảng cấu hình mạng và bảng 5 địa chỉ công khai với tên vai trò. Dùng giá trị thật, không placeholder khi đã đọc được từ RPC.
3. Hướng dẫn ngắn từng thao tác thêm mạng, import tài khoản Ganache, đổi tên và chọn mạng. Nếu tên menu khác theo bản MetaMask, hướng dẫn dựa trên UI/tài liệu chính thức hiện tại khi cần, không yêu cầu tắt bảo vệ hoặc cung cấp bí mật.
4. Dừng đúng phần tôi cần thao tác và chờ tôi xác nhận. Không tự đánh dấu MetaMask hoạt động chỉ vì eth_accounts của Ganache trả đúng tài khoản.
5. Sau phản hồi, xác minh on-chain được những gì có thể, ghi rõ MetaMask mới được xác nhận thủ công. Việc kiểm tra website nhận tài khoản sẽ làm ở bước 06.
6. Nếu nonce lỗi sau khi reset chain, phân tích nguyên nhân và hướng dẫn thao tác cần thiết trên mạng local, không mặc định xóa ví hay reset Ganache.
7. Lưu hướng dẫn tái lập vào docs/metamask-setup.md, tránh gắn địa chỉ máy này thành yêu cầu cho mọi máy. Cập nhật PROGRESS.md.

Không cấp vai trò tự động; giữ luồng cấp quyền qua website cho bước 06.
```

## Hoàn thành khi

- Bạn xác nhận MetaMask có đúng mạng và 5 địa chỉ.
- Admin trùng deployer; số dư ETH local hiển thị hợp lý.
- Không có private key/seed phrase trong nội dung AI nhận hoặc ghi.

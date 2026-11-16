# Bước 05 — Tạo cấu trúc website và giao diện

## Mục tiêu

Website Vite vanilla JavaScript chạy và build được, có đủ vùng chức năng; phần tích hợp ví/giao dịch và QR sẽ hoàn thiện ở bước 06–07.

## Phân chia

- **AI:** tạo file, cài dependency, CSS/layout, config loader và kiểm tra build; dùng browser kiểm tra nếu có công cụ.
- **Bạn:** không cần setup mới; có thể góp ý giao diện. Không bắt buộc chờ góp ý để làm bản đầu.

## Prompt giao AI

```text
Thực hiện bước 05. Đọc 00-START-HERE.md, PROGRESS.md, CONTRACT_INTERFACE.md và các file export ở bước 03.

1. Kiểm tra frontend/ đã có gì. Vì bước 03 đã tạo ABI/config, không chạy scaffold ghi đè thư mục bằng force. Tạo cấu hình Vite/package.json/index.html/src thủ công hoặc scaffold vào thư mục tạm rồi chỉ lấy file cần thiết.
2. Dùng vanilla JavaScript, ethers v6, qrcode và html5-qrcode. Có package-lock.json riêng cho frontend, npm scripts dev/build/preview và dependency tương thích. Không thêm React/backend.
3. Tổ chức src/main.js, style.css, services/blockchain.js, config/ và abi/. Giữ đúng định dạng ABI đã chọn ở bước 03.
4. Tạo giao diện tiếng Việt rõ ràng, responsive: trạng thái mạng/contract, kết nối ví và vai trò, Admin cấp quyền, Producer tạo sản phẩm, bàn giao, tra cứu/timeline và vùng QR/camera. Có label cho input, trạng thái đang xử lý, thông báo lỗi/thành công. Chưa kết nối ví vẫn truy cập được vùng tra cứu.
5. Nạp deployment.local.json theo cách optional phù hợp Vite, ví dụ import.meta.glob với đường dẫn cố định rồi kiểm tra thiếu cấu hình. Khi thiếu/sai, trang vẫn mở và chỉ rõ lệnh export; không dùng địa chỉ giả, không crash từ top-level import không tồn tại.
6. Kiểm tra RPC/Chain ID/contract khi cấu hình có sẵn; tách lỗi thiếu config, node không chạy và contract không tồn tại. Không ghi config hoặc private key vào localStorage.
7. Chưa tích hợp chức năng nào thì nút phải thể hiện rõ chưa sẵn sàng; không hiển thị dữ liệu blockchain giả hay alert thành công giả.
8. Chạy npm.cmd ci hoặc install phù hợp trạng thái lockfile, npm.cmd run build, khởi động dev server nếu cần kiểm tra. Nếu có browser tool, xem desktop/mobile và lỗi console. Nếu không có, ghi kiểm tra hình ảnh còn chờ thay vì tuyên bố đã xem UI.
9. Ghi kết quả vào docs/verification/frontend-foundation.md và cập nhật PROGRESS.md. Không tự mở rộng sang giao dịch/QR của bước 06–07.
```

## Hoàn thành khi

- Vite chạy, build pass và layout có đủ vùng chức năng.
- Bản có cấu hình và bản thiếu cấu hình đều không crash; tình trạng chưa tích hợp được thể hiện trung thực.
- ABI/config bước 03 không bị scaffold ghi đè.

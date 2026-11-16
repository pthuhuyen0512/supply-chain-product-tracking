# Bước 08 — Kiểm tra tích hợp và xử lý lỗi

## Mục tiêu

Có bằng chứng toàn hệ thống chạy trên Ganache, phân biệt test contract mô phỏng với nghiệm thu frontend thực tế.

## Phân chia

- **AI:** lập ma trận kiểm tra, chạy lệnh, đối chiếu on-chain, sửa lỗi thuộc frontend/deploy và lưu bằng chứng.
- **Bạn:** thao tác MetaMask, đổi mạng/tài khoản, từ chối ký khi được hướng dẫn và thử webcam. Không cần chia sẻ bí mật.

## Prompt giao AI

```text
Thực hiện bước 08. Đọc 00-START-HERE.md, PROGRESS.md và mọi log verification hiện có. Đừng coi các mục chờ thủ công là đã pass.

1. Chạy lại compile/typecheck/test cần thiết cho trạng thái code hiện tại và frontend build. Ghi môi trường/profile và exit code. Không sửa Solidity hoặc test Huyền để che lỗi tích hợp.
2. Tạo docs/verification/integration.md với cột ca kiểm tra, cách chạy, expected/actual, pass/fail/pending, transaction hash hoặc bằng chứng liên quan. Tách contract test Hardhat mô phỏng, kiểm tra RPC Ganache, browser UI và thao tác MetaMask/camera.
3. Kiểm tra full flow cho mã sản phẩm mới có thể tái chạy mà không reset chain: Admin cấp role, Producer tạo, 3 bàn giao, Customer giữ cuối, 4 history entries, event và timestamps khớp receipt/block. Dùng mã riêng cho ca lỗi cần stage giữa; không thử trường hợp cần Produced trên sản phẩm đã Delivered.
4. Kiểm tra từ UI: không ví; chưa kết nối; sai mạng; đổi tài khoản; từ chối ký; mã trùng; người không giữ hàng; người nhận sai role; sau Delivered; mã không tồn tại; RPC ngắt tạm; QR và camera. Không ngắt/reset Ganache nếu có cách mô phỏng lỗi an toàn hơn; hướng dẫn khôi phục khi cần tôi thao tác.
5. Ca sai quyền/sai thứ tự phải xác minh dữ liệu không đổi. Contract có thể từ chối tại estimateGas trước ký, không bắt buộc ép gửi giao dịch revert để lấy receipt.
6. Khi AI không điều khiển được MetaMask/camera, chuẩn bị bảng thao tác cụ thể cho tôi và hỏi kết quả đúng lúc. Ưu tiên đọc RPC để bổ sung kiểm chứng; giao dịch terminal không thay bằng chứng UI.
7. Chỉ thêm kiểm thử có ích cho logic mới dễ sai như config loader/error decoding hoặc account switching nếu hạ tầng cho phép; không tạo test chỉ lặp lại code hay dựng hạ tầng lớn không cần thiết. Sau sửa lỗi, chạy lại ca liên quan và build; không lặp toàn bộ vô lý nếu không có thay đổi.
8. Ghi screenshot nếu công cụ browser cho phép hoặc chỉ rõ phần tôi cần chụp; không tạo ảnh bằng chứng giả. Cập nhật PROGRESS.md với lỗi chưa giải quyết và giới hạn.
```

## Hoàn thành khi

- Full flow Ganache/MetaMask và QR được xác nhận bằng dữ liệu thật.
- Không còn lỗi chặn chức năng chính; mọi mục chưa thử ghi pending, không được đánh dấu bước hoàn tất.
- Log đủ để hai thành viên dùng trong README, báo cáo và demo.

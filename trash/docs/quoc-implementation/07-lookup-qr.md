# Bước 07 — Tra cứu công khai, timeline và QR

## Mục tiêu

Khách hàng nhập/quét mã và xem lịch sử thật mà không phải kết nối MetaMask.

## Phân chia

- **AI:** gọi hàm đọc, dựng timeline, tạo QR, viết vòng đời scanner và kiểm tra tự động phù hợp.
- **Bạn:** cấp quyền camera, đưa QR in sẵn hoặc trên điện thoại vào webcam. Nếu máy không có camera, phần camera vẫn là chưa xác minh; có thể thêm đọc ảnh QR như tiện ích hỗ trợ, không giả nhận đã thử camera.

## Prompt giao AI

```text
Thực hiện bước 07. Đọc 00-START-HERE.md, PROGRESS.md, CONTRACT_INTERFACE.md và frontend hiện tại.

1. Triển khai tra cứu bằng reader qua RPC, không yêu cầu window.ethereum hay eth_requestAccounts. Thử trong ngữ cảnh chưa kết nối ví; phân biệt RPC lỗi, thiếu config và mã không tồn tại.
2. Trim mã ở mọi đầu vào (tạo, bàn giao, tra cứu và QR); giữ nguyên phân biệt hoa/thường theo contract. Không hash chuỗi mã trước khi gọi getProduct/getHistory.
3. Kiểm tra product.exists. Nếu false, hiển thị không tìm thấy và xóa kết quả cũ; getHistory mã lạ trả mảng rỗng, không dựa vào revert. Khi tìm thấy, hiển thị tên, mã, origin, holder, stage, createdAt và timeline history theo đúng thứ tự mảng.
4. Nhãn stage 0–4 đúng ABI; chuyển bigint an toàn khi hiển thị, timestamp giây sang mili giây. Mốc tạo có from=zero phải diễn giải là khởi tạo; không làm mất mốc nếu timestamp bằng nhau. Không yêu cầu lịch sử lúc nào cũng đủ bốn mốc: chỉ đủ bốn khi Delivered.
5. Tạo QR từ đúng mã sản phẩm, có xem/tải ảnh QR nếu thuận tiện. Không đưa private key hoặc dữ liệu không liên quan vào QR.
6. Tích hợp html5-qrcode: bật/tắt camera, xử lý denied/không có camera, ngăn start/stop trùng và callback đọc lặp. Sau decode hợp lệ, dừng scanner/release camera và gọi tra cứu. Dọn tài nguyên khi rời màn hình. localhost được dùng cho demo; không hướng dẫn mở localhost máy tính trên điện thoại như cùng một server.
7. Bảo vệ UI trước mã QR lạ/rỗng và dữ liệu HTML độc hại; coi decoded text là mã, không tự mở URL hoặc thực thi nội dung.
8. Chạy build, kiểm tra tra cứu mã thật, mã lạ, mạng ngắt và trường hợp không có MetaMask. Nếu có công cụ đọc ảnh/browser hãy dùng kiểm tra QR phù hợp; không xem việc tạo được ảnh là camera đã quét thành công.
9. Yêu cầu tôi cấp camera và quét QR đã chuẩn bị; chờ kết quả rồi đối chiếu product/history. Ghi docs/verification/lookup-qr.md và cập nhật PROGRESS.md, tách bằng chứng thật khỏi phần còn chờ.
```

## Hoàn thành khi

- Tra cứu công khai chạy được khi không kết nối ví, dữ liệu khớp contract.
- QR mã demo tra ra đúng sản phẩm; camera được kiểm tra thực tế hoặc được ghi rõ là chưa hoàn tất.
- Không còn kết quả cũ gây hiểu nhầm khi tra mã không tồn tại hoặc RPC lỗi.

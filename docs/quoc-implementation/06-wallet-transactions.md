# Bước 06 — Kết nối ví, cấp quyền, tạo và bàn giao

## Mục tiêu

Hoàn thành mọi thao tác ghi blockchain trên website bằng MetaMask.

## Phân chia

- **AI:** viết dịch vụ ethers, xử lý quyền/lỗi/trạng thái, kiểm tra code/build và hỗ trợ kiểm tra on-chain.
- **Bạn:** bấm kết nối website với MetaMask, đổi đúng ví và xác nhận từng giao dịch local. AI không cần private key.
- **Điểm dừng:** khi cần extension cho phép kết nối/ký. AI phải chuẩn bị màn hình và dữ liệu nhập cụ thể trước khi yêu cầu thao tác.

## Prompt giao AI

```text
Thực hiện bước 06. Đọc 00-START-HERE.md, PROGRESS.md, CONTRACT_INTERFACE.md và frontend hiện tại; kiểm tra deploy/config vẫn hợp lệ.

1. Triển khai BrowserProvider/Signer cho ghi và JsonRpcProvider cho đọc. Kết nối MetaMask khi người dùng bấm nút. Kiểm tra Chain ID trước giao dịch; chỉ hỗ trợ thêm/chuyển đúng mạng Ganache, để người dùng xác nhận trong ví.
2. Xử lý accountsChanged, chainChanged và tài khoản rỗng/ngắt kết nối. Hủy tham chiếu writer cũ ngay khi ví/mạng đổi, tạo signer mới và cập nhật quyền. Không tự yêu cầu eth_requestAccounts lặp khi người dùng ngắt kết nối; không giữ nút ghi hoạt động khi trạng thái không hợp lệ.
3. Đọc hasRole và các getter để hiển thị quyền; một ví có thể có nhiều quyền. Admin không được xem là Producer tự động. Form cấp quyền dùng getter bytes32, không truyền tên role dạng chuỗi trực tiếp.
4. Tích hợp grantRole, createProduct(productId,name,origin), handoverProduct(productId,to). Chuẩn hóa trim nhất quán, kiểm tra input rỗng, địa chỉ sai/zero và tự bàn giao. Chỉ người giữ và còn đúng quyền được thao tác ở stage hiện tại; contract vẫn là nơi kiểm soát cuối cùng.
5. Thực hiện tx.wait(), hiển thị pending/thành công/thất bại, transaction hash và gasUsed dạng chuỗi. Ngăn bấm lặp khi đang chờ, khôi phục UI khi lỗi, refresh thông tin sau receipt thành công. Xử lý người dùng từ chối, RPC mất kết nối, thiếu ETH, revert chuỗi/custom error và giao dịch thất bại. Render dữ liệu nhập bằng cách tránh XSS.
6. Chạy build và kiểm tra phù hợp. Sau đó chuẩn bị từng bước nghiệm thu UI: Admin cấp 4 role cho bảng ví local; Producer tạo một mã demo chưa dùng; Producer→Distributor→Retailer→Customer. Trước mỗi giao dịch cho tôi biết ví cần chọn, dữ liệu nhập, kết quả mong đợi rồi chờ thao tác ví khi cần.
7. Không dùng tài khoản Ganache ký qua terminal thay cho bằng chứng UI/MetaMask. Có thể dùng RPC đọc product/history/role sau mỗi thao tác để kiểm chứng. Nếu không kiểm tra được UI, ghi rõ còn chờ.
8. Kiểm tra đổi tài khoản và thử một giao dịch sai quyền hoặc sai thứ tự. Không yêu cầu giao dịch sai phải được mined: việc estimateGas từ chối với lý do hợp lệ cũng là kết quả cần ghi.
9. Lưu kết quả docs/verification/wallet-transactions.md và cập nhật PROGRESS.md, tách phần tự động khỏi phần người dùng thực sự xác nhận.
```

## Hoàn thành khi

- UI kết nối đúng ví/mạng và không sử dụng signer cũ sau khi đổi tài khoản.
- Các giao dịch thật qua MetaMask có receipt; full flow kết thúc ở Delivered.
- Có thông báo lỗi dễ hiểu cho thao tác không hợp lệ; nếu chưa thao tác ví, bước vẫn chờ nghiệm thu thủ công.

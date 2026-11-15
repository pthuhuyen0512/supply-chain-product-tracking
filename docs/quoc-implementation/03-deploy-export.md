# Bước 03 — Deploy và xuất ABI/cấu hình tự động

## Mục tiêu

Deploy được bằng module Ignition hiện có; frontend nhận đúng ABI, contract address, RPC và Chain ID của lần deploy thật.

## Phân chia

- **AI:** compile, chạy deploy trên Ganache local, xác minh bytecode/Admin, viết script xuất cấu hình và lệnh npm thuận tiện.
- **Bạn:** giữ Ganache hoạt động; nếu đổi workspace, báo lại. Bước này dùng tài khoản mở khóa của Ganache, không cần bạn xác nhận MetaMask.
- **Điểm dừng:** Ganache không truy cập được hoặc journal mâu thuẫn với chain hiện tại. AI phân tích trước, không tự xóa/reset trạng thái.

## Prompt giao AI

```text
Thực hiện bước 03. Đọc 00-START-HERE.md, PROGRESS.md và docs/CONTRACT_INTERFACE.md; kiểm tra điều kiện của bước 01–02.

1. Đọc module ignition/modules/SupplyChain.ts. Giữ module đang đúng thay vì viết lại chỉ vì có comment tạm. Đọc help và cấu trúc output của phiên bản Hardhat/Ignition đã cài.
2. Compile và deploy bằng npx.cmd hardhat ignition deploy ignition/modules/SupplyChain.ts --network ganache. Dùng mạng local đã xác minh, không mạng public; xử lý xác nhận CLI thông thường trong phạm vi này. Không mặc định dùng --reset.
3. Lấy contract address từ kết quả/journal thực tế, không nhập địa chỉ giả. Kiểm tra eth_getCode khác 0x, gọi DEFAULT_ADMIN_ROLE() và hasRole() để xác minh ví deploy có quyền Admin. Cập nhật bảng tài khoản local nếu deployer khác dự kiến.
4. Viết script export phù hợp ESM của project, ưu tiên scripts/export-frontend.mjs. Nó phải lấy ABI của đúng SupplyChain từ artifact thực tế và địa chỉ từ deployment hiện tại, lấy Chain ID qua RPC, kiểm tra bytecode trước khi ghi. Khi artifact/deployment/RPC sai hoặc thiếu, thoát lỗi rõ ràng; không xuất config giả hay giữ im lặng config cũ.
5. Xuất ABI tối thiểu vào frontend/src/abi/SupplyChain.json (quy ước thống nhất chỉ mảng ABI). Xuất môi trường thật vào frontend/src/config/deployment.local.json gồm contractAddress, rpcUrl, chainId dạng chuỗi; ignore file local. Tạo deployment.example.json không chứa địa chỉ deploy giả được xem là dùng được; frontend phải hướng dẫn chạy export khi thiếu file thật.
6. Thiết kế cách frontend nạp file local tùy chọn mà vẫn build được với bản clone sạch; sẽ triển khai ở bước 05. Chỉ tạo các thư mục/file cấu hình cần thiết ở bước này, chưa scaffold toàn bộ Vite.
7. Bổ sung scripts npm cho deploy/export, ghi rõ deploy profile dùng gì để tái lập và phối hợp đo gas. Không đổi profile/compiler chỉ để tạo số gas đẹp. Có thể tách deploy và export thành hai lệnh rõ ràng; nếu gộp phải dừng khi deploy thất bại.
8. Lưu bằng chứng deploy vào docs/verification/deployment.md, phân biệt dữ liệu công khai có thể commit với cấu hình máy local. Kiểm tra chạy export lại là an toàn và ABI khớp contract. Không tạo giao dịch cấp vai trò ở bước này.
9. Cập nhật .gitignore và PROGRESS.md. Ghi chính xác lệnh chạy lại sau khi compile/deploy thay đổi.
```

## Hoàn thành khi

- Contract có bytecode trên Ganache; Admin được kiểm tra bằng lời gọi on-chain.
- Một lệnh export tái tạo được ABI/cấu hình từ dữ liệu thật, có kiểm tra lỗi.
- Không đưa khóa hoặc cấu hình local bắt buộc lên Git; bản clone sạch có mẫu và chỉ dẫn rõ ràng.

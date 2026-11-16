# Bước 01 — Kiểm tra môi trường và code gốc

## Mục tiêu

Xác nhận bản clone compile và test được trước khi tích hợp; giữ nguyên contract và công việc hiện có.

## Phân chia

- **AI:** đọc cấu hình, git status, kiểm tra Node/npm, cài dependency theo lockfile, compile, typecheck, chạy test và lưu kết quả.
- **Bạn:** cài/sửa Node nếu cần; cài Ganache Desktop, Chrome và MetaMask nếu chưa có. Bước này chưa yêu cầu cấu hình ví.
- **Điểm dừng:** lỗi hệ thống/phần mềm mà AI không sửa được trong phạm vi project; yêu cầu một thao tác cụ thể rồi kiểm tra lại. Không coi thiếu Ganache là lý do không chạy contract test mô phỏng.

## Prompt giao AI

```text
Thực hiện bước 01. Đọc docs/quoc-implementation/00-START-HERE.md, code hiện tại và docs/CONTRACT_INTERFACE.md; tuân thủ quy ước chung.

1. Kiểm tra cwd, git status/branch và file thay đổi. Không pull hay chuyển nhánh. Đọc package.json, package-lock.json, hardhat.config.ts, tsconfig.json và test trước khi chạy.
2. Kiểm tra node --version, npm.cmd --version, git --version. Xác minh tương thích từ dependency và thông báo runtime thực tế; không tự hạ phiên bản code theo hướng dẫn mẫu.
3. Nếu dependency chưa sẵn sàng, chạy npm.cmd ci theo lockfile. Không tự dùng npm audit fix --force hoặc cập nhật hàng loạt.
4. Chạy lần lượt npx.cmd hardhat compile, npx.cmd tsc --noEmit và npx.cmd hardhat test mocha test/SupplyChain.test.ts; nếu cú pháp thực tế khác, đọc help của bản đã cài trước khi điều chỉnh.
5. Lưu stdout/stderr và exit code với UTF-8 vào docs/verification/environment.md và docs/verification/contract-tests.txt. Giữ nguyên docs/test_results.txt cũ để phân biệt nguồn bằng chứng. Nếu test fail, ghi rõ lỗi; không sửa Solidity/test ngoài phạm vi.
6. Đọc .gitignore: kích hoạt quy tắc bỏ qua frontend/node_modules/ và frontend/dist/, bổ sung quy tắc cho file cấu hình môi trường local sẽ sinh ở bước 03. Với ignition/deployments, đề xuất nhất quán journal local bị ignore và thông tin công khai rút gọn được lưu riêng; không xóa journal hiện có.
7. Tạo/cập nhật docs/quoc-implementation/PROGRESS.md với kết quả thật. Nếu cần tôi cài phần mềm, hướng dẫn ngắn và tiếp tục các kiểm tra độc lập còn làm được.

Chỉ thực hiện bước 01, chưa khởi tạo frontend hay deploy.
```

## Hoàn thành khi

- Compile, typecheck và test có kết quả mới, exit code rõ ràng; nếu có lỗi thì bước còn chưa hoàn thành.
- Có ghi nhận số test thực tế, không mặc định là 27 chỉ vì log cũ.
- Không có thay đổi ngoài dự kiến vào contract/test hoặc file người dùng đang làm.

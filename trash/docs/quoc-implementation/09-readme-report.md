# Bước 09 — README, phần báo cáo và phối hợp với Huyền

## Mục tiêu

Người khác làm theo README chạy được hệ thống; phần báo cáo của Quốc có mô tả và bằng chứng phù hợp code.

## Phân chia

- **AI:** viết tài liệu theo lệnh/file thật, tổng hợp kiểm thử, soạn phần giao diện và tích hợp, lập danh sách đầu vào còn thiếu.
- **Bạn:** trao đổi với Huyền về bảng gas trước/sau, phương pháp tối ưu và phần báo cáo contract; xác nhận thông tin nhóm. AI không tự nhắn Huyền hoặc bịa số liệu.
- **Chưa thuộc bước này:** xuất PDF cuối nếu chưa có đủ nội dung nhóm. Có thể soạn Markdown trước; khi được yêu cầu xuất PDF phải dùng quy trình render/kiểm tra tài liệu thích hợp.

## Prompt giao AI

```text
Thực hiện bước 09. Đọc 00-START-HERE.md, PROGRESS.md, code cuối, tài liệu đề bài và docs/verification/. Viết nội dung khớp trạng thái thật, không chép nguyên lệnh mẫu lỗi thời.

1. Hoàn thiện README.md: bài toán/phạm vi, công nghệ và phiên bản đã kiểm tra, cấu trúc repo, cài dependency root/frontend, compile/test/typecheck, mở Ganache, deploy, export ABI/config, cấu hình MetaMask, chạy web, bảng vai trò và demo ngắn. Có PowerShell commands dùng npm.cmd/npx.cmd khi phù hợp.
2. Mô tả chính xác file cấu hình local, mẫu example, cách lấy Chain ID, cơ chế Admin, cách cập nhật sau redeploy/reset Ganache và sự khác biệt Network ID/Chain ID. Không hướng dẫn dùng một địa chỉ máy Quốc cho mọi máy clone.
3. README link tới test log/bằng chứng thật, nêu ngày/môi trường và giới hạn: contract test không đồng nghĩa UI/MetaMask pass. Rà .gitignore cho dependencies, dist, env, config local và journal theo quy ước đã chọn. Không đưa key vào mẫu.
4. Viết docs/report-quoc.md: giao diện, luồng ví→ethers→RPC/contract, phân biệt đọc/ghi, xuất ABI/config, luồng tạo/bàn giao/tra cứu và QR, lỗi/thay đổi tài khoản/mạng, bằng chứng kiểm tra, hạn chế. Dùng sơ đồ Mermaid nhỏ nếu giúp giải thích; không tự dựng deliverable đồ họa phức tạp.
5. Ghi rõ phân công hai thành viên. Phần Huyền phụ trách là contract, access control, test và đo/tối ưu gas. Không khẳng định lịch sử Git đã có commit của cả hai nếu chưa kiểm tra.
6. Rà gas-analysis và báo cáo nhóm có thật chưa. Nếu chưa có, tạo docs/group-report-inputs.md liệt kê cần Huyền cung cấp: dữ liệu gas hàm chính, baseline/optimized, điều kiện compiler/profile/dữ liệu tương đương, phép tính chênh lệch và giải thích một tối ưu hóa. receipt gas UI chỉ là dữ liệu bổ sung, chưa thay bằng chứng so sánh tối ưu.
7. Không tự tạo số gas, ảnh test hoặc kết luận tối ưu chưa đo. Không lặp mô tả cũ rằng người đã bị thu hồi vai trò vẫn bàn giao được. Contract hiện chặn trường hợp này.
8. Nếu đủ đầu vào, soạn dàn nội dung gộp báo cáo 4–6 trang theo đề; đánh dấu phần chờ nếu thiếu. Phân biệt hoàn thành tài liệu phần Quốc và báo cáo nhóm còn thiếu.
9. Kiểm tra mọi lệnh/path/link local trong README tồn tại, cập nhật PROGRESS.md và đưa danh sách đầu vào tôi cần lấy từ Huyền nếu có.
```

## Hoàn thành khi

- README tái lập đúng cách cài/deploy/chạy, không cần đoán các bước còn thiếu.
- Có phần báo cáo của Quốc và danh sách đầu vào nhóm còn thiếu, nếu có.
- Không báo cáo gas/báo cáo nhóm đã hoàn thành khi thiếu số liệu hoặc nội dung thật.

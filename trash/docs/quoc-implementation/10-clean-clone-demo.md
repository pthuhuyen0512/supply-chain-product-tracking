# Bước 10 — Thử bản sạch và chuẩn bị nộp/demo

## Mục tiêu

Kiểm chứng README không phụ thuộc file chỉ có trên máy Quốc; chuẩn bị demo 10 phút và danh sách cần nộp.

## Phân chia

- **AI:** tạo bản sao sạch không chạm repo chính, chạy quy trình README, sửa hướng dẫn/lỗi thuộc phạm vi, chuẩn bị checklist và kịch bản.
- **Bạn:** xác nhận MetaMask/camera trên bản sạch, tập demo cùng Huyền, quay video dự phòng và nộp bài theo yêu cầu lớp.
- **Giới hạn:** không tự commit/push/merge/tag hoặc reset chain. Cần tính tới việc code đang sửa chưa được commit khi tạo bản sạch.

## Prompt giao AI

```text
Thực hiện bước 10. Đọc 00-START-HERE.md, PROGRESS.md, README và các kết quả verification hiện tại.

1. Kiểm tra git status và git diff để biết thay đổi nào chưa commit. Nếu clone Git đơn thuần không bao gồm code mới, tạo thư mục staging riêng từ source dự định nộp, gồm cả thay đổi mới, loại node_modules/artifacts/cache/dist/env/key/config local/deployment journal. Ghi rõ đây là kiểm tra source snapshot, chưa phải kiểm tra remote clone. Không xóa/di chuyển repo chính và không tự commit để tiện clone.
2. Nếu đã có commit phù hợp, có thể clone local vào thư mục mới; chỉ xác nhận remote clone khi thực sự clone đúng bản đã push. Chọn đường dẫn riêng, xác minh trước thao tác filesystem; không ghi đè dữ liệu có sẵn.
3. Làm đúng README từ đầu trong bản sạch: npm ci root/frontend, compile/test/typecheck, build không có deployment.local.json phải cho trạng thái thiếu cấu hình rõ ràng, deploy/export và chạy web. Không sao chép cấu hình máy chính để che bước thiếu.
4. Dùng deployment journal và cấu hình riêng trong bản sạch, không reset workspace Ganache đang chạy. Nếu tạo contract mới, ghi địa chỉ riêng, nhắc người dùng tab nào dùng contract nào; không thay config repo chính một cách ngầm định. Bản sạch cũng phải xác minh deployer/Admin/bytecode.
5. Chuẩn bị nghiệm thu UI/MetaMask/QR cho bản sạch và chờ tôi thao tác phần cần ký/camera. Ghi docs/verification/clean-setup.md: source nào, commit nếu có, lệnh/kết quả, bằng chứng mới, việc còn chờ. Nếu README thiếu bước thì sửa rồi kiểm tra lại phần liên quan.
6. Tạo docs/demo-script.md theo 10 phút: 1 phút Huyền giới thiệu; 1 phút Quốc cấp role; 2 phút Quốc tạo sản phẩm; 3 phút Quốc đổi ví và bàn giao; 1 phút Huyền tra cứu/quét QR; 1 phút Quốc minh họa thao tác sai; 1 phút Huyền trình bày test/gas. Chọn mã mới mỗi buổi hoặc chuẩn bị dữ liệu riêng, không mặc định reset Ganache.
7. Có checklist trước demo: Ganache chạy, đúng contract/config, đủ ETH local, 5 ví đặt tên, địa chỉ sẵn, website mở, camera được phép, cách khôi phục lỗi và phân công người nói/thao tác. Video dự phòng cần quay thật, không đánh dấu đã quay trước khi tôi xác nhận.
8. Tạo docs/submission-checklist.md bám đề: source, README, test log mới, bảng gas trước/sau và giải thích, báo cáo 4–6 trang, sơ đồ, commit của cả hai, demo và video. Rà file chuẩn bị đưa lên Git bằng git status/check-ignore; không in nội dung bí mật nếu phát hiện. Chỉ báo thực trạng lịch sử commit, chưa tự tạo commit/push/merge/tag.
9. Cập nhật PROGRESS.md, nêu phần Quốc đã xong, phần nhóm còn chờ và đề xuất bước Git tiếp theo như thông tin để tôi quyết định. Không nói toàn đồ án hoàn tất nếu gas/báo cáo/demo vẫn thiếu.
```

## Hoàn thành khi

- Bản sạch chạy theo README với nguồn và mức kiểm chứng được ghi rõ.
- Full flow/QR trên bản sạch đã nghiệm thu hoặc mục chờ được chỉ ra cụ thể.
- Kịch bản/checklist đủ để tập demo; trạng thái báo cáo, gas, video và lịch sử Git được báo trung thực.

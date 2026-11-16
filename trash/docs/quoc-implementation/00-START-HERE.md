# Hướng dẫn thực hiện phần của Quốc

Bộ tài liệu này là các yêu cầu để giao ChatGPT/Codex thực hiện lần lượt, chưa phải các tính năng đã được triển khai. Được lập từ `DS441A_Blockchain_Team5.md` và code local ngày 15/11/2026.

## Cách dùng

1. Mở project `supply-chain-product-tracking` bằng Codex hoặc công cụ AI có quyền đọc/sửa file và chạy terminal. ChatGPT chỉ trong trình duyệt, không có kết nối máy local, không thể tự chạy các lệnh này; khi đó AI phải cung cấp file và lệnh để bạn chạy.
2. Làm theo thứ tự bên dưới. Mỗi bước có thể dùng một chat mới: đính kèm file bước đó và file này, rồi gửi nguyên phần **Prompt giao AI**. Nếu AI có quyền workspace, chỉ cần yêu cầu đọc hai file.
3. AI thực hiện tất cả công việc không bị phụ thuộc trước khi dừng ở thao tác thủ công. Sau khi bạn làm xong, AI kiểm tra bằng dữ liệu thật rồi tiếp tục cùng bước.
4. Chỉ chuyển bước khi đạt tiêu chí hoàn thành. Nếu chưa đạt, AI ghi rõ lỗi và cách xử lý, không đánh dấu hoàn thành.
5. AI duy trì `docs/quoc-implementation/PROGRESS.md` sau mỗi bước: trạng thái, file thay đổi, lệnh và kết quả kiểm tra, phần chưa xác nhận, hành động tiếp theo. File này sẽ được tạo khi bắt đầu bước 01, chưa có trong bộ hướng dẫn ban đầu.

## Thứ tự và phân chia thao tác

| Bước | File | AI làm được qua file/terminal | Bạn cần làm trực tiếp |
| --- | --- | --- | --- |
| 01 | `01-environment.md` | Kiểm tra repo, dependency, compile, typecheck, test | Cài/sửa Node hoặc phần mềm nếu máy chưa sẵn sàng |
| 02 | `02-ganache.md` | Đọc RPC, Chain ID, tài khoản và số dư | Cài/mở Ganache, tạo hoặc chọn workspace |
| 03 | `03-deploy-export.md` | Deploy Ignition, xuất ABI và cấu hình thật | Giữ Ganache chạy; báo nếu workspace thay đổi |
| 04 | `04-metamask.md` | Soạn cấu hình mạng, bảng địa chỉ và kiểm tra on-chain | Cài MetaMask, thêm mạng, nhập 5 tài khoản |
| 05 | `05-frontend-foundation.md` | Tạo Vite, layout, form và cấu trúc dịch vụ | Có thể góp ý giao diện, không bắt buộc |
| 06 | `06-wallet-transactions.md` | Tích hợp ví, phân quyền, tạo và bàn giao | Kết nối ví, đổi tài khoản, xác nhận giao dịch |
| 07 | `07-lookup-qr.md` | Tra cứu công khai, timeline, tạo/quét QR | Cấp quyền camera, đưa QR vào webcam |
| 08 | `08-integration.md` | Kiểm tra build, luồng tích hợp, log và sửa lỗi | Thao tác MetaMask/camera để nghiệm thu thực tế |
| 09 | `09-readme-report.md` | README, phần báo cáo của Quốc, tổng hợp bằng chứng | Lấy kết quả gas từ Huyền, kiểm tra nội dung nhóm |
| 10 | `10-clean-clone-demo.md` | Thử bản sao sạch, checklist, kịch bản demo | Xác nhận ví/camera trên bản sạch, tập và quay demo |

## Dữ kiện đầu vào đã kiểm tra

- Repo có `contracts/SupplyChain.sol`, cấu hình Hardhat 3 và module `ignition/modules/SupplyChain.ts`.
- Compiler cấu hình là 0.8.34, target Paris; pragma contract là `^0.8.24`.
- Log có sẵn ghi 27 test pass; đó là bằng chứng từ repo, chưa phải lần chạy mới trên máy Quốc.
- Chưa có frontend, script xuất cấu hình, bảng gas trước/sau hoặc báo cáo cuối trong bản code đã đọc.
- README hiện mới giới thiệu đề tài và thành viên.
- Khi lập tài liệu, nhánh local đang là `quoc`. AI phải kiểm tra lại trạng thái thật, giữ công việc hiện có; không tự chuyển nhánh, pull, merge, commit hoặc push.

## Quy ước chung cho mọi prompt

- Đọc code hiện tại và `docs/CONTRACT_INTERFACE.md` trước khi sửa. Tài liệu mẫu cũ chỉ để tham khảo; không chép đè contract hoặc test bằng code mẫu.
- Phạm vi của Quốc: deploy, frontend, tích hợp, README và phần báo cáo tương ứng. Không tự sửa logic Solidity/test của Huyền để làm frontend chạy; nếu thấy lỗi contract, nêu bằng chứng và đề xuất trao đổi.
- Dùng HTML/CSS/JavaScript với Vite, ethers v6. Không thêm backend, React, dịch vụ trả phí hoặc deploy public nếu chưa được yêu cầu.
- Tự kiểm tra phiên bản dependency thực tế. Không giả định đường dẫn artifact hoặc schema deployment của Hardhat từ trí nhớ. Chỉ cập nhật dependency khi có lý do rõ ràng và giữ lockfile phù hợp.
- PowerShell có thể chặn npm.ps1: ưu tiên `npm.cmd`, `npx.cmd`. Không đổi ExecutionPolicy toàn máy để xử lý.
- Chỉ dùng Ganache local. Không ghi private key/seed phrase vào source, log, prompt hoặc tài liệu. AI không cần đọc khóa để deploy vì cấu hình dùng tài khoản Ganache mở khóa sẵn.
- Không reset Ganache, không chạy Ignition `--reset` và không xóa deployment journal đang dùng nếu chưa giải thích tác động và có yêu cầu phù hợp. Địa chỉ sau deploy lại có thể trùng hoặc khác; luôn kiểm tra lại bytecode và cấu hình.
- AI có terminal có thể đọc RPC và gửi giao dịch bằng các tài khoản local đã mở khóa. Điều đó không chứng minh frontend/MetaMask hoạt động; giao dịch nghiệm thu UI phải đi qua MetaMask.
- Không giả định AI điều khiển được extension MetaMask, camera hoặc màn hình hệ thống. Mặc định bạn xử lý những phần này. Nếu có công cụ UI được cho phép và dùng được, AI có thể hỗ trợ nhưng vẫn để bạn nhập bí mật/xác nhận ví.
- Không tuyên bố test, QR, deploy hoặc demo thành công nếu chỉ đọc source hay log cũ. Phân biệt rõ kiểm tra tự động và kiểm tra thủ công chưa làm.
- Nếu cần bạn thao tác, chỉ yêu cầu đúng phần đang chặn, với các giá trị thực tế đã thu thập; sau khi bạn phản hồi phải kiểm tra lại được phần nào thì kiểm tra.
- Sau mỗi bước, báo ngắn: đã làm gì, kiểm tra gì, còn thiếu gì và bước tiếp theo. Không tự chạy bước tiếp theo ngoài phạm vi bạn giao.

## Những khác biệt với tài liệu mẫu cần giữ đúng

- `getHistory()` của mã chưa tồn tại trả mảng rỗng; `getProduct()` trả struct với `exists=false`.
- Người đang giữ hàng bị thu hồi vai trò sẽ không được bàn giao cho tới khi được cấp lại.
- Contract kiểm tra cả nguồn gốc rỗng và việc bàn giao cho chính mình.
- Admin không tự có quyền Producer. Chuỗi đầy đủ: Producer → Distributor → Retailer → Customer.
- Không có hàm liệt kê toàn bộ sản phẩm/thành viên. Bản tối thiểu tra cứu theo mã, không tự thêm tính năng đòi thay contract.

## Prompt khởi động gợi ý

> Đọc `docs/quoc-implementation/00-START-HERE.md` và `docs/quoc-implementation/01-environment.md`, rồi thực hiện bước 01 trong repo hiện tại. Tự làm các phần chạy được qua file/terminal, chỉ dừng khi có thao tác thủ công thực sự cần tôi thực hiện. Chưa thực hiện các bước sau.

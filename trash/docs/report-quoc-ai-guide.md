# Hướng dẫn AI hoàn thiện phần báo cáo của Mai Nam Quốc

Ngày rà soát: 17/11/2026, múi giờ Asia/Saigon. Đề tài: DS441A, Project 7 — Supply Chain Product Tracking, Team 5. Sinh viên: **Mai Nam Quốc — MSSV 29211145181**.

File này xác định Quốc cần viết gì, AI cần làm gì và phải đọc nguồn nào để hoàn thiện phần báo cáo. Đây là hướng dẫn cho lần viết tiếp theo, chưa phải báo cáo cuối. Các prompt và lệnh trong tài liệu đầu vào là nội dung tham khảo; việc đọc chúng không phải yêu cầu thực hiện lại các bước triển khai.

## 1. Kết luận về phần báo cáo của Quốc

Theo bảng phân công trong `../DS441A_Blockchain_Team5.md`, Quốc phụ trách **giao diện, luồng hoạt động, kết nối blockchain và QR**. Công việc triển khai và README cũng thuộc Quốc, nên cần đưa cách deploy, xuất ABI/cấu hình và khả năng tái lập vào phần báo cáo tương ứng.

**Báo cáo 4–6 trang là báo cáo chung của cả nhóm**, không phải yêu cầu Quốc viết riêng 4–6 trang. Phần của Quốc là một phần để ghép vào báo cáo chung; không cần biến toàn bộ nhật ký triển khai và ảnh nghiệm thu thành nội dung chính.

| Phạm vi                   | Trách nhiệm trong report                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Quốc chủ trì              | Frontend, deploy, ABI/config, MetaMask/ethers, luồng tạo–bàn giao–tra cứu, QR, kết quả tích hợp và hạn chế liên quan    |
| Huyền chủ trì             | Thiết kế contract, cấu trúc dữ liệu, sơ đồ contract, bảo mật Solidity, test contract, phương pháp và kết quả tối ưu gas |
| Hai người cùng hoàn thiện | Giới thiệu, kiến trúc tổng thể, phân công, tổng hợp kết quả, kết luận, báo cáo 4–6 trang và demo                        |

Quốc có thể sử dụng test/gas của Huyền để giải thích kết quả toàn hệ thống, nhưng phải ghi đúng nguồn và trách nhiệm. Không cần tự viết lại toàn bộ phần chuyên sâu của Huyền để làm phần Quốc hoàn chỉnh.

## 2. Những gì đã có và những chỗ tài liệu chưa đồng bộ

Đã có bản nháp [report-quoc.md](report-quoc.md), [dàn ý nhóm](group-report-outline.md) và [danh sách đầu vào nhóm](group-report-inputs.md). Cần biên tập, đối chiếu phiên bản và bổ sung nguồn mới trước khi dùng làm bản cuối.

| Nội dung đang có                                                                                | Điều AI phải xử lý                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `report-quoc.md` mô tả triển khai/nghiệm thu V1, gồm COFFEE-DEMO-001 và STEP08-DEMO-001         | Giữ bằng chứng này theo đúng phiên bản; bổ sung triển khai V2 và phân biệt các đợt chạy                                                                                            |
| `group-report-inputs.md` và một số phần của `PROGRESS.md` nói chưa có source tối ưu/dữ liệu gas | Nhận định đó thuộc thời điểm cũ. Hiện đã có `SupplyChain_ver2.sol`, test V2, log V1/V2 và báo cáo so sánh DOCX                                                                     |
| `CONTRACT_INTERFACE_ver2.md` nói Quốc còn phải đổi module/export và chưa xác nhận deploy V2     | Source hiện tại đã chọn `SupplyChainV2Module`/`SupplyChainV2`; export đã tham chiếu artifact V2; snapshot có deploy V2 ở block 17. Không lặp trạng thái bàn giao cũ như hiện trạng |
| `docs/deployments/ganache-summary.json` ghi contract V1 ở block 1                               | Đây là snapshot V1, không phải bằng chứng deploy V2; đối chiếu receipt V2 riêng                                                                                                    |
| Report cũ mô tả `deployment.local.json` chỉ có ba trường                                        | Script export hiện ghi thêm `contractName: "SupplyChainV2"`; đọc code/config trước khi mô tả                                                                                       |
| Log kiểm thử cũ ghi 27 contract tests và 25 frontend tests ở bước 08                            | Chỉ gắn các số này với lần chạy được lưu. Đã có test V2 và test trang gas; chưa được suy ra số test hiện tại hoặc V2 pass từ kết quả V1                                            |
| Có ảnh QR/camera V1 và ảnh `scan_V2.png`                                                        | Nghiệm thu webcam V1 có ghi nhận riêng. Ảnh QR-ready V2 không đủ chứng minh quét webcam V2 thành công                                                                              |
| Frontend có trang/logic so sánh gas và dữ liệu snapshot                                         | Có thể trình bày như phần bổ sung giao diện của Quốc; phải phân biệt dashboard snapshot với dữ liệu blockchain trực tiếp                                                           |

Thứ tự đối chiếu: **đề bài xác định yêu cầu; source xác định cách cài đặt; receipt/log/ảnh xác định điều đã được kiểm chứng; report và nhật ký là phần tổng hợp cần cập nhật**. Một file mới hơn không tự chứng minh mọi phát biểu trong file đó đúng. Nếu source và bằng chứng thuộc hai thời điểm, mô tả riêng từng thời điểm.

## 3. Phần của Quốc nên có nội dung nào

### 3.1. Mục tiêu và kiến trúc tích hợp

- Giới thiệu ngắn bài toán truy xuất nguồn gốc và phạm vi Ganache local; năm vai trò Admin, Producer, Distributor, Retailer, Customer.
- Nêu frontend HTML/CSS/JavaScript, Vite, ethers v6, MetaMask và thư viện QR theo phiên bản thực tế trong package/lockfile.
- Giải thích frontend giao tiếp trực tiếp với RPC/contract, không cần application backend.
- Có một sơ đồ kiến trúc nhỏ: frontend → JsonRpcProvider → RPC → contract cho đọc; frontend → BrowserProvider/Signer → MetaMask → RPC → contract cho ghi; Hardhat/export cung cấp ABI/config.
- Phân biệt quyền on-chain với tên tài khoản trong MetaMask và điều kiện hiển thị nút trên UI.

### 3.2. Triển khai hợp đồng và đồng bộ frontend

- Trình bày Hardhat Ignition, module/contract được chọn, Ganache RPC, Chain ID và profile biên dịch; phân biệt Chain ID với Network ID.
- Mô tả deployer nhận Admin, không tự nhận Producer; chuẩn bị năm ví demo.
- Giải thích script export đọc artifact/journal, xác minh bytecode, receipt và Admin trước khi xuất ABI/cấu hình.
- Nêu file cấu hình local, file example, cách frontend xử lý thiếu/sai cấu hình và việc phải xuất lại khi đổi deployment.
- Trình bày V1/V2 là hai contract khác nhau; vai trò, sản phẩm và lịch sử không tự chuyển sang V2. Tên file ABI `SupplyChain.json` không đủ xác định nó chứa ABI V1 hay V2.
- Chỉ đưa vài lệnh chính khi cần chứng minh khả năng tái lập; hướng dẫn cài đặt đầy đủ dẫn sang README.

### 3.3. Giao diện và luồng nghiệp vụ

- Giới thiệu các vùng thực tế của giao diện: trạng thái mạng/ví, lookup, operations, access control, QR/camera; bổ sung trang so sánh gas nếu thuộc bản bàn giao cuối.
- Mô tả Admin cấp bốn vai trò; Producer tạo sản phẩm; ba lần bàn giao kết thúc ở Delivered.
- Có bảng ngắn gồm người thao tác, thao tác, điều kiện và kết quả: holder/stage/số mốc lịch sử.
- Giải thích UI hiển thị hash, trạng thái, block/gas theo dữ liệu hiện có; chỉ báo thành công sau receipt hợp lệ.
- Nêu khóa thao tác khi pending, kiểm tra holder/role/stage và `staticCall` trước ký. Contract vẫn là nơi thực thi quyền cuối cùng.
- Dữ liệu sản phẩm giữ nguyên chữ hoa/thường; frontend trim mã thống nhất, truyền chuỗi mã gốc vào hàm contract; không truyền hash thay ID.

### 3.4. Kết nối MetaMask và xử lý lỗi

- Đọc công khai bằng JsonRpcProvider; ghi bằng BrowserProvider và Signer. Tra cứu không cần kết nối ví nhưng vẫn cần RPC truy cập được.
- Đổi tài khoản/mạng phải vô hiệu writer cũ, đọc lại quyền và tạo kết nối phù hợp; tránh response bất đồng bộ cũ ghi đè trạng thái mới.
- Nêu các lỗi có nguồn chứng minh: từ chối ký, thiếu quyền, sai người nhận, mã trùng, sai mạng, RPC mất kết nối, thiếu ETH local và custom error V2.
- Phân biệt UI khóa nút, preflight/eth_call bị từ chối, người dùng từ chối ký và transaction đã mined nhưng revert.

### 3.5. Tra cứu lịch sử và QR

- `getProduct` và `getHistory`, đọc cùng block nếu source vẫn thực hiện; hiển thị metadata, holder, stage và timeline.
- Mã không tồn tại: `exists=false`, lịch sử rỗng; UI xóa kết quả cũ khi đổi mã hoặc lỗi.
- Timeline giữ thứ tự mảng, có mốc khởi tạo từ địa chỉ zero; timestamp blockchain tính bằng giây, chuyển sang giờ hiển thị có ghi múi giờ.
- QR chứa mã sản phẩm, không chứa quyền sở hữu hoặc bằng chứng hàng thật. Sau giải mã, dùng mã đó để tra cứu.
- Giải thích tạo/tải PNG, quét webcam và đọc file ảnh; quyền camera, chống callback lặp và giải phóng camera sau decode/stop/rời trang.
- Nêu giới hạn demo localhost trên điện thoại; QR giống URL/HTML vẫn được xử lý như chuỗi ID, dữ liệu hiển thị an toàn.

### 3.6. Kết quả kiểm chứng và giới hạn

- Có bảng nghiệm thu ngắn: chức năng, phương pháp, kết quả, phiên bản và nguồn bằng chứng.
- Chọn một luồng nhất quán để kể toàn bộ quá trình; nếu dùng V2, đối chiếu sản phẩm `COFFEE v2-1`, block 22–25 và contract V2 trong receipt.
- Tách contract unit tests, frontend service tests, browser giả lập, giao dịch thật qua MetaMask và camera vật lý.
- Với V1, disconnect/reconnect và wrong-network/return thực tế từng được miễn, chưa chạy; không biến kết quả giả lập thành manual pass. Không suy rộng trạng thái này sang V2 khi chưa có nguồn.
- Hạn chế: Ganache local, dữ liệu on-chain công khai, Admin được tin cậy, chuyển giao tức thời chưa cần người nhận xác nhận, QR có thể sao chép, blockchain không kiểm chứng hàng thật; phạm vi frontend không có backend/public hosting hay API liệt kê toàn bộ sản phẩm.
- Kết thúc bằng đóng góp cụ thể của Quốc và những phần phối hợp nhóm còn cần xác minh.

## 4. Bản đồ file và thư mục AI cần đọc

Các đường dẫn dưới đây tính từ thư mục gốc repository, trừ tài liệu đề bài ở thư mục cha. Đọc theo thứ tự, không chỉ đọc file nháp report.

### Nhóm A — Yêu cầu, phân công và nội dung đã soạn

| File/folder                                                               | Mục đích                                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `../DS441A_Blockchain_Team5.md`                                           | Yêu cầu nộp, phân công, mục báo cáo, demo; phần hướng dẫn dự kiến không thay thế code thực tế |
| `docs/report-quoc.md`                                                     | Bản nháp chính để biên tập và bổ sung                                                         |
| `docs/group-report-outline.md`, `docs/group-report-inputs.md`             | Vị trí ghép phần Quốc và các đầu vào nhóm; rà lại ghi chú lỗi thời                            |
| `docs/quoc-implementation/00-START-HERE.md`, `PROGRESS.md`                | Phạm vi và lịch sử thực hiện, không mặc định là hiện trạng cuối                               |
| `docs/quoc-implementation/01-environment.md` đến `10-clean-clone-demo.md` | Mục tiêu/tiêu chí từng bước; ưu tiên 03, 06, 07, 08, 09, 10 khi viết report                   |
| `README.md`, `frontend/README.md`, `frontend/src/config/README.md`        | Hướng dẫn tái lập và cấu hình; đối chiếu lại source                                           |

### Nhóm B — Code triển khai, frontend và interface

| File/folder                                                                                                | Nội dung cần rút ra                                                                                             |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `hardhat.config.ts`, `package.json`, `package-lock.json`                                                   | Network, compiler/profile, script, phiên bản root                                                               |
| `ignition/modules/SupplyChain.ts`, `scripts/export-frontend.mjs`                                           | Deploy V2, định danh module, kiểm tra và xuất ABI/config                                                        |
| `frontend/package.json`, `frontend/package-lock.json`, `frontend/index.html`                               | Stack/phiên bản frontend và entry point                                                                         |
| `frontend/src/main.js`, `style.css`, `wallet-ui.js`, `lookup-ui.js`                                        | Các vùng UI, cách thao tác và phản hồi                                                                          |
| `frontend/src/services/blockchain.js`, `wallet.js`, `products.js`, `camera.js`                             | Đọc/ghi, mạng/ví, nghiệp vụ, timeline, QR và camera                                                             |
| `frontend/src/config/`, `frontend/src/abi/SupplyChain.json`                                                | Schema cấu hình, kiểm tra, ABI V2 và custom errors; config local có thể không tồn tại ở bản clone               |
| `frontend/src/gas-comparison.js`, `gas-comparison-ui.js`, `gas-comparison.css`, `data/gas-comparison.json` | Phần hiển thị so sánh gas, cách tính và giới hạn snapshot                                                       |
| `frontend/tests/`                                                                                          | Hành vi được test; test có tồn tại không đồng nghĩa đã chạy thành công                                          |
| `contracts/SupplyChain.sol`, `contracts/SupplyChain_ver2.sol`                                              | Đối chiếu V1/V2, quyền, stage, API và lỗi; chỉ lấy đủ để mô tả tích hợp chính xác                               |
| `docs/CONTRACT_INTERFACE.md`, `docs/CONTRACT_INTERFACE_ver2.md`                                            | Hợp đồng giao tiếp, struct/event/error và yêu cầu chuyển phiên bản; đối chiếu code để bỏ trạng thái bàn giao cũ |
| `test/SupplyChain.test.ts`, `test/SupplyChain_ver2.test.ts`                                                | Phạm vi test contract V1/V2 và điều kiện revert                                                                 |

### Nhóm C — Bằng chứng triển khai và nghiệm thu

| File/folder                                                                                              | Cách sử dụng                                                                        |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `docs/verification/environment.md`, `ganache.md`, `deployment.md`, `redeploy-new-workspace.md`           | Môi trường và lịch sử deployment V1/workspace                                       |
| `docs/deployments/`                                                                                      | Snapshot deploy công khai; gắn đúng workspace/version                               |
| `docs/metamask-setup.md`, `wallet-acceptance.md`, `lookup-qr-acceptance.md`, `integration-manual.md`     | Quy trình kiểm tra và các cập nhật nghiệm thu                                       |
| `docs/verification/wallet-transactions.md`, `lookup-qr.md`, `integration.md`                             | Tổng hợp kết quả và phân loại tự động/thủ công; đọc cả cập nhật cuối                |
| `docs/verification/integration-checks.json`, `integration-browser.json`, `integration-chain-replay.json` | Lệnh/exit code, browser cases, receipt/event/history của V1                         |
| `docs/verification/wallet-*-receipts.json`, `wallet-demo-state.json`, `lookup-browser.json`              | Đối chiếu receipt, trạng thái và QR ở các mốc trước                                 |
| `docs/verification/metamask-screenshots/`, `lookup-screenshots/`, `integration-screenshots/`             | Ảnh gốc và manifest; mở ảnh được chọn, kiểm tra caption/hash/block/phiên bản        |
| `docs/reports/step-06-metamask-acceptance.docx`, `step-08-integration-acceptance.docx`                   | Hồ sơ nghiệm thu chi tiết để trích nội dung/ảnh, không thay báo cáo chính 4–6 trang |
| `docs/verification/step06-report-quality.json`, `step08-report-quality.json`, `readme-report.json`       | QA của tài liệu trước đây; không chứng minh report mới đã được QA                   |
| `docs/test_report.md`, `test_results.txt`, `verification/contract-tests.txt`                             | Kết quả contract V1 đã lưu; ghi đúng nguồn, ngày và phạm vi                         |

### Nhóm D — Tư liệu V2 và gas đã bổ sung

| File/folder                                           | Cách sử dụng                                                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `docs/reports/comparision_gas_v1_v2.docx`             | So sánh chi tiết ba phần; dùng để cập nhật nhận định cũ “chưa có gas”                                            |
| `docs/transaction log/transaction_v1/ganache log v1/` | Đọc README, summary và transactions trước; raw blocks/receipts để truy nguyên số liệu V1                         |
| `docs/transaction log/transaction_v2/`                | Tương tự cho V2; snapshot block 17–25, chín giao dịch thành công                                                 |
| `docs/transaction log/transaction_v2/img/`            | Bằng chứng UI V2: cấp quyền, tạo, ba bàn giao, tra cứu và QR-ready                                               |
| `frontend/src/data/gas-comparison.json`               | Dữ liệu trình bày đã tổng hợp; đối chiếu số chính xác với receipt/summary, không lấy số tiền float làm nguồn gốc |

Không phải đọc `node_modules/`, `dist/`, cache hay toàn bộ generated artifacts để viết report. Artifact/journal chỉ cần khi xác minh provenance của deployment/profile. `docs/local-demo.local.md` là snapshot máy cá nhân, không phải cấu hình bắt buộc cho người khác; không cần sao chép toàn bộ vào báo cáo.

## 5. Các kiểm tra đặc biệt trước khi kết luận

1. **Xác định phiên bản cuối.** Code module/export đang chọn V2; bằng chứng nghiệm thu chi tiết cũ chủ yếu là V1. Ghi rõ ma trận V1/V2 thay vì ghép tất cả thành một lần chạy. Chưa có bằng chứng nào thì đánh dấu chưa xác minh.
2. **Bảo mật và nghiệp vụ đúng code.** Admin không tự có Producer; người giữ bị revoke vai trò không được bàn giao cho đến khi cấp lại; Delivered là cuối. Không chép nhận định trái ngược trong hướng dẫn đề bài cũ.
3. **Gas đã có nhưng cần diễn giải đúng.** V1 snapshot có 16 giao dịch, V2 có 9. Muốn so workload, dùng chín thao tác tương ứng, không lấy tổng 16 so với 9 để kết luận hiệu suất.
4. **Tách gas used và phí ETH.** Deployment trong hai snapshot có gas price khác nhau. Không gán toàn bộ giảm phí cho tối ưu code; tính bằng số nguyên Wei rồi đổi sang ETH.
5. **Không kết luận sai từ 48 gas.** Tài liệu so sánh chỉ ra chênh lệch 48 gas ở mỗi thao tác sản phẩm khớp chênh lệch calldata do mã sản phẩm khác độ dài. Nó không tự chứng minh execution gas giảm. Phần giải thích tối ưu custom error cần nối với source, cấu hình và kết quả kiểm thử tương ứng của Huyền.
6. **Tránh làm tròn sai nguồn tiền.** Một số chuỗi tổng phí trong JSON frontend có thể lệch 1 Wei so với `summary.json`/DOCX. Khi ghi số chính xác, tính lại từ receipt bằng số nguyên; ưu tiên dữ liệu gốc.
7. **Ảnh không thay thế điều chưa xảy ra.** `scan_V2.png` là QR-ready/camera off; không dùng caption “quét webcam V2 thành công”. Không chuyển kết quả V1 sang V2 nếu không có bằng chứng.
8. **Kiểm tra đường dẫn tham chiếu.** Interface V2 dẫn `gas/gas_report.md`, nhưng thư mục `gas/` không có trong checkout đã rà. Dùng nguồn gas hiện tồn tại và nêu rõ phần cần bổ sung; không viết link đến file giả định.
9. **Chỉ ghi việc đã kiểm chứng.** Test cũ là kết quả cũ; đọc source không phải chạy test mới. Clone sạch, tập demo, video và report nhóm cuối không tự được đánh dấu xong từ một checklist hoặc prompt.

## 6. Danh sách công việc giao AI khi viết report

- [ ] Đọc đề bài và nhóm nguồn A; xác định phần Quốc, phần Huyền và giới hạn 4–6 trang của nhóm.
- [ ] Đọc nhóm B, lập bảng phiên bản/môi trường: contract, deployment, ABI/config, profile, đợt nghiệm thu.
- [ ] Đọc nhóm C/D; lập bảng nội bộ mỗi khẳng định chính → file/ảnh/receipt → phiên bản → mức kiểm chứng.
- [ ] Liệt kê mâu thuẫn nguồn và cách xử lý, đặc biệt tình trạng V2, gas, số test và QR.
- [ ] Biên tập phần Quốc theo mục 3, viết bằng tiếng Việt học thuật rõ ràng, giữ tên API và thuật ngữ kỹ thuật cần thiết. Không kể lại toàn bộ lịch sử AI thao tác.
- [ ] Tạo một sơ đồ kiến trúc đọc/ghi và một bảng luồng nghiệp vụ; có thể dùng Mermaid trong Markdown. Sơ đồ contract chi tiết do Huyền cung cấp/đối chiếu.
- [ ] Chọn 2–3 ảnh đại diện có chữ đọc được: giao dịch, timeline, QR hoặc lỗi. Đưa bộ ảnh đầy đủ vào tư liệu hỗ trợ; caption nêu ID/version và nguồn.
- [ ] Viết bảng kết quả tích hợp, tách manual/simulated/not run. Gắn số test với đúng log.
- [ ] Nếu có trình bày trang gas của Quốc, mô tả nó là giao diện dữ liệu snapshot; dùng số liệu đã đối chiếu và giữ giới hạn ở mục 5.
- [ ] Viết hạn chế và kết luận đóng góp của Quốc; ghi cụ thể đầu vào nhóm còn thiếu sau khi đã kiểm kê nguồn mới.
- [ ] Soạn phần rút gọn để ghép nhóm, khoảng 1–1,5 trang cho frontend/tích hợp và các đoạn deploy/kiến trúc phân bổ ở phần thiết kế. Đây là gợi ý dung lượng, không phải quy định đề bài.
- [ ] Kiểm tra link, thuật ngữ, bảng/ảnh, số liệu và tính nhất quán V1/V2. Không tự sửa source hoặc gửi transaction để làm lời văn khớp hiện trạng mong muốn.

### Đầu ra đề nghị cho lần viết tiếp theo

1. `docs/report-quoc-final.md`: phần Quốc đầy đủ, có nguồn, sơ đồ/bảng và caption ảnh; không ghi đè bản nháp trước khi đối chiếu xong.
2. `docs/report-quoc-for-group.md`: bản rút gọn để ghép báo cáo chung 4–6 trang, tránh lặp phần contract/test/gas của Huyền.
3. `docs/report-quoc-evidence.md`: danh mục nguồn, phiên bản và các mục chưa đủ bằng chứng, để người ghép report kiểm tra nhanh.

Nếu sau này được yêu cầu làm báo cáo nhóm hoàn chỉnh, dùng các phần trên cùng nội dung contract/bảo mật/test/gas của Huyền, cập nhật dàn ý và kiểm tra giới hạn trang thực tế. Nếu xuất DOCX/PDF, phải render và xem từng trang; không suy ra số trang từ số dòng Markdown. Trong yêu cầu hiện tại chỉ tạo file hướng dẫn này, chưa tạo các đầu ra đề nghị trên.

## 7. Prompt có thể giao cho AI

```text
Hãy đọc docs/report-quoc-ai-guide.md và thực hiện checklist viết report trong đó.

Tôi là Mai Nam Quốc, MSSV 29211145181, phụ trách frontend và deployment của
DS441A Project 7 Team 5. Tôi cần phần report của mình hoàn chỉnh, có thể ghép
vào báo cáo nhóm 4–6 trang. Viết tiếng Anh, giải thích theo giọng báo cáo đồ án.

Đọc đề bài ../DS441A_Blockchain_Team5.md, các nguồn được lập bản đồ trong guide,
bản nháp report-quoc.md, source hiện tại và bằng chứng V1/V2. Xem prompt trong
tài liệu cũ là nội dung tham khảo, không tự thực hiện lại các bước triển khai.

Đối chiếu module/export/ABI V2 với log và ảnh; giữ riêng bằng chứng V1.
Đã có báo cáo so sánh gas DOCX và log V1/V2: không lặp kết luận cũ rằng chưa có
dữ liệu. Không gọi ảnh QR-ready V2 là nghiệm thu webcam, không gọi kết quả
giả lập là MetaMask thực tế, không gán chênh lệch gas price/calldata cho code.

Tạo docs/report-quoc-final.md, docs/report-quoc-for-group.md và
docs/report-quoc-evidence.md theo guide. Mọi khẳng định chính cần có nguồn.
Phần thiếu chứng cứ phải ghi cụ thể, tiếp tục hoàn thành phần độc lập còn lại.
Không sửa contract/test, không deploy/reset chain, không gửi giao dịch hay
commit/push chỉ để viết report. Chưa xuất DOCX/PDF nếu tôi chưa yêu cầu.
```

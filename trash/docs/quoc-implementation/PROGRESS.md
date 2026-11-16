# Tiến độ triển khai phần Quốc

## Bước 01 — Hoàn thành

Ngày kiểm tra: 15/11/2026 (Asia/Saigon).

- Workspace: `C:\Users\Quoc\Desktop\DTU\Blockchain\Huyen-git\supply-chain-product-tracking`.
- Nhánh: `quoc`. Ban đầu chỉ có `docs/quoc-implementation/` chưa được Git theo dõi. Không chuyển nhánh, pull, merge, commit hoặc push.
- Đã đọc hướng dẫn, contract, test, interface, cấu hình Hardhat/TypeScript và thông tin dependency trong lockfile.
- Node `26.3.0`, npm `11.16.0`, Git `2.54.0.windows.1`.
- Ban đầu chưa có `node_modules`; đã chạy `npm.cmd ci` theo lockfile, exit code `0`, cài 191 package. Không sửa package.json hoặc package-lock.json.
- Hardhat `3.21.2` kiểm tra Node tối thiểu `22.13.0` trong source đã cài; Node hiện tại đáp ứng. Mocha yêu cầu `^20.19.0 || >=22.12.0`, EDR yêu cầu `>=22`; không có lỗi phiên bản runtime khi chạy.

| Lệnh | Kết quả mới | Exit code |
| --- | --- | --- |
| `npx.cmd hardhat compile` | Compile 1 file Solidity bằng solc 0.8.34, target Paris | 0 |
| `npx.cmd tsc --noEmit` | Không có lỗi TypeScript | 0 |
| `npx.cmd hardhat test mocha test/SupplyChain.test.ts` | 27 passing, 0 failing, trên mạng Hardhat mô phỏng | 0 |

### File thay đổi và bằng chứng

- `.gitignore`: bỏ qua `frontend/node_modules/`, `frontend/dist/`, `frontend/src/config/deployment.local.json` và `ignition/deployments/`.
- `docs/verification/environment.md`: stdout/stderr, exit code của cài dependency và các lệnh kiểm tra; ghi nhận môi trường và giới hạn xác minh.
- `docs/verification/contract-tests.txt`: stdout/stderr và exit code của lần chạy test mới.
- `docs/quoc-implementation/PROGRESS.md`: tiến độ hiện tại.
- Đã kiểm tra quy tắc ignore bằng `git check-ignore`; `deployment.example.json` vẫn có thể được Git theo dõi.
- Không sửa contract/test, cấu hình Hardhat/TypeScript, lockfile hoặc `docs/test_results.txt` cũ. Artifact/cache/type sinh ra được ignore.

### Ghi nhận và phần chưa xác nhận

- npm báo 16 lỗ hổng (3 moderate, 13 high), cùng cảnh báo deprecated và install script của esbuild chưa được phê duyệt. Chưa chạy audit fix hoặc thay dependency. Các kiểm tra yêu cầu của bước 01 vẫn thành công; chưa kiểm tra build frontend vì ngoài phạm vi.
- Đã thấy Chrome tại đường dẫn cài đặt thông thường. Chưa xác nhận MetaMask; không đọc dữ liệu ví.
- Chưa thấy Ganache ở hai đường dẫn thông thường đã kiểm tra hoặc trong danh sách uninstall của Windows. Điều này chưa đủ kết luận máy không có bản cài ở vị trí khác. Không cần Ganache cho các test mô phỏng đã chạy.
- Không có thư mục `ignition/deployments/` ở thời điểm kiểm tra; không xóa journal. Quy ước: giữ journal cục bộ bị ignore; ở bước 03 lưu bản tóm tắt công khai riêng dưới `docs/deployments/` (địa chỉ contract/admin, RPC local, Chain ID, compiler, transaction hash), không sao chép journal hoặc khóa bí mật. Chưa tạo dữ liệu deploy.

### Hành động tiếp theo

Bước 01 đã đạt tiêu chí compile/typecheck/test và lưu bằng chứng. Không có thao tác thủ công đang chặn bước này. Dừng theo phạm vi yêu cầu; chưa thực hiện bước 02 hoặc các bước sau, chưa khởi tạo frontend, chưa deploy. Khi được giao bước 02 mới xác nhận/cài/mở Ganache nếu cần.

## Bước 02 — Hoàn thành

Ngày kiểm tra: 15/11/2026 (Asia/Saigon), sau khi được yêu cầu tiếp tục bước 02.

- Xác nhận bước 01 đã đạt trước khi kiểm tra.
- Ganache Desktop đang chạy từ bản cài WindowsApps `GanacheUI_2.7.1.0`; ghi nhận này bổ sung cho kiểm tra đường dẫn thông thường ở bước 01.
- RPC thực tế: `http://127.0.0.1:7545`, trùng cấu hình hiện tại; không sửa `hardhat.config.ts`.
- `web3_clientVersion`: `Ganache/v7.7.3/EthereumJS TestRPC/v7.7.3/ethereum-js`.
- Chain ID thực tế: `0x539` (hex), `1337` (thập phân). Network ID riêng từ `net_version`: `5777`.
- Block hiện tại: `0x0` / `0`. `eth_accounts` trả 10 địa chỉ.
- Kiểm tra định dạng địa chỉ bằng ethers và gọi `eth_getBalance` cho 5 tài khoản đầu: mỗi tài khoản có `100 ETH` thử nghiệm (`100000000000000000000 wei`).
- Đã chọn bảng dự kiến Admin/deployer, Producer, Distributor, Retailer, Customer; chưa cấp quyền on-chain. Admin phải được xác nhận lại theo deployer thực tế ở bước 03.
- Các request JSON-RPC có timeout 5000 ms; HTTP 200, phản hồi hợp lệ, không có RPC error. Script kiểm tra/lưu kết quả exit code `0`.

### File thay đổi và bằng chứng

- `.gitignore`: thêm `/docs/local-demo.local.md` để giữ thông tin môi trường cục bộ ngoài Git.
- `docs/local-demo.local.md`: RPC, client, Chain ID, Network ID, địa chỉ công khai và số dư của 5 tài khoản dự kiến (được ignore).
- `docs/verification/ganache.md`: phép kiểm tra, phản hồi RPC và giới hạn áp dụng; địa chỉ được lược bỏ khỏi bản verification.
- `docs/quoc-implementation/PROGRESS.md`: cập nhật kết quả bước 02.

### Phạm vi và hành động tiếp theo

Không còn phần bắt buộc chưa xác nhận của bước 02. Không đọc/lưu private key hoặc seed phrase, không gửi giao dịch, không reset workspace. Chưa deploy, cấp quyền, tạo sản phẩm hoặc thực hiện bước 03.

Bạn cần giữ Ganache chạy với workspace hiện tại; nếu reset/đổi workspace, phải báo và lấy lại dữ liệu môi trường. Khi được yêu cầu, bước tiếp theo là bước 03 — deploy và export.

## Bước 03 — Hoàn thành

Ngày thực hiện: 15/11/2026 (Asia/Saigon), sau khi được yêu cầu tiếp tục.

- Ganache vẫn phản hồi ở `http://127.0.0.1:7545`, Chain ID `1337`; journal chưa tồn tại trước lần deploy này. Không reset hoặc xóa journal.
- Đã đọc help và source task Ignition của bản đang cài: deploy mặc định dùng profile production. Đã truyền rõ `--build-profile default` để giữ baseline bước 01: solc `0.8.34`, EVM Paris, optimizer tắt. Không thay cấu hình compiler/profile.
- Compile và deploy đều exit code `0`.
- Contract thực tế: `0x8B52d5D247fa21Af5D471FcD73991fF6Aaf56fda`.
- Deployer/Admin thực tế: `0x4BAe880df29E1d5A76Fa973be01FbcB363671E83`, đúng tài khoản dự kiến.
- Transaction: `0xa0e691329467367a6e60a959ddc768db7adbae25602b1c9ce894e9642bfc2775`, block `1`, gas used `2502495`.
- Bytecode on-chain có `11249` byte và khớp chính xác deployedBytecode trong artifact Ignition/current artifact. Receipt khớp hash/block/deployer/contract và status thành công.
- `DEFAULT_ADMIN_ROLE()` trả bytes32 zero; `hasRole(role, deployer)` trả true. Chưa cấp vai trò nghiệp vụ.

### File thay đổi và bằng chứng

- `package.json`: thêm `deploy:local` (truyền rõ profile default) và `export:frontend`. Không thêm dependency hoặc đổi lockfile.
- `scripts/export-frontend.mjs`: đọc cấu hình Hardhat, xác nhận RPC local Ganache, Chain ID, artifact, deployment address/journal, receipt, bytecode và quyền Admin trước khi xuất. RPC timeout 5 giây. Lỗi thoát code 1 và cảnh báo config cũ chưa được xác minh.
- `frontend/src/abi/SupplyChain.json`: chỉ mảng ABI, 23 entry, khớp artifact.
- `frontend/src/config/deployment.local.json`: contractAddress/rpcUrl/chainId dạng chuỗi lấy từ dữ liệu thật, được ignore.
- `frontend/src/config/deployment.example.json`: mẫu rỗng, không có địa chỉ giả.
- `frontend/src/config/README.md`: cách chạy lại, profile đo gas và thiết kế nạp config tùy chọn qua import.meta.glob ở bước 05 để clone sạch vẫn build được. Chưa scaffold Vite.
- `docs/deployments/ganache-summary.json`: bản tóm tắt công khai cho workspace này, có thể commit, không dùng làm config chung cho mọi máy.
- `docs/local-demo.local.md`: bổ sung kết quả deploy/Admin thực tế; số dư bảng vẫn ghi rõ là snapshot trước deploy.
- `docs/verification/deployment.md`: stdout/stderr, exit code của compile/deploy/export và kiểm tra bổ sung.
- `.gitignore` đã có đầy đủ quy tắc từ bước 01–02; xác nhận journal và config local vẫn bị ignore, không cần thêm quy tắc.

### Kiểm tra

- Export nhiều lần thành công, exit code `0`; hai lần liên tiếp có ABI/config giống từng byte, không gửi giao dịch.
- Thử JSON artifact hỏng, artifact sai contract, bytecode artifact khác deployment: đều bị từ chối, exit code `1`, thông báo rõ và không thay file đầu ra. Artifact được khôi phục nguyên byte; export sau khôi phục thành công.
- `node --check scripts/export-frontend.mjs`, `npx.cmd tsc --noEmit`, `git diff --check`: exit code `0`.
- Contract/test, module Ignition, cấu hình Hardhat/TypeScript, lockfile và log test cũ không bị sửa.
- Chưa chạy build frontend/clone sạch vì Vite sẽ được triển khai ở bước 05; đã ghi thiết kế và yêu cầu xác minh tại thời điểm đó.

### Lệnh tái lập và hành động tiếp theo

```powershell
npx.cmd hardhat compile --build-profile default
npm.cmd run deploy:local
npm.cmd run export:frontend
```

Nếu chỉ cần tái tạo ABI/config từ deployment hiện tại: `npm.cmd run export:frontend`.
Giữ Ganache chạy và không reset workspace. Nếu source/profile/workspace đổi, kiểm tra journal trước khi deploy lại; không tự dùng `--reset`.

Bước 03 đạt tiêu chí. Chưa thực hiện bước 04 (MetaMask), chưa cấp quyền hoặc tạo sản phẩm. Bước tiếp theo khi được giao là cấu hình MetaMask; các thao tác ví cần người dùng thực hiện.

## Bước 04 — Hoàn thành theo xác nhận thủ công (16/11/2026)

- Đã được yêu cầu tiếp tục sau bước 03. Đã đọc hướng dẫn bước 04 và bảng môi trường local.
- Chạy lại `npm.cmd run export:frontend`: exit code `0`; RPC vẫn là Ganache,
  Chain ID `1337`, bytecode khớp, receipt/deployer/Admin hợp lệ.
- Đã gọi đọc lại tài khoản/số dư: Admin có `99.995307821875 ETH` sau deploy;
  4 tài khoản nghiệp vụ dự kiến vẫn có `100 ETH` mỗi ví. Block hiện tại `1`.
- `docs/verification/metamask.md`: ghi phép kiểm tra RPC/on-chain trước hướng dẫn ví,
  thời điểm UTC `2026-11-15T16:59:56.097Z` (23:59:56 ngày 15/11 tại Asia/Saigon).
- `docs/metamask-setup.md`: hướng dẫn tái lập và nguồn MetaMask chính thức;
  dữ liệu máy này được phân biệt với cấu hình dùng trên máy khác.
- Chưa xác nhận MetaMask đã cài, chọn đúng mạng hoặc import đúng 5 tài khoản;
  chưa đánh dấu bước 04 hoàn thành. Người dùng tự nhập bí mật và xác nhận địa chỉ/số dư.
- Không cấp quyền, gửi giao dịch hoặc thực hiện bước 05. Sau phản hồi người dùng,
  kiểm tra lại RPC/on-chain và ghi riêng xác nhận MetaMask thủ công; nghiệm thu
  website nhận tài khoản sẽ ở bước 06.

### Cập nhật 16/11/2026 — Sau khi người dùng import 5 ví

- Người dùng xác nhận đã thêm đủ 5 ví. Ảnh MetaMask cho thấy các tên Admin,
  Producer, Distributor, Retailer, Customer; tiền tố/hậu tố địa chỉ khớp 5 tài khoản
  Ganache mới. Ảnh chưa cho thấy mạng đang chọn hoặc số dư trong MetaMask.
- Đã kiểm tra RPC thực tế lúc `2026-11-15T17:29:49.541Z`
  (00:29:49 ngày 16/11 tại Asia/Saigon): client vẫn Ganache, RPC/Chain ID/Network ID
  không đổi, nhưng block trở về `0` và cả 5 tài khoản khác lần deploy trước.
- Contract cũ `0x8B52d5D247fa21Af5D471FcD73991fF6Aaf56fda` trả bytecode `0x`;
  receipt deploy cũ không còn trên chain hiện tại. Kết quả bước 03 trước đây là
  snapshot của workspace cũ, không còn dùng được với workspace hiện tại.
- Bằng chứng mới: `docs/verification/metamask-workspace-change.json`.
  Bảng 5 ví mới được bổ sung ở đầu `docs/local-demo.local.md`; giữ bảng cũ để đối chiếu.
- Journal/config deployment cũ được giữ nguyên; không chạy deploy, reset hoặc xóa
  journal. Không sử dụng config cũ cho chain hiện tại. Cần xác nhận người dùng muốn
  giữ workspace mới hay quay lại workspace cũ trước khi xử lý deployment.
- Bước 04 chưa hoàn thành: cần giải quyết Admin/deployment của workspace đang dùng,
  đồng thời người dùng xác nhận MetaMask chọn Ganache Local (Chain ID 1337) và số dư.
  Chưa thực hiện bước 05. Không lưu nội dung bí mật xuất hiện trong ảnh vào file/log.

### Người dùng chọn giữ workspace mới — đang chờ RPC hoạt động

- Đã được xác nhận giữ workspace mới và tiếp tục xử lý deployment tương ứng.
- Kiểm tra ngay trước xử lý: `npm.cmd run export:frontend` thoát code `1`,
  `connect ECONNREFUSED 127.0.0.1:7545`. Request fetch độc lập, timeout 5 giây,
  cũng bị từ chối kết nối. Bằng chứng: `docs/verification/redeploy-new-workspace.md`.
- Chưa di chuyển journal, chưa deploy lại, chưa sửa config. Cấu hình deployment cũ
  vẫn không hợp lệ cho workspace mới.
- Thao tác đang chặn: người dùng mở Ganache, chọn đúng workspace có Admin
  `0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec`, giữ RPC ở `127.0.0.1:7545` chạy.
- Khi RPC hoạt động: xác minh lại tài khoản; chuyển journal cũ sang thư mục lưu trữ
  riêng trong ignition/deployments (giữ nguyên nội dung), deploy bằng profile default,
  rồi export và xác minh Admin/bytecode. Không reset Ganache hoặc xóa journal.

### Khôi phục thành công trên workspace NOISELESS-MAGIC — 16/11/2026

- Xác nhận Ganache UI vẫn mở nhưng Windows không có listener 7545; request tới
  127.0.0.1, localhost và ::1 đều bị ECONNREFUSED. Không kết luận người dùng đóng app.
- Dùng UI Settings → Server xác nhận host 127.0.0.1, port 7545. Bấm Restart
  không đổi cấu hình, không reset workspace. RPC đã phản hồi trở lại, cùng 5 địa chỉ mới.
- Journal cũ được chuyển nguyên thư mục sang
  `ignition/deployments/archive-chain-1337-workspace-before-20261116`;
  SHA256 journal trước/sau giống nhau:
  `49720EE456B756EC51A38F3995D34C045210020C9F6DA2FD9B1C8BBDA2E74D5E`.
- Compile, deploy:local và export:frontend đều exit code 0, profile default như trước.
- Contract mới: `0x843B273a8c67BcaB604f14fd466162CBdBb556B9`.
- Admin mới: `0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec`; đã xác minh quyền Admin.
- Transaction: `0x7e4212bb316487c9c436a3a65093a18f5ebdd1fb658de19dcedf3cf0ecf4de67`,
  block 1, gas used 2502495; bytecode 11249 byte, khớp artifact và receipt/journal mới.
- Export lại thành công và config giống từng byte. Đã cập nhật config local, bảng
  tài khoản local và summary công khai; summary workspace cũ được lưu riêng.
- Bằng chứng: `docs/verification/redeploy-new-workspace.md`.
- Phần deployment của bước 03 đã khôi phục cho workspace mới. Bước 04 vẫn chờ
  người dùng xác nhận MetaMask chọn Ganache Local/Chain ID 1337 và hiển thị số dư hợp lý.
  Người dùng đã xác nhận import đủ 5 ví; chưa nghiệm thu website ở bước 06.
- Không cấp vai trò, không tạo sản phẩm, chưa thực hiện bước 05.

### Xác nhận cuối bước 04

- Người dùng đã xác nhận import 5 ví; ảnh MetaMask Admin hiển thị địa chỉ
  `0x2FE82…a25ec` và `99.995 ETH`, khớp số dư RPC sau deploy mới.
- Tên mạng trên ảnh là Localhost 8545. Đã yêu cầu kiểm tra RPC thực tế 7545 và
  Chain ID 1337; người dùng trả lời “oke đúng rồi đó sang bước 5”. Ghi nhận đây là
  xác nhận thủ công thông số MetaMask, không phải xác minh tự động provider trong website.
- Bước 04 hoàn thành; việc website nhận tài khoản, đổi ví và ký giao dịch để bước 06.

## Bước 05 — Hoàn thành

Ngày thực hiện: 16/11/2026 (Asia/Saigon).

- Tạo frontend bằng file thủ công, không scaffold ghi đè ABI/config đã export.
- Dùng vanilla JavaScript, Vite `8.3.8`, ethers `6.17.0`, qrcode `1.5.4`,
  html5-qrcode `2.3.8`; có package-lock riêng và scripts dev/build/preview/test.
  Không thêm framework/backend, không đổi dependency của root repo.
- Giao diện tiếng Việt, responsive: điều hướng, luồng 4 giai đoạn, kiểm tra mạng/contract,
  khu vực ví/vai trò, cấp quyền, tạo sản phẩm, bàn giao, tra cứu/timeline và QR/camera.
- Các nút chưa tích hợp bị khóa và ghi rõ bước 06/07; form không gửi khi nhấn Enter.
  Không kết nối MetaMask, yêu cầu camera, gửi giao dịch hoặc tạo dữ liệu blockchain giả.
- Loader import.meta.glob tùy chọn dạng raw + parse/validate: thiếu file hoặc JSON sai
  không làm crash build/trang. Hiển thị hướng dẫn export ở trạng thái cấu hình không dùng được.
- Service chỉ gọi đọc web3_clientVersion, eth_chainId, eth_getCode, timeout 5 giây/request;
  phân biệt thiếu/sai config, RPC không kết nối, sai client/chain và contract không tồn tại.
  Không ghi config/bí mật vào localStorage.

### File và bằng chứng

- `frontend/package.json`, `frontend/package-lock.json`, `frontend/index.html`,
  `frontend/public/favicon.svg`, `frontend/README.md`.
- `frontend/src/main.js`, `frontend/src/style.css`, `frontend/src/services/blockchain.js`,
  `frontend/src/config/index.js`, `frontend/src/config/validate.js`, cập nhật config README.
- `frontend/tests/environment.test.js`: 6 kiểm tra cấu hình/RPC/lỗi/timeout.
- `docs/verification/frontend-foundation.md`: lệnh và stdout/stderr/exit code.
- `docs/verification/frontend-browser.json`: kết quả kiểm tra Chrome thật và các tình huống giả lập lỗi.
- Ảnh giao diện: `frontend-desktop.png`, `frontend-mobile.png`,
  `frontend-missing-config.png`, `frontend-invalid-config.png` trong `docs/verification/`.
- `docs/metamask-setup.md` và PROGRESS cập nhật xác nhận cuối bước 04.

### Kết quả kiểm tra

- Frontend install thành công, npm audit 0 vulnerabilities tại thời điểm cài.
- Đã kiểm tra lại cài đặt từ lockfile bằng `npm.cmd ci`: lần đầu EPERM do dev
  server khóa native binding Rolldown trên Windows; dừng server rồi chạy lại thành
  công, exit code 0. Sau ci, cả 6 test, build và typecheck root đều pass.
- `npm.cmd test`: 6 pass, 0 fail. `npm.cmd run build`: exit code 0.
- Production build thật khi không có file local và khi JSON local hỏng: đều exit code 0;
  mở bằng Chrome headless đều có hướng dẫn export, không có uncaught page error.
- Chrome desktop 1440×1100 và mobile 390×844 đã chụp và xem ảnh; mobile không tràn ngang.
  Đường chạy RPC thật không có console error hoặc page error, nhận đúng Ganache/Chain ID/bytecode.
- Kiểm tra trình duyệt khi RPC offline, sai chain, contract rỗng: thông báo riêng đúng.
  Các phản hồi giả lập chỉ dùng trong kiểm tra, không nằm trong dữ liệu giao diện sản phẩm.
- ABI và config local được giữ nguyên từng byte sau thử nghiệm; journal/contract/test không đổi.
- Công cụ Playwright chỉ cài ở thư mục temp để kiểm tra, không thêm vào dependency dự án.
  Chrome trong LocalAppData không khởi chạy được bằng Playwright; dùng bản Program Files thành công.

### Chạy và phạm vi tiếp theo

Dev server local: `http://127.0.0.1:5173/`. Từ `frontend/`, dùng `npm.cmd ci`,
`npm.cmd run dev`; build bằng `npm.cmd run build`, preview bằng `npm.cmd run preview`.
Giữ Ganache chạy để kiểm tra trạng thái mạng. Không cần thao tác thủ công cho bước 05.
Chưa thực hiện bước 06 (MetaMask/giao dịch) hoặc 07 (tra cứu/QR/camera).

### Yêu cầu ngôn ngữ — cập nhật sau bước 05

- Người dùng yêu cầu sản phẩm dùng tiếng Anh toàn bộ vì giảng viên là người nước ngoài.
  Từ đây, toàn bộ giao diện, thông báo và tài liệu bàn giao cho giảng viên ở các bước
  tiếp theo phải dùng tiếng Anh. Ghi chú điều phối nội bộ/lịch sử trong bộ hướng dẫn
  này không phải nội dung giao diện sản phẩm.
- Đã chuyển toàn bộ frontend sang tiếng Anh: điều hướng, heading, nhãn/placeholder,
  role options, trạng thái, lỗi RPC/config, chỉ dẫn export, aria-label, metadata và
  `html lang=en`; cả hai README dưới frontend cũng đã chuyển sang tiếng Anh.
- Giữ nguyên chức năng và phạm vi bước 05, không tích hợp bước 06/07.
- `npm.cmd test`: 6/6 pass; `npm.cmd run build`: exit code 0; git diff --check sạch.
- Chrome đã xác minh nội dung hiển thị, placeholder và accessibility label không còn
  tiếng Việt; không có page error. Desktop 1440px và mobile 390/320px không tràn ngang.
- Đã kiểm tra lỗi RPC và JSON cấu hình sai hiển thị bằng tiếng Anh; ảnh desktop/mobile
  cập nhật theo bản tiếng Anh. Bằng chứng bổ sung: `docs/verification/frontend-language.json`.

## Step 06 — Complete (real MetaMask acceptance verified)

Date: 16 November 2026 (Asia/Saigon).

### Step 05 recheck

- Re-ran the original 6 frontend tests and production build: all passed.
- Re-ran export validation: existing deployment, bytecode, receipt and Admin remain valid.
- Rechecked responsive browser layout and optional configuration behavior after wallet integration.

### Implementation

- `frontend/src/services/wallet.js`: BrowserProvider/Signer for writes and a separate
  JsonRpcProvider for reads. Handles accountsChanged, chainChanged, empty accounts,
  local disconnect and network switching/adding with explicit wallet approval.
- Invalidates the writer synchronously on account/network changes; generation checks
  prevent stale async signer/role responses from replacing a newer wallet session.
- Reads all role getters/hasRole, supports multiple roles, and keeps Admin distinct
  from Producer. Grants use bytes32 getter results, never role-name strings.
- Implements grantRole/createProduct/handoverProduct with trimmed input, address,
  stage/holder/role checks and a contract simulation before signing. Rechecks account,
  Chain IDs and matching contract bytecode on wallet/configured RPC before sending.
- Calls tx.wait, displays pending/confirmed/failed states, transaction hash and gas
  used as a string. Prevents duplicate writes while pending and handles rejection,
  insufficient funds, RPC errors and contract errors. Uses textContent for dynamic data.
- `frontend/src/wallet-ui.js`, `main.js`, `style.css`: active wallet/roles, write forms,
  handover holder/stage inspection and a read-only local demo checklist with prepared inputs.
- `frontend/tests/wallet.test.js`: 10 new tests; total 16 frontend tests pass.
- `scripts/verify-wallet-demo.mjs` and root `npm.cmd run verify:demo`: read-only role,
  product and history verification. Does not sign or broadcast transactions.
- Updated frontend README; no new dependencies, no Solidity/test/module changes.

### Verification and evidence

- Frontend tests: 16 pass, 0 fail. Build, root typecheck, script syntax and diff checks pass.
- Chrome test with a simulated injected wallet and real read-only RPC verified Admin
  gating, account/network changes, rejected signing and disconnect behavior. The mock
  provider deliberately rejects send requests; zero real transactions were broadcast.
- Desktop/mobile screenshots reviewed; 390/320px layouts have no horizontal page overflow.
- Baseline on-chain state is still block 1: Admin granted, four business roles absent,
  COFFEE-DEMO-001 unused. This is not a completed MetaMask demo.
- `docs/verification/wallet-transactions.md`: commands, outputs, limits and pending checks.
- `docs/verification/wallet-browser.json`, `wallet-demo-state.json`, `wallet-desktop.png`,
  `wallet-mobile.png`: browser/read-only evidence.
- `docs/wallet-acceptance.md`: concrete English guide for all manual transactions.

### Required next user action

Open/reload http://127.0.0.1:5173/ in Chrome with MetaMask. Select Admin
`0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec` on Ganache Chain ID 1337,
then click Connect MetaMask and approve access. The first role form is prefilled:
Producer → `0x810A640B6089B12ab3bb7Bde1697752129679828`.
Click Grant role and confirm that one transaction in MetaMask; wait for the receipt.
The expected result is a confirmed hash/gas display and a Granted on-chain Producer row.

After user confirmation, verify the chain state and continue through the remaining
three grants, product creation and three handovers. Record an invalid/rejected action
and account-change checks. Step 06 remains incomplete until real MetaMask receipts
and the Delivered product with four history entries are verified. Step 07 is not started.

### Manual milestone — role grants complete in Edge

- The user confirms all four roles were granted through MetaMask in Microsoft Edge.
  The screenshot shows Admin connected and four Granted on-chain rows.
- Independent read-only RPC verification: block 5; Producer, Distributor, Retailer
  and Customer roles are true for their expected addresses. Four RoleGranted
  transaction receipts have status 1. Evidence: `wallet-role-receipts.json` and
  updated `wallet-demo-state.json` under docs/verification.
- COFFEE-DEMO-001 is unused; next action is creation as Producer with name
  Da Lat Arabica and origin Da Lat, Vietnam. Do not create it from Admin.
- User uses Edge; browser guidance now accepts Edge/Chrome rather than requiring
  Chrome. Automated browser evidence remains labeled Chrome, as actually tested.
- Product creation, all three handovers and negative/account-change manual acceptance
  are still pending. Step 06 is not complete.

### Manual milestone — product created

- User screenshot shows Product creation confirmed through MetaMask in Edge at block 6.
- Read-only verification confirms COFFEE-DEMO-001, name Da Lat Arabica, origin
  Da Lat, Vietnam, stage Produced, holder Producer and exactly one history entry.
- Creation receipt status 1, gas used 146937; evidence saved in
  `docs/verification/wallet-product-receipts.json` and updated wallet-demo-state.json.
- Next manual check: while Producer holds the product, attempt a direct handover
  to Customer; expect a missing Distributor-role rejection with no broadcast.
  Then hand over from Producer to Distributor and verify the receipt/stage/history.
- Three handovers and negative/account-change acceptance remain pending.

### Manual milestone — invalid handover rejected and Distributor received product

- User screenshots show a Producer-to-Customer attempt rejected with
  "The recipient needs the Distributor role." No transaction hash/gas was produced.
  This was an application preflight rejection using on-chain role checks, not a mined revert.
- User then confirmed Producer-to-Distributor through MetaMask in Edge.
- Independent RPC verification: block 7, stage At distributor, holder Distributor,
  history length 2. Handover receipt status 1, gas used 87258; saved in
  `docs/verification/wallet-handover-receipts.json`.
- Screenshot also shows Producer can no longer hand over the product after transfer.
- Next: switch MetaMask to Distributor, verify its address/role on the page, and
  hand over COFFEE-DEMO-001 to Retailer. Final Retailer-to-Customer remains afterward.
- Step 06 remains in progress; negative-operation rejection is now manually evidenced.

### Manual milestone — Retailer received product

- User screenshot confirms Distributor-to-Retailer at block 8. Independent RPC
  verification confirms At retailer, Retailer holder, history length 3.
- Receipt status 1 and gas used 87526; handover receipt evidence updated.
- Screenshot shows Producer-only creation disabled for the selected non-Producer
  account, consistent with account-change role gating.
- Final transfer pending: select Retailer and hand over COFFEE-DEMO-001 to Customer.
  Verify Delivered and four history entries before completing step 06.

### Final manual milestone — Customer received product; step 06 complete

- User screenshot confirms Retailer-to-Customer at block 9, gas used 87794.
- Independent RPC verification confirms Delivered (stage 4), Customer holder,
  four correctly ordered history entries, and unchanged product name/origin.
- All three handover receipts have status 1; `wallet-demo-state.json` now reports
  fullFlowOnChain=true. Handover receipts and verification narrative updated.
- Acceptance evidence includes all four role grants, creation and three handovers
  performed by the user through MetaMask in Edge, account-change role gating,
  and a direct Producer-to-Customer attempt correctly rejected before signing.
- Signing-request rejection, empty-account disconnect and wrong-chain recovery have
  automated/mock-provider evidence; these are not represented as manually tested.
- Step 06 completion criteria are met. No terminal-signed acceptance transactions.
  Step 07 (public lookup/timeline, QR/camera) has not started.

### Step 06 manual acceptance document

- Created `docs/reports/step-06-metamask-acceptance.docx` in English at the user's request.
  It records the completed run from Grant all participant roles through Delivered,
  the rejected invalid handover, account-change observations and all eight successful receipts.
- Recovered and saved all six original user screenshots for this acceptance sequence in
  `docs/verification/metamask-screenshots/`, with filenames matched to each step and
  a manifest of message times, dimensions and SHA256 hashes. Earlier wallet setup
  screenshots are excluded. Embedded image bytes match the originals exactly.
- The report has nine pages. Rendered with the Documents packaged renderer and inspected
  every final page; no layout defects remain. All eight transaction hashes are present
  in the rendered output. Accessibility audit has zero high, medium or low findings.
- Quality record: `docs/verification/step06-report-quality.json`.
  Reproducible builder: `scripts/build-step06-acceptance-report.py`.
- The report distinguishes actual manual Edge/MetaMask evidence from simulated-provider tests.
  No step 07 work was performed.

## Step 07 — Implemented and automatically verified pending physical webcam acceptance

Date: 16 November 2026 (Asia/Saigon).

### Implementation

- Rechecked the existing deployment/demo: Delivered, Customer holder, four ordered
  history entries at block 9. No new chain transactions were sent.
- `frontend/src/services/products.js`: public read-only lookup using a separate
  JsonRpcProvider, no injected wallet or permission request. RPC/client/Chain ID/code
  verification precedes reads. Product and history use the same block snapshot.
- IDs are trimmed consistently while preserving case and literal contents. Unknown
  product.exists=false returns not found. Timestamps are converted safely and history
  is displayed in array order, including equal timestamps and partial histories.
- `frontend/src/lookup-ui.js`: real details and timeline, initialized zero-address
  entry, request generation guards, and immediate clearing of stale results on input,
  missing IDs, configuration changes and RPC errors. Dynamic content uses textContent.
- QR generation/download contains only the product ID; arbitrary decoded strings,
  including URLs or HTML, are treated as literal IDs and never opened or executed.
- `frontend/src/services/camera.js`: serialized scanner lifecycle, guarded start/stop,
  cancellation while starting, duplicate-decode suppression, track release after decode,
  explicit stop, navigation, leaving the QR section, hidden tab and page departure.
- html5-qrcode is loaded lazily. QR image scanning provides an optional fallback;
  it is not represented as proof that a physical camera works.
- Updated main.js, style.css and frontend README; no dependency or Solidity/test changes.

### Checks and evidence

- `npm.cmd test`: 24 pass, 0 fail. Build, root typecheck and diff checks pass.
- Edge headless with window.ethereum absent: real COFFEE-DEMO-001 lookup confirms
  Delivered, Customer holder and four history events. No MetaMask connection required.
- Actual QR image decoder round-tripped the prepared PNG and automatically queried
  the correct product. URL payload decoding did not navigate away.
- Browser tests cover unknown IDs, RPC outage, stale asynchronous responses,
  literal HTML input and malicious on-chain strings. No page errors or mobile overflow
  at 390/320px. Screenshot layout was inspected.
- Synthetic canvas MediaStream exercised the real camera decoding pipeline: one
  decode, automatic track release, repeated start/stop and navigation cleanup pass.
  Camera denial was also simulated. These tests do not prove physical webcam access.
- Actual production build without local config opens safely with export guidance;
  original local config restored byte-for-byte after the test.
- `frontend/tests/lookup.test.js`: eight additional product/scanner tests.
- Evidence: `docs/verification/lookup-qr.md`, `lookup-browser.json`,
  `lookup-desktop.png`, `lookup-mobile.png`, and `COFFEE-DEMO-001-qr.png`.
- Manual guide: `docs/lookup-qr-acceptance.md`.

### Required next user action

In Edge, reload http://127.0.0.1:5173/, look up COFFEE-DEMO-001 and verify Delivered
with four history entries. Generate/download its QR or use the prepared PNG. Display
the image on another screen/phone or print it, then click Open camera on the computer
and allow access. Verify a single decode, automatic public lookup and camera shutdown;
also verify Stop camera after starting a second time. Do not use the computer's
localhost URL on a phone as if it were the same server.

Step 07 remains pending physical camera acceptance. If no webcam is available,
record that limitation explicitly. Step 08 has not started.
# Step 07 follow-up: startup connection repair (2026-11-16)

- Investigated the actual Edge page stuck on `Checking network...`. Both Vite (5173) and Ganache RPC (7545) were reachable.
- Root cause: the public product reader passed a bigint chain ID inside a plain ethers network object. Ethers 6.17 rejected this during synchronous startup, preventing the network check from running.
- Fixed the reader to construct an ethers `Network` instance, preserving the decimal chain ID without numeric precision loss. Added a startup error message so initialization failures cannot leave a misleading pending network indicator.
- Added a regression test using the real ethers provider constructor. All 25 frontend tests and the production build passed.
- Verified the actual Edge page now displays `Ganache connected`, `Chain ID: 1337`, verified contract bytecode, and enabled lookup/MetaMask controls. No blockchain reset, redeployment, or transactions were performed.
- Physical webcam acceptance remains pending. Step 08 has not started.

## Step 07 acceptance update — 2026-11-16

Status: complete against the step 07 completion criteria.

- The user confirmed that the physical camera scanned the QR successfully in Edge.
- Their result screenshot matches COFFEE-DEMO-001 on-chain: Da Lat Arabica,
  Da Lat, Vietnam, Delivered, Customer holder, and four ordered history events.
- Public lookup without MetaMask, unknown-ID and RPC-error result clearing have
  separate automated evidence. The supplied manual screenshot has Admin connected.
- Physical camera indicator shutdown and a second manual Stop camera check have
  not been separately confirmed. Automated stream cleanup tests passed.
- Updated the acceptance guide and verification record to distinguish manual and
  automated evidence. Step 08 has not started and awaits the user's instruction.

### Final physical camera confirmation

The user confirmed both camera shutdown after decoding and shutdown through Stop
camera. All requested physical camera checks are accepted. The English Word report
at docs/reports/step-06-metamask-acceptance.docx now includes step 07 manual results,
the original result screenshot, and the distinction between manual and automated
evidence. The existing filename and step 06 receipt and screenshot evidence are
retained. Step 08 has not started.

## Step 08 Integration verification

Status: in progress, awaiting actual MetaMask checks and a fresh product replay.

- Read the step 08 requirements, contract interface and accumulated verification
  records, distinguishing historical pending notes from later accepted milestones.
- Added scripts/check-integration.mjs: default-profile compile, root typecheck,
  isolated Hardhat contract tests (27 pass), frontend tests (25 pass), production
  build, deployment export verification and protected-source diff all exit 0.
- Added scripts/verify-integration-chain.mjs: live read-only role/receipt/event and
  exact history/block timestamp audit for COFFEE-DEMO-001, including creation
  metadata and sender checks. Four negative staticCall cases reject without state
  changes. The baseline full flow is still valid at block 9.
- Added scripts/check-integration-browser.mjs: 13 isolated Edge checks pass using
  actual Ganache reads and an explicitly simulated wallet that never sends. No
  page errors, no broadcast, chain stays at block 9. Covered no wallet, unconnected
  wallet, wrong chain/recovery, account changes, signature rejection, duplicate ID,
  non-holder/Delivered gates, disconnect, public lookup, unknown ID, RPC outage and
  real QR image decoding. Existing module used; no dependency installation.
- Saved docs/verification/integration.md with separate Hardhat, live RPC, browser
  and manual matrices plus receipt references and pending cases. Raw logs are in
  integration-checks.json, integration-chain.json and integration-browser.json.
- Existing real MetaMask flow and physical camera/stop acceptance remain accepted.
  Fresh STEP08-DEMO-001 full flow, actual signing rejection, disconnect/reconnect,
  wrong-chain recovery and remaining UI negative checks are pending. The new flow
  uses existing verified participant roles; no duplicate grants are required.
- Prepared docs/integration-manual.md with exact fields, addresses, expected
  results and the sequence that tests invalid recipients while still Produced.
- No application code, Solidity, Huyen tests, root lockfile or deployment module
  changed in this step. No workspace reset, redeploy or chain write occurred.
- Next: user completes batch A and creates STEP08-DEMO-001 as Producer in Edge;
  verify its state/receipt before proceeding through the three handovers.
  Step 08 is not complete. Step 09 has not started.

### Step 08 manual milestone Signing rejection duplicate ID and fresh creation

- Received three original user screenshots showing real MetaMask rejection for
  STEP08-REJECT-001, Product exists for duplicate COFFEE-DEMO-001, and confirmed
  creation of STEP08-DEMO-001. Saved originals and SHA256 manifest under
  docs/verification/integration-screenshots.
- Verified on Ganache at block 10: the rejected ID is absent with empty history;
  COFFEE-DEMO-001 product and history remain identical to the saved baseline.
  See integration-manual-batch-a.json.
- Fresh creation receipt is successful, hash
  0xe38888d9935b3b68690b7cfbf888fd9b37f8abd816ce04ad90ef964a6d02abbc,
  block 10, gas 146937. ProductCreated event and initialization history timestamp
  both equal block timestamp 1794770899. The new product is Produced, held by
  Producer, with one history entry. See integration-chain-replay.json.
- Creation and real-wallet rejection/duplicate tests pass. Disconnect/reconnect
  and real wrong-chain recovery remain pending, as do fresh handovers, invalid
  recipient/non-holder/Delivered checks and fresh QR scanning.
- Next: test Customer as invalid recipient while the new product is Produced,
  verify rejection, then hand over to Distributor through MetaMask. Step 09 has
  not started.

### Step 08 first fresh handover accepted

- User supplied original screenshots of Customer recipient rejection while
  STEP08-DEMO-001 was Produced, then a valid Producer to Distributor handover.
  Saved as integration-screenshots/04-invalid-customer-recipient.png and
  05-producer-to-distributor.png with SHA256 manifest entries.
- The invalid attempt was a preflight rejection with no hash/gas. The screenshot
  retains Produced and Producer holder; no separate transaction was mined between
  creation at block 10 and the valid transfer at block 11.
- Read-only audit confirms block 11 receipt status 1, gas 87258, hash
  0xddef3d41c66985fa40484aada77af68435a59b2d8288cb1f74a56db4b36c4cc3.
  Event and second history entry match block timestamp 1794771061, stage 2 and
  Distributor recipient. Product metadata and first history entry are preserved.
- Current state: At distributor, Distributor holder, two entries. The screenshot
  shows the former holder's handover button locked with the current-holder hint.
- Next: Distributor to Retailer, then Retailer to Customer. Real network recovery
  and disconnect confirmation, final Delivered gate and fresh QR remain pending.
  Step 08 remains in progress; step 09 has not started.

### Step 08 second fresh handover accepted

- Saved the user's original block 12 confirmation screenshot as
  integration-screenshots/06-distributor-to-retailer.png with its SHA256 hash.
- Live read-only verification confirms successful receipt, gas 87526, hash
  0xc72371e4cffdf25af3a79fabe5e08372cb2ee92b32f639b34a1c4895560c81bd.
  Distributor sender, Retailer recipient, stage 3 and timestamp 1794771162 match
  the event, third history entry and receipt block. Earlier metadata/history intact.
- STEP08-DEMO-001 is At retailer, Retailer holds it, history length 3. The user
  screenshot shows Producer-only creation and former-holder handover locked.
- Next: Retailer to Customer, then Customer Delivered gate and fresh QR scan.
  Actual disconnect/reconnect and wrong-network recovery confirmations still
  pending. Step 08 remains in progress; step 09 has not started.

### Step 08 fresh full flow accepted

- Saved the user's final confirmation as integration-screenshots/07-retailer-to-customer.png
  with SHA256. Read-only audit confirms receipt status 1 at block 13, gas 87794,
  hash 0xbfc1bc3868178b3d2b8b8f00369a23957ceb2cb576afe2f54af95419482a31ae.
- ProductTransferred event, fourth history entry and receipt block timestamp all
  match 1794771228, Retailer to Customer, stage 4. STEP08-DEMO-001 is Delivered,
  Customer holds it, and all four ordered history entries and immutable metadata
  are verified. integration-chain-replay.json fullFlow is now true.
- Customer post-delivery eth_call rejects with Already delivered and leaves state
  unchanged. Actual Customer UI inspection and fresh QR scan still need user
  confirmation, as do actual disconnect/reconnect and wrong-network recovery.
- Step 08 remains in progress until those remaining manual cases are recorded.
  Step 09 has not started.

### Step 08 final Customer gate and fresh QR accepted

- Received and saved three original user screenshots as integration-screenshots
  08-customer-delivered-gate.png, 09-fresh-product-timeline.png and
  10-fresh-qr-camera-released.png, each with a SHA256 manifest entry.
- Delivered handover is locked with This product has already been delivered.
  Customer is shown connected in the lookup screenshot. STEP08-DEMO-001 details,
  Customer holder and all four ordered timeline entries match the audited chain
  state, including the four displayed local times.
- Fresh QR contains STEP08-DEMO-001; scanner status confirms QR decoded and
  Camera released. Final product gate, lookup and fresh camera QR acceptance pass.
- Only real-wallet disconnect/reconnect and wrong-network recovery confirmations
  remain pending. Step 08 is still in progress; step 09 has not started.

### Step 08 closed within the user approved scope

The user explicitly requested closure without checking the two remaining actual
wallet recovery cases. Disconnect/reconnect and wrong network/return are recorded
as Not run, waived by user. Their simulated browser results are retained separately
and are not represented as actual MetaMask acceptance.

All other scoped checks are accepted: automated compile/typecheck/build and tests,
fresh MetaMask creation and three handovers, event/receipt/history timestamp audit,
manual signing rejection, duplicate ID, invalid recipient, non-holder and Delivered
gates, product timeline and physical fresh QR camera scan/release. The English report
docs/reports/step-08-integration-acceptance.docx includes the ten original manual
screenshots and distinguishes real, simulated and waived evidence.

Step 08 is closed under this explicitly reduced scope. Step 09 has not started.

Report QA: all 12 rendered pages visually inspected; all 10 embedded screenshots
match original bytes; four transaction hashes match the audited chain record;
accessibility audit has zero findings. Reproducible builder:
scripts/build-step08-acceptance-report.py. QA record:
docs/verification/step08-report-quality.json.

## Step 09 README and Quoc report completed

Status: Quoc documentation complete; final group report awaits Huyen inputs.

- Read the actual assignment document in the parent directory, final source,
  contract interface, current package versions and accumulated step 08 evidence.
- Replaced the root README with English installation, compile/test/typecheck,
  Ganache RPC/Chain ID reads, explicit-profile deployment, verified ABI/local
  configuration export, MetaMask and first-five-account mapping, frontend start,
  product/QR demo, evidence and limitations. Local addresses are not prescribed
  for another machine. Workspace changes, journal preservation and re-export are
  explained; no reset/delete command was added.
- Created docs/report-quoc.md covering architecture with a small Mermaid diagram,
  public reads versus wallet writes, deployment/config, roles/stages, account and
  network handling, QR lifecycle, actual acceptance, measured baseline receipts
  and limitations. Contract revocation behavior is described correctly.
- Created docs/group-report-inputs.md with the missing gas datasets, reproducible
  measurement conditions, baseline/optimized source/profile, formulas, optimization
  explanation and final contract/security inputs. Existing assignment notes claim
  gas work was done, but the actual measurement data are not in this checkout.
  Receipt gas is identified as baseline supporting evidence only.
- Created docs/group-report-outline.md with a five-page assembly outline and
  marked Huyen/gas sections awaiting inputs. It is not a final paginated report;
  no final group PDF was generated. Updated frontend README/config wording.
- Checked current local Git history: 8 commits attributed to Huyen; this workflow
  has not committed Quoc's work or established both-member commit attribution.
  No branch switch, pull, merge, commit or push was performed.
- Verification: 47 local document links resolve; all 6 README PowerShell blocks
  parse; the README RPC block executes successfully and returns Chain ID 1337
  and the five current public accounts. Ten ignore checks pass for dependencies,
  generated builds, env files, local config/journals and account mapping; lockfiles,
  ABI and empty example remain visible to version control. Existing ignore rules
  required no additional change. Report receipt gas/timestamps match chain evidence.
- Protected Solidity, Huyen tests, Hardhat config, root lockfile and deployment
  module remain unchanged. git diff --check passes. Documentation-only changes
  use the completed step 08 test/build evidence without rerunning suites or
  reinstalling dependencies. No deploy or chain transaction was performed.
- Evidence: docs/verification/readme-report.json. Clean-copy installation/demo
  verification is intentionally reserved for step 10, which has not started.

Next coordination: obtain Huyen's measured before/after gas table and raw script/log,
optimization explanation with equivalent test conditions and correctness results,
and final contract/security section. Reconcile and assemble the concise 4–6-page
group report only when those inputs are available. Step 09 documentation criteria
are met; the final group report and gas optimization analysis remain incomplete.


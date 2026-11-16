# Bước 05 — Giao diện nền tảng

Ngày thực hiện: 16/11/2026 (Asia/Saigon).

Vanilla JavaScript, Vite 8.3.8, ethers 6.17.0, qrcode 1.5.4, html5-qrcode 2.3.8. Vite engines: ^20.19.0 || >=22.12.0; Node máy này 26.3.0 đáp ứng. Nguồn: https://vite.dev/guide/ và npm registry. Frontend npm install đã cài 56 packages, audit 0 vulnerabilities, exit code 0.

## frontend/: npm.cmd test

Exit code: 0

stdout:

```text

> supply-chain-frontend@1.0.0 test
> node --test tests/*.test.js

✔ missing, malformed and unusable configurations have distinct safe results (5.4759ms)
✔ valid local Ganache with contract passes using read-only requests (0.9526ms)
✔ node unreachable is distinguished from missing contract (0.7196ms)
✔ wrong Chain ID and wrong client are rejected before accepting a contract (0.2777ms)
✔ invalid JSON-RPC, HTTP errors and malformed responses are rejected (0.4161ms)
✔ an unresponsive request is bounded by the abort signal (25.3074ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 409.9747

```

stderr:

```text

```
## frontend/: npm.cmd run build

Exit code: 0

stdout:

```text

> supply-chain-frontend@1.0.0 build
> vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 157 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.65 kB │ gzip:  0.41 kB
dist/assets/index-ChnQFfcS.css  13.94 kB │ gzip:  3.86 kB
dist/assets/index-Cq_JF6s-.js   78.54 kB │ gzip: 24.46 kB

✓ built in 143ms

```

stderr:

```text

```

## Build không có deployment.local.json

Exit code: 0

```text

> supply-chain-frontend@1.0.0 build
> vite build --outDir node_modules/.verification/missing-config --emptyOutDir false

vite v8.3.8 building client environment for production...
transforming...
✓ 156 modules transformed.
rendering chunks...
computing gzip size...
node_modules/.verification/missing-config/index.html                  0.65 kB │ gzip:  0.41 kB
node_modules/.verification/missing-config/assets/index-ChnQFfcS.css  13.94 kB │ gzip:  3.86 kB
node_modules/.verification/missing-config/assets/index-DBLs0HId.js   78.38 kB │ gzip: 24.33 kB

✓ built in 145ms


```

## Build với JSON cấu hình hỏng

Exit code: 0

```text

> supply-chain-frontend@1.0.0 build
> vite build --outDir node_modules/.verification/invalid-config --emptyOutDir false

vite v8.3.8 building client environment for production...
transforming...
✓ 157 modules transformed.
rendering chunks...
computing gzip size...
node_modules/.verification/invalid-config/index.html                  0.65 kB │ gzip:  0.41 kB
node_modules/.verification/invalid-config/assets/index-ChnQFfcS.css  13.94 kB │ gzip:  3.86 kB
node_modules/.verification/invalid-config/assets/index-BzXQApay.js   78.42 kB │ gzip: 24.35 kB

✓ built in 138ms


```

## frontend: npm.cmd ci

Exit code: 4294963248

```text

npm error code EPERM
npm error syscall unlink
npm error path C:\Users\Quoc\Desktop\DTU\Blockchain\Huyen-git\supply-chain-product-tracking\frontend\node_modules\@rolldown\binding-win32-x64-msvc\rolldown-binding.win32-x64-msvc.node
npm error errno -4048
npm error [Error: EPERM: operation not permitted, unlink 'C:\Users\Quoc\Desktop\DTU\Blockchain\Huyen-git\supply-chain-product-tracking\frontend\node_modules\@rolldown\binding-win32-x64-msvc\rolldown-binding.win32-x64-msvc.node'] {
npm error   errno: -4048,
npm error   code: 'EPERM',
npm error   syscall: 'unlink',
npm error   path: 'C:\\Users\\Quoc\\Desktop\\DTU\\Blockchain\\Huyen-git\\supply-chain-product-tracking\\frontend\\node_modules\\@rolldown\\binding-win32-x64-msvc\\rolldown-binding.win32-x64-msvc.node'
npm error }
npm error
npm error The operation was rejected by your operating system.
npm error It's possible that the file was already in use (by a text editor or antivirus), or that you lack permissions to access it.
npm error
npm error If you believe this might be a permissions issue, please double-check the permissions of the file and its containing directories, or try running the command again as root/Administrator.
npm error A complete log of this run can be found in: C:\Users\Quoc\AppData\Local\npm-cache\_logs\2026-11-15T17_48_41_281Z-debug-0.log

```

## Browser và phạm vi

Kết quả browser chi tiết: frontend-browser.json. Đã chụp và xem ảnh desktop/mobile. Kiểm tra RPC thật không có console/page error, mobile không tràn ngang; giả lập RPC offline/sai chain/thiếu contract cho thông báo riêng. Bản build thiếu config và JSON sai được mở thực tế, không crash. ABI/config gốc được khôi phục nguyên byte; không có giao dịch hoặc yêu cầu camera/MetaMask.

Chỉ hoàn thiện bước 05. URL dev: http://127.0.0.1:5173/. Các hành động wallet/transaction/lookup/QR chưa tích hợp đều bị khóa và có nhãn rõ.

Đã dừng dev server của lần kiểm tra để giải phóng native binding Rolldown trên Windows trước khi chạy ci lại. Không thay dependency.

## frontend: npm.cmd ci

Exit code: 0

```text

added 54 packages, and audited 55 packages in 9s

13 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities


```

## frontend: npm.cmd test

Exit code: 0

```text

> supply-chain-frontend@1.0.0 test
> node --test tests/*.test.js

✔ missing, malformed and unusable configurations have distinct safe results (5.2778ms)
✔ valid local Ganache with contract passes using read-only requests (0.9607ms)
✔ node unreachable is distinguished from missing contract (0.8991ms)
✔ wrong Chain ID and wrong client are rejected before accepting a contract (0.3901ms)
✔ invalid JSON-RPC, HTTP errors and malformed responses are rejected (0.685ms)
✔ an unresponsive request is bounded by the abort signal (17.1095ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 530.7672


```

## frontend: npm.cmd run build

Exit code: 0

```text

> supply-chain-frontend@1.0.0 build
> vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 157 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  0.65 kB │ gzip:  0.41 kB
dist/assets/index-ChnQFfcS.css  13.94 kB │ gzip:  3.86 kB
dist/assets/index-Cq_JF6s-.js   78.54 kB │ gzip: 24.46 kB

✓ built in 156ms


```

## .: npx.cmd tsc --noEmit

Exit code: 0

```text


```

## .: git diff --check

Exit code: 0

```text


```

## .: git diff --exit-code -- contracts test hardhat.config.ts tsconfig.json package-lock.json ignition/modules docs/test_results.txt

Exit code: 0

```text


```

## .: git check-ignore frontend/node_modules/example frontend/dist/example frontend/src/config/deployment.local.json docs/local-demo.local.md

Exit code: 0

```text
frontend/node_modules/example
frontend/dist/example
frontend/src/config/deployment.local.json
docs/local-demo.local.md


```

## English-language update

The user requires English throughout the product for an international instructor. All frontend UI text, metadata, accessibility labels, errors, and frontend README files are now in English. Six tests and production build passed again (exit 0). Chrome verified English UI and error messages, no uncaught page errors, and no page overflow at widths 1440, 390 and 320. Screenshots frontend-desktop.png/frontend-mobile.png now show the English version. See frontend-language.json. Earlier missing/invalid-config screenshots are historical Vietnamese test evidence from the original foundation check. No step 06/07 functionality was added.

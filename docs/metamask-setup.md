# Thiết lập MetaMask cho Ganache local

> Cập nhật 16/11/2026: đã giữ workspace mới NOISELESS-MAGIC, khôi phục RPC bằng
> Restart và deploy lại. Bảng 5 ví mới tại `docs/local-demo.local.md`, bằng chứng tại
> `verification/redeploy-new-workspace.md`. Người dùng đã import đủ 5 ví và
> xác nhận thông số mạng/số dư trước khi yêu cầu chuyển bước 05.

Trạng thái: bước 04 hoàn thành theo xác nhận thủ công của người dùng ngày 16/11/2026
về 5 ví, địa chỉ/số dư Admin và RPC 7545/Chain ID 1337. Tên mạng trong UI có thể vẫn
là Localhost 8545; người dùng xác nhận thông số thực tế đã đúng. Kết nối website
với MetaMask vẫn cần nghiệm thu ở bước 06.
Không thể kết luận MetaMask hoạt động chỉ từ tài khoản RPC của Ganache.

## Giá trị cho workspace hiện tại

Đã kiểm tra lại trước khi hướng dẫn bước 04; bằng chứng tại `verification/metamask.md`.

| Trường | Giá trị |
| --- | --- |
| Network name | Ganache Local |
| RPC URL | http://127.0.0.1:7545 |
| Chain ID | 1337 (0x539) |
| Currency symbol | ETH |
| Block explorer URL | Để trống |

Network ID `5777` là giá trị riêng, không điền thay Chain ID `1337`.
Contract đã kiểm tra bytecode và quyền Admin:
`0x843B273a8c67BcaB604f14fd466162CBdBb556B9`.
Địa chỉ contract không phải địa chỉ ví để import.

Bảng 5 địa chỉ đầy đủ nằm trong `docs/local-demo.local.md` (được Git ignore).
Admin phải trùng deployer mới `0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec`.
Snapshot số dư sau deploy xem tại bảng local;
Producer/Distributor/Retailer/Customer mỗi ví `100 ETH` thử nghiệm.
Đây chỉ là môi trường máy hiện tại; khi đổi máy/workspace phải lấy lại tất cả giá trị từ RPC.

## Thao tác trên Chrome

1. Mở MetaMask; nếu chưa cài, lấy từ [trang chính thức](https://metamask.io/download).
   Tự hoàn tất thiết lập/mở khóa ví; không gửi mật khẩu, seed phrase hoặc private key vào chat/repo.
2. Trong tab Tokens, mở All networks → Manage networks → Add a custom network,
   điền bảng trên, lưu và chọn Ganache Local. Nếu mạng đã có, kiểm tra RPC/Chain ID thay vì thêm trùng.
   [Hướng dẫn thêm mạng của MetaMask](https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc).
3. Trong Ganache, tìm tài khoản có địa chỉ khớp từng dòng trong bảng local và tự lấy
   private key của tài khoản thử nghiệm. Dán trực tiếp vào MetaMask qua menu chọn tài khoản
   → Add wallet → Import an account → chọn Private key → Import. Lặp lại đủ 5 ví.
   [Hướng dẫn import chính thức](https://support.metamask.io/start/use-an-existing-wallet).
4. Đổi tên từng tài khoản thành Admin, Producer, Distributor, Retailer, Customer
   qua phần chi tiết/chỉnh sửa tài khoản. Nếu tên menu khác, đối chiếu UI phiên bản đang dùng.
5. Chọn Ganache Local, kiểm tra đủ 5 địa chỉ và số dư gần snapshot trên; chọn Admin
   khi chuẩn bị bước tích hợp. Đặt tên ví chưa cấp quyền on-chain. Không cần gửi giao dịch ở bước này.
6. Xác nhận trong chat rằng đã có đúng mạng, 5 địa chỉ và số dư. Chỉ báo thông tin công khai;
   nếu có lỗi, gửi nội dung lỗi không chứa bí mật.

Giữ Ganache chạy và không reset workspace. Chưa kiểm tra kết nối website vì frontend
nhận tài khoản qua MetaMask sẽ được nghiệm thu ở bước 06. Nếu lỗi nonce sau khi chain
bị reset, báo lỗi để đối chiếu trạng thái; không tự xóa ví hoặc reset Ganache.

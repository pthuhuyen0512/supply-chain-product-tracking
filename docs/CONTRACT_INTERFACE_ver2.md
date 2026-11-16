# Giao diện hợp đồng SupplyChainV2

Tài liệu bàn giao từ Huyền (smart contract và kiểm thử) cho Quốc (deploy và frontend).
Nội dung mô tả bản tối ưu `contracts/SupplyChain_ver2.sol`, contract `SupplyChainV2`. Bản gốc `contracts/SupplyChain.sol` được giữ để so sánh trước/sau tối ưu. V2 giữ nguyên các hàm nghiệp vụ, dữ liệu trả về và event; các lỗi chuỗi do dự án định nghĩa được thay bằng custom error.

## 1. Thông tin tích hợp

| Nội dung | Giá trị |
| --- | --- |
| Contract | `SupplyChainV2` |
| File nguồn | `contracts/SupplyChain_ver2.sol` |
| Constructor | Không có tham số |
| Admin ban đầu | Địa chỉ thực hiện deploy; không tự có quyền Producer |
| Compiler cấu hình dùng khi so sánh | Solidity `0.8.34`, EVM `paris`, profile `default`, optimizer tắt |
| Mạng triển khai dự kiến | Ganache cục bộ |
| RPC cấu hình hiện tại | `http://127.0.0.1:7545` |
| Chain ID | Quốc đọc từ Ganache bằng `eth_chainId`; không mặc định bằng Network ID |
| Module deploy | `ignition/modules/SupplyChain.ts`; Quốc cần đổi contract được chọn thành `SupplyChainV2` |
| Artifact sau compile | `artifacts/contracts/SupplyChain_ver2.sol/SupplyChainV2.json` |
| ABI | Thuộc tính `abi` trong artifact |
| Địa chỉ contract | Quốc ghi lại sau khi deploy V2; chưa xác nhận V2 đã deploy lên Ganache |

Không gửi ETH khi gọi các hàm: contract không có hàm payable, receive hoặc fallback.
Các giao dịch ghi cần ví ký và tài khoản có ETH thử nghiệm để trả gas.
Các hàm đọc có thể gọi qua RPC mà không cần MetaMask, không gửi giao dịch và không trả phí gas.

Quốc phụ trách deploy, xuất ABI và địa chỉ sang frontend. Khi deploy lại, phải kiểm tra và cập nhật cấu hình frontend; dữ liệu cũ không tự chuyển sang contract mới.

### Bàn giao từ V1 sang V2

1. Module deploy phải chọn `m.contract("SupplyChainV2")`, không tiếp tục chọn `SupplyChain` của bản gốc. Dùng profile `default` để khớp cấu hình đo đã báo cáo.
2. `scripts/export-frontend.mjs` hiện còn tham chiếu bản gốc. Quốc cần cập nhật tên contract, source, artifact và các tham chiếu địa chỉ trong journal theo module thực tế, đồng thời giữ các bước kiểm tra bytecode, receipt và Admin.
3. Deploy V2 thành contract mới rồi xuất ABI từ artifact V2 và địa chỉ thật của lần deploy đó sang frontend. Không ghép ABI V2 với địa chỉ V1.
4. Cấp lại vai trò trên V2. Sản phẩm và lịch sử V1 không tự di chuyển sang V2.
5. Cập nhật phần giải mã/hiển thị lỗi theo bảng custom error ở mục 10; chạy lại luồng cấp quyền, tạo, bàn giao, tra cứu và QR.

Tài liệu này là hướng dẫn bàn giao; chưa thay đổi module deploy, script export hoặc frontend. Số liệu tối ưu xem tại [báo cáo gas](../gas/gas_report.md).

## 2. Vai trò và đăng ký

| Vai trò | Getter trả về `bytes32` | Quyền nghiệp vụ |
| --- | --- | --- |
| Admin | `DEFAULT_ADMIN_ROLE()` | Cấp và thu hồi vai trò, bao gồm Admin |
| Producer | `PRODUCER_ROLE()` | Tạo sản phẩm; bàn giao sản phẩm đang giữ ở giai đoạn Produced |
| Distributor | `DISTRIBUTOR_ROLE()` | Nhận từ Producer; bàn giao ở giai đoạn AtDistributor |
| Retailer | `RETAILER_ROLE()` | Nhận từ Distributor; bàn giao ở giai đoạn AtRetailer |
| Customer | `CUSTOMER_ROLE()` | Nhận từ Retailer; không bàn giao tiếp sau Delivered |

Đăng ký được thực hiện bằng Admin gọi `grantRole`, không có hàm tự đăng ký tên hoặc thông tin cá nhân.
Các getter vai trò không có tham số và không yêu cầu quyền.
`DEFAULT_ADMIN_ROLE()` là `bytes32(0)`; bốn vai trò nghiệp vụ là hash keccak256 của tên hằng tương ứng.
Frontend nên đọc getter, không truyền trực tiếp chuỗi `"PRODUCER_ROLE"` vào `grantRole`.

Một ví có thể có nhiều vai trò. Tuy nhiên, mỗi lần bàn giao vẫn phải sang một địa chỉ khác và chỉ tiến đúng một giai đoạn.
Admin không được bỏ qua quy tắc tạo hoặc bàn giao nếu chưa có vai trò nghiệp vụ phù hợp.

### Các hàm quản lý quyền

| Chữ ký | Quyền gọi | Kết quả |
| --- | --- | --- |
| `grantRole(bytes32 role, address account)` | Admin | Cấp vai trò; không có giá trị trả về |
| `revokeRole(bytes32 role, address account)` | Admin | Thu hồi vai trò; không có giá trị trả về |
| `hasRole(bytes32 role, address account) view returns (bool)` | Công khai | Kiểm tra quyền hiện tại |
| `getRoleAdmin(bytes32 role) view returns (bytes32)` | Công khai | Vai trò quản trị; các vai trò hiện tại đều do DEFAULT_ADMIN_ROLE quản trị |
| `renounceRole(bytes32 role, address callerConfirmation)` | Chính tài khoản từ bỏ quyền | `callerConfirmation` phải bằng địa chỉ ví đang gọi |

`grantRole` chỉ chấp nhận năm vai trò trong bảng và địa chỉ khác zero.
Cấp lại quyền đã có hoặc thu hồi quyền chưa có không thay đổi trạng thái, không phát event thay đổi quyền.
`revokeRole` và `renounceRole` là hàm kế thừa từ OpenZeppelin AccessControl.
Không cần đưa chức năng từ bỏ hoặc cấp thêm quyền Admin lên giao diện demo. Contract hiện không ngăn Admin cuối cùng tự từ bỏ/thu hồi quyền của mình; tránh thao tác này vì có thể mất khả năng quản trị.

## 3. Trạng thái sản phẩm

Enum `Stage` được ABI biểu diễn bằng `uint8`:

| Giá trị | Tên | Nhãn gợi ý trên website |
| --- | --- | --- |
| 0 | None | Chưa tồn tại |
| 1 | Produced | Đã sản xuất |
| 2 | AtDistributor | Tại nhà phân phối |
| 3 | AtRetailer | Tại nhà bán lẻ |
| 4 | Delivered | Đã giao khách hàng |

Luồng hợp lệ:

```text
Tạo sản phẩm → Produced → AtDistributor → AtRetailer → Delivered
```

Không bỏ bước, quay lại giai đoạn trước hoặc bàn giao tiếp sau Delivered.

## 4. Quy ước mã sản phẩm

- `productId` là chuỗi do người dùng nhập, ví dụ `COFFEE-001`.
- Contract phân biệt chữ hoa/thường và không tự xóa khoảng trắng.
- `COFFEE-001`, `coffee-001` và `COFFEE-001 ` là các mã khác nhau.
- Frontend nên thống nhất dùng `.trim()` ở form tạo, form bàn giao, form tra cứu và dữ liệu đọc từ QR.
- Contract chỉ chặn chuỗi có độ dài bằng 0; chuỗi chỉ chứa khoảng trắng cần frontend kiểm tra thêm.
- Khóa lưu trữ và khóa event là `keccak256(bytes(productId))`; với ethers v6 có thể tính bằng `ethers.id(productId)`.
- Khi gọi hàm nghiệp vụ, truyền mã chuỗi gốc, không truyền hash thay mã.

## 5. Hàm tạo sản phẩm

```solidity
function createProduct(
    string calldata productId,
    string calldata name,
    string calldata origin
) external;
```

| Tham số | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| productId | Mã duy nhất | COFFEE-001 |
| name | Tên sản phẩm | Arabica Da Lat |
| origin | Nguồn gốc | Da Lat, Viet Nam |

Điều kiện: ví gọi có PRODUCER_ROLE; cả ba chuỗi không rỗng; mã chưa tồn tại.

Khi thành công:

- Người tạo là `currentHolder`, trạng thái là Produced, `exists` là true.
- `createdAt` lấy từ `block.timestamp` của giao dịch.
- Lịch sử có mốc đầu tiên: `from = address(0)`, `to = producer`, trạng thái Produced.
- Phát event ProductCreated.

Không trả về dữ liệu Solidity. Frontend nhận transaction, đợi xác nhận rồi gọi lại hàm đọc.

## 6. Hàm bàn giao

```solidity
function handoverProduct(string calldata productId, address to) external;
```

| Tham số | Ý nghĩa |
| --- | --- |
| productId | Mã sản phẩm đã tồn tại |
| to | Địa chỉ ví nhận |

Người gọi phải đang giữ sản phẩm; người nhận khác địa chỉ zero và khác người gửi.

| Trạng thái hiện tại | Vai trò người gửi phải còn hiệu lực | Vai trò người nhận | Trạng thái sau giao dịch |
| --- | --- | --- | --- |
| Produced | PRODUCER_ROLE | DISTRIBUTOR_ROLE | AtDistributor |
| AtDistributor | DISTRIBUTOR_ROLE | RETAILER_ROLE | AtRetailer |
| AtRetailer | RETAILER_ROLE | CUSTOMER_ROLE | Delivered |

Khi thành công, cập nhật người giữ và trạng thái, thêm một mốc lịch sử, phát ProductTransferred. Tên, nguồn gốc và thời gian tạo không thay đổi.
Không có giá trị trả về Solidity.

Nếu người đang giữ hàng bị thu hồi vai trò, họ vẫn là người giữ nhưng không được bàn giao cho đến khi Admin cấp lại đúng vai trò.
Giao dịch có hiệu lực ngay, không có bước người nhận xác nhận và không có chức năng hoàn tác.

## 7. Truy vấn sản phẩm

```solidity
function getProduct(string calldata productId)
    external view returns (Product memory);
```

Struct trả về theo đúng thứ tự:

| Chỉ số | Trường | Kiểu Solidity | Ý nghĩa |
| --- | --- | --- | --- |
| 0 | name | string | Tên sản phẩm |
| 1 | origin | string | Nguồn gốc |
| 2 | currentHolder | address | Ví đang giữ sản phẩm |
| 3 | stage | Stage / uint8 | Trạng thái 0–4 |
| 4 | createdAt | uint64 | Unix timestamp, đơn vị giây |
| 5 | exists | bool | Có tồn tại hay không |

Mã không tồn tại không gây revert: trả chuỗi rỗng, địa chỉ zero, stage 0, timestamp 0 và exists false.
Frontend phải kiểm tra `product.exists` trước khi hiển thị.
Struct không chứa productId; frontend giữ lại mã đang tra cứu.

## 8. Truy vấn lịch sử

```solidity
function getHistory(string calldata productId)
    external view returns (Handover[] memory);
```

Mỗi phần tử có các trường:

| Chỉ số | Trường | Kiểu Solidity | Ý nghĩa |
| --- | --- | --- | --- |
| 0 | from | address | Ví gửi; zero ở mốc tạo |
| 1 | to | address | Ví nhận |
| 2 | timestamp | uint64 | Thời gian blockchain, đơn vị giây |
| 3 | stage | Stage / uint8 | Trạng thái sau thao tác |

Mảng theo thứ tự thao tác, tối đa bốn phần tử: tạo, nhận tại Distributor, nhận tại Retailer, nhận tại Customer.
Mã chưa tồn tại trả mảng rỗng.
Các mốc có thể cùng timestamp; giữ thứ tự mảng, không dựa vào việc timestamp phải khác nhau.

Với ethers v6, số nguyên Solidity được đọc dưới dạng `bigint`. Chuyển trạng thái bằng `Number(item.stage)`; hiển thị thời gian bằng:

```javascript
new Date(Number(item.timestamp) * 1000).toLocaleString("vi-VN");
```

Không đưa trực tiếp bigint vào JSON.stringify; chuyển sang chuỗi nếu cần lưu JSON.

## 9. Event

```solidity
event ProductCreated(
    bytes32 indexed productKey,
    string productId,
    address indexed producer,
    uint64 timestamp
);

event ProductTransferred(
    bytes32 indexed productKey,
    address indexed from,
    address indexed to,
    uint8 stage,
    uint64 timestamp
);

// Kế thừa từ OpenZeppelin AccessControl:
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);
```

`sender` trong event quyền là tài khoản thực hiện thay đổi.
Constructor phát RoleGranted cho Admin ban đầu.
RoleAdminChanged nằm trong ABI kế thừa nhưng contract hiện không cung cấp hàm đổi vai trò quản trị.
ProductTransferred không chứa chuỗi productId: dùng productKey để lọc theo sản phẩm.
Để dựng timeline đơn giản, frontend dùng getHistory, không bắt buộc truy vấn log event.

## 10. Lỗi và thông báo gợi ý

### Custom error của V2 và đối chiếu thông báo V1

| Lỗi chuỗi V1 | Custom error V2 | Thao tác | Thông báo gợi ý |
| --- | --- | --- | --- |
| Invalid account | `InvalidAccount()` | grantRole | Địa chỉ được cấp quyền không được là địa chỉ zero |
| Invalid role | `InvalidRole()` | grantRole | Vai trò không được hỗ trợ |
| Empty product ID | `EmptyProductId()` | createProduct | Chưa nhập mã sản phẩm |
| Empty name | `EmptyName()` | createProduct | Chưa nhập tên sản phẩm |
| Empty origin | `EmptyOrigin()` | createProduct | Chưa nhập nguồn gốc |
| Product exists | `ProductExists()` | createProduct | Mã sản phẩm đã được sử dụng |
| Product not found | `ProductNotFound()` | handoverProduct | Sản phẩm không tồn tại |
| Not current holder | `NotCurrentHolder()` | handoverProduct | Ví hiện tại không giữ sản phẩm |
| Invalid receiver | `InvalidReceiver()` | handoverProduct | Địa chỉ người nhận là địa chỉ zero |
| Cannot transfer to self | `CannotTransferToSelf()` | handoverProduct | Không thể bàn giao cho chính mình |
| Not distributor | `NotDistributor()` | handoverProduct | Người nhận chưa có quyền Distributor |
| Not retailer | `NotRetailer()` | handoverProduct | Người nhận chưa có quyền Retailer |
| Not customer | `NotCustomer()` | handoverProduct | Người nhận chưa có quyền Customer |
| Already delivered | `AlreadyDelivered()` | handoverProduct | Sản phẩm đã giao khách hàng, không được bàn giao tiếp |

### Custom error kế thừa từ AccessControl

| Error | Ý nghĩa |
| --- | --- |
| `AccessControlUnauthorizedAccount(address account, bytes32 neededRole)` | Ví thiếu vai trò cần thiết; gồm trường hợp vai trò người gửi đã bị thu hồi |
| `AccessControlBadConfirmation()` | callerConfirmation không khớp ví gọi renounceRole |

ABI chứa thông tin để ethers giải mã custom error. Lỗi có thể phát sinh ngay lúc ước lượng gas, trước khi người dùng ký giao dịch.
Frontend cần phân biệt lỗi contract với lỗi người dùng từ chối ký, sai mạng, thiếu ETH thử nghiệm hoặc RPC không kết nối được.
Contract chỉ trả lỗi của điều kiện bị vi phạm đầu tiên.

V2 đã thay lỗi chuỗi bằng các custom error trong bảng trên. Quốc cần lấy ABI V2 và ánh xạ tên lỗi sang thông báo giao diện; không tiếp tục chỉ dựa vào chuỗi revert của V1. Các custom error kế thừa từ AccessControl giữ nguyên.

## 11. Ví dụ gọi bằng ethers v6

Ví dụ minh họa bên dưới chưa phải file frontend hoàn chỉnh. ABI, địa chỉ, Chain ID và địa chỉ ví phải lấy từ môi trường deploy thực tế.

```javascript
// Đọc công khai qua RPC, không yêu cầu kết nối MetaMask.
const rpc = new ethers.JsonRpcProvider(RPC_URL);
const reader = new ethers.Contract(CONTRACT_ADDRESS, ABI, rpc);
const product = await reader.getProduct("COFFEE-001");
if (product.exists) {
  const history = await reader.getHistory("COFFEE-001");
  // Dựng timeline từ history.
}

// Ghi bằng ví MetaMask đang được người dùng chọn.
if (!window.ethereum) throw new Error("Chưa cài MetaMask");
const wallet = new ethers.BrowserProvider(window.ethereum);
await wallet.send("eth_requestAccounts", []);
const walletNetwork = await wallet.getNetwork();
if (walletNetwork.chainId !== BigInt(EXPECTED_CHAIN_ID)) {
  throw new Error("Hãy chọn đúng mạng Ganache");
}
const signer = await wallet.getSigner();
const writer = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Khi ví đang chọn là Admin:
const role = await reader.PRODUCER_ROLE();
const grantTx = await writer.grantRole(role, PRODUCER_ADDRESS);
const grantReceipt = await grantTx.wait();

// Khi ví đang chọn là Producer: tạo lại signer và writer sau khi đổi ví.
// const createTx = await writer.createProduct("COFFEE-001", "Arabica Da Lat", "Da Lat, Viet Nam");
// const createReceipt = await createTx.wait();

// Khi ví đang chọn là người giữ đúng vai trò:
// const transferTx = await writer.handoverProduct("COFFEE-001", RECEIVER_ADDRESS);
// const transferReceipt = await transferTx.wait();
// Gas đã dùng lấy từ receipt.gasUsed.toString().
```

Xử lý `accountsChanged` để cập nhật signer, writer và quyền hiển thị; xử lý `chainChanged` để kiểm tra lại mạng và khởi tạo lại kết nối.
Kiểm tra quyền trên giao diện giúp người dùng thao tác, nhưng contract vẫn là nơi quyết định quyền cuối cùng.
QR chỉ cần chứa mã sản phẩm, ví dụ COFFEE-001; sau khi quét, gọi getProduct và getHistory.

## 12. Kịch bản tích hợp tối thiểu

1. Quốc deploy bằng một tài khoản Ganache; ghi địa chỉ Admin, contract, RPC và Chain ID; xuất ABI.
2. Admin cấp bốn vai trò cho bốn ví còn lại.
3. Producer tạo COFFEE-001 với tên Arabica Da Lat, nguồn gốc Da Lat, Viet Nam.
4. Producer bàn giao cho Distributor, Distributor bàn giao cho Retailer, Retailer bàn giao cho Customer.
5. Tra cứu hoặc quét QR: trạng thái Delivered, người giữ là Customer và đủ bốn mốc lịch sử.
6. Thử sai quyền hoặc sai thứ tự; giao diện báo lỗi, dữ liệu sản phẩm không thay đổi.

Các địa chỉ ví demo do Quốc chuẩn bị; không đưa private key hoặc seed phrase vào repo.

## 13. Phạm vi và hạn chế

- Lịch sử chỉ bổ sung, không có hàm sửa/xóa sản phẩm hoặc lịch sử.
- Contract không có danh sách toàn bộ sản phẩm hoặc thành viên; nếu cần danh sách, frontend phải lập chỉ mục từ event hoặc quản lý mã đã biết.
- Dữ liệu on-chain công khai; không nhập thông tin nhạy cảm.
- Bản ghi chứng minh thao tác trên blockchain, không chứng minh chất lượng hay sự tồn tại của hàng thật.
- Admin có quyền cấp/thu hồi vai trò; chưa có cơ chế đa chữ ký hoặc bảo vệ Admin cuối cùng.
- Chưa có xác nhận nhận hàng, thanh toán, hoàn hàng hoặc cơ chế giải quyết tranh chấp.

## 14. Kiểm tra tại máy nhận bàn giao

Chạy tại thư mục gốc sau khi clone/pull:

```powershell
npm.cmd ci
npx.cmd hardhat compile --build-profile default
npx.cmd tsc --noEmit
npx.cmd hardhat test mocha test/SupplyChain.test.ts test/SupplyChain_ver2.test.ts --build-profile default
```


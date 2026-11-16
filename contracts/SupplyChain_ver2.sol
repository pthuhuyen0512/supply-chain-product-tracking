// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Supply chain product tracking
/// @notice Tracks registered participants and a product's on-chain custody history.
/// @dev Records submitted data; it cannot verify physical goods or delivery.
contract SupplyChainV2 is AccessControl {
    // OPTIMIZATION: replace revert strings with parameterless custom errors.
    // On failure, each custom error encodes a four-byte selector instead of
    // an Error(string) payload. This reduces error-handling bytecode and can
    // reduce deployment gas; measured results are recorded in docs/gas/.
    // Keep storage, events, business conditions and validation order unchanged.
    // Compiler optimization stays disabled to isolate this source-code change.
    error InvalidAccount();
    error InvalidRole();
    error EmptyProductId();
    error EmptyName();
    error EmptyOrigin();
    error ProductExists();
    error ProductNotFound();
    error NotCurrentHolder();
    error InvalidReceiver();
    error CannotTransferToSelf();
    error NotDistributor();
    error NotRetailer();
    error NotCustomer();
    error AlreadyDelivered();

    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CUSTOMER_ROLE = keccak256("CUSTOMER_ROLE");

    enum Stage { None, Produced, AtDistributor, AtRetailer, Delivered }

    struct Product {
        string name;
        string origin;
        address currentHolder;
        Stage stage;
        uint64 createdAt;
        bool exists;
    }

    struct Handover {
        address from;
        address to;
        uint64 timestamp;
        Stage stage;
    }

    mapping(bytes32 => Product) private products;
    mapping(bytes32 => Handover[]) private histories;

    // Emitted when a product is created.
    event ProductCreated(
        bytes32 indexed productKey,
        string productId,
        address indexed producer,
        uint64 timestamp
    );

    // Emitted when product custody is transferred.
    event ProductTransferred(
        bytes32 indexed productKey,
        address indexed from,
        address indexed to,
        uint8 stage,
        uint64 timestamp
    );

    /// @dev The deployer administers roles. Admin is not automatically a producer.
    /// Role changes emit AccessControl's RoleGranted / RoleRevoked events.
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Register a participant through the inherited AccessControl API.
    /// @dev Multiple roles per account are allowed; each handover must still
    /// advance exactly one stage and go to a different address.
    function grantRole(bytes32 role, address account)
        public
        override
        onlyRole(getRoleAdmin(role))
    {
        // Use custom errors for role registration; keep address validation unchanged.
        if (account == address(0)) revert InvalidAccount();
        if (!(role == DEFAULT_ADMIN_ROLE || role == PRODUCER_ROLE ||
            role == DISTRIBUTOR_ROLE || role == RETAILER_ROLE ||
            role == CUSTOMER_ROLE)) revert InvalidRole();
        _grantRole(role, account);
    }

    /// @notice Create a unique product and its first history entry.
    /// @dev IDs are case-sensitive and are not trimmed or normalized on-chain.
    function createProduct(
        string calldata productId,
        string calldata name,
        string calldata origin
    ) external onlyRole(PRODUCER_ROLE) {
        // Use custom errors for invalid inputs without relaxing validation.
        if (bytes(productId).length == 0) revert EmptyProductId();
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(origin).length == 0) revert EmptyOrigin();

        bytes32 key = keccak256(bytes(productId));
        if (products[key].exists) revert ProductExists();
        uint64 timestamp = uint64(block.timestamp);

        products[key] = Product({
            name: name,
            origin: origin,
            currentHolder: msg.sender,
            stage: Stage.Produced,
            createdAt: timestamp,
            exists: true
        });
        histories[key].push(
            Handover(address(0), msg.sender, timestamp, Stage.Produced)
        );
        emit ProductCreated(key, productId, msg.sender, timestamp);
    }

    /// @notice Transfer custody to the next registered participant.
    /// @dev Revoked senders must regain the required role before transferring.
    /// Transfers take effect immediately, without receiver confirmation.
    function handoverProduct(string calldata productId, address to) external {
        bytes32 key = keccak256(bytes(productId));
        Product storage product = products[key];
        // Use custom errors for handovers; preserve the original validation order.
        if (!product.exists) revert ProductNotFound();
        if (product.currentHolder != msg.sender) revert NotCurrentHolder();
        if (to == address(0)) revert InvalidReceiver();
        if (to == msg.sender) revert CannotTransferToSelf();

        Stage nextStage;
        if (product.stage == Stage.Produced) {
            _checkRole(PRODUCER_ROLE, msg.sender);
            // OpenZeppelin already uses custom errors in _checkRole; keep it unchanged.
            if (!hasRole(DISTRIBUTOR_ROLE, to)) revert NotDistributor();
            nextStage = Stage.AtDistributor;
        } else if (product.stage == Stage.AtDistributor) {
            _checkRole(DISTRIBUTOR_ROLE, msg.sender);
            if (!hasRole(RETAILER_ROLE, to)) revert NotRetailer();
            nextStage = Stage.AtRetailer;
        } else if (product.stage == Stage.AtRetailer) {
            _checkRole(RETAILER_ROLE, msg.sender);
            if (!hasRole(CUSTOMER_ROLE, to)) revert NotCustomer();
            nextStage = Stage.Delivered;
        } else {
            revert AlreadyDelivered();
        }

        uint64 timestamp = uint64(block.timestamp);
        product.currentHolder = to;
        product.stage = nextStage;
        histories[key].push(Handover(msg.sender, to, timestamp, nextStage));
        emit ProductTransferred(key, msg.sender, to, uint8(nextStage), timestamp);
    }

    /// @notice Read public product data without requiring a registered wallet.
    /// @dev Unknown IDs return a zero-valued Product with exists == false.
    function getProduct(string calldata productId) external view returns (Product memory) {
        return products[keccak256(bytes(productId))];
    }

    /// @notice Read creation followed by all handovers in chronological order.
    /// @dev At most four entries; unknown IDs return an empty array.
    function getHistory(string calldata productId) external view returns (Handover[] memory) {
        return histories[keccak256(bytes(productId))];
    }
}

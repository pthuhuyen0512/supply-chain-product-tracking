// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Supply chain product tracking
/// @notice Tracks registered participants and a product's on-chain custody history.
/// @dev Records submitted data; it cannot verify physical goods or delivery.
contract SupplyChain is AccessControl {
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

    ///Event: tạo sp
    event ProductCreated(
        bytes32 indexed productKey,
        string productId,
        address indexed producer,
        uint64 timestamp
    );

    ///Event: bàn giao sp
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
        require(account != address(0), "Invalid account");
        require(
            role == DEFAULT_ADMIN_ROLE || role == PRODUCER_ROLE ||
            role == DISTRIBUTOR_ROLE || role == RETAILER_ROLE ||
            role == CUSTOMER_ROLE,
            "Invalid role"
        );
        _grantRole(role, account);
    }

    /// @notice Create a unique product and its first history entry.
    /// @dev IDs are case-sensitive and are not trimmed or normalized on-chain.
    function createProduct(
        string calldata productId,
        string calldata name,
        string calldata origin
    ) external onlyRole(PRODUCER_ROLE) {
        require(bytes(productId).length > 0, "Empty product ID");
        require(bytes(name).length > 0, "Empty name");
        require(bytes(origin).length > 0, "Empty origin");

        bytes32 key = keccak256(bytes(productId));
        require(!products[key].exists, "Product exists");
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
        require(product.exists, "Product not found");
        require(product.currentHolder == msg.sender, "Not current holder");
        require(to != address(0), "Invalid receiver");
        require(to != msg.sender, "Cannot transfer to self");

        Stage nextStage;
        if (product.stage == Stage.Produced) {
            _checkRole(PRODUCER_ROLE, msg.sender);
            require(hasRole(DISTRIBUTOR_ROLE, to), "Not distributor");
            nextStage = Stage.AtDistributor;
        } else if (product.stage == Stage.AtDistributor) {
            _checkRole(DISTRIBUTOR_ROLE, msg.sender);
            require(hasRole(RETAILER_ROLE, to), "Not retailer");
            nextStage = Stage.AtRetailer;
        } else if (product.stage == Stage.AtRetailer) {
            _checkRole(RETAILER_ROLE, msg.sender);
            require(hasRole(CUSTOMER_ROLE, to), "Not customer");
            nextStage = Stage.Delivered;
        } else {
            revert("Already delivered");
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

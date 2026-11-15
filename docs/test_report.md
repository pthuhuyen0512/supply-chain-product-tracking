# SupplyChain Smart Contract Test Report

## 1. Objective and scope

This report verifies role-based access control, product creation, sequential custody transfers, and public history retrieval. It also checks that invalid operations revert with the expected errors.

| Item | Description |
| --- | --- |
| Contract | [SupplyChain.sol](../contracts/SupplyChain.sol) |
| Test suite | [SupplyChain.test.ts](../test/SupplyChain.test.ts) |
| Execution evidence | [Raw test log](test_results.txt) |
| Framework | Hardhat 3, Mocha, Chai, ethers v6 |
| Network | Isolated Hardhat simulated blockchain |
| Compiler configuration | Solidity 0.8.34, EVM target Paris, default profile with optimizer disabled |

## 2. Test method

Tests use six accounts: Admin, Producer, Distributor, Retailer, Customer, and an unregistered outsider. Named fixtures deploy the contract and prepare roles or a sample product. Hardhat snapshots restore fixture state between tests to prevent dependencies on earlier test outcomes.

The tests use a sample product with an ID, name, and origin. These values are used only for testing and do not restrict the product type.

Assertions check stored data, role membership, event arguments, and history entries. Controlled block timestamps verify the exact timestamps recorded by the contract. Invalid operations are checked using `revertedWith` or `revertedWithCustomError`, including error arguments where applicable. Selected rejection cases also verify that product data and history remain unchanged.


## 3. Results

The linked log records **27 passing tests** and **no failing tests** ( test_results.txt)

### 3.1 Role registration and Access control

| ID | Test case & expected behavior | Result |
| --- | --- | --- |
| TC1 | Deployer receives Admin, not Producer; role administrators and the initial RoleGranted event are correct | Pass |
| TC2 | Admin grants and revokes Producer; membership and event arguments are correct | Pass |
| TC3 | Admin grants and revokes Distributor; membership and event arguments are correct | Pass |
| TC4 | Admin grants and revokes Retailer; membership and event arguments are correct | Pass |
| TC5 | Admin grants and revokes Customer; membership and event arguments are correct | Pass |
| TC6 | Non-admin cannot grant or revoke roles; existing permissions remain unchanged | Pass |
| TC7 | Granting a role to the zero address or granting an unsupported role is rejected | Pass |

### 3.2 Product creation and Public lookup

| ID | Test case & expected behavior | Result |
| --- | --- | --- |
| TC8 | Producer creates a product with correct fields, ProductCreated arguments, and initial history timestamp | Pass |
| TC9 | Unregistered account and Admin without Producer privileges cannot create products | Pass |
| TC10 | Empty product ID is rejected | Pass |
| TC11 | Empty product name is rejected | Pass |
| TC12 | Empty origin is rejected | Pass |
| TC13 | Duplicate ID is rejected without overwriting the original product or history | Pass |
| TC14 | Unregistered reader receives default product values and an empty history for an unknown ID | Pass |
| TC15 | Transferring one product leaves another product and its history unchanged | Pass |

### 3.3 Custody transfers and History

| ID | Test case & expected behavior | Result |
| --- | --- | --- |
| TC16 | Complete Producer -> Distributor -> Retailer -> Customer flow updates each holder and stage, emits correct events, preserves metadata, and exposes four timestamped history entries to an unregistered reader | Pass |
| TC17 | Transfer of a nonexistent product is rejected | Pass |
| TC18 | Unregistered sender and registered non-holder cannot transfer the product | Pass |
| TC19 | Zero-address recipient and self-transfer are rejected, even when the sender holds multiple roles | Pass |
| TC20 | First handover rejects incorrect or unregistered recipients without changing product data or history | Pass |
| TC21 | Revoked Producer cannot hand over; restoring the role permits transfer | Pass |
| TC22 | Second handover rejects incorrect or unregistered recipients without changing product data or history | Pass |
| TC23 | Revoked Distributor cannot hand over; restoring the role permits transfer | Pass |
| TC24 | Third handover rejects incorrect or unregistered recipients without changing product data or history | Pass |
| TC25 | Revoked Retailer cannot hand over; restoring the role permits transfer | Pass |
| TC26 | Previous holder cannot transfer again after handing over custody | Pass |
| TC27 | Customer cannot transfer after Delivered; final product data and four-entry history remain unchanged | Pass |

## 4. Required revert scenarios

| Scenario | Attempted operation | Expected revert reason | Test | Result |
| --- | --- | --- | --- | --- |
| Unregistered participant attempts a handover | Outsider transfers a product currently held by Producer | `Not current holder` | TC18 | Pass |
| Handover skips the required stage | Producer transfers directly to Retailer while the product is Produced | `Not distributor` | TC20 | Pass |
| Sender no longer holds the product | Producer attempts another transfer after handing custody to Distributor | `Not current holder` | TC26 | Pass |

The unregistered-sender case fails at the current-holder check before role validation. Authorization failures are tested separately in TC6, TC9, TC21, TC23, TC25 using `AccessControlUnauthorizedAccount(account, neededRole)`.

Rejection tests cover empty inputs, duplicate IDs, invalid recipients, revoked roles and transfers after final delivery.

## 5. Requirement coverage and Limitations

| Project requirement | Relevant tests |
| --- | --- |
| Role registration and access control | TC1-TC7 |
| Product creation | TC8-TC13 |
| Sequential handovers | TC16, TC20, TC22, TC24, TC26-TC27 |
| Product and history queries | TC8, TC14-TC16 |
| Events and blockchain timestamps | TC1-TC5, TC8, TC16 |
| 3 require/revert scenarios | TC18, TC20, TC26, additional rejection cases |

The recorded results satisfy the automated testing requirements for the main contract functions and 3 failure scenarios.

This report covers contract tests on the Hardhat simulated network. 
--> Ganache deployment, MetaMask, frontend integration, QR scanning, and gas optimization require separate validation.


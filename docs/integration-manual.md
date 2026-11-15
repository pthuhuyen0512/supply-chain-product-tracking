# Step 08 Manual Integration Acceptance

Use Microsoft Edge at http://127.0.0.1:5173/ and keep the existing Ganache workspace
NOISELESS-MAGIC. Local RPC is http://127.0.0.1:7545 and Chain ID is 1337.
The MetaMask display name Localhost 8545 is only a label for the previously verified
local configuration. Never reset the chain for this test.

Current roles are already granted and verified. Reuse them. The new flow below uses
STEP08-DEMO-001, confirmed unused at block 9. The rejection-only ID is
STEP08-REJECT-001, also confirmed absent. If replaying this guide later, use the
next unused ID from the chain verifier instead of overwriting an existing product.

## A Wallet recovery and rejection checks

1. While connected, click Disconnect from this page. Expect Not connected and
   disabled write buttons. Click Connect MetaMask and verify the selected address
   and roles return. This does not remove your saved accounts from MetaMask.
2. With the site connected, temporarily select a different existing network in
   MetaMask. Expect Wrong network and disabled write controls. Return to the local
   network with Chain ID 1337. Expect Connected and correct role gates. No transaction
   is needed on the other network. Record the wrong-network screen and recovery.
3. Select Producer and connect it to the website. In Create product, enter
   STEP08-REJECT-001, name Da Lat Arabica, origin Da Lat, Vietnam. Click Create
   product, then choose Reject in MetaMask. Expect an English rejection message,
   no transaction hash, restored controls, and a not-found public lookup for that ID.
   Share the rejection result so the agent can independently verify absence on-chain.
4. Still as Producer, attempt Create product using existing ID COFFEE-DEMO-001
   with non-empty name and origin. Expect Product exists before signing. Existing
   product/history must stay unchanged. This is an expected rejection, not a failed
   acceptance run. Capture the message.

## B Fresh full flow

1. As Producer, create the product below and confirm in MetaMask. Expect Produced,
   Producer holder, one history entry. Share the confirmation/hash before continuing
   so the agent can independently check this first milestone.

   | Field | Value |
   | --- | --- |
   | Product ID | STEP08-DEMO-001 |
   | Product name | Da Lat Arabica |
   | Origin | Da Lat, Vietnam |

2. Before a valid transfer, enter this new ID in Hand over product and use Customer
   as recipient. Expect The recipient needs the Distributor role and no signing
   request. Public lookup must still show Produced, Producer and one history entry.
   Record the failure, then replace Customer with Distributor and confirm the valid
   transfer in MetaMask. Expect At distributor and two history entries.
3. While Producer is still selected, check the same ID again. Expect the handover
   button disabled because Producer is no longer the holder. Select Distributor,
   verify its role/address, and transfer to Retailer. Expect At retailer, Retailer
   holder and three history entries.
4. Select Retailer and transfer the same product to Customer. Expect Delivered,
   Customer holder and four history entries.
5. Select Customer and check the same ID. Expect the handover button disabled with
   the already-delivered explanation. Look up the new ID, generate its QR and scan
   it using the camera. Verify the same product/history and automatic camera stop.

   | Recipient | Public wallet address |
   | --- | --- |
   | Distributor | 0x3a9f1bC5DE0dA2d1e04BEbBA2c6B29f09ED0AaB7 |
   | Retailer | 0x3788b00da52305a37DA455B164B0EBf2a937B4Bd |
   | Customer | 0x9CE98Beb9e0Bacb75cD09B2a6A623cD366805Cd3 |

The agent will compare every fresh product event, receipt and block timestamp to
the product/history after each reported milestone. Invalid/preflight cases must
leave those values unchanged; they do not need a forced reverted transaction.
Provide screenshots of results and transaction hashes where available. Only the
result screens are needed; do not include keys or recovery phrases.

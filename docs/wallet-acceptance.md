# Step 06 — MetaMask Acceptance Guide

Status: core acceptance completed through MetaMask in Microsoft Edge on 16 November 2026.
All four roles, product creation and three handovers have successful on-chain receipts;
COFFEE-DEMO-001 is Delivered with four history entries. Invalid handover and account-change
gating were also demonstrated. See `verification/wallet-transactions.md` for evidence and
the distinction between manual and simulated-provider checks. The procedure below remains
as the repeatable demo guide; use a new unused product ID when replaying it.
Use Microsoft Edge or Chrome with the MetaMask extension. Keep Ganache on the existing NOISELESS-MAGIC workspace.
Never paste private keys or a recovery phrase into this website or chat.

## Verified Local Environment

- Website: http://127.0.0.1:5173/
- RPC: http://127.0.0.1:7545
- Chain ID: 1337 (`0x539`)
- Contract: `0x843B273a8c67BcaB604f14fd466162CBdBb556B9`
- The addresses below are public values for this workspace only. Recheck them if the workspace changes.

| Account | Address |
| --- | --- |
| Admin | `0x2FE82257462dc3095D497e6ce446b2ce1Bba25ec` |
| Producer | `0x810A640B6089B12ab3bb7Bde1697752129679828` |
| Distributor | `0x3a9f1bC5DE0dA2d1e04BEbBA2c6B29f09ED0AaB7` |
| Retailer | `0x3788b00da52305a37DA455B164B0EBf2a937B4Bd` |
| Customer | `0x9CE98Beb9e0Bacb75cD09B2a6A623cD366805Cd3` |

## 1. Connect as Admin

Select Admin and the local network in MetaMask. Reload the website, click **Connect MetaMask**,
and approve the connection. Confirm the full address displayed on the page and the **Admin** role.
If MetaMask offers account selection, allow the five demo accounts. If changing to an
account that has not been shared with the site disconnects the page, select that account
and click Connect MetaMask again to approve access explicitly.
The Create product button should remain disabled because Admin is not automatically a Producer.
If the wallet is on another chain, use **Switch to Ganache** and approve the network request.
The page does not automatically request permission after a disconnect.

## 2. Grant Four Roles

Remain on Admin. The first **Grant participant role** form is prefilled for Producer.
Review its address and role, click **Grant role**, and confirm in MetaMask.
Wait until the transaction panel says **confirmed** and displays a hash and gas used.

Repeat for Distributor, Retailer, and Customer using **Use in form** in the local demo checklist.
Each row changes to **Granted on-chain** after receipt confirmation and refresh.
Each operation is a separate wallet confirmation. Record the transaction hashes.

## 3. Create a Product

Select Producer in MetaMask. The website should update its address/roles without using the old signer.
Use the prepared values below, provided the ID is still unused:

| Field | Value |
| --- | --- |
| Product ID | `COFFEE-DEMO-001` |
| Product name | `Da Lat Arabica` |
| Origin | `Da Lat, Vietnam` |

Click **Create product**, review and confirm in MetaMask, and wait for the receipt.
Expected on-chain state: Produced, Producer is the current holder, one history entry.
If the ID already exists, use the unused ID suggested by the checklist and keep that same ID for all handovers.

## 4. Complete the Handovers

In **Hand over product**, enter the same product ID and click **Check holder and stage**.
Before each transaction, select the sender below, enter the recipient's full address from the table,
and review the stage/holder shown on the page. Then confirm **Hand over product** in MetaMask.

| Sender selected in MetaMask | Recipient | Expected stage after confirmation | History length |
| --- | --- | --- | --- |
| Producer | Distributor | At distributor | 2 |
| Distributor | Retailer | At retailer | 3 |
| Retailer | Customer | Delivered | 4 |

On each account change the previous writer is invalidated immediately. Transaction buttons remain
disabled until the new signer and roles are ready. The current holder must retain the required role.
After Delivered, further handovers must be unavailable.

## 5. Negative and Account-Change Checks

- Reject a wallet request deliberately and confirm the page reports the rejection and restores controls.
- With Admin selected, verify that Create product is disabled.
- While Producer holds the product, try handing it directly to Customer. The page should reject the
  recipient's missing Distributor role without broadcasting a transaction. Record this separately
  from a mined contract failure. A contract static-call or gas-estimation revert also counts as a rejection.
- Change the active account and verify the displayed address and role gates update.
- Disconnect this page or remove its account access in MetaMask. All write buttons should disable;
  the website must not repeatedly open new connection requests.

## Read-Only Verification

After each manual milestone, run from the repository root:

```powershell
npm.cmd run verify:demo -- COFFEE-DEMO-001
```

This reads role membership, balances, the product, and its history and writes
`docs/verification/wallet-demo-state.json`. It never signs transactions. RPC state alone
cannot prove that MetaMask was used. Final acceptance requires the user's browser confirmations,
successful receipts, the Delivered state, and the negative/account-change checks.

Public product lookup/timeline and QR/camera are still reserved for step 07.

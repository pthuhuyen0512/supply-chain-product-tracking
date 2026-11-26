# Ganache and Integration Evidence

These files supplement the [shared report](../../DS441A_Team5_Project7_Report.pdf), [contract tests](../testing/test_report.md) and [controlled gas analysis](../gas/gas_report.md). They document the recorded Ganache deployments and web application runs.

## Supporting Reports

| File | Purpose and scope |
| --- | --- |
| [integration_report.pdf](integration_report.pdf) | Quoc's final frontend/deployment report, distinguishing historical V1 acceptance from recorded V2 operation |
| [ganache_comparison.pdf](ganache_comparison.pdf) | Actual V1/V2 transaction gas and fees; account for input, workload and gas-price differences |
| [v1_acceptance.pdf](v1_acceptance.pdf) | Historical V1 integration acceptance, including wallet/QR screenshots and cases not performed; not a V2 acceptance certificate |

## Transaction Snapshots

| Snapshot | Scope | Files |
| --- | --- | --- |
| V1 | Blocks 0-16; 16 successful transactions | [transactions.jsonl](ganache/v1/transactions.jsonl), [summary.json](ganache/v1/summary.json) |
| V2 | Blocks 17-25; 9 successful transactions: deployment, four grants, creation and three handovers | [transactions.jsonl](ganache/v2/transactions.jsonl), [summary.json](ganache/v2/summary.json) |

Each JSONL line describes a transaction and retains its raw transaction/receipt data. The summaries record export scope, counts, validation results, gas and actual fees. Both recorded snapshots had no failed or pending transactions. A rejected operation caught before broadcast requires separate UI evidence rather than appearing as a failed transaction here.

Full snapshot totals have different workloads and must not be treated as a controlled comparison. The frontend compares matched operations in a fixed snapshot. The separate Hardhat experiment keeps equivalent inputs and initial conditions and measures gas units; transaction fees also depend on the effective gas price.

## V2 Screenshots

The [screenshots/v2/](screenshots/v2/) images document role assignment, product creation, handovers, history lookup and QR generation on V2.

| File | Visible evidence |
| --- | --- |
| [01-role-grant-confirmed.png](screenshots/v2/01-role-grant-confirmed.png) | One role grant confirmed at block 18, with transaction hash and gas used; this is not a screenshot listing all four granted roles |
| [02-product-created.png](screenshots/v2/02-product-created.png) | Product COFFEE v2-1 created at block 22, with Producer custody and Produced stage |
| [03-producer-to-distributor.png](screenshots/v2/03-producer-to-distributor.png) | Handover confirmed at block 23; stage At distributor and updated holder |
| [04-distributor-to-retailer.png](screenshots/v2/04-distributor-to-retailer.png) | Handover confirmed at block 24; stage At retailer and updated holder |
| [05-retailer-to-customer.png](screenshots/v2/05-retailer-to-customer.png) | Handover confirmed at block 25; stage Delivered and Customer custody |
| [06-complete-product-history.png](screenshots/v2/06-complete-product-history.png) | Delivered product COFFEE v2-1 and all four ordered history entries with addresses and timestamps |
| [07-qr-code-generated.png](screenshots/v2/07-qr-code-generated.png) | Generated QR for COFFEE v2-1; camera is off, with no completed scan shown |

This seven-image set does not contain a deployment screenshot, a rejected-operation screenshot or proof of a successful physical-camera scan. Those must be recorded separately if used as evidence; none of these filenames claims those outcomes.

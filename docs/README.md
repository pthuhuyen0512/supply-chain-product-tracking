# Submission Documents

The shared report is located at the repository root. This directory contains detailed test results, gas measurements and Ganache integration evidence that support it.

| Deliverable | Main file | Supporting files |
| --- | --- | --- |
| Shared report (4-6 pages): design, contract diagrams, security and gas analysis | [DS441A_Team5_Project7_Report.pdf](../DS441A_Team5_Project7_Report.pdf) | - |
| Automated contract testing | [testing/test_report.md](testing/test_report.md) | [V1 log](testing/test_results.txt), [combined V1/V2 log](testing/test_results_v1_v2.txt) |
| Controlled gas experiment | [gas/gas_report.md](gas/gas_report.md) | [Comparison CSV](gas/gas_analysis.csv), [baseline JSON](gas/before/gas.json), [optimized JSON](gas/after/gas.json) |
| Ganache deployment and web integration | [evidence/README.md](evidence/README.md) | Supporting PDFs, transaction records and V2 screenshots |

## Document Layout

```text
docs/
  README.md
  testing/
    test_report.md
    test_results.txt
    test_results_v1_v2.txt
  gas/
    gas_report.md
    gas_analysis.csv
    before/                    gas.json, measurements.csv, run.txt
    after/                     gas.json, measurements.csv, run.txt
  evidence/
    README.md
    integration_report.pdf
    ganache_comparison.pdf
    v1_acceptance.pdf
    ganache/
      v1/                      transactions.jsonl, summary.json
      v2/                      transactions.jsonl, summary.json
    screenshots/
      v2/                      V2 lifecycle screenshots
```

Source code, tests and reproducible commands are indexed in the [root README](../README.md). The demonstration takes place on Ganache; its setup and lifecycle are documented there. Historical snapshots describe a particular recorded workspace, not the current state of every user's machine.

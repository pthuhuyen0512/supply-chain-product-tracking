# Group Report Inputs and Outstanding Evidence

Reviewed on 16 November 2026 for DS441A Project 7, Team 5.

Quoc's frontend, deployment and integration report section is prepared. The final
4–6-page group report is not complete because the repository does not yet contain
the measured baseline/optimized gas comparison or Huyen's final optimization
explanation and contract/security section. The project planning document says gas
measurement was done, but the actual measurement files were not available in this
checkout. This records missing inputs, not a claim that Huyen has not done the work.

## Available material

| Material | Evidence and use |
| --- | --- |
| Contract and interface | [SupplyChain.sol](../contracts/SupplyChain.sol), [interface](CONTRACT_INTERFACE.md); current code is the technical authority |
| Contract tests | [Test report](test_report.md), [original log](test_results.txt); 27 cases, including invalid operations and role revocation |
| Frontend and integration section | [Quoc report](report-quoc.md); ready to condense into the group report |
| Setup and demonstration | [README](../README.md); local installation, deployment, wallet roles and product flow |
| Automated integration checks | [Command records](verification/integration-checks.json), [browser checks](verification/integration-browser.json) |
| Actual MetaMask and camera acceptance | [Steps 06 and 07 record](reports/step-06-metamask-acceptance.docx), [step 08 record](reports/step-08-integration-acceptance.docx) |
| Baseline receipt observations | [Fresh chain audit](verification/integration-chain-replay.json); supporting gas per recorded transaction, no optimization conclusion |
| Group report structure | [Five-page outline](group-report-outline.md); gas and final contract sections marked awaiting inputs |

No gas-analysis dataset, measurement script, optimized contract source or final
group report was found among the project files reviewed. The existing production
compiler profile alone is not evidence that an optimization was implemented and
measured. No final group PDF has been generated.

## Inputs to request from Huyen

1. **Original gas measurements.** Supply a CSV/table and raw run output or receipts
   for role registration, product creation and all three handovers. Include the
   original measurement script or exact reproducible commands. For public view
   functions, distinguish an eth_call with no transaction fee from a gas estimate
   or a transaction deliberately sent for measurement.
2. **Baseline and optimized versions.** Identify source revisions or files and the
   exact implemented change. State whether the optimization is a Solidity code
   change, a compiler setting change or both; keep each effect distinguishable.
3. **Controlled measurement conditions.** Record Solidity version, optimizer
   enabled/runs, EVM target, Hardhat/Ganache versions, account/role assignments,
   starting storage state and data lengths. Use equivalent transaction inputs and
   the same lifecycle stage on separate equivalent deployments. A first grant and
   a repeat grant are not equivalent: a repeat may perform no storage write or event.
4. **Comparison and calculation.** For each comparable operation, include baseline
   gas, optimized gas, absolute reduction and percentage reduction. Explain any
   increase or zero improvement instead of assuming every row must improve.
5. **One measured optimization explanation.** Explain the mechanism, measured
   benefit, code/config change, tradeoffs and semantic equivalence. Supply the
   correctness test run for the optimized version; state any interface or storage
   impact that would require a new deployment/export.
6. **Final contract and security report section.** Provide the contract diagram,
   role/state/data structure explanation and analysis of access control, input
   checks, revocation, role spoofing, reentrancy relevance and public on-chain data.
   Align it with the current code: a revoked current holder cannot transfer until
   the required role is restored. The two remaining manual wallet recovery cases
   were waived; do not present them as actual MetaMask passes.

## Suggested comparison schema

This is the requested schema, not measured data. No row should be filled from
assumptions or from the UI's gas receipts as if those were optimized measurements.

| Field | Required meaning |
| --- | --- |
| operation and stage | Function and lifecycle stage, including handover number |
| baseline source and profile | Exact source revision, compiler, EVM and optimizer settings |
| optimized source and profile | Exact compared source revision and settings |
| input and initial state | Equivalent fields, roles and starting storage |
| baseline gas and optimized gas | Measured gas units and evidence references |
| gas reduction | baseline gas minus optimized gas; negative values are increases |
| percent reduction | 100 times gas reduction divided by baseline gas, for baseline greater than zero |
| evidence | Script/log or transaction hash, chain and block identifying each result |

The accepted UI run uses default profile, optimizer disabled: creation 146937 gas,
then handovers 87258, 87526 and 87794 gas at blocks 10–13. These figures describe
that specific baseline execution only. They do not prove a before/after saving,
and differing recipient addresses or data lengths can affect comparability.

## Team and submission coordination

- Registered names and IDs are consistent across the existing README and project
  document: Phạm Thu Huyền 29201139715 and Mai Nam Quốc 29211145181, Team 5.
  Both members should check the final cover before submission.
- Local Git history at this review contains eight commits attributed to Huyen;
  Quoc's current frontend/deployment/documentation work is not yet committed by this
  workflow. Both-member Git attribution remains a submission coordination item.
  No commit, push, merge or branch switch has been performed to manufacture it.
- Keep the 12-page step 08 evidence report as an appendix/supporting file. It is
  not the required concise 4–6-page group report. Select a few representative
  images and link the complete evidence rather than inserting every screenshot.
- After the missing inputs arrive, reconcile the narrative and comparison table,
  assemble the five-page outline, check citations/figures and render the final
  report before producing a submission PDF. Clean-copy verification and the
  10-minute demonstration rehearsal are step 10, not completed in step 09.

No messages have been sent to Huyen. Quoc can use this list to request the files.

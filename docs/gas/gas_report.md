# SupplyChain Gas Optimization Report

**Prepared by:** Phạm Thu Huyền

**Student ID:** 29201139715

**Project:** DS441A - Team 5 - Supply Chain Product Tracking

## 1. Objective and Compared Versions

This experiment measures one Solidity optimization: replacing application-defined revert strings with parameterless custom errors. Compiler optimization remains disabled in both versions.

| Version | Source | Contract |
| --- | --- | --- |
| Baseline (V1) | [SupplyChain.sol](../../contracts/SupplyChain.sol) | SupplyChain |
| Optimized (V2) | [SupplyChain_ver2.sol](../../contracts/SupplyChain_ver2.sol) | SupplyChainV2 |

The `before/` directory and CSV fields prefixed with `before` refer to Baseline (V1); `after/` and fields prefixed with `after` refer to Optimized (V2).

V2 preserves the product structures, storage layout, events, function arguments, role checks, validation order, and custody transitions of V1. Only the application-defined error handling is changed.

## 2. Measurement Conditions

| Condition | Both runs |
| --- | --- |
| Solidity | 0.8.34+commit.80d5c536 |
| Compiler EVM target | Paris |
| Build profile | default |
| Compiler optimizer | Disabled |
| Network | A fresh isolated Hardhat simulated blockchain for each run; not Ganache |
| Accounts | Same Admin, Producer, Distributor, Retailer, Customer addresses |
| Initial state | New contract; four first-time participant grants; one new product |
| Product inputs | PRODUCT-001 / Sample Product / Sample Origin |
| Transactions | Deploy, four grants, create product, three handovers |
| Metric | Successful transaction receipt.gasUsed, in gas units |

Both versions use identical inputs, account assignments, and transaction order on separate fresh simulated chains. Gas is taken from transaction receipts rather than estimates or gas limits. The measurements apply to this Hardhat environment; they are not deployment measurements from Ganache.

The [measurement test](../../test/SupplyChain.gas.ts) checks role membership, product fields, custody, lifecycle stage, and history after measured operations. The [comparison script](../../scripts/compare-gas.mjs) validates the recorded measurement conditions and source hashes before generating the comparison CSV.

## 3. Measured Results

| Operation | Baseline (V1) gas | Optimized (V2) gas | Reduction (gas) | Reduction (%) |
| --- | ---: | ---: | ---: | ---: |
| Deploy | 2,503,225 | 2,152,495 | 350,730 | 14.0111 |
| Grant Producer | 52,223 | 52,223 | 0 | 0 |
| Grant Distributor | 52,222 | 52,222 | 0 | 0 |
| Grant Retailer | 52,245 | 52,245 | 0 | 0 |
| Grant Customer | 52,256 | 52,256 | 0 | 0 |
| Create product | 146,865 | 146,865 | 0 | 0 |
| Handover 1: Producer to Distributor | 87,198 | 87,198 | 0 | 0 |
| Handover 2: Distributor to Retailer | 87,478 | 87,478 | 0 | 0 |
| Handover 3: Retailer to Customer | 87,746 | 87,746 | 0 | 0 |

Runtime bytecode decreased from **11,249 to 9,611 bytes**, a reduction of 1,638 bytes.
These values are recorded in the `deployedBytecodeBytes` field of the [Baseline (V1) JSON](before/gas.json) and [Optimized (V2) JSON](after/gas.json), respectively.

```text
gas reduction = before gas - after gas
percentage reduction = 100 * gas reduction / before gas
```

Machine-readable comparison: [gas_analysis.csv](gas_analysis.csv).

### Evidence

- Baseline (V1): [gas.json](before/gas.json), [measurements.csv](before/measurements.csv), [run.txt](before/run.txt).
- Optimized (V2): [gas.json](after/gas.json), [measurements.csv](after/measurements.csv), [run.txt](after/run.txt).
- Correctness: [combined V1/V2 test output](../testing/test_results_v1_v2.txt).

Each gas.json records compiler settings, source identification, accounts, transaction hashes, block numbers, and gas usage. The CSV and run.txt files provide tabular measurements and receipt summaries.

## 4. Explanation and Tradeoffs

V1 uses require statements with strings such as `"Product exists"`. V2 uses `if (condition) revert ProductExists()`. A parameterless custom error encodes a four-byte selector instead of the standard Error(string) payload with its string data. This avoids the larger string-error handling code and reduces deployed bytecode.

The observed benefit is **350,730 gas saved on deployment (approximately 14.01%)**. All eight measured successful application transactions used exactly the same gas as V1. Their storage operations, events and successful execution rules did not change. This is a deployment-cost optimization; the results do not demonstrate a reduction in routine transfer costs.

These results apply to the default build profile with the compiler optimizer disabled. Savings with the optimizer enabled were not measured and may differ.

Reverted transaction gas was not measured. No percentage saving for failures is claimed. Existing OpenZeppelin AccessControl errors were already custom errors and remain unchanged.

The tradeoff is a change to the error ABI: clients must decode the new custom errors instead of relying on V1's revert strings. Successful function signatures and events remain compatible.

## 5. Correctness Verification

The Baseline (V1) and Optimized (V2) suites each passed the same 27 behavior scenarios: **54 passing tests in total**. V2 tests check the corresponding custom errors while retaining the original behavior scenarios. The detailed results are documented in the [test report](../testing/test_report.md).

The scenarios cover grants/revocations, empty inputs, duplicates, wrong custody, skipped stages, invalid recipients, revoked senders, terminal delivery, events, and timestamped history. The results support preservation of the tested business rules after optimization.

## 6. Reproduction

Run the following commands from the repository root to reproduce the measurements. Each measurement command replaces the corresponding before/after output files.

```powershell
# Verify both contracts using the same compiler profile.
npx.cmd hardhat compile --build-profile default
npx.cmd tsc --noEmit
npx.cmd hardhat test mocha test/SupplyChain.test.ts test/SupplyChain_ver2.test.ts --build-profile default

# Measure Baseline (V1) on a fresh simulated chain.
$env:GAS_VERSION = "before"
npx.cmd hardhat test mocha test/SupplyChain.gas.ts --build-profile default

# Measure Optimized (V2) on another fresh simulated chain.
$env:GAS_VERSION = "after"
npx.cmd hardhat test mocha test/SupplyChain.gas.ts --build-profile default

# Check comparability and regenerate the CSV.
node scripts/compare-gas.mjs
Remove-Item Env:GAS_VERSION
```

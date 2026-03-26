# Case Context and Setup

## 2.1 Objective

The objective is to document the operating setup of one SYMM LP deployment and define the context needed to interpret performance metrics in `03-Performance-and-Unit-Economics.md`.

This section focuses on setup only, not outcome interpretation.

## 2.2 Test Case Scope

This paper tracks one test case:

- participant: LafaChief
- deposited inventory: `2,271,131` SYMM tokens (across 3 deposits)
- current token balance: `2,501,328.4` SYMM
- token delta: `+230,197.4` SYMM (`+10.14%`)
- average deposit reference price: `$0.01280`
- current reference price used in this paper: `$0.0074`

Exact deposit transactions:

| txid | date | token | amount |
|---|---|---|---:|
| `0x02ac33dfaebfd2f07ff35e4202753bdab5825702431200a4dae6c59b3bd075f5` | `24/01/2026 12:09:07` | `SYMM` | `620,000` |
| `0x95466e0f334de737971012765849ce5eb0c1965ea3c8967fc8d95d9772fb8e06` | `06/01/2026 08:12:41` | `SYMM` | `825,925` |
| `0xaef807a86785d9cf9e670f04dcf52f8bd02bf4fc7187aacd747bf87d4b9b2fe5` | `29/12/2025 11:49:29` | `SYMM` | `825,206` |

## 2.3 Market Context

From transcript and dashboard evidence:

- launch phase began late December;
- market is SYMM;
- profile is long-tail relative to major assets;
- positioning was heavily long-biased.

## 2.4 Setup Objective (Operational)

The LP setup is designed to:

- bootstrap perp market liquidity,
- hedge existing token exposure,
- convert market activity into USDC-denominated returns.

## 2.5 Mechanism Design Framing

The case frames the LP role as **bootstrap collateral**:

- early phase: LP collateral helps initialize perp market bootstrapping;
- mature phase: when two-sided trader flow increases, trader-vs-trader netting grows;
- LP still participates in revenue flows even when collateral usage intensity declines.

## 2.6 Economic Channels in Scope

Four income channels are explicitly described:

1. trader directional losses (in long-skew + down-price regime),
2. funding transfers from persistent long positioning,
3. trading fees from activity,
4. liquidation-related cashflows.

## 2.7 Data Cut (Dashboard State)

At the provided data cut (`20:48:23`), the dashboard indicates:

- **User Profit:** `-5,816.45`
- **Current Debt:** `-5,895.90`
- **Current UPnL:** `-7,999.32`
- **Total OI:** `3,393,754.98`
- **Long OI:** `3,341,281.71`
- **Short OI:** `52,473.28`
- **Open Interest Quantity:** `3,470,667.340516`
- **Open positions:** `289`
- **Long utilization:** `131.48%`
- **Short utilization:** `0.00%`

These values establish the operating state used by the performance section. Full metric definitions are documented in `07-Data-Snapshot-and-Metric-Definitions.md`.


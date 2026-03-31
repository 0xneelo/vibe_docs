# Performance and Unit Economics

## 3.1 Concrete Performance Metrics (Three Deposits)

Inputs used for this performance view:

- deposited tokens (sum of txs): `2,271,131` SYMM
- current token balance: `2,501,328.4` SYMM
- token gain: `+230,197.4` SYMM (`+10.14%`)
- average deposit SYMM price: `$0.01280`
- current SYMM price: `$0.0074`

USDC PnL components:

- realized LP profit: `$5,895.90`
- unrealized LP profit: `$7,999.32`
- combined realized + unrealized: `$13,895.22`

Implied USDC return levels on deposit-time notional (`$29,070.4768`):

- realized return: `5,895.90 / 29,070.4768 = 20.28%`
- unrealized return: `7,999.32 / 29,070.4768 = 27.52%`
- combined return: `13,895.22 / 29,070.4768 = 47.80%`

Token-side valuation references:

- deposited-token value at entry: `2,271,131 * 0.01280 = $29,070.4768`
- deposited-token value at current reference: `2,271,131 * 0.0074 = $16,806.3694`
- current-token value at current reference: `2,501,328.4 * 0.0074 = $18,509.83016`
- token gain valued at current reference: `230,197.4 * 0.0074 = $1,703.46076`

Reported average yield metrics:

- average USDC yield per day: `0.88%`
- average USDC yield per year: `319.87%`
- average token yield per day: `0.15%`
- average token yield per year: `55.46%`

## 3.2 Methodology

Daily yields are computed from averaged per-day profit and active token notional, then averaged over the analysis window and annualized.

- `tokenYield_day = avgTokenProfitPerDay / tokenAmountThatDay`
- `usdcYield_day = avgUsdcProfitPerDay / activeUsdNotionalThatDay`
- `avgYield_day = mean(yield_day over analysis window)`
- `avgYield_year = avgYield_day * 365`

Window assumptions used in this paper:

- analysis window starts at first deposit (`29/12/2025`) and ends at the referenced dashboard snapshot (`20:48:23` data cut);
- the daily yield series uses the same case-study source set documented in `07-Data-Snapshot-and-Metric-Definitions.md`;
- annualization uses a simple 365-day multiplier (no compounding adjustment).

## 3.3 Benchmark Comparison

Benchmarks are evaluated on the same starting capital (`moneyIN = $29,070.48`) using three scenarios.

| Scenario | moneyIN | tokenNow | tokenValNow | usdcNow | tokenPnL | totalFunds |
|---|---:|---:|---:|---:|---:|---:|
| Bench1 - Full Hold | `29,070.48` | `2,271,131.00` | `16,806.37` | `0.00` | `-12,264.11` | `16,806.37` |
| Bench2 - Vibe deposit | `29,070.48` | `2,501,328.40` | `18,509.83` | `13,895.22` | `-10,560.65` | `32,405.05` |
| Bench3 - Full Sell (USDC hold baseline) | `29,070.48` | `2,271,131.00` | `0.00` | `29,070.48` | `-29,070.48` | `29,070.48` |

Portfolio-level returns from `totalFunds`:

- Bench1 (Full Hold): `16,806.37 / 29,070.48 - 1 = -42.19%`
- Bench2 (Vibe deposit): `32,405.05 / 29,070.48 - 1 = +11.47%`
- Bench3 (Full Sell): `29,070.48 / 29,070.48 - 1 = 0.00%`

Vibe deposit (Bench2) spread vs alternatives:

- vs Full Hold: `32,405.05 - 16,806.37 = +15,598.68` (`+53.66pp` return spread)
- vs Full Sell: `32,405.05 - 29,070.48 = +3,334.57` (`+11.47pp` return spread)

Interpretation:

- this framing separates token mark-to-market (`tokenPnL`) from cash earned (`usdcNow`) and compares end-of-period total wealth directly;
- in this window, Vibe deposit outperforms both passive holding and immediate full-sell baselines;
- the excess over Full Hold is regime-sensitive (long crowding + down move), so it should not be treated as a constant edge.

## 3.4 Volume Context and Driver Analysis

Reported volume context for this case:

- estimated total trading volume over the period: `~$100,000`
- estimated average daily volume: `~$1,000`

Interpretation:

- the observed LP profit was not dependent on high market turnover;
- the primary return driver was directional imbalance and user-side losses, with funding support;
- this indicates LP economics can remain attractive even when token volume is low.

Forward implication:

- in markets with higher fluctuation and higher open/close activity, fee revenue can stack on top of the same funding and user-PnL channels.

## 3.5 Metric Sign Convention (Critical)

Per your protocol accounting definitions:

- **Current Debt** is user debt to LP that is already realized.
- **Current UPnL** is users' current unrealized PnL.
- If either field is **negative**, that means the **LP is in profit** on that component.

Operationally:

- `LP realized component ~= - Current Debt`
- `LP unrealized component ~= - Current UPnL`

Example from the provided screenshot:

- `Current Debt = -5,895.90` -> LP has about `$5,895.90` realized user debt in its favor.
- `Current UPnL = -7,999.32` -> LP has about `$7,999.32` unrealized edge at that mark.

`Current Debt` is realized and withdrawable for the LP, while `Current UPnL` remains mark-to-market and is not guaranteed as immediately withdrawable cash.

## 3.6 Revenue Attribution (Qualitative)

The narrative states that the dominant share of LP revenue came from trader-side losses in a long-skew/down-price regime, with additional contribution from funding, fees, and liquidations.

Interpretation:

- this indicates a strong directional imbalance regime;
- strategy sensitivity to crowding direction is high;
- persistence of this split is uncertain across regimes.

## 3.7 Measurement Gaps to Close

A production-grade case study should add:

- vault-level time series of NAV and PnL attribution,
- realized vs unrealized split by day/week,
- max drawdown and drawdown duration,
- gross-to-net bridge (funding, fees, liquidations, slippage),
- benchmark comparison updates across multiple market regimes.

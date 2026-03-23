# Performance and Unit Economics

## 3.1 Concrete Performance Metrics (Three Deposits)

Inputs used for this performance view:

- deposited tokens (sum of txs): `2,271,131` SYMM
- current token balance: `2,501,328.4` SYMM
- token gain: `+230,197.4` SYMM (`+10.14%`)
- average deposit SYMM price: `$0.01280`
- current SYMM price: `$0.007`

USDC PnL components:

- realized LP profit: `$5,895.90`
- unrealized LP profit: `$7,999.32`
- combined realized + unrealized: `$13,895.22`

Implied USDC return levels on deposit-time notional (`$29,089.967`):

- realized return: `5,895.90 / 29,089.967 = 20.27%`
- unrealized return: `7,999.32 / 29,089.967 = 27.50%`
- combined return: `13,895.22 / 29,089.967 = 47.77%`

Token-side valuation references:

- deposited-token value at entry: `2,271,131 * 0.01280 = $29,089.967`
- current-token value at current reference: `2,501,328.4 * 0.007 = $17,509.2988`
- token gain valued at current reference: `230,197.4 * 0.007 = $1,611.3818`

Reported average yield metrics:

- average USDC yield per day: `0.88%`
- average USDC yield per year: `319.87%`
- average token yield per day: `0.15%`
- average token yield per year: `55.46%`

## 3.2 Volume Context and Driver Analysis

Reported volume context for this case:

- estimated total trading volume over the period: `~$100,000`
- estimated average daily volume: `~$1,000`

Interpretation:

- the observed LP profit was not dependent on high market turnover;
- the primary return driver was directional imbalance and user-side losses, with funding support;
- this indicates LP economics can remain attractive even when token volume is low.

Forward implication:

- in markets with higher fluctuation and higher open/close activity, fee revenue can stack on top of the same funding and user-PnL channels.

## 3.3 Metric Sign Convention (Critical)

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

## 3.4 Revenue Attribution (Qualitative)

The narrative states that the dominant share of LP revenue came from trader-side losses in a long-skew/down-price regime, with additional contribution from funding, fees, and liquidations.

Interpretation:

- this indicates a strong directional imbalance regime;
- strategy sensitivity to crowding direction is high;
- persistence of this split is uncertain across regimes.

## 3.5 Measurement Gaps to Close

A production-grade case study should add:

- vault-level time series of NAV and PnL attribution,
- realized vs unrealized split by day/week,
- max drawdown and drawdown duration,
- gross-to-net bridge (funding, fees, liquidations, slippage),
- benchmark comparison vs passive token hold and stablecoin hold.

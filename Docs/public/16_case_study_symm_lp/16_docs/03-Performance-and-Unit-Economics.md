# Performance and Unit Economics

## 3.1 Concrete Performance Metrics (Single Deposit)

Inputs used for this performance view:

- deposited tokens: `2.501.328,4` SYMM (LafaChief, SYMM LP)
- deposit-time SYMM price: `$0.01`
- current SYMM price: `$0.007`

PnL components:

- realized LP profit: `$5,895.90`
- unrealized LP profit: `$7,999.32`
- combined realized + unrealized: `$13,895.22`

Implied return levels on deposit-time notional (`$25,013.284`):

- realized return: `5,895.90 / 25,013.284 = 23.57%`
- unrealized return: `7,999.32 / 25,013.284 = 31.98%`
- combined return: `13,895.22 / 25,013.284 = 55.55%`

Token-notional reference at current SYMM price:

- `2,501,328.4 * 0.007 = $17,509.2988`

## 3.2 Metric Sign Convention (Critical)

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

## 3.3 Revenue Attribution (Qualitative)

The narrative states that the dominant share of LP revenue came from trader-side losses in a long-skew/down-price regime, with additional contribution from funding, fees, and liquidations.

Interpretation:

- this indicates a strong directional imbalance regime;
- strategy sensitivity to crowding direction is high;
- persistence of this split is uncertain across regimes.

## 3.4 Measurement Gaps to Close

A production-grade case study should add:

- vault-level time series of NAV and PnL attribution,
- realized vs unrealized split by day/week,
- max drawdown and drawdown duration,
- gross-to-net bridge (funding, fees, liquidations, slippage),
- benchmark comparison vs passive token hold and stablecoin hold.

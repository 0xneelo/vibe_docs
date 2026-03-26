# Executive Summary

## What Happened

This case tracks one SYMM LP deployment on Vibe by LafaChief. The market regime was strongly long-biased while token price declined, which created LP-favorable conditions.

## Headline Results

- **Deposited tokens (sum of txs):** `2,271,131` SYMM.
- **Current token balance:** `2,501,328.4` SYMM.
- **Token gain:** `+230,197.4` SYMM (`+10.14%` vs deposited tokens).
- **Average deposit price:** `$0.01280` per token.
- **Current price reference:** `$0.0074` per token.
- **Realized LP profit (`Current Debt`):** `$5,895.90` (withdrawable).
- **Unrealized LP profit (`Current UPnL`):** `$7,999.32` (mark-to-market).
- **Token-side outcome:** no token loss; token count increased.

- **Notional deposit at entry:** `$29,070.4768`
- **Total PnL (realized + unrealized):** `$13,895.22`
- **Average USDC yield per day:** `0.88%`
- **Average USDC yield per year:** `319.87%`
- **Average token yield per day:** `0.15%`
- **Average token yield per year:** `55.46%`
- **Estimated total trading volume (period):** `~$100,000`
- **Estimated average volume per day:** `~$1,000`
- **Benchmark A (passive SYMM hold):** `-42.19%` (`-$12,264.1074`)
- **Benchmark B (passive USDC hold):** `0%` (`$0`)
- **LP combined spread vs benchmarks:** `+$26,159.33` vs passive SYMM and `+$13,895.22` vs passive USDC

### Exact Deposit Transactions

| txid | date | TOKEN | AMOUNT |
|---|---|---|---:|
| `0x02ac33dfaebfd2f07ff35e4202753bdab5825702431200a4dae6c59b3bd075f5` | `24/01/2026 12:09:07` | `SYMM` | `620,000` |
| `0x95466e0f334de737971012765849ce5eb0c1965ea3c8967fc8d95d9772fb8e06` | `06/01/2026 08:12:41` | `SYMM` | `825,925` |
| `0xaef807a86785d9cf9e670f04dcf52f8bd02bf4fc7187aacd747bf87d4b9b2fe5` | `29/12/2025 11:49:29` | `SYMM` | `825,206` |


## Interpretation

These are concrete point-in-time results from one case and one regime. They show strong potential for treasury/holder collateral deployment on Vibe, but they are not a guaranteed steady-state yield.

An important signal in this case is that the outcomes were achieved in a low-volume environment. The core driver was directional crowding (many users chose one side and were wrong), not high churn from frequent opening/closing of positions. In higher-volume, higher-fluctuation markets, fee revenue can add on top of funding and user PnL transfer dynamics.

## Why It Matters

The strategic claim is that Vibe enables communities to bootstrap derivatives markets where:

- the team/whales/holders can contribute inventory as bootstrap LP capital,
- users can express directional views via perps,
- team/whales/holders can partially hedge downside while retaining most of their core token stack.

## Main Caveats

- this is a single-case study;
- sample period is favorable for LP outcomes;
- unrealized PnL is path-dependent and can reverse;
- results depend on position skew, leverage, and user trading behavior.

## Bottom Line

This is a strong **proof-of-possibility** case for bootstrap LP economics in a long-skew down market regime.

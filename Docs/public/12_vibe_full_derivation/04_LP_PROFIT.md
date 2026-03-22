# 04. LP Profit Decomposition

## Overview

LP/vault profit is the core quantity we want to maximize, subject to risk constraints. This section provides the complete decomposition of LP profit into its constituent parts.

---

## The Master Formula

For market `m` over period `[t₀, t₁]`:

```
Π_m = Rev_m − Cost_m − α·Π_m_traders + Π_m_hedge − L_m_shortfall
```

Where:
- `Rev_m` = total revenue from all sources
- `Cost_m` = total costs
- `α` = counterparty share (Phase 1: ~1, Phase 2: ~0)
- `Π_m_traders` = aggregate trader PnL (positive = traders win)
- `Π_m_hedge` = solver hedge PnL
- `L_m_shortfall` = bad debt / liquidation shortfall

**Global LP Profit:**

```
Π_global = Σ_m Π_m
```

---

## Revenue Decomposition

```
Rev_m = F_trade + F_spread + F_fund + F_liq + F_mm + F_borrow
```

### Component Breakdown

| Component | Symbol | Source | Typical Range |
|-----------|--------|--------|---------------|
| Trading Fees | `F_trade` | Taker/maker fees on trades | 0.05-0.10% per trade |
| Spread Revenue | `F_spread` | Bid-ask spread capture | 0.02-0.50% per trade |
| Funding Revenue | `F_fund` | Net funding received | Variable (can be negative) |
| Liquidation Fees | `F_liq` | Liquidation penalties | 0.5-2% of liquidated position |
| Maintenance Margin | `F_mm` | MM fees/penalties | Variable |
| Borrow Revenue | `F_borrow` | Charges for borrowed capital | APR-based |

### Dynamic Revenue (Depends on Pricing Controls)

When using dynamic pricing multipliers:

```
F_spread(t) = κ_s(t) · F̂_spread(t)
F_fund(t) = κ_f(t) · F̂_fund(t)
F_borrow(t) = κ_b(t) · F̂_borrow(t)
```

Where:
- `F̂` = baseline revenue at normal parameters
- `κ` = dynamic multiplier (≥ 1)

---

## Cost Decomposition

```
Cost_m = C_hedge + C_borrow_ext + C_ops
```

| Component | Symbol | Source |
|-----------|--------|--------|
| Hedge Cost | `C_hedge` | Cost of hedging exposure externally |
| External Borrow | `C_borrow_ext` | Financing costs (USDC sourcing, etc.) |
| Operations | `C_ops` | Gas, oracle, infrastructure |

---

## Trader PnL Term

### Definition

```
Π_m_traders = Σ_i PnL_i
```

Sum of all individual trader profits/losses in market `m`.

### Decomposition

```
Π_m_traders = W_m − L_m_users
```

Where:
- `W_m = max(Π_m_traders, 0)` = trader winnings (LP pays out)
- `L_m_users = max(−Π_m_traders, 0)` = trader losses (LP receives)

### Phase Toggle

The `α` parameter controls how much LP absorbs trader PnL:

| Phase | α Value | LP Exposure to Trader PnL |
|-------|---------|---------------------------|
| Phase 1 (Bootstrap) | ~1.0 | LP is full counterparty |
| Phase 2 (Mature) | ~0.0 | Traders offset each other |
| Transition | 0.3-0.7 | Partial exposure |

**Rewriting with α:**

```
Π_m = F_m − C_m − α·Π_m_traders + Π_m_hedge − L_m_shortfall
```

Where `F_m = Rev_m` for brevity.

---

## LP Loss Pressure Signal

### Definition

The "LP loss pressure" measures when trader winnings exceed available revenue:

```
ℓ_m_LP = max(0, W_m − (Rev_m + L_m_users))
```

**Interpretation:**
- If `ℓ_m_LP > 0`: LP is paying out beyond what it collected
- This is a key input to the local risk function

### Expanded Form

```
ℓ_m_LP = max(0, W_m − (F_trade + F_spread + F_fund + F_liq + F_mm + F_borrow + L_m_users))
```

---

## Comparison: Uniswap vs Vibe LP Profit

### Uniswap v2 (Spot AMM)

```
LP_PnL_uni = Fees + IL(R)

where:
  IL(R) = 2√R / (1 + R) − 1  ≤ 0 for R ≠ 1
  R = P_new / P_deposit
```

- Price-only dependency
- IL is mathematically inevitable
- Path-independent loss

### Vibe (Semi-AMM for Perps)

```
LP_PnL_vibe = Fees + Funding + Liquidations − Trader_PnL

where:
  E[Trader_PnL] < 0  (historically)
  ⟹ E[LP_PnL] > 0
```

- Depends on trader performance, not raw price
- No IL equivalent (different risk profile)
- Positive expectation if traders lose on average

---

## Insurance Fund Inflows

### Local Insurance Fund

Receives:
1. 100% of liquidation profits from this market
2. 30% of solver profits from this market

```
ΔI_loc = F_liq + 0.30 · max(0, Π_m_solver)
```

### Global Insurance Fund

Receives:
1. Portion of system-wide profits
2. Taxes from "bell curve flattening" (winner markets)

```
ΔI_glob = Σ_m tax_m
```

---

## Buyback Allocation

When profit is positive, portion goes to buybacks:

```
B_m = γ · max(0, Π_m)
```

Where:
- `γ ∈ [0, 1]` = buyback fraction
- `γ = 1` for "perpetual bid" mode (100% buyback)

**Tokens bought:**

```
Q_m = B_m / P_spot
```

### Liquidation-Only Buyback

If buybacks are only from liquidation profits:

```
B_m_liq = γ_liq · F_liq,   γ_liq = 1
```

---

## The Vibe Invariant (Revisited)

**Key Statement:**

> No trader loss event requires selling the base token into the spot market.

**Why this holds:**
1. Positions are OTC-settled at solver-quoted prices
2. Liquidations are cash-settled, not inventory-settled
3. Losses become protocol revenue (USDC)
4. Revenue can fund buybacks (token purchases)

**Result:**

```
Trader losses → Buy pressure, not sell pressure
```

This is **anti-cyclical** by construction.

---

## Complete Formula with All Terms

```
Π_m_LP = (F_trade + F_spread + F_fund + F_liq + F_mm + F_borrow)
         − (C_hedge + C_borrow_ext + C_ops)
         − α · Π_m_traders
         + Π_m_hedge
         − L_m_shortfall
```

**Simplified:**

```
Π_m = Rev_m − Cost_m − α·Π_traders + Π_hedge − L_shortfall
```

**Global:**

```
Π_global = Σ_m Π_m
```

---

## Event-by-Event Impact Matrix

| Event | Token Effect | LP Role (Phase 1) | LP Role (Phase 2) |
|-------|--------------|-------------------|-------------------|
| Trader opens position | ↑ (+fees) | Receives fees | Receives fees |
| Trader holds position | ↑ (+funding, +borrow) | Receives funding & borrow | Receives borrow only |
| Trader loses | ↑ (+PnL transfer) | Receives losses → buybacks | Traders settle each other |
| Trader wins | ↓ (−PnL payout) | Pays winnings | Traders settle each other |
| Liquidation | ↑↑ (+seized collateral) | Receives collateral | Receives collateral |

---

*Next: [05. Dynamic Pricing](05_DYNAMIC_PRICING.md)*

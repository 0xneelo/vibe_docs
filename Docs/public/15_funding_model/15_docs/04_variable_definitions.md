# 04. Variable Definitions

## Per-Market State Variables

For a market `m` at time `t`:

### Inventory / Balances

| Variable | Symbol | Formula | Description |
|----------|--------|---------|-------------|
| Initial Token Deposit | `T₀` | `initialTokenDeposit` | Total tokens deposited by LP |
| Total USDC Held | `U` | `totalUSDCHeld` | All USDC (includes insurance, sales, profits) |
| Token Price | `P` | `tokenPrice` | Current spot/mark price |
| Covered Amount (USDC) | `C_usd` | `coveredAmount` | USDC notional covered by token holdings |
| Covered Amount (tokens) | `C_tok` | `C_usd / P` | Token equivalent |
| Remaining Tokens | `T_rem` | `remainingTokens` | Token holdings − covered locked amount |
| Obtainable Tokens | `T_ob` | `currentObtainableTokens` | Max tokens buyable with profits |
| Absolute Tokens | `T_abs` | `C_tok + T_ob` | Total token capacity |

### Open Interest (USDC Notional)

| Variable | Symbol | Formula | Description |
|----------|--------|---------|-------------|
| Total Long OI | `L` | `totalLongExposure` | All long positions (USDC notional) |
| Total Short OI | `S` | `totalShortExposure` | All short positions (USDC notional) |
| Netted Amount | `N` | `min(L, S)` | Positions that cancel each other |
| Solver Exposure | `E_usd` | `|L − S|` | Un-netted exposure (USDC notional) |
| Exposure (tokens) | `E_tok` | `E_usd / P` | Exposure in token units |
| Exposure Direction | `dir` | `LONG if L > S else SHORT` | Which side solver is exposed to |

### Utilization Metrics

| Variable | Symbol | Formula | Description |
|----------|--------|---------|-------------|
| Utilization | `u` | `E_usd / C_usd` | Solver exposure / covered amount |
| Absolute Utilization | `u_abs` | `E_usd / (P · T_abs)` | Including obtainable tokens |
| Theoretical Overexposure | `OE` | `(L + S) / (P · T_abs)` | Total OI / absolute token capacity |
| Max Overexposure | `OE_max` | `maxOverExposure` | Configurable limit |

### Skew / Imbalance

| Variable | Symbol | Formula | Description |
|----------|--------|---------|-------------|
| Skew | `skew` | `(L − S) / (L + S)` | Range: `[-1, 1]` |
| Non-Covered Exposure | `NCE` | `max(0, E_usd − C_usd)` | Exposure beyond token coverage |
| Non-Covered Ratio | `NCR` | `NCE / C_usd` | As percentage of covered |

---

## Insurance & Safety Variables

| Variable | Symbol | Formula | Description |
|----------|--------|---------|-------------|
| Local Insurance Fund | `I_loc` | `insuranceFundLocal` | Per-market fund from liquidations |
| Global Insurance (this market) | `I_m_glob` | `insuranceFundGlobalOnThisMarket` | Allocated global fund |
| Max Local Spend/Period | `B_m_loc` | — | Cap on local insurance spend |
| Max Global Spend/Period | `B_m_glob` | — | Cap on global insurance spend |
| Total Defense Budget | `B_m_def` | `B_m_loc + B_m_glob` | Combined spend cap |

---

## Risk & Volatility Variables

| Variable | Symbol | Formula | Description |
|----------|--------|---------|-------------|
| Volatility | `σ` | `volatility` | 30d price deviation / returns std dev |
| Profit Deviation | `dev` | `profitDeviation` | How far from target profit |
| Market Max Pump | `M_pump` | `1 + marketMaxPump` | Max price multiplier before pump stops |
| Avg User Max Pump | `U_pump` | `1 + avgAllUserMaxPump` | When users would close (aggregate) |
| Max Market Drawdown | `DD_mkt` | `maxMarketDrawdown` | Max % to sell on short opening |
| Max Deposit Drawdown | `DD_dep` | `maxDepositDrawdown` | Max % of deposited tokens to sell |

---

## Aenigma: The ADL Exposure Threshold

**Definition:**

```
A := aenigma = max(M_pump, U_pump, D)
```

Where:
- `M_pump = 1 + marketMaxPump` (e.g., 500% → 6.0)
- `U_pump = 1 + avgAllUserMaxPump` (e.g., 400% → 5.0)
- `D = 1 + max(DD_mkt, DD_dep)` (e.g., 40% → 1.4)

**Interpretation:**

Aenigma is the worst-case multiplier of exposure before positions are assumed to unwind. It tells us exactly at which point we are fully exposed, as our tokens are not enough to cover positions.

**Example Values:**

| Scenario | M_pump | U_pump | D | A |
|----------|--------|--------|---|---|
| Conservative | 3.0 | 2.5 | 1.3 | 3.0 |
| Moderate | 6.0 | 5.0 | 1.4 | 6.0 |
| Aggressive | 11.0 | 10.0 | 1.5 | 11.0 |

---

## Dynamic Pricing Variables

| Variable | Symbol | Description |
|----------|--------|-------------|
| Base Borrow Rate | `b₀` | Normal borrow rate (paid to LP/solver) |
| Base Funding Rate | `f₀` | Normal funding rate (between sides) |
| Base Spread | `s₀` | Normal trading spread |
| Dynamic Borrow | `b(·)` | Adjusted borrow rate |
| Dynamic Funding | `f(·)` | Adjusted funding rate |
| Dynamic Spread | `s(·)` | Adjusted spread |
| Borrow Multiplier | `κ_b` | `b / b₀` |
| Funding Multiplier | `κ_f` | `f / f₀` |
| Spread Multiplier | `κ_s` | `s / s₀` |

---

## Revenue & Cost Variables

| Variable | Symbol | Description |
|----------|--------|-------------|
| Trading Fees | `F_trade` | Taker/maker fees |
| Spread Revenue | `F_spread` | From bid-ask spread |
| Funding Revenue | `F_fund` | Net funding received |
| Liquidation Fees | `F_liq` | Liquidation penalties |
| Maintenance Margin Fees | `F_mm` | MM fees/penalties |
| Borrow Revenue | `F_borrow` | From borrow charges |
| Total Revenue | `Rev` | Sum of all above |
| Hedge Cost | `C_hedge` | Cost of hedging exposure |
| External Borrow Cost | `C_borrow_ext` | External financing |
| Shortfall/Bad Debt | `L_shortfall` | Unrecovered liquidation loss |
| Trader PnL | `Π_traders` | Aggregate trader profit (+ = they win) |
| LP/Vault Profit | `Π_m` | Per-market profit |

---

## Control Variables (What the System Chooses)

| Variable | Symbol | Range | Description |
|----------|--------|-------|-------------|
| Local Insurance Spend | `x_m_loc` | `[0, B_m_loc]` | Insurance spent this period (local) |
| Global Insurance Spend | `x_m_glob` | `[0, B_m_glob]` | Insurance spent this period (global) |
| Total Insurance Spend | `x_m` | `x_m_loc + x_m_glob` | Combined spend |
| Hedge Action | `h_m` | — | Exposure-reducing trade (tokens) |
| ADL Action | `a_m` | `[0, 1]` | Fraction of exposure to ADL |

---

## Phase Parameter

| Variable | Symbol | Range | Description |
|----------|--------|-------|-------------|
| Counterparty Share | `α` | `[0, 1]` | How much LP is counterparty |

**Phase 1:** `α ≈ 1` — LP/solver is the counterparty
**Phase 2:** `α ≈ 0` — Traders mostly offset each other

---

## Computed Risk Signals (Inputs to Risk Function)

| Signal | Symbol | Formula | When High |
|--------|--------|---------|-----------|
| Inventory Utilization | `u₁` | `E_usd / C_usd` | Low token coverage |
| Insurance Utilization | `u₂` | `L(E_usd) / B_ins` | Exposure loss > insurance |
| Skew | `|skew|` | `|L − S| / (L + S)` | Imbalanced market |
| Volatility | `σ` | From price data | Unstable market |
| Profit Deviation | `dev` | `profitDeviation` | Below target profit |
| Residual Stress | `D_m_res` | `max(0, D_m − x_m)` | Uncovered after insurance |

---

*Next: [05. Utilization modes](05_utilization_modes.md)*

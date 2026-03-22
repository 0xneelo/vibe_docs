# 03. Utilization Modes: Token Inventory vs Insurance Fund

## Overview

The system tracks **two different utilization metrics** and switches between them based on exposure state. This is the key innovation that allows aggressive risk management while maintaining capital efficiency.

---

## Mode 1: Token Inventory Utilization

### Definition

```
u₁ := u_token = E_usd / C_usd
```

Or equivalently in tokens:

```
u₁ = E_tok / C_tok
```

### When Used

- Exposure is **within** token inventory limits
- `E_usd ≤ C_usd` (we have tokens to cover)
- System is in "normal" or "stress" regime

### Interpretation

| `u₁` Value | State | Action |
|------------|-------|--------|
| `< 0.80` | Normal | Base rates |
| `0.80 - 0.95` | Stress | Elevated rates (kinked curve) |
| `> 0.95` | Critical | Emergency ramp begins |
| `> 1.00` | Over-utilized | Switch to Mode 2 |

### Example

```
Token inventory: $50,000 (5,000 tokens @ $10)
Net long exposure: $40,000

u₁ = 40,000 / 50,000 = 80%
```

Status: At the kink point, entering stress regime.

---

## Mode 2: Insurance Fund Utilization

### Definition

```
u₂ := u_insurance = L(E_usd) / B_ins
```

Where:
- `L(E_usd)` = exposure loss estimate (worst-case)
- `B_ins` = insurance budget (local + global allocation)

### Insurance Budget Formula

```
B_ins := η_loc · I_loc + η_glob · I_m_glob
```

Where:
- `η_loc ∈ [0, 1]` = fraction of local fund willing to risk (e.g., 30%)
- `η_glob ∈ [0, 1]` = fraction of global allocation willing to risk (e.g., 100%)
- `I_loc` = local insurance fund
- `I_m_glob` = global insurance allocated to this market

### Exposure Loss Estimate

Simple (transparent) version:

```
L(E_usd) := E_usd · (A − 1)
```

Where `A` is Aenigma (max exposure multiplier before unwind).

With volatility adjustment:

```
L(E_usd) := E_usd · max(A − 1, exp(z · σ · √Δt) − 1)
```

Where:
- `σ` = volatility
- `Δt` = risk horizon
- `z` = safety quantile (e.g., 2.33 for 99%)

### When Used

- Exposure **exceeds** token inventory (`E_usd > C_usd`)
- Solver has "unhedged exposure"
- System is in "insurance mode"

### Interpretation

| `u₂` Value | State | Action |
|------------|-------|--------|
| `< 0.50` | Manageable | Use insurance + aggressive rates |
| `0.50 - 0.75` | Warning | Very aggressive rates |
| `0.75 - 1.00` | Danger | Near ADL threshold |
| `≥ 1.00` | Critical | ADL likely required |

### Example

```
Unhedged exposure: $10,000
Aenigma (A): 3.0
Exposure loss estimate: L = 10,000 × (3.0 − 1) = $20,000

Local insurance: $100,000 @ 30% risk = $30,000
Global allocation: $10,000 @ 100% risk = $10,000
B_ins = $40,000

u₂ = 20,000 / 40,000 = 50%
```

Status: Warning zone, but manageable.

---

## Mode Switching Logic

### Automatic Transition

```python
def get_utilization_mode(E_usd, C_usd, L_E, B_ins):
    u1 = E_usd / C_usd
    u2 = L_E / B_ins
    
    if E_usd <= C_usd:
        # Within token coverage
        return "token_inventory", u1
    else:
        # Unhedged exposure exists
        # Use the higher/more urgent utilization
        return "insurance_fund", max(u1, u2)
```

### Combined Utilization for Pricing

When determining dynamic rates:

```
u_effective = {
    u₁                    if E_usd ≤ C_usd
    max(u₁, u₂)           if E_usd > C_usd
}
```

### Why Use Max?

Using `max(u₁, u₂)` ensures:
- If token utilization is high but insurance is plentiful → rates reflect token scarcity
- If insurance utilization is high but tokens exist → rates reflect insurance stress
- The system always prices in the binding constraint

---

## Mode Transition Diagram

```
                                    E_usd increases
                                         │
                                         ▼
┌──────────────────┐    u₁ > 100%    ┌──────────────────┐
│  TOKEN INVENTORY │ ───────────────▶ │  INSURANCE FUND  │
│      MODE        │                  │      MODE        │
│                  │                  │                  │
│  u = u₁         │                  │  u = max(u₁, u₂) │
│  Normal pricing │                  │  Aggressive      │
│  based on tokens │ ◀─────────────── │  pricing + ADL   │
└──────────────────┘    u₁ < 100%    └──────────────────┘
                      E reduced via
                      hedging/ADL
```

---

## Comparison: Two-Mode System

| Aspect | Mode 1 (Token Inventory) | Mode 2 (Insurance Fund) |
|--------|--------------------------|-------------------------|
| **Numerator** | Current exposure | Expected loss |
| **Denominator** | Token holdings | Insurance budget |
| **Risk horizon** | Immediate | Worst-case |
| **Rate response** | Moderate | Aggressive |
| **Spread response** | Moderate | Can be negative (rebates) |
| **Insurance spend** | None | Active |
| **ADL possible** | No | Yes |

---

## Why Two Modes?

### Problem with Single Mode

If we only used token inventory utilization:
- No mechanism to price risk when exposure exceeds tokens
- No connection to insurance capacity
- Can't distinguish "slightly over tokens" from "insurance exhausted"

### Benefits of Two Modes

1. **Capital efficiency**: Normal operations only need token-based pricing
2. **Risk sensitivity**: Insurance mode captures tail risk
3. **Smooth transition**: No discontinuous jumps
4. **ADL integration**: `u₂ > 1` naturally triggers ADL consideration

---

## Formulas Summary

### Mode 1: Token Inventory

```
u₁ = E_usd / C_usd

where:
  E_usd = |L − S|  (solver exposure)
  C_usd = P · min(T₀, E_tok)  (covered amount)
```

### Mode 2: Insurance Fund

```
u₂ = L(E_usd) / B_ins

where:
  L(E_usd) = E_usd · (A − 1)  (exposure loss estimate)
  B_ins = η_loc · I_loc + η_glob · I_m_glob  (insurance budget)
  A = aenigma  (worst-case multiplier)
```

### Effective Utilization

```
u_eff = u₁                   if E_usd ≤ C_usd
u_eff = max(u₁, u₂)          if E_usd > C_usd
```

---

*Next: [04. LP Profit Decomposition](04_LP_PROFIT.md)*

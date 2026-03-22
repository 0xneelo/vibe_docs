# 05. Dynamic Pricing: Funding, Spread, and Borrow Rates

## Overview

Dynamic pricing is the primary mechanism for incentivizing market balance before resorting to insurance or ADL. All three pricing instruments respond to the same underlying risk signals but with different sensitivities.

---

## The Three Pricing Instruments

| Instrument | Who Pays | Who Receives | Frequency |
|------------|----------|--------------|-----------|
| **Funding** | Dominant side (more OI) | Other side | Every 8h |
| **Borrow** | Position holders | LP/Solver | Continuous |
| **Spread** | Takers (on open/close) | LP/Solver | Per trade |

---

## Input Signals (What Triggers Rate Increases)

| Signal | Symbol | Description | Increases Rates When... |
|--------|--------|-------------|-------------------------|
| Inventory Utilization | `u₁` | `E_usd / C_usd` | Running out of tokens |
| Insurance Utilization | `u₂` | `L(E) / B_ins` | Insurance capacity stressed |
| Long/Short Skew | `skew` | `(L−S)/(L+S)` | Market is imbalanced |
| Volatility | `σ` | Price std dev | Market is unstable |
| Profit Deviation | `dev` | Below target profit | Need to recover |

---

## General Formula Structure

All three pricing functions follow this pattern:

```
rate(inputs) = base_rate × Π_i multiplier_i(input_i)
```

Where each multiplier is ≥ 1 and increases with risk signal intensity.

---

## 1. Dynamic Borrow Rate

### Formula

```
b(u₁, dev) = b₀ · ψ_b(u₁) · χ_b(dev)
```

### Component Functions

**Utilization response `ψ_b(u)`:**

```
ψ_b(u) = 1 + a_b · max(0, (u − u*) / (1 − u*))^p_b
```

Where:
- `u* = 0.80` (kink point)
- `a_b = 0.50` (amplitude)
- `p_b = 2` (convexity)

**Profit deviation response `χ_b(dev)`:**

```
χ_b(dev) = 1 + c_b · max(0, 1 − dev)^q_b
```

Where:
- `dev = profitDeviation` (1.0 = on target)
- `c_b = 0.30` (amplitude)
- `q_b = 1.5` (convexity)

### Example

```
u₁ = 90%, u* = 80%, a_b = 0.50, p_b = 2
ψ_b = 1 + 0.50 × ((0.90 − 0.80) / 0.20)^2 = 1 + 0.50 × 0.25 = 1.125

dev = 0.90 (10% below target), c_b = 0.30, q_b = 1.5
χ_b = 1 + 0.30 × (0.10)^1.5 = 1 + 0.30 × 0.032 = 1.01

b = b₀ × 1.125 × 1.01 ≈ 1.14 × b₀
```

Borrow rate increased by ~14%.

---

## 2. Dynamic Funding Rate

### Formula

```
f(u₁, skew, u₂) = f₀ · ψ_f(u₁) · χ_f(|skew|) · ω_f(u₂)
```

### Component Functions

**Utilization response `ψ_f(u)`:**

Same as borrow, but potentially steeper:

```
ψ_f(u) = 1 + a_f · max(0, (u − u*) / (1 − u*))^p_f
```

With `a_f = 1.00`, `p_f = 2`.

**Skew response `χ_f(skew)` (long/short imbalance):**

```
χ_f(|skew|) = 1 + d_f · |skew|^r_f
```

Where:
- `d_f = 0.50` (amplitude)
- `r_f = 1` (linear) or `2` (quadratic)

**Insurance mode response `ω_f(u₂)` (aggressive when exposed):**

```
ω_f(u₂) = 1 + γ_f · max(0, u₂ − 1)^p_f2
```

Where:
- `γ_f = 2.0` (aggressive multiplier)
- `p_f2 = 2` (convexity)

**Critical behavior:** When `u₂ > 1` (insurance utilization exceeds capacity), funding becomes very aggressive.

### Three-Regime Structure

```
           u₁ < u*         u* ≤ u₁ < u_crit        u₁ ≥ u_crit
         ┌──────────┐    ┌───────────────┐    ┌──────────────────┐
         │  NORMAL  │    │    STRESS     │    │   EMERGENCY      │
         │  f = f₀  │    │ f = f₀·ψ·χ   │    │ f = f₀·ψ·χ·ω     │
         │          │    │ kinked curve  │    │ + time ramp      │
         └──────────┘    └───────────────┘    └──────────────────┘
```

### Emergency Regime: Time-Based Ramp

When in emergency (`u₁ > u_crit` for `T_grace` days):

```
f_emergency = f₀ + b · t_eff^q

where:
  t_eff = effective time (accelerated by loss intensity)
  b = 0.08 (ramp coefficient)
  q = 1.5 (convexity)
```

And `t_eff` evolves as:

```
t_eff(t + Δt) = t_eff(t) + m(ℓ) · Δt

where:
  m(ℓ) = 1 + k · clip((ℓ − ℓ₀)/(ℓ₁ − ℓ₀), 0, 1)
  ℓ = loss intensity (% equity/hour)
  ℓ₀ = 0.03% (noise floor)
  ℓ₁ = 0.20% (stress threshold)
  k = 2.0 (max acceleration)
```

---

## 3. Dynamic Spread

### Formula

```
s(u₁, σ, dev, u₂) = s₀ · ψ_s(u₁) · χ_s(σ) · ω_s(dev) · ω'_s(u₂)
```

### Component Functions

**Utilization response `ψ_s(u)`:**

```
ψ_s(u) = 1 + a_s · max(0, (u − u*) / (1 − u*))^p_s
```

**Volatility response `χ_s(σ)`:**

```
χ_s(σ) = 1 + e_s · (σ / σ_base − 1)
```

Where:
- `σ_base` = baseline expected volatility
- `e_s = 0.50` (sensitivity)

**Profit deviation response `ω_s(dev)`:**

```
ω_s(dev) = 1 + c_s · max(0, 1 − dev)
```

**Insurance mode response `ω'_s(u₂)`:**

```
ω'_s(u₂) = 1 + γ_s · max(0, u₂ − 1)^2
```

### Asymmetric Spreads (Directional)

When solver is exposed in one direction, spreads can be asymmetric:

**If solver is LONG exposed:**
```
s_long_open  = s × (1 + asymmetry_factor)   # More expensive to go long
s_long_close = s × (1 + exit_factor)         # Charge to exit too
s_short_open = s × (1 − rebate_factor)       # Cheaper/FREE to go short
s_short_close = s                            # Normal
```

**If solver is SHORT exposed:**
```
s_short_open  = s × (1 + asymmetry_factor)
s_short_close = s × (1 + exit_factor)
s_long_open = s × (1 − rebate_factor)
s_long_close = s
```

### Negative Spreads (Rebates)

In insurance mode, short opens can have **negative spread** (we pay them to open):

```
If u₂ > 1 and solver is LONG:
  s_short_open = s₀ × (1 − rebate × min(u₂ − 1, 1))
  
  Can be NEGATIVE if rebate is large enough
```

**Why:** It's cheaper to pay traders to rebalance than to hit ADL.

---

## Spread Adjustment Table

| State | Long Open | Long Close | Short Open | Short Close |
|-------|-----------|------------|------------|-------------|
| Normal (u < 80%) | Base | Base | Base | Base |
| Stress (80-95%) | +50-100% | Base | −20% | Base |
| Critical (>95%) | +200% | +50% | −50% | Base |
| Insurance Mode | +300%+ | +100% | **Negative** | Base |

---

## Recovery Constraint

The goal is that dynamic pricing should cover exposure losses:

```
F_spread(t) + F_fund(t) + F_borrow(t)  ≥  ρ · L(E(t))
```

Where:
- `L(E)` = exposure loss estimate
- `ρ ∈ (0, 1]` = recovery rate

**Optional global cross-subsidy:**

```
Σ_m (F_spread + F_fund + F_borrow)  ≥  ρ · Σ_m L(E_m)
```

This allows raising rates globally to cover localized stress.

---

## Why Dynamic Pricing Works

### Immediate vs Periodic Incentives

| Mechanism | Timing | Effect |
|-----------|--------|--------|
| Funding | Every 8h | Periodic pressure on dominant side |
| Spread | Per trade | Immediate cost for wrong-side trades |
| Borrow | Continuous | Ongoing cost for holding positions |

### Self-Balancing Dynamics

1. **High utilization → higher rates → traders close positions → utilization drops**
2. **High skew → higher funding for dominant side → traders switch sides → skew drops**
3. **High volatility → wider spreads → less trading → volatility stabilizes**

### Combined Cost

Total cost to a trader:

```
Total Cost = Spread (immediate) + Funding (periodic) + Borrow (continuous)
```

All increase together in stress/emergency, creating compounding pressure to rebalance.

---

## Parameter Summary

| Parameter | Symbol | Typical Value | Description |
|-----------|--------|---------------|-------------|
| Kink point | `u*` | 0.80 | Where rates start increasing |
| Critical threshold | `u_crit` | 0.95 | Emergency regime |
| Stress amplitude | `a` | 0.70-1.00 | How much rates increase |
| Convexity | `p` | 2.0 | Rate curve shape |
| Emergency ramp | `b` | 0.08 | Time-based increase speed |
| Acceleration factor | `k` | 2.0 | Loss-driven speedup |
| Max multiplier | `m_max` | 5.0 | Hard cap on acceleration |

---

*Next: [06. Bell Curve Flattening](06_BELL_CURVE_FLATTENING.md)*

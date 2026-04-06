# 09. Insurance & ADL Logic

## Overview

When dynamic pricing alone cannot cover exposure risk, the system activates insurance mechanisms. ADL (Auto-Deleveraging) is the last resort when all insurance is exhausted.

---

## Insurance Fund Structure

### Local Insurance Fund (Per-Market)

**Funding sources:**
1. 100% of liquidation profits from this market
2. 30% of solver profits from this market
3. CVA (Credit Valuation Adjustment) charges

**Properties:**
- Completely isolated per market
- Cannot be drained by other markets
- First capital at risk after token inventory depleted

**Update rule:**
```
I_loc(t + Δt) = I_loc(t) − x_m_loc(t) + inflows

where:
  inflows = F_liq + 0.30 · max(0, Π_m_solver)
```

### Global Insurance Fund (Shared)

**Eligibility:**
- NOT every token qualifies (prevents scam token contagion)
- Eligibility set manually per market
- Non-eligible markets can only use local insurance

**Allocation limits:**
- Never risk 100% of global fund in one market
- Per-market allocation set manually (e.g., "risk max 1% of global for $BERT")

**Update rule:**
```
I_glob(t + Δt) = I_glob(t) − Σ_m x_m_glob(t) + global_inflows

where:
  global_inflows = Σ_m tax_m  (from bell-curve flattening)
```

---

## Insurance Spend Mechanism

### Control Variables

| Variable | Symbol | Range | Description |
|----------|--------|-------|-------------|
| Local insurance spend | `x_m_loc` | `[0, B_m_loc]` | Spend from local fund |
| Global insurance spend | `x_m_glob` | `[0, B_m_glob]` | Spend from global allocation |
| Total spend | `x_m` | `x_m_loc + x_m_glob` | Combined insurance deployed |

### Spend Caps (Per Period)

```
x_m_loc ≤ B_m_loc       (local cap)
Σ_m x_m_glob ≤ B_glob   (global cap)
x_m ≤ B_m_def           (total defense budget)
```

Where:
```
B_m_def := B_m_loc + B_m_glob
```

---

## Exposure Loss Estimate

### Simple Formula

```
L(E_usd) := E_usd · (A − 1)
```

Where:
- `E_usd` = solver exposure (USDC notional)
- `A` = Aenigma (worst-case multiplier)

### With Volatility

```
L(E_usd) := E_usd · max(A − 1, exp(z·σ·√Δt) − 1)
```

Where:
- `σ` = volatility
- `Δt` = risk horizon
- `z` = safety quantile (e.g., 2.33 for 99%)

---

## Uncovered Stress (What Insurance Must Cover)

### Stress Demand

**Residual exposure loss after dynamic revenue:**

```
D_m := max(0, L(E_usd) − (F_spread + F_fund + F_borrow))
```

**Interpretation:** How much exposure-loss remains uncovered by the market's own dynamic revenue.

### Post-Insurance Residual

```
D_m_res := max(0, D_m − x_m)
```

**Interpretation:** Stress remaining after insurance spend.

---

## Insurance Allocation Rule (Bell-Curve Based)

From the bell-curve flattening framework:

### Step 1: Identify Winners and Stressed Markets

**Winner surplus:**
```
E_m_prof := max(0, Π_m − U)
```

**Stress demand:**
```
S_m_stress := D_m
```

### Step 2: Create Transfer Pool

```
T := β · min(Σ_m E_m_prof, Σ_m S_m_stress)
```

### Step 3: Allocate Global Insurance Proportionally

```
x_m_glob = min(B_m_glob, T · D_m / Σ_j D_j)
```

**Result:** Markets with higher stress demand receive more global insurance, funded by winner markets' surplus.

---

## Exposure Reduction via Hedging

### Hedge Action

Let `h_m(t)` be the hedge/trade action (in base units) to reduce exposure:

```
E(t + Δt) = E(t) − h_m(t)
```

### Hedge Cost

```
Cost_m_hedge(t) = c_m(|h_m|, liquidity_m, spread_m)
```

### Constraint

Insurance spend must cover hedge cost:

```
Cost_m_hedge(t) ≤ x_m_loc(t) + x_m_glob(t)
```

---

## ADL Trigger Conditions

### Condition A: Spend Saturated AND Still Unsafe

```
x_m = B_m_def  AND  D_m_res > 0
```

**Meaning:** We've spent all available insurance but still have uncovered stress.

### Condition B: Exposure Exceeds Aenigma Safe Level

Define safe exposure limit:

```
E_safe := (P · T_abs) / A
```

Trigger if:

```
E_usd > E_safe
```

**Meaning:** Exposure exceeds what we can cover even in worst-case unwind.

### Combined ADL Trigger

```
ADL_trigger = (x_m = B_m_def AND D_m_res > 0) OR (E_usd > E_safe)
```

---

## ADL Action

### ADL as Exposure Reduction

Let `a_m ∈ [0, 1]` be the ADL fraction:

```
E(t + Δt) = E(t) − h_m(t) − a_m(t) · E(t)
         = (1 − a_m) · E(t) − h_m(t)
```

Where:
- `a_m = 0`: No ADL
- `a_m = 1`: Full unwind to zero exposure

### ADL Target

Choose minimal `a_m` such that:

```
E(t + Δt) ≤ min(E_safe, E_m_target)
```

Where `E_m_target` is a configurable "safe level" to ADL down to.

### ADL to Safer Levels (Not Zero)

```
a_m = 1 − (E_target / E_current)
```

**Example:**
- Current exposure: $60,000
- Safe target: $40,000
- `a_m = 1 − (40,000 / 60,000) = 33%`

ADL 33% of positions to bring exposure to safe level.

---

## ADL Priority (Who Gets Deleveraged)

When triggering ADL, positions are closed in order of:

1. **Largest winners first** (highest unrealized profit)
2. **Oldest positions** (if profits equal)
3. **Proportional** (if needed for fairness)

**Rationale:** Deleveraging winners is less harmful than deleveraging losers (who would crystallize losses).

---

## Complete Defense Activation Sequence

### Phase 1: Normal Operation

```
State: u₁ < u* (80%)
Funding: F_base
Spread: Normal
Defense: None needed
Insurance: Not used
```

### Phase 2: High Token Utilization

```
State: u* < u₁ < u_crit
Funding: Stress curve kicks in
Spread: Slight widening for dominant side
Defense: Passive (price incentives)
Insurance: Not used
```

### Phase 3: Critical Token Utilization

```
State: u₁ > u_crit (95%)
Funding: Emergency ramp begins
Spread: Aggressive widening
Defense: Active (time pressure)
Insurance: Standing by
```

### Phase 4: Unhedged Exposure (Insurance Mode)

```
State: E_usd > C_usd (exposure exceeds tokens)
Funding: Switch to u₂ utilization
Spread: 
  - Longs exiting: Pay premium
  - Shorts entering: Receive rebate (negative spread!)
Defense: Maximum (using insurance capital)
Insurance: ACTIVE
  - Deploy x_m_loc first
  - Deploy x_m_glob if needed
```

### Phase 5: ADL Triggered

```
State: x_m = B_m_def AND D_m_res > 0
      OR E_usd > E_safe
Action: Force-close profitable positions
Priority: Largest winners deleveraged first
Target: Reduce E_usd to E_safe
```

---

## Example: The $BERT Scenario

### Initial State

```
Token inventory: $50,000 (5,000 tokens @ $10)
Longs: $120,000
Shorts: $80,000
Netted: $80,000
Solver exposure: $40,000 (LONG)
```

**Status:** `u₁ = 40,000 / 50,000 = 80%` — At kink point.

### Shorts Close (Market Pumps)

```
Longs: $120,000 (unchanged)
Shorts: $60,000 (some closed)
Netted: $60,000
Solver exposure: $60,000 (LONG)
```

**Now:** `u₁ = 60,000 / 50,000 = 120%`

Unhedged exposure: `$60,000 − $50,000 = $10,000`

### Defense Activation

1. **Funding:** Switch to insurance utilization mode
   ```
   L(E) = 10,000 × (3 − 1) = $20,000 (with A = 3)
   B_ins = 30% × $100,000 + 100% × $10,000 = $40,000
   u₂ = 20,000 / 40,000 = 50%
   ```

2. **Spread:** 
   - Longs open: +200%
   - Longs close: +50%
   - Shorts open: −30% (rebate)

3. **Insurance:** Deploy `x_m = min(D_m, B_m_def)`

### If Insurance Exhausted

```
D_m_res > 0 after x_m = B_m_def
```

→ **ADL triggered**

ADL the $10,000 of unhedged exposure (or to safe level).

---

## Parameters Summary

| Parameter | Symbol | Typical Value | Description |
|-----------|--------|---------------|-------------|
| Local risk fraction | `η_loc` | 0.30 | % of local fund to risk |
| Global risk fraction | `η_glob` | 1.00 | % of global allocation to risk |
| Local spend cap | `B_m_loc` | Per-market | Daily limit |
| Global spend cap | `B_glob` | System-wide | Daily limit |
| Safe exposure multiplier | `1/A` | ~0.33 | `E_safe = P·T_abs/A` |

---

*Next: [10. Defense hierarchy](10_defense_hierarchy.md)*

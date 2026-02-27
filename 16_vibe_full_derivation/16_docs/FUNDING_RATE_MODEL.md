# Funding Rate Model for Low-Cap Perpetual Contracts

## A Complete Mathematical Derivation

---

## Table of Contents

1. [Introduction: What Problem Are We Solving?](#1-introduction-what-problem-are-we-solving)
2. [Background: Understanding Perpetual Contracts](#2-background-understanding-perpetual-contracts)
3. [The Core Invariant: Why This System Is Different](#3-the-core-invariant-why-this-system-is-different)
4. [Defense Hierarchy: The Full Protection Stack](#4-defense-hierarchy-the-full-protection-stack)
5. [Variable Definitions](#5-variable-definitions)
6. [Part 1: The Base Funding Model](#6-part-1-the-base-funding-model)
7. [Part 2: The Stress Regime (Kinked Curve)](#7-part-2-the-stress-regime-kinked-curve)
8. [Part 3: Emergency Regime (Time-Based Ramp)](#8-part-3-emergency-regime-time-based-ramp)
9. [Part 4: Exposure-Driven Acceleration](#9-part-4-exposure-driven-acceleration)
10. [Part 5: Dynamic Spread Adjustments](#10-part-5-dynamic-spread-adjustments)
11. [Part 6: Putting It All Together](#11-part-6-putting-it-all-together)
12. [Worked Examples](#12-worked-examples)
13. [Parameter Reference](#13-parameter-reference)

---

## 1. Introduction: What Problem Are We Solving?

### The Setup

Imagine you're running a trading platform where people can bet on whether a token's price will go up or down. This is called a **perpetual contract** (or "perp"). Unlike futures that expire, perps can be held forever.

Here's the challenge:

- Your platform has a **solver** (think of it as the house/market maker) that takes the opposite side of trades
- You offer **20× leverage**, meaning someone with $1,000 can control a $20,000 position
- The token you're trading has a small market cap (~$10 million), so it's **illiquid** (hard to buy/sell large amounts without moving the price)

### The Problem

When too many people bet in the same direction (say, everyone goes long), the solver becomes dangerously exposed. If the price moves against the solver, it could lose money fast.

**Funding rates** are payments between longs and shorts that balance this exposure. When there are too many longs, longs pay shorts (and vice versa). This incentivizes people to take the other side.

### What We Need

A funding rate model that:

1. Is **cheap** when the system is balanced (to encourage trading)
2. Becomes **expensive** when the system is imbalanced (to force rebalancing)
3. Becomes **very expensive** when imbalance persists (to prevent insolvency)
4. Reacts **faster** when the solver is losing money

---

## 2. Background: Understanding Perpetual Contracts

### What is a Perpetual Contract?

A perpetual contract lets you:
- **Go long**: Bet the price will go up
- **Go short**: Bet the price will go down
- Use **leverage**: Control more than you actually have

### What is Utilization?

**Utilization** measures how much of the system's capacity is being used.

```
Utilization (U) = Total Positions / Total Capacity
```

- If U = 0.5 (50%), half the capacity is used
- If U = 0.95 (95%), almost all capacity is used — **danger zone**

### What is a Funding Rate?

The funding rate is a periodic payment:
- Expressed as **APR** (Annual Percentage Rate) or per-8-hour rate
- Paid by the dominant side (more longs → longs pay shorts)
- Designed to balance the market

**Converting between APR and 8-hour rate:**

There are 3 eight-hour periods per day, and 365 days per year:

```
Periods per year = 3 × 365 = 1,095
```

So if funding is F_APR (annual rate):

```
F_8h = F_APR / 1,095
```

**Example:** 300% APR = 300% / 1,095 ≈ 0.274% per 8 hours

---

## 3. The Core Invariant: Why This System Is Different

### The Key Insight

> **Liquidations are inventory reallocations, not loss events.**

This is the most important concept in this entire document. Let me explain.

### Traditional Systems (Like Aave/Compound)

In traditional lending:
- You borrow tokens
- If you can't pay back, your collateral is sold
- If the collateral isn't worth enough → **bad debt** (the system loses money)

### Our System: How Liquidations Work

**When a SHORT gets liquidated:**

1. The trader bet the price would go down, but it went up
2. On liquidation:
   - Solver receives the trader's USDC collateral
   - Solver's token inventory increases
3. **Result:** The solver now holds more tokens that are worth more
4. **LP (Liquidity Provider) impact:** They have more USDC, fewer tokens. They still profit from price increase + fees, just not as much as "perfect hindsight" would give them

**When a LONG gets liquidated:**

1. The trader bet the price would go up, but it went down
2. On liquidation:
   - Solver receives tokens
   - Token price is lower
3. **Result:** The solver holds more tokens at lower prices
4. **LP impact:** They explicitly agreed to bear this directional risk when they deposited

### Why This Matters

Because liquidations never create negative equity:
- Faster liquidations = **better** for solver safety
- We can use aggressive funding ramps without fear
- Liquidation cascades are **not** insolvency cascades

---

## 4. Defense Hierarchy: The Full Protection Stack

### Overview: Defense in Depth

Before Auto-Deleveraging (ADL) ever triggers, the system has multiple layers of defense. Think of it like an onion - each layer must be exhausted before the next is touched.

```
┌─────────────────────────────────────────┐
│  Layer 1: User Position Netting         │  ← First line of defense
│  (Longs vs Shorts cancel out)           │
├─────────────────────────────────────────┤
│  Layer 2: Solver Token Inventory        │  ← Solver's own tokens
│  (Available tokens to cover positions)  │
├─────────────────────────────────────────┤
│  Layer 3: Local Insurance Fund          │  ← Per-market USDC pool
│  (Funded by liquidations + profits)     │
├─────────────────────────────────────────┤
│  Layer 4: Global Insurance Fund         │  ← Shared pool (partial)
│  (Capped allocation per market)         │
├─────────────────────────────────────────┤
│  Layer 5: Auto-Deleveraging (ADL)       │  ← Last resort
│  (Forcibly close winning positions)     │
└─────────────────────────────────────────┘
```

### Layer 1: User Position Netting

Users naturally offset each other:
- If we have $120k in longs and $80k in shorts, $80k is **netted**
- Only the remaining $40k represents actual directional exposure
- This is free protection - no capital required

### Layer 2: Solver Token Inventory

The solver holds actual tokens:
- These tokens back the net exposure
- If we have $50k in tokens and $40k net long exposure → fully hedged
- If net exposure exceeds token inventory → **unhedged exposure** begins

### Layer 3: Local Insurance Fund

Each market has its own dedicated USDC pool:

**Funding Sources:**
- 100% of liquidation profits from this market
- 30% of solver profits allocated per market
- Any CVA (Credit Valuation Adjustment) charges

**Key Properties:**
- Completely isolated per market
- Cannot be drained by other markets
- First capital at risk after token inventory is depleted

### Layer 4: Global Insurance Fund

A shared pool across all markets, with important restrictions:

**Eligibility:**
- NOT every token qualifies (prevents scam token contagion)
- Eligibility set manually per market
- Non-eligible markets can only use local insurance

**Allocation Limits:**
- Never risk 100% of global fund in one market
- Per-market allocation set manually (e.g., "risk max 1% of global for $BERT")
- This is a configurable parameter, not dynamic

### Layer 5: Auto-Deleveraging (ADL)

The last resort when all other defenses are exhausted:

**Trigger Condition:**
```
ADL triggers when:
  Unhedged Exposure Loss > Local Insurance Fund + Global Allocation
```

**What ADL Does:**
- Forcibly closes profitable positions (against their will)
- Matches them against the losing side
- Protects system solvency at the cost of user experience

---

### The Two Utilization Modes

The system tracks TWO different utilization metrics, and switches between them based on exposure state:

#### Mode 1: Token Inventory Utilization

```
U_token = Net Exposure / Token Inventory Value
```

**Used when:** Exposure is within token inventory limits

**Example:**
- $50k token inventory
- $40k net long exposure
- U_token = 40k / 50k = 80%

#### Mode 2: Insurance Fund Utilization

```
U_insurance = Unhedged Loss / (Local Insurance + Global Allocation)
```

**Used when:** Exposure exceeds token inventory (solver is unhedged)

**Example:**
- $60k net long exposure, $50k in tokens → $10k unhedged
- Price moves against solver → $10k becomes $15k loss
- Local insurance: $30k, Global allocation: $10k
- U_insurance = 15k / 40k = 37.5%

### Switching Between Modes

```
if (Net Exposure ≤ Token Inventory):
    utilization = U_token
    funding_mode = "Token Inventory"
else:
    utilization = max(U_token, U_insurance)  // Use the higher/more urgent
    funding_mode = "Insurance Fund"
    // Also activate aggressive spread adjustments
```

---

### Profit Allocation: The Recommended Approach

**Question:** How should solver profits be allocated for ADL protection?

**Recommendation: Unified Pool with Per-Event Risk Limits**

Rather than segregating profits by source (dynamic funding vs spread vs trading), treat all solver PnL as a unified pool and risk a configurable percentage per "ADL event."

```
Per-Market Risk Budget = (Local Insurance Fund + Allocated Profits) × Risk_Percentage
```

**Why this approach:**

1. **Simplicity** - No complex profit segregation accounting
2. **Flexibility** - Tune risk % per market based on token quality/volatility
3. **Auditability** - One number to track per market
4. **Consistency** - Matches manual control philosophy for global insurance

**Configurable Parameters:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `local_risk_pct` | % of local fund to risk per ADL event | 30% |
| `global_risk_pct` | % of global allocation to risk | 100% |
| `profit_allocation_pct` | % of profits added to local fund | 30% |

**Example:**
- Local Insurance Fund: $100k
- Global Allocation: $10k
- local_risk_pct: 30%
- global_risk_pct: 100%

```
Max Loss Before ADL = ($100k × 30%) + ($10k × 100%) = $40k
```

---

### Complete Defense Activation Sequence

Here's exactly what happens as a market goes from healthy to ADL:

**Phase 1: Normal Operation**
```
State: U_token < U_optimal (80%)
Funding: F_base (30% APR)
Spread: Normal
Defense: None needed
```

**Phase 2: High Token Utilization**
```
State: U_optimal < U_token < U_critical
Funding: Stress curve kicks in
Spread: Slight widening for dominant side
Defense: Passive (price incentives)
```

**Phase 3: Critical Token Utilization**
```
State: U_token > U_critical (95%)
Funding: Emergency ramp begins
Spread: Aggressive widening
Defense: Active (time pressure)
```

**Phase 4: Unhedged Exposure (Insurance Mode)**
```
State: Net Exposure > Token Inventory
Funding: Switch to U_insurance utilization
Spread: 
  - Longs exiting: Pay premium
  - Shorts entering: Receive rebate (negative spread!)
Defense: Maximum (using insurance capital)
```

**Phase 5: ADL Triggered**
```
State: Unhedged Loss > Risk Budget
Action: Force-close profitable positions
Priority: Largest winners deleveraged first
```

---

## 5. Variable Definitions

Let's define every variable we'll use. I'll use clear notation throughout.

### Utilization Variables

| Symbol | Name | Description | Range |
|--------|------|-------------|-------|
| U | Utilization | Current capacity usage | [0, 1] |
| U* | Optimal Utilization | The "kink point" | ~0.80 |
| U_crit | Critical Utilization | Emergency threshold | ~0.95 |
| EMA(U) | Smoothed Utilization | Time-weighted average | [0, 1] |

### Funding Rate Variables

| Symbol | Name | Description | Typical Value |
|--------|------|-------------|---------------|
| F | Funding Rate | Current rate (APR) | Variable |
| F_base | Base Funding | Normal rate | 30% APR |
| F_max | Maximum Funding | Ceiling | 300% APR |

### Time Variables

| Symbol | Name | Description |
|--------|------|-------------|
| t | Time | Days since entering emergency |
| t_eff | Effective Time | Accelerated time under stress |
| Δt | Time Interval | Measurement period (hours) |
| T_grace | Grace Period | Days before emergency triggers |

### Solver/Risk Variables

| Symbol | Name | Description |
|--------|------|-------------|
| E | Equity | Solver's vault value (USDC) |
| Δ | Delta | Solver's net token position |
| h | Hedge Ratio | Fraction of delta hedged [0,1] |
| ℓ | Loss Intensity | Loss rate as % of equity/hour |

### Insurance & ADL Variables

| Symbol | Name | Description |
|--------|------|-------------|
| I_local | Local Insurance | Per-market USDC pool |
| I_global | Global Insurance | Shared pool allocation for this market |
| U_token | Token Utilization | Net Exposure / Token Inventory |
| U_insurance | Insurance Utilization | Unhedged Loss / Insurance Budget |
| L_max | Max Solver Loss | ADL threshold in USDC |
| E_unhedged | Unhedged Exposure | Exposure beyond token inventory |

### Spread Variables

| Symbol | Name | Description |
|--------|------|-------------|
| S_base | Base Spread | Normal trading spread |
| S_long_open | Long Open Spread | Cost for longs to enter |
| S_long_close | Long Close Spread | Cost for longs to exit |
| S_short_open | Short Open Spread | Cost for shorts (can be negative = rebate) |

### Model Parameters

| Symbol | Name | Description | Typical |
|--------|------|-------------|---------|
| a | Stress Slope | Steepness of stress curve | 70-100% |
| p | Convexity | Curve shape in stress | 2-3 |
| b | Emergency Slope | Speed of emergency ramp | 8-10 |
| q | Emergency Convexity | Emergency curve shape | 1.5 |
| k | Acceleration Factor | Max speed multiplier - 1 | 2 |

---

## 6. Part 1: The Base Funding Model

### The Normal Regime (U ≤ U*)

When utilization is below the optimal level, we want funding to be cheap. This encourages trading activity.

**Formula:**

```
F(U) = F_base    when U ≤ U*
```

**Derivation:** None needed — this is a design choice. We pick F_base = 30% APR because:
- It's lower than BTC/ETH perps during imbalance periods
- It's attractive for traders
- It's safe for market makers

**Intuition:** Think of this like the "normal" price of a service. When there's plenty of capacity, you charge the standard rate.

---

## 7. Part 2: The Stress Regime (Kinked Curve)

### The Problem

When U > U*, the system is stressed. We need funding to increase to discourage new positions and encourage rebalancing.

### Why Not Linear?

A linear increase would be:

```
F(U) = F_base + c × (U - U*)    [Linear - Don't use this]
```

The problem: Linear is too gentle near the critical zone. We need funding to increase **faster** as we approach danger.

### The Solution: Convex (Power) Function

We use a power function that curves upward:

```
F(U) = F_base + a × ((U - U*) / (1 - U*))^p
```

Let me derive this step by step.

### Step 1: Normalize the Utilization

We want a value that goes from 0 to 1 as U goes from U* to 1.

Define the **normalized stress**:

```
s = (U - U*) / (1 - U*)
```

**Why this works:**
- When U = U* (at the kink): s = (U* - U*) / (1 - U*) = 0
- When U = 1 (fully utilized): s = (1 - U*) / (1 - U*) = 1

**Example with U* = 0.80:**
- At U = 0.80: s = 0
- At U = 0.90: s = (0.90 - 0.80) / (1 - 0.80) = 0.10 / 0.20 = 0.5
- At U = 0.95: s = (0.95 - 0.80) / 0.20 = 0.75
- At U = 1.00: s = 1

### Step 2: Apply Convexity

Raise s to a power p > 1:

```
stress_factor = s^p
```

**Why powers create convexity:**

| s | s^1 (linear) | s^2 (quadratic) | s^3 (cubic) |
|---|--------------|-----------------|-------------|
| 0 | 0 | 0 | 0 |
| 0.25 | 0.25 | 0.0625 | 0.0156 |
| 0.50 | 0.50 | 0.25 | 0.125 |
| 0.75 | 0.75 | 0.5625 | 0.4219 |
| 1.00 | 1.00 | 1.00 | 1.00 |

Notice: With p = 2, when you're at s = 0.5 (halfway to critical), the stress factor is only 0.25. The penalty is **back-loaded** toward the danger zone.

### Step 3: Scale and Add to Base

Multiply by a scaling factor `a` and add to base:

```
F(U) = F_base + a × s^p
F(U) = F_base + a × ((U - U*) / (1 - U*))^p
```

**Choosing `a`:**

At maximum stress (s = 1), the additional funding is `a`. If we want F to reach ~130% APR at full utilization (before emergency kicks in):

```
F(1) = 30% + a × 1^p = 130%
a = 100%
```

### The Complete Stress Regime Formula

```
F(U) = F_base + a × ((U - U*) / (1 - U*))^p    when U* < U < U_crit
```

**Recommended parameters:**
- F_base = 30% APR
- U* = 0.80
- a = 70-100% APR
- p = 2 to 3

### Visual Intuition

```
Funding Rate (APR)
     ^
130% |                          *
     |                       *
     |                    *
     |                 *
 70% |              *
     |           *
 30% |***********-------------- U*
     |
     +----------------------------> Utilization
     0        0.8    0.95    1.0
              U*     U_crit
```

---

## 8. Part 3: Emergency Regime (Time-Based Ramp)

### When Does Emergency Trigger?

Emergency activates when:
1. Smoothed utilization EMA(U) ≥ U_crit (e.g., 95%)
2. This has persisted for ≥ T_grace days (e.g., 5-7 days)

**Why a grace period?**
- Organic spikes happen (big trades, news events)
- We don't want to punish normal volatility
- Filter out short-term speculation

### The Emergency Funding Formula

Once in emergency, funding depends on **time**, not just utilization:

```
F(t) = min(F_base + b × t^q, F_max)
```

Where:
- t = days since emergency began
- b = ramp speed coefficient (~8-10)
- q = convexity exponent (~1.5)
- F_max = 300% APR

### Derivation: Why This Shape?

**Step 1: We want funding to reach F_max in about T_target days**

Let's say T_target = 14 days (2 weeks).

At t = T_target, we want F = F_max:

```
F_max = F_base + b × T_target^q
300% = 30% + b × 14^q
270% = b × 14^q
```

**Step 2: Choose q to control the curve shape**

With q = 1 (linear): Funding increases at constant rate
With q = 1.5: Funding increases slowly at first, then faster
With q = 2: Even more back-loaded

We choose q = 1.5 because:
- Early days: gentle increase (warning to traders)
- Later days: aggressive increase (force exit)

**Step 3: Solve for b**

```
270% = b × 14^1.5
270% = b × 52.38
b = 270% / 52.38 ≈ 5.16%
```

Let's use b ≈ 8-10% for safety margin (reaches max faster).

### The Math of the Ramp

With F_base = 30%, b = 8%, q = 1.5:

| Day (t) | t^1.5 | 8% × t^1.5 | F(t) = 30% + 8% × t^1.5 |
|---------|-------|------------|-------------------------|
| 0 | 0 | 0% | 30% |
| 1 | 1 | 8% | 38% |
| 3 | 5.2 | 42% | 72% |
| 5 | 11.2 | 90% | 120% |
| 7 | 18.5 | 148% | 178% |
| 10 | 31.6 | 253% | 283% |
| 11 | 36.5 | 292% | **300%** (capped) |

So with these parameters, we reach F_max in about 11 days.

### Why Use min() to Cap?

```
F(t) = min(F_base + b × t^q, F_max)
```

Without the min(), funding would grow forever. The cap ensures:
- Predictability (traders know the worst case)
- No infinite funding
- Triggers for other mechanisms (leverage reduction)

---

## 9. Part 4: Exposure-Driven Acceleration

### The Problem

The basic emergency ramp is **time-based**. But what if the solver is actively losing money? We should ramp faster.

### The Key Insight

Instead of changing the formula, we **accelerate time** when the solver is stressed.

Think of it like a video:
- Normal: 1× speed
- Stressed: 2× or 3× speed

### Measuring Solver Stress: Loss Intensity

We define **loss intensity** (ℓ) as the rate at which the solver is losing equity:

```
ℓ = (Loss per hour) / (Solver Equity)
```

Expressed as % of equity per hour.

**Why normalize by equity?**
- A $1,000/hour loss is huge for a $100,000 vault
- A $1,000/hour loss is trivial for a $10,000,000 vault
- Normalization makes the metric scale-invariant

### Deriving Loss Intensity

**Step 1: Define solver equity change**

Let E(t) be solver equity at time t. Over interval Δt:

```
ΔE = E(t) - E(t - Δt)
```

If ΔE < 0, the solver lost money.

**Step 2: Calculate loss velocity (only counting losses)**

We only care about losses, not gains:

```
L̇ = max(0, -ΔE) / Δt
```

The max(0, ...) ensures we only measure adverse moves.

**Step 3: Normalize by equity**

```
ℓ_raw = L̇ / E = max(0, -ΔE/Δt) / E
```

**Step 4: Smooth with EMA**

Raw values are noisy. We use an Exponential Moving Average:

```
ℓ(t) = EMA(ℓ_raw)
```

### Understanding EMA (Exponential Moving Average)

The EMA gives more weight to recent values while smoothing noise.

**Formula:**

```
EMA_t = α × x_t + (1 - α) × EMA_{t-1}
```

Where:
- x_t is the new value
- EMA_{t-1} is the previous smoothed value
- α is the smoothing factor

**Choosing α:**

For an N-period EMA:

```
α = 2 / (N + 1)
```

**Examples:**
- 8-hour EMA: α = 2/(8+1) = 0.222
- 72-hour EMA: α = 2/(72+1) = 0.027

**Why use EMA?**
- Reacts to trends (unlike simple average)
- Smooths out spikes (unlike raw values)
- Easy to compute incrementally

### Dual-Timescale Smoothing

We use TWO EMAs:

1. **Fast EMA (8h):** Reacts quickly to sudden stress
2. **Slow EMA (72h):** Captures persistent stress, resists gaming

**Blending:**

```
ℓ_blend = w_f × EMA_8h(ℓ_raw) + (1 - w_f) × EMA_72h(ℓ_raw)
```

Where w_f ≈ 0.4-0.6 (weight on fast EMA).

**Alternative (more robust):**

```
ℓ_blend = max(EMA_8h(ℓ_raw), EMA_72h(ℓ_raw))
```

Using max() prevents gaming where someone creates brief relief periods to lower the average.

### Stress Thresholds

We define two thresholds:

| Threshold | Symbol | Value | Meaning |
|-----------|--------|-------|---------|
| Noise floor | ℓ₀ | 0.03%/hour | Normal volatility |
| Stress onset | ℓ₁ | 0.20%/hour | Solver is in trouble |

**Derivation of thresholds:**

For a $2,000,000 vault:
- ℓ₀ = 0.03%/hour → $600/hour loss (noise)
- ℓ₁ = 0.20%/hour → $4,000/hour loss (stress)

Annualized:
- ℓ₀ = 0.03% × 24 × 365 = 263%/year (sounds high, but it's loss rate, not funding)
- ℓ₁ = 0.20% × 24 × 365 = 1,752%/year (clearly unsustainable)

### Converting Stress to Acceleration

**Step 1: Normalize ℓ to [0, 1]**

```
stress_level = (ℓ - ℓ₀) / (ℓ₁ - ℓ₀)
```

**Step 2: Clamp to [0, 1]**

```
clamped_stress = clip(stress_level, 0, 1)
```

Where clip(x, 0, 1) = max(0, min(x, 1))

**Step 3: Calculate multiplier**

```
m(ℓ) = 1 + k × clip((ℓ - ℓ₀)/(ℓ₁ - ℓ₀), 0, 1)
```

Where k is the maximum acceleration (typically 2, giving m ∈ [1, 3]).

**How the multiplier behaves:**

| ℓ | (ℓ-ℓ₀)/(ℓ₁-ℓ₀) | clipped | m (with k=2) |
|---|----------------|---------|--------------|
| 0.02% | -0.06 | 0 | 1.0 |
| 0.03% (ℓ₀) | 0 | 0 | 1.0 |
| 0.10% | 0.41 | 0.41 | 1.82 |
| 0.20% (ℓ₁) | 1.0 | 1.0 | 3.0 |
| 0.30% | 1.59 | 1.0 | 3.0 |

### Applying Acceleration via Effective Time

**The Key Trick:**

Instead of changing the funding formula, we speed up time:

```
t_eff(t + Δt) = t_eff(t) + m(ℓ(t)) × Δt
```

Then use t_eff in the funding formula:

```
F(t) = min(F_base + b × t_eff(t)^q, F_max)
```

**Example:**

Normal conditions (ℓ < ℓ₀, m = 1):
- After 7 real days: t_eff = 7 days

Stressed conditions (ℓ = ℓ₁, m = 3):
- After 7 real days: t_eff = 21 days
- Reaches F_max 3× faster!

### Why This Design Is Elegant

1. **Separation of concerns:** Base curve logic is unchanged
2. **Predictable:** Same formula, just faster clock
3. **Smooth:** No sudden jumps in funding rate
4. **Testable:** Each component can be verified independently

---

## 10. Part 5: Dynamic Spread Adjustments

### Why Spread Matters

Funding rates are periodic payments (every 8 hours). But traders can open and close positions at any time. **Dynamic spreads** provide instant incentives:

- **Immediate effect** vs waiting 8 hours for funding
- **Asymmetric** - can charge different rates for opening vs closing
- **Direction-aware** - can incentivize the side we need

### The Two Spread Modes

Like funding, spreads operate in two modes based on exposure state:

#### Mode 1: Token Inventory Spread

When exposure is within token inventory limits:

```
spread_long_open  = base_spread × (1 + α × U_token)
spread_short_open = base_spread × (1 - β × (1 - U_token))

where:
  base_spread = normal trading spread (e.g., 0.1%)
  U_token = token utilization
  α, β = sensitivity parameters
```

**Intuition:** As token utilization rises, it becomes more expensive for longs to open and cheaper for shorts.

#### Mode 2: Insurance Fund Spread (Aggressive)

When we have unhedged exposure (insurance capital at risk):

```
spread_long_open  = base_spread × (1 + γ × U_insurance)
spread_long_close = base_spread × (1 + δ × U_insurance)  // Charge to exit too!
spread_short_open = base_spread × (1 - ε × U_insurance)   // Negative = rebate!

where:
  U_insurance = insurance fund utilization
  γ, δ, ε = aggressiveness parameters (γ > α, etc.)
```

**Key insight:** In insurance mode, we may pay traders to open shorts (negative spread). This is cheaper than hitting ADL.

### Spread Adjustment Table

| State | Long Open | Long Close | Short Open | Short Close |
|-------|-----------|------------|------------|-------------|
| Normal (U < 80%) | Base | Base | Base | Base |
| Stress (80-95%) | +50-100% | Base | -20% | Base |
| Critical (>95%) | +200% | +50% | -50% | Base |
| Insurance Mode | +300%+ | +100% | **Negative** | Base |

### Example: The $BERT Scenario

Starting state:
- $120k longs, $80k shorts → $40k net long exposure
- $50k token inventory → fully hedged

After shorts close:
- $120k longs, $60k shorts → $60k net long exposure  
- $50k token inventory → **$10k unhedged**

Spread response:
```
// Switch to Insurance Mode
spread_long_open  = 0.1% × (1 + 3 × 0.25) = 0.175%   // 75% more expensive
spread_long_close = 0.1% × (1 + 1 × 0.25) = 0.125%   // 25% more expensive  
spread_short_open = 0.1% × (1 - 2 × 0.25) = -0.05%   // WE PAY THEM 0.05%
```

**Result:** Shorts are incentivized to enter, longs are discouraged from opening or encouraged to close.

### Combining Spread + Funding

The total cost to a trader is:

```
Total Cost = Spread (immediate) + Funding (periodic)
```

Both increase together in stress/emergency, creating compounding pressure to rebalance.

---

## 11. Part 6: Putting It All Together

### The Complete Funding Rate Algorithm

```
FUNCTION calculate_funding():
    
    # Step 1: Calculate smoothed utilization
    U_smoothed = EMA_24h(U_raw)
    
    # Step 2: Determine regime
    IF U_smoothed ≤ U*:
        RETURN F_base                    # Normal regime
    
    ELSE IF U_smoothed < U_crit OR time_above_crit < T_grace:
        # Stress regime (kinked curve)
        s = (U_smoothed - U*) / (1 - U*)
        RETURN F_base + a × s^p
    
    ELSE:
        # Emergency regime (time-based ramp with acceleration)
        
        # Calculate loss intensity
        ℓ = calculate_loss_intensity()
        
        # Calculate acceleration multiplier
        m = 1 + k × clip((ℓ - ℓ₀)/(ℓ₁ - ℓ₀), 0, 1)
        
        # Update effective time
        t_eff = t_eff + m × Δt
        
        # Calculate funding with accelerated time
        F = F_base + b × t_eff^q
        
        # Apply cap
        RETURN min(F, F_max)
```

### State Transition Diagram

```
                    U drops below U*
    +----------+  <------------------  +----------+
    |  NORMAL  |                       |  STRESS  |
    | F = F_base|  ------------------>  | F = curve |
    +----------+   U exceeds U*        +----------+
                                            |
                                            | U ≥ U_crit for T_grace days
                                            v
                                       +------------+
                                       | EMERGENCY  |
                                       | F = ramp   |
                                       +------------+
                                            |
                                            | U drops below U_crit
                                            | (slow decay of t_eff)
                                            v
                                       +----------+
                                       |  STRESS  |
                                       +----------+
```

### Guardrails

**1. Maximum Acceleration Cap**

```
m ≤ m_max (recommended: 3-5)
```

**2. Maximum Daily Funding Change**

```
|F(t + 1 day) - F(t)| ≤ ΔF_max (recommended: 25-30% APR/day)
```

**3. Asymmetric Decay**

Funding increases fast, decreases slow:

```
When stress decreases:
    m decays with EMA (already handled)
    t_eff decreases slowly (or not at all)
```

**4. Failure Mode: Beyond Funding**

If EMA(U) ≥ 95% AND F = F_max for ≥ 7 days:
- Reduce max leverage (20× → 15× → 10×)
- Increase initial margin requirements
- Restrict new position sizes

---

## 12. Worked Examples

### Example 1: Normal Operation

**Given:**
- Utilization U = 70%
- U* = 80%

**Calculation:**

Since U < U*, we're in Normal regime:

```
F = F_base = 30% APR
```

**Per 8-hour funding:**
```
F_8h = 30% / (3 × 365) = 0.0274%
```

A trader with a $10,000 position pays:
```
$10,000 × 0.0274% = $2.74 per 8 hours
```

---

### Example 2: Stress Regime

**Given:**
- Utilization U = 90%
- U* = 80%
- a = 100% APR
- p = 2

**Calculation:**

Step 1: Calculate normalized stress
```
s = (U - U*) / (1 - U*) = (0.90 - 0.80) / (1 - 0.80) = 0.10 / 0.20 = 0.5
```

Step 2: Apply convexity
```
s^p = 0.5^2 = 0.25
```

Step 3: Calculate funding
```
F = F_base + a × s^p = 30% + 100% × 0.25 = 30% + 25% = 55% APR
```

**Per 8-hour funding:**
```
F_8h = 55% / 1095 = 0.0502%
```

---

### Example 3: Emergency Regime (No Acceleration)

**Given:**
- Utilization ≥ 95% for 7 days (emergency triggered)
- Day 5 of emergency
- No solver stress (ℓ < ℓ₀, so m = 1)
- b = 8%, q = 1.5

**Calculation:**

Step 1: t_eff = t (no acceleration)
```
t_eff = 5 days
```

Step 2: Calculate funding
```
F = F_base + b × t_eff^q
F = 30% + 8% × 5^1.5
F = 30% + 8% × 11.18
F = 30% + 89.4%
F = 119.4% APR
```

---

### Example 4: Emergency Regime with Acceleration

**Given:**
- Same as Example 3, but solver is stressed
- Loss intensity ℓ = 0.15%/hour
- ℓ₀ = 0.03%, ℓ₁ = 0.20%, k = 2

**Calculation:**

Step 1: Calculate stress level
```
stress_level = (ℓ - ℓ₀) / (ℓ₁ - ℓ₀)
             = (0.15% - 0.03%) / (0.20% - 0.03%)
             = 0.12% / 0.17%
             = 0.706
```

Step 2: Calculate multiplier
```
m = 1 + k × clip(0.706, 0, 1)
m = 1 + 2 × 0.706
m = 2.41
```

Step 3: Calculate effective time
Over 5 real days with constant m = 2.41:
```
t_eff = 5 × 2.41 = 12.05 days
```

Step 4: Calculate funding
```
F = 30% + 8% × 12.05^1.5
F = 30% + 8% × 41.8
F = 30% + 334.4%
F = 364.4% APR → capped to 300% APR
```

**Result:** Reaches maximum funding in ~5 days instead of ~11 days!

---

### Example 5: Loss Intensity Calculation

**Given:**
- Solver equity E = $2,000,000
- Over the past hour, solver lost $3,000
- Previous EMA_8h(ℓ) = 0.10%/hour

**Calculation:**

Step 1: Calculate raw loss intensity
```
L̇ = $3,000 / 1 hour = $3,000/hour
ℓ_raw = L̇ / E = $3,000 / $2,000,000 = 0.15%/hour
```

Step 2: Update EMA (α = 2/(8+1) = 0.222)
```
EMA_new = α × ℓ_raw + (1-α) × EMA_old
EMA_new = 0.222 × 0.15% + 0.778 × 0.10%
EMA_new = 0.0333% + 0.0778%
EMA_new = 0.111%/hour
```

---

## 13. Parameter Reference

### Recommended Defaults for Low-Cap 20× Perps

| Parameter | Symbol | Recommended | Range |
|-----------|--------|-------------|-------|
| **Utilization** |
| Optimal utilization | U* | 0.80 | 0.75-0.85 |
| Critical utilization | U_crit | 0.95 | 0.90-0.95 |
| Grace period | T_grace | 5-7 days | 3-10 days |
| Smoothing window | - | 24-72h EMA | - |
| **Funding Rates** |
| Base funding | F_base | 30% APR | 20-40% |
| Maximum funding | F_max | 300% APR | 200-400% |
| **Stress Curve** |
| Stress amplitude | a | 70-100% | 50-150% |
| Stress convexity | p | 2-3 | 1.5-4 |
| **Emergency Ramp** |
| Ramp coefficient | b | 8-10% | 5-15% |
| Ramp convexity | q | 1.5 | 1.2-2.0 |
| **Acceleration** |
| Noise floor | ℓ₀ | 0.03%/hour | 0.02-0.05% |
| Stress threshold | ℓ₁ | 0.20%/hour | 0.15-0.30% |
| Max acceleration | k | 2 (→3×) | 1-4 |
| Max multiplier | m_max | 3-5 | 2-7 |
| Fast EMA | - | 8 hours | 4-12h |
| Slow EMA | - | 72 hours | 48-168h |
| **Guardrails** |
| Max daily change | ΔF_max | 25-30%/day | 15-50% |

### Conversion Formulas

**APR to 8-hour rate:**
```
F_8h = F_APR / 1095
```

**APR to daily rate:**
```
F_daily = F_APR / 365
```

**Daily loss to hourly:**
```
ℓ_hourly = ℓ_daily / 24
```

---

## Appendix A: Why These Formulas?

### Why Power Functions for Convexity?

Power functions x^p have these properties:
- Pass through (0,0) and (1,1) for any p
- p > 1 creates upward curvature
- p < 1 creates downward curvature
- Simple to compute and understand

Alternatives like exponential (e^x) or logistic curves are more complex without clear benefits.

### Why EMA for Smoothing?

Alternatives:
- **Simple Moving Average (SMA):** Gives equal weight to all periods; sudden jumps when old data drops off
- **Weighted Moving Average (WMA):** Better, but harder to compute
- **EMA:** Decays smoothly, easy incremental update, widely understood

### Why Separate Fast and Slow EMAs?

- **Fast only:** Too reactive; can be gamed with brief relief periods
- **Slow only:** Too sluggish; misses genuine sudden stress
- **Both:** Captures short-term spikes AND persistent trends

---

## Appendix B: Comparison to Other Systems

### Aave/Compound (Lending)

| Aspect | Aave/Compound | This Model |
|--------|---------------|------------|
| Asset type | Loans | Perpetual positions |
| Risk metric | Utilization | Utilization + Solver exposure |
| Rate response | Instant | Smoothed |
| Time factor | None | Emergency ramp |
| Bad debt risk | Yes | No (core invariant) |

### GMX / Hyperliquid (Perps)

| Aspect | GMX/Hyperliquid | This Model |
|--------|-----------------|------------|
| Settlement | External execution | Internal inventory |
| Liquidation risk | Bad debt possible | No bad debt |
| Funding ceiling | Variable | 300% APR cap |
| Stress acceleration | Limited | Full loss-velocity model |

---

## Appendix C: Implementation Notes

### Numerical Stability

1. **Avoid division by zero:**
   - Check (ℓ₁ - ℓ₀) ≠ 0 before dividing
   - Check E > 0 before computing ℓ

2. **Precision:**
   - Use at least 18 decimal places for on-chain math
   - Or use fixed-point arithmetic (e.g., multiply by 10^18)

3. **Overflow:**
   - t^1.5 can be large; check bounds before computing
   - Use min() early to cap intermediate values

### Gas Optimization (for on-chain)

1. **Precompute constants:**
   - 1/(ℓ₁ - ℓ₀) can be stored
   - 1/(1 - U*) can be stored

2. **Update EMA incrementally:**
   - Store only EMA state, not history
   - One multiplication + one addition per update

3. **Batch updates:**
   - Update funding once per block, not per trade

---

## Glossary

| Term | Definition |
|------|------------|
| **APR** | Annual Percentage Rate — interest expressed per year |
| **Convexity** | A curve that bends upward (accelerating) |
| **Delta** | Net directional exposure to the underlying asset |
| **EMA** | Exponential Moving Average — a smoothing technique |
| **Funding Rate** | Periodic payment between longs and shorts |
| **Hedge Ratio** | Fraction of exposure that is offset |
| **Kink** | The point where a curve changes slope |
| **Leverage** | Ratio of position size to collateral |
| **Liquidation** | Forced closing of a position due to insufficient collateral |
| **Loss Intensity** | Rate of loss as a percentage of equity |
| **Market Cap** | Total value of all tokens in circulation |
| **Perp / Perpetual** | A derivative contract with no expiration |
| **Solver** | The entity that takes the opposite side of trades |
| **Utilization** | Ratio of used capacity to total capacity |

---

*Document Version: 1.0*
*Last Updated: January 2026*

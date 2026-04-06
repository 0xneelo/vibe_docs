# 10. Defense Hierarchy: The Complete Protection Stack

## Overview: Defense in Depth

Before Auto-Deleveraging (ADL) ever triggers, the system has **five layers of defense**. Think of it like an onion—each layer must be exhausted before the next is touched.

---

## The Five-Layer Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: USER POSITION NETTING                             │
│  Longs vs Shorts cancel out naturally                       │
│  Cost: $0 (free protection)                                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: SOLVER TOKEN INVENTORY                            │
│  Actual tokens held back the exposure                       │
│  Cost: Opportunity cost of holding tokens                   │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: LOCAL INSURANCE FUND                              │
│  Per-market USDC pool from liquidations + profits           │
│  Cost: 30% of profits + 100% liquidation fees               │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: GLOBAL INSURANCE FUND (Partial)                   │
│  Shared pool with capped allocation per market              │
│  Cost: Cross-market risk mutualization                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: AUTO-DELEVERAGING (ADL)                           │
│  Forcibly close winning positions                           │
│  Cost: User experience, trust                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: User Position Netting

### Mechanism

Users naturally offset each other:

```
Netted Amount = min(L, S)
```

**Example:**
- Longs: $120,000
- Shorts: $80,000
- Netted: $80,000
- Net exposure: $40,000

### Properties

| Property | Value |
|----------|-------|
| Capital required | $0 |
| Risk absorbed | Highest priority |
| Failure mode | None (always works) |

### Protection Amount

```
Protection_netting = min(L, S)
```

This is "free" protection—no capital required.

---

## Layer 2: Solver Token Inventory

### Mechanism

The solver holds actual tokens that back the net exposure:

```
Covered Amount = min(E_usd, P × T_holdings)
```

**Example:**
- Token holdings: 5,000 tokens @ $10 = $50,000
- Net exposure: $40,000
- Covered: $40,000 (fully hedged)

### Properties

| Property | Value |
|----------|-------|
| Capital required | Token holdings |
| Risk absorbed | Up to token value |
| Failure mode | Exposure exceeds holdings |

### Protection Amount

```
Protection_tokens = P × T_holdings
```

### When Exhausted

If `E_usd > P × T_holdings`:
- **Unhedged exposure** emerges
- System switches to Insurance Mode
- Dynamic pricing becomes aggressive

---

## Layer 3: Local Insurance Fund

### Mechanism

Each market has a dedicated USDC pool:

```
I_loc = Σ(liquidation_fees) + 0.30 × Σ(solver_profits)
```

### Funding Sources

1. **100%** of liquidation profits from this market
2. **30%** of solver profits from this market
3. CVA charges (if applicable)

### Properties

| Property | Value |
|----------|-------|
| Capital required | Accumulated from operations |
| Risk absorbed | Configurable (e.g., 30%) |
| Failure mode | Fund depleted |
| Isolation | Cannot be drained by other markets |

### Protection Amount

```
Protection_local = η_loc × I_loc
```

Where `η_loc` is the fraction willing to risk (e.g., 30%).

### Spend Constraint

```
x_m_loc ≤ B_m_loc  (per-period cap)
x_m_loc ≤ η_loc × I_loc  (total available)
```

---

## Layer 4: Global Insurance Fund

### Mechanism

A shared pool across all markets with restrictions:

```
I_m_glob = allocation(I_glob, market_m)
```

### Eligibility Rules

- **NOT** every token qualifies
- Prevents scam token contagion
- Eligibility set manually per market
- Non-eligible markets: Local insurance only

### Allocation Limits

- Never risk 100% of global fund in one market
- Per-market allocation set manually
- Example: "Risk max 1% of global for $BERT"

### Properties

| Property | Value |
|----------|-------|
| Capital required | System-wide pool |
| Risk absorbed | Capped allocation |
| Failure mode | Allocation exhausted |
| Governance | Manual parameter setting |

### Protection Amount

```
Protection_global = η_glob × I_m_glob
```

Where `η_glob` is typically 100% of the allocation.

### Spend Constraint

```
x_m_glob ≤ B_m_glob  (per-period cap)
Σ_m x_m_glob ≤ B_glob  (system-wide cap)
```

---

## Layer 5: Auto-Deleveraging (ADL)

### Mechanism

When all other defenses are exhausted, forcibly close positions:

```
E(t+Δt) = (1 − a_m) × E(t)
```

Where `a_m ∈ [0, 1]` is the ADL fraction.

### Trigger Condition

```
ADL triggers when:
  (x_m = B_m_def AND D_m_res > 0)
  OR
  (E_usd > E_safe)
```

### What ADL Does

1. Identifies winning positions (in profit)
2. Force-closes them against losing side
3. Reduces system exposure
4. Protects solvency at cost of UX

### Properties

| Property | Value |
|----------|-------|
| Capital required | None (closes positions) |
| Risk absorbed | Unlimited |
| Failure mode | None (always works) |
| Cost | User experience, trust |

### ADL Priority

1. Largest winners first
2. Oldest positions (tiebreaker)
3. Proportional (if needed)

---

## Total Defense Budget

### Per-Market

```
B_m_def = B_m_loc + B_m_glob
```

### Protection Sequence

For a given exposure `E_usd`:

```
1. Netting absorbs: min(L, S)
2. Tokens absorb: min(E_remaining, P × T)
3. Local insurance absorbs: min(D_remaining, η_loc × I_loc)
4. Global insurance absorbs: min(D_remaining, η_glob × I_m_glob)
5. ADL absorbs: Everything else
```

### Max Loss Before ADL

```
Max_Loss_Before_ADL = 
    (P × T_holdings)           # Layer 2
  + (η_loc × I_loc)            # Layer 3
  + (η_glob × I_m_glob)        # Layer 4
```

**Example:**
```
Tokens: $50,000
Local insurance @ 30%: $100,000 × 0.30 = $30,000
Global allocation @ 100%: $10,000

Max loss before ADL = $50,000 + $30,000 + $10,000 = $90,000
```

---

## Defense Activation Timeline

### T = 0: Normal Operation

```
Utilization: 50%
Layers active: 1 (Netting)
Status: Green
```

### T = 1: Utilization Rising

```
Utilization: 85%
Layers active: 1-2 (Netting + Tokens)
Status: Yellow (Stress regime)
Action: Elevated funding/spreads
```

### T = 2: High Utilization

```
Utilization: 98%
Layers active: 1-2
Status: Orange (Critical)
Action: Emergency funding ramp
```

### T = 3: Unhedged Exposure

```
Utilization: 120%
Layers active: 1-3 (+ Local Insurance)
Status: Red (Insurance Mode)
Action: 
  - Aggressive spreads
  - Negative spreads for rebalancing side
  - Deploy local insurance
```

### T = 4: Local Insurance Depleted

```
Layers active: 1-4 (+ Global Insurance)
Status: Red
Action:
  - Deploy global insurance
  - Maximum aggressive pricing
  - Prepare for possible ADL
```

### T = 5: All Insurance Exhausted

```
Layers active: 1-5 (ADL)
Status: Critical
Action:
  - Trigger ADL
  - Deleverage to safe level
  - Reset to sustainable state
```

---

## Comparison: What Each Layer Costs

| Layer | Capital Cost | Operational Cost | UX Cost |
|-------|--------------|------------------|---------|
| Netting | $0 | None | None |
| Tokens | Holding cost | Management | None |
| Local Insurance | 30% profits | Accounting | None |
| Global Insurance | Shared pool | Governance | None |
| ADL | $0 | Execution | **High** |

---

## Why This Order?

### Principle: Minimize UX Impact

1. **Netting**: Free, no UX impact
2. **Tokens**: Pre-committed capital, no active impact
3. **Local Insurance**: Market's own earnings, fair
4. **Global Insurance**: Shared risk, still no forced closes
5. **ADL**: Only when absolutely necessary

### Principle: Isolate Contagion

- Local insurance is isolated per market
- Global insurance has capped allocation
- Scam tokens can't drain global fund
- One market's failure doesn't cascade

### Principle: Align Incentives

- Markets fund their own insurance (liquidations + profits)
- Good markets build bigger buffers
- Poor markets have less runway before ADL

---

## Configuration Parameters

| Parameter | Symbol | Description | Typical |
|-----------|--------|-------------|---------|
| Local risk % | `η_loc` | % of local fund to risk | 30% |
| Global risk % | `η_glob` | % of global allocation | 100% |
| Local spend cap | `B_m_loc` | Per-period limit | Variable |
| Global spend cap | `B_glob` | System limit | Variable |
| Global eligibility | — | Which markets can use global | Manual |
| ADL safe target | `E_safe` | Level to deleverage to | `P×T/A` |

---

*Next: [11. Full combined objective](11_full_objective.md)*

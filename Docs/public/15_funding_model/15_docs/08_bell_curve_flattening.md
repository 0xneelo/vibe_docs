# 08. Bell Curve Flattening: Cross-Market Risk Mutualization

## The Core Idea

> **Give profits of big winners to big losers.**

As we expect some markets to have big trader wins and some to have big trader losses, we can "flatten" the distribution by transferring PnL from the right tail (profitable markets) to the left tail (losing markets).

This is a **cross-market insurance layer** that reduces tail volatility without changing aggregate expectancy.

---

## Mathematical Framework

### Distribution Statistics

Given per-market profits `{Π_m}` for `m ∈ {1, ..., M}`:

**Mean:**
```
μ = (1/M) · Σ_m Π_m
```

**Standard Deviation:**
```
σ = √[(1/(M−1)) · Σ_m (Π_m − μ)²]
```

### Threshold Parameters

| Parameter | Symbol | Range | Description |
|-----------|--------|-------|-------------|
| Tail threshold | `k` | > 0 | How many σ defines "tail" (e.g., 1.5) |
| Flatten intensity | `β` | [0, 1] | 0 = none, 1 = full equalization |
| Protocol haircut | `δ` | [0, 1] | Fraction retained as insurance premium |

### Cutoffs

**Upper cutoff (winners above this are "big winners"):**
```
U := μ + k·σ
```

**Lower cutoff (losers below this are "big losers"):**
```
L := μ − k·σ
```

---

## Tail Identification

### Right-Tail Excess (Winner Surplus)

For each market:
```
E_m := max(0, Π_m − U)
```

Markets with `E_m > 0` are "winners" contributing to the pool.

### Left-Tail Shortfall (Loser Deficit)

For each market:
```
S_m := max(0, L − Π_m)
```

Markets with `S_m > 0` are "losers" receiving from the pool.

### Totals

```
E := Σ_m E_m   (total winner excess)
S := Σ_m S_m   (total loser shortfall)
```

---

## Transfer Pool

### Conservative Pool Size

To ensure feasibility (never transfer more than exists on either tail):

```
T := β · min(E, S)
```

### With Protocol Retention

If the protocol keeps a fraction as insurance premium:

```
T_dist := (1 − δ) · T   (amount actually distributed)
T_fee := δ · T          (retained by protocol)
```

---

## Allocation Rules

### Tax on Winners (Proportional to Excess)

```
τ_m = {
    T_dist · (E_m / E)   if E > 0
    0                     if E = 0
}
```

### Subsidy to Losers (Proportional to Shortfall)

```
γ_m = {
    T_dist · (S_m / S)   if S > 0
    0                     if S = 0
}
```

### Flattened Profit

```
Π'_m = Π_m − τ_m + γ_m
```

---

## Key Invariants

### Conservation (if δ = 0)

```
Σ_m Π'_m = Σ_m Π_m
```

Total profit unchanged—only distribution is compressed.

### With Retention (if δ > 0)

```
Σ_m Π'_m = Σ_m Π_m − T_fee
```

Protocol retains `T_fee` as insurance reserve.

---

## Worked Example

### Input Data

| Market | Π_m (raw) |
|--------|-----------|
| A | +$50,000 |
| B | +$30,000 |
| C | +$10,000 |
| D | −$5,000 |
| E | −$35,000 |

### Statistics

```
μ = (50 + 30 + 10 − 5 − 35) / 5 = $10,000
σ = $32,000 (approx)
```

### Parameters

```
k = 1.0 (one standard deviation)
β = 0.8 (80% transfer)
δ = 0 (no retention)
```

### Cutoffs

```
U = μ + k·σ = 10,000 + 32,000 = $42,000
L = μ − k·σ = 10,000 − 32,000 = −$22,000
```

### Tail Identification

| Market | Π_m | E_m (excess) | S_m (shortfall) |
|--------|-----|--------------|-----------------|
| A | +$50,000 | $8,000 | $0 |
| B | +$30,000 | $0 | $0 |
| C | +$10,000 | $0 | $0 |
| D | −$5,000 | $0 | $0 |
| E | −$35,000 | $0 | $13,000 |

```
E = $8,000 (total excess from A)
S = $13,000 (total shortfall from E)
```

### Transfer Pool

```
T = β · min(E, S) = 0.8 × min(8000, 13000) = $6,400
```

### Allocations

**Tax (from A only, since only A has excess):**
```
τ_A = 6,400 × (8,000 / 8,000) = $6,400
τ_B = τ_C = τ_D = τ_E = $0
```

**Subsidy (to E only, since only E has shortfall):**
```
γ_E = 6,400 × (13,000 / 13,000) = $6,400
γ_A = γ_B = γ_C = γ_D = $0
```

### Flattened Profits

| Market | Π_m (raw) | τ_m | γ_m | Π'_m (flattened) |
|--------|-----------|-----|-----|------------------|
| A | +$50,000 | $6,400 | $0 | **+$43,600** |
| B | +$30,000 | $0 | $0 | +$30,000 |
| C | +$10,000 | $0 | $0 | +$10,000 |
| D | −$5,000 | $0 | $0 | −$5,000 |
| E | −$35,000 | $0 | $6,400 | **−$28,600** |

**Total before:** $50,000  
**Total after:** $50,000 ✓ (conserved)

**Effect:** A's extreme profit reduced, E's extreme loss reduced.

---

## Alternative: Shrink Toward Mean

For simpler bell-curve flattening (no explicit transfer pool):

```
Π'_m = μ + α · (Π_m − μ),   0 < α < 1
```

Where `α` controls compression strength.

**Pros:** Extremely simple, one parameter
**Cons:** Doesn't explicitly "pay losers with winners"; compresses everyone

---

## Connecting to Insurance Allocation

### From Profit Flattening to Stress Coverage

The bell-curve framework can also allocate **insurance spend** to stressed markets:

**Winner surplus (markets with high profit):**
```
E_m_prof := max(0, Π_m − U)
```

**Stress demand (markets needing support):**
```
S_m_stress := D_m   (uncovered exposure loss)
```

**Transfer pool:**
```
T := β · min(Σ_m E_m_prof, Σ_m S_m_stress)
```

**Global insurance spend allocation:**
```
x_m_glob = min(B_m_glob, T · D_m / Σ_j D_j)
```

This mathematically encodes:
> "Give profits of big winners to big losers"

But now "losers" are explicitly "markets with uncovered exposure stress".

---

## Why Bell Curve Flattening Matters

### Problem Without Flattening

- One extreme loser market can drain global insurance
- Winner markets accumulate profits that don't help system stability
- Tail risk is concentrated, not mutualized

### Benefits of Flattening

1. **Risk mutualization**: Extreme outcomes averaged out
2. **Insurance efficiency**: Winners fund losers automatically
3. **Stability**: Reduces probability of ADL in any single market
4. **Fairness**: Markets share fortune and misfortune

### The One-Sentence Summary

> Bell-curve flattening is a cross-market risk mutualization layer: extreme winner markets contribute part of their surplus to cover extreme loser markets, compressing the PnL distribution toward a standard profile while conserving total expected profit.

---

## Parameters Summary

| Parameter | Symbol | Typical Value | Effect |
|-----------|--------|---------------|--------|
| Tail threshold | `k` | 1.0 - 2.0 | Higher = fewer markets affected |
| Flatten intensity | `β` | 0.5 - 1.0 | Higher = more aggressive transfer |
| Protocol retention | `δ` | 0.0 - 0.1 | Higher = more kept as reserve |

---

*Next: [09. Insurance & ADL](09_insurance_adl.md)*

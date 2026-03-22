# 09. Full Combined Objective: The Complete Optimization Problem

## The Master Equation

The system optimizes:

```
max  Σ_m Π'_m  −  λ Σ_m R_m  −  Σ_m C_ins(x_m)  −  Σ_m C_adl(a_m)
```

Subject to:
- Insurance budget constraints
- Global allocation rule (bell-curve flattening)
- Exposure dynamics
- ADL safety constraints

---

## Component 1: Flattened Profit `Π'_m`

### Raw Per-Market Profit

```
Π_m = Rev_m − Cost_m − α·Π_m_traders + Π_m_hedge − L_m_shortfall
```

Where:
```
Rev_m = F_trade + F_spread(s) + F_fund(f) + F_liq + F_mm + F_borrow(b)
Cost_m = C_hedge + C_borrow_ext + C_ops
```

### Bell-Curve Flattening

Compute distribution stats:
```
μ = (1/M) Σ_m Π_m
σ = √[(1/(M-1)) Σ_m (Π_m − μ)²]
```

Define cutoffs:
```
U = μ + k·σ   (upper)
L = μ − k·σ   (lower)
```

Compute tails:
```
E_m = max(0, Π_m − U)   (winner excess)
S_m = max(0, L − Π_m)   (loser shortfall)
```

Transfer pool:
```
T = β · min(Σ_m E_m, Σ_m S_m)
```

Allocations:
```
τ_m = T · E_m / Σ_j E_j   (tax from winners)
γ_m = T · S_m / Σ_j S_j   (subsidy to losers)
```

**Flattened profit:**
```
Π'_m = Π_m − τ_m + γ_m
```

**Invariant:** `Σ_m Π'_m = Σ_m Π_m` (conserved)

---

## Component 2: Local Risk Score `R_m`

### Formula

```
R_m = w₁·ϕ(u₁) + w₂·ϕ(u₂) + w₃·ϕ(|skew|) + w₄·ϕ(dev) + w₅·ϕ(σ) + w₆·ϕ(D_m_res)
```

### Input Signals

| Signal | Symbol | Formula | Risk When High |
|--------|--------|---------|----------------|
| Token utilization | `u₁` | `E_usd / C_usd` | Low token coverage |
| Insurance utilization | `u₂` | `L(E) / B_ins` | Insurance stressed |
| Skew | `|skew|` | `|L-S| / (L+S)` | Imbalanced market |
| Profit deviation | `dev` | Target vs actual | Below target |
| Volatility | `σ` | Price std dev | Unstable |
| Residual stress | `D_m_res` | `max(0, D_m - x_m)` | Uncovered after insurance |

### Penalty Functions

**Barrier-style (blow up near limits):**
```
ϕ(u) = −ln(1 − u)  for u ∈ [0, 1)
```

**Convex (quadratic/exponential):**
```
ϕ(x) = x²  or  exp(kx) − 1
```

**Typical shapes:**
```
ϕ_u(u) = −ln(1 − u)           # Utilization barrier
ϕ_skew(s) = s²                 # Quadratic skew penalty
ϕ_vol(σ) = (σ/σ_base − 1)²    # Excess volatility
ϕ_res(D) = D²                  # Residual stress squared
```

### Weights

| Weight | Description | Typical |
|--------|-------------|---------|
| `w₁` | Token utilization importance | 1.0 |
| `w₂` | Insurance utilization importance | 2.0 |
| `w₃` | Skew importance | 0.5 |
| `w₄` | Profit deviation importance | 0.3 |
| `w₅` | Volatility importance | 0.5 |
| `w₆` | Residual stress importance | 3.0 |

---

## Component 3: Insurance Cost `C_ins(x_m)`

### Linear Cost

```
C_ins(x_m) = c_ins · x_m
```

Where `c_ins` is the opportunity cost of deploying insurance.

### With Nonlinearity

```
C_ins(x_m) = c_ins · x_m + c_nl · x_m²
```

Quadratic term discourages excessive insurance use.

---

## Component 4: ADL Penalty `C_adl(a_m)`

### Strongly Convex (Discourages ADL)

```
C_adl(a_m) = c_adl · a_m^p,   p ≥ 2
```

**Typical:** `p = 3` makes ADL very expensive unless necessary.

### Interpretation

- `a_m = 0`: No penalty
- `a_m = 0.1` (10% ADL): Small penalty
- `a_m = 0.5` (50% ADL): Large penalty
- `a_m = 1` (100% ADL): Very large penalty

---

## Constraints

### 1. Insurance Budget Constraints

```
x_m_loc ≤ B_m_loc           (local cap)
x_m_glob ≤ B_m_glob         (per-market global cap)
Σ_m x_m_glob ≤ B_glob       (system global cap)
x_m = x_m_loc + x_m_glob
```

### 2. Global Allocation Rule (Bell-Curve Based)

```
x_m_glob = min(B_m_glob, T_stress · D_m / Σ_j D_j)

where:
  T_stress = β · min(Σ_m E_m_prof, Σ_m S_m_stress)
  S_m_stress = D_m
```

### 3. Exposure Dynamics

```
E(t+Δt) = E(t) − h_m(t) − a_m(t)·E(t)
```

Where:
- `h_m` = hedge action (exposure reduced by trading)
- `a_m` = ADL action (exposure reduced by forced closes)

### 4. ADL Safety Constraints

**Trigger condition:**
```
a_m > 0  only if  (x_m = B_m_def AND D_m_res > 0) OR (E_usd > E_safe)
```

**Target:**
```
E(t+Δt) ≤ E_safe  where  E_safe = P·T_abs / A
```

### 5. Recovery Constraint (Soft)

```
F_spread + F_fund + F_borrow ≥ ρ · L(E)
```

Dynamic pricing should cover `ρ` fraction of exposure loss estimate.

---

## The Complete Optimization Problem

### Primal Form

```
maximize:
    Σ_m Π'_m − λ·Σ_m R_m − Σ_m C_ins(x_m) − Σ_m C_adl(a_m)

subject to:
    # Insurance constraints
    x_m_loc ≤ B_m_loc                        ∀m
    x_m_glob ≤ B_m_glob                      ∀m
    Σ_m x_m_glob ≤ B_glob
    
    # Exposure dynamics
    E_m(t+1) = E_m(t) − h_m − a_m·E_m(t)     ∀m
    
    # ADL trigger
    a_m > 0 ⟹ (x_m = B_m_def ∧ D_m_res > 0) ∨ (E_m > E_safe)
    
    # Safety
    E_m(t+1) ≤ E_safe                        ∀m where a_m > 0
    
    # Non-negativity
    x_m_loc, x_m_glob, a_m ≥ 0               ∀m
    a_m ≤ 1                                   ∀m
```

### Simplified Form (Per-Market)

For a single market, ignoring cross-market terms:

```
maximize:
    Π_m − λ·R_m − c_ins·x_m − c_adl·a_m^p

subject to:
    x_m ≤ B_m_def
    E_m' = (1 − a_m)·E_m − h_m
    a_m > 0 only if (x_m = B_m_def ∧ D_m_res > 0) ∨ (E_m > E_safe)
    E_m' ≤ E_safe if a_m > 0
```

---

## Interpretation: The S-N Field Model

Recall the physical analogy:

| System Component | Field Analogue |
|------------------|----------------|
| `Σ_m Π'_m` | Global attractor (S pole) |
| `Σ_m R_m` | Local repellers (N poles) |
| `λ` | Field strength ratio |
| Trajectories | Capital/liquidity flow |

**The optimization problem says:**
> Maximize profit (move toward S) while being repelled by risk (avoid N), using insurance to smooth the path and ADL only as last resort.

---

## Dynamic Pricing as Implicit Control

The dynamic pricing functions `f(·)`, `s(·)`, `b(·)` are not explicit decision variables—they are **functions of the state**:

```
f = f(u₁, skew, u₂)
s = s(u₁, σ, dev, u₂)
b = b(u₁, dev)
```

This makes the revenue terms `F_spread`, `F_fund`, `F_borrow` **endogenous**—they respond automatically to risk signals.

**Result:** The system is self-regulating within each layer before insurance/ADL needed.

---

## Order of Operations

### 1. Observe State
```
Compute: L, S, E, u₁, u₂, skew, σ, dev
```

### 2. Apply Dynamic Pricing
```
Set: f(·), s(·), b(·) based on state
Result: Implicit rate increases
```

### 3. Compute Revenues and Stress
```
Compute: Rev_m, D_m
```

### 4. Bell-Curve Allocation
```
Compute: τ_m, γ_m for profit flattening
Compute: x_m_glob allocation for stress coverage
```

### 5. Deploy Insurance
```
Set: x_m_loc, x_m_glob
Compute: D_m_res = max(0, D_m − x_m)
```

### 6. ADL if Needed
```
If (x_m = B_m_def ∧ D_m_res > 0) or (E > E_safe):
    Set: a_m to bring E ≤ E_safe
```

### 7. Update State
```
E(t+1) = (1 − a_m)·E(t) − h_m
I_loc(t+1) = I_loc(t) − x_m_loc + inflows
I_glob(t+1) = I_glob(t) − Σx_m_glob + global_inflows
```

---

## The One-Sentence Summary

> **Maximize risk-adjusted profit across all markets by using dynamic pricing to self-regulate, bell-curve flattening to mutualize tail risk, layered insurance to absorb shocks, and ADL only as the final backstop.**

---

## Parameters Summary

| Category | Parameter | Symbol | Typical |
|----------|-----------|--------|---------|
| **Objective** | Risk aversion | `λ` | 0.5-2.0 |
| **Flattening** | Tail threshold | `k` | 1.0-1.5 |
| | Intensity | `β` | 0.8 |
| **Risk Weights** | Utilization | `w₁` | 1.0 |
| | Insurance util | `w₂` | 2.0 |
| | Skew | `w₃` | 0.5 |
| | Residual stress | `w₆` | 3.0 |
| **Insurance** | Local risk % | `η_loc` | 0.30 |
| | Global risk % | `η_glob` | 1.00 |
| **ADL** | Penalty power | `p` | 3 |
| | Penalty scale | `c_adl` | Large |

---

*Next: [10. Worked Examples](10_WORKED_EXAMPLES.md)*

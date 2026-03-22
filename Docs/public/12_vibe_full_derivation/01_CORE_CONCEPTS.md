# 01. Core Concepts: Gradient Flow & Attractor-Repeller Dynamics

## The Fundamental Analogy

The Vibe funding system can be understood through a powerful physical analogy:

> **S (South pole) attracts, N (North pole) pushes**

This maps directly to our optimization landscape:

| Magnet | Math | System Analogue |
|--------|------|-----------------|
| N pole (North) | Source / Local maximum | Local risk (utilization, skew, exposure) |
| S pole (South) | Sink / Global minimum | Global profit / system sustainability |
| Field lines | Gradient flow | Capital/liquidity trajectories |
| Repulsion near N | High gradient magnitude | "Local risk pushes away" |
| Convergence at S | Stable equilibrium | Global attractor |

---

## Mathematical Foundation: Gradient Flow

### The Master Equation

Any system where agents follow local gradients of a potential will be repelled by local extremes and converge toward a global attractor:

```
dx/dt = -∇V(x)
```

Where:
- `V(x)` = potential (energy, risk, cost, stress)
- System moves "downhill" in the potential landscape
- Local gradients push things away from danger
- Global minimum attracts everything

### Mapping to Our System

| Our System | Mathematical Object |
|------------|---------------------|
| Local risk (per market) | High local gradient `∇V` |
| Push away from danger | Force `-∇V` |
| Converge to global profit | Global minimum of `V` |
| Capital/liquidity flow | Trajectory `x(t)` |

---

## Why This Analogy Matters

### 1. Local vs Global Optimization

**Problem with pure gradient ascent:**
- Converges to local maxima (often undesirable)
- Cannot see global structure
- Gets "stuck" in suboptimal states

**Our solution:**
- Local repellers (risk signals) push away from danger zones
- Global attractor (profit) pulls toward sustainability
- Multiple mechanisms prevent local traps

### 2. The Source-Sink Flow Structure

Our system exhibits **source-sink dynamics**:

```
∇·F > 0  near N (source) — divergence, repulsion
∇·F < 0  near S (sink)   — convergence, attraction
```

This structure appears in:
- Magnetism
- Fluid flow
- Capital flow
- Risk routing
- Mean-field games

### 3. Why Magnets Don't Get "Stuck in Local Maxima"

Magnetic fields are **globally constrained** (Maxwell equations):
- Field lines cannot terminate arbitrarily
- Local extrema are structurally unstable
- The geometry eliminates bad local optima by construction

Our system mimics this by:
- Using convex penalties near danger zones (blow up as `u → 1`)
- Cross-market insurance (bell curve flattening)
- Multiple defense layers before ADL

---

## How Systems Avoid Bad Local Optima

### Mechanism 1: Noise / Temperature (Simulated Annealing)

```
x_{t+1} = x_t + η∇f(x_t) + √T · ξ_t
```

- Noise lets you escape local peaks
- As `T → 0`, system settles into global maximum
- Entropy temporarily beats gradient greediness

### Mechanism 2: Momentum / Inertia

```
v_{t+1} = β·v_t + ∇f(x_t)
x_{t+1} = x_t + η·v_{t+1}
```

- Prevents getting stuck on small bumps
- Carries system across shallow local extrema

### Mechanism 3: Repulsive Local Penalties (Our Approach)

```
max_x  f(x) − λ·R_local(x)
```

- Local risk spikes create repulsive gradients
- Flatten or destabilize local maxima
- Only large, stable structures survive

### Mechanism 4: Mean-Field / Population Effects

```
ρ_{t+1}(x) ∝ ρ_t(x) · e^{β·f(x)}
```

- Bad local peaks lose mass
- Global peak accumulates mass
- Collective dynamics beat local traps

---

## The Core Invariant: Why Vibe Is Different

### Traditional Systems (Uniswap, GMX)

```
LP PnL = f(ΔP)  — Price-only, path-independent, unavoidable loss
```

- Liquidations can create bad debt
- Aggressive funding can cause cascades
- IL is mathematically inevitable

### Vibe's Invariant

> **Liquidations are inventory reallocations, not loss events.**

```
LP PnL = Fees + Funding + Liquidations − Trader_PnL
```

- Price enters only indirectly (via trader success)
- Empirically: E[Trader_PnL] < 0 → E[LP_PnL] > 0
- Liquidations generate revenue, not spot sells

### Why This Changes Everything

Because liquidations never create negative equity:
- Faster liquidations = **better** for solver safety
- We can use aggressive funding ramps without fear
- Liquidation cascades are **not** insolvency cascades

---

## The Unified Objective (Preview)

Combining all concepts:

```
max  Σ_m Π'_m  −  λ Σ_m R_m
```

Where:
- `Π'_m` = flattened profit (global attractor)
- `R_m` = local risk score (local repellers)
- `λ` = controls how aggressively risk repels

This is the simplest "global attractor + local repellers" formula that captures:
- S attracts (maximize profit)
- N pushes (minimize risk)

---

## Key Insight: Inversion of Traditional Risk

| Traditional | Vibe |
|-------------|------|
| Uniswap LPs sell volatility | Vibe LPs sell leverage and trader behavior |
| Volatility hurts AMMs | Volatility feeds perp markets |
| Liquidations = risk | Liquidations = revenue |

**That's the inversion.**

---

*Next: [02. Variable Definitions](02_VARIABLE_DEFINITIONS.md)*

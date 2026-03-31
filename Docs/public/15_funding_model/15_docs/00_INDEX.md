# Vibe Perpetual Market - Full Mathematical Derivation

## Document Index

This folder contains the complete mathematical specification for Vibe's perpetual futures system, including funding rates, dynamic spreads, insurance mechanisms, and auto-deleveraging logic.

> **Start here:** [00_ABSTRACT.md](00_ABSTRACT.md) — System overview, master formula, and spec table of contents

---

### Core Documents

| # | File | Description |
|---|------|-------------|
| 00 | [Abstract & Spec TOC](00_ABSTRACT.md) | System overview, master formula, specification index |
| 01 | [Core Concepts](01_CORE_CONCEPTS.md) | Gradient flow analogy, attractor-repeller dynamics |
| 02 | [Variable Definitions](02_VARIABLE_DEFINITIONS.md) | All per-market state variables and notation |
| 03 | [Utilization Modes](03_UTILIZATION_MODES.md) | Token inventory vs insurance fund utilization |
| 04 | [LP Profit Decomposition](04_LP_PROFIT.md) | Revenue streams, costs, trader PnL accounting |
| 05 | [Dynamic Pricing](05_DYNAMIC_PRICING.md) | Funding, spread, and borrow rate formulas |
| 06 | [Bell Curve Flattening](06_BELL_CURVE_FLATTENING.md) | Cross-market risk mutualization |
| 07 | [Insurance & ADL](07_INSURANCE_ADL.md) | Local/global insurance, spend caps, ADL triggers |
| 08 | [Defense Hierarchy](08_DEFENSE_HIERARCHY.md) | Complete protection stack and activation sequence |
| 09 | [Full Combined Objective](09_FULL_OBJECTIVE.md) | The complete optimization problem |
| 10 | [Worked Examples](10_WORKED_EXAMPLES.md) | Numerical examples with real values |

---

## Quick Reference: The One-Line Summary

**System Objective:**

```
max  Σ_m Π'_m  −  λ Σ_m R_m  −  Σ_m C_adl(a_m)
```

Where:
- `Π'_m` = flattened per-market profit (after cross-market insurance transfer)
- `R_m` = local risk score (utilization, skew, exposure, volatility)
- `C_adl(a_m)` = ADL penalty (UX cost of forced deleveraging)
- `λ` = risk aversion parameter

**The Core Invariant:**

> Liquidations are inventory reallocations, not loss events. No trader loss event requires selling the base token into the spot market.

---

## Key Innovations

1. **Two Utilization Modes**: Token inventory utilization vs insurance fund utilization
2. **Bell Curve Flattening**: Transfer profits from winning markets to cover losing markets
3. **Defense-in-Depth**: 5-layer protection before ADL (netting → tokens → local insurance → global insurance → ADL)
4. **Anti-Cyclical Liquidations**: Liquidation profits fund buybacks, not spot sells

---

## Notation Convention

| Symbol | Meaning |
|--------|---------|
| `m` | Market index |
| `t` | Time |
| `P` | Token price |
| `L`, `S` | Long/Short open interest (USDC notional) |
| `E` | Solver exposure |
| `u` | Utilization |
| `Π` | Profit |
| `R` | Risk score |
| `I` | Insurance fund |
| `A` | Aenigma (max exposure multiplier before ADL) |

---

*Last updated: January 2026*

# Vibe Perpetual Market - Full Mathematical Derivation

## Document Index

This folder contains the complete mathematical specification for Vibe's perpetual futures system, including funding rates, dynamic spreads, insurance mechanisms, and auto-deleveraging logic.

> **Start here:** [01_abstract.md](01_abstract.md) — System overview, master formula, and spec table of contents  
> **Why this math exists:** [00_informal_intro.md](00_informal_intro.md) — Informal framing: what the derivation claims vs does not claim, and how it relates to markets, z-score traversal, and solver design

---

### Core Documents

| # | File | Description |
|---|------|-------------|
| 00 | [Informal intro (thought process)](00_informal_intro.md) | Why the problem is not “solvable by math alone”; formulas as problem-sharpening; UX vs LP tradeoff; role of ADL and solvers |
| 01 | [Abstract & spec TOC](01_abstract.md) | System overview, master formula, specification index |
| 02 | [Document index](02_index.md) | This file: directory index and quick reference |
| 03 | [Core concepts](03_core_concepts.md) | Gradient flow analogy, attractor-repeller dynamics |
| 04 | [Variable definitions](04_variable_definitions.md) | All per-market state variables and notation |
| 05 | [Utilization modes](05_utilization_modes.md) | Token inventory vs insurance fund utilization |
| 06 | [LP profit decomposition](06_lp_profit.md) | Revenue streams, costs, trader PnL accounting |
| 07 | [Dynamic pricing](07_dynamic_pricing.md) | Funding, spread, and borrow rate formulas |
| 08 | [Bell curve flattening](08_bell_curve_flattening.md) | Cross-market risk mutualization |
| 09 | [Insurance & ADL](09_insurance_adl.md) | Local/global insurance, spend caps, ADL triggers |
| 10 | [Defense hierarchy](10_defense_hierarchy.md) | Complete protection stack and activation sequence |
| 11 | [Full combined objective](11_full_objective.md) | The complete optimization problem |
| 12 | [Worked examples](12_worked_examples.md) | Numerical examples with real values |

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

*Last updated: April 2026*

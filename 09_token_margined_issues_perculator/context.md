# Token-Margined Issues (Percolator) — Context

This folder contains the dissertation on why token-margined (inverse) perpetual protocols are structurally problematic, using Percolator as the primary case study.

## Structure

| Path | Description |
|------|-------------|
| **01_docs/** | Restructured dissertation (multi-file format) |
| **09_transcripts/** | Source transcripts and context (reflexivity, permissionless self-collateral, etc.) |
| **dissertation.md** | Original single-file dissertation (legacy) |
| **comparison.md** | Original Vibe vs. Percolator comparison (legacy) |

## Key Documents in 01_docs

- **README.md** — Overview, table of contents, key themes
- **00-Abstract.md** — Executive summary
- **01-Introduction.md** — Paradigms, thesis
- **02-Percolator-Architecture.md** — Design, inverted mode, SOV
- **03-Reflexivity-and-Convexity.md** — Double-hit, negative convexity
- **04-LP-Economics-and-Leverage.md** — Lose-lose quadrant, 1× constraint
- **05-Oracle-Manipulation-Death-Spiral.md** — Circuit breaker, spot-perp, death spiral
- **06-Capital-and-Historical.md** — Isolation, graveyard (Futureswap, Drift, Synthetix)
- **07-Percolator-Strengths.md** — Engineering achievements, what cannot be fixed
- **08-Structurally-Superior-Alternative.md** — USDC-margined hybrid, active risk
- **09-Vibe-vs-Percolator.md** — Full comparative analysis
- **10-Conclusion.md** — Summary, path forward

## The Core Thesis

Token-margined perpetuals suffer from seven failure modes that are **inherent to the economic model**, not implementation: reflexivity, negative convexity, LP lose-lose, 1× leverage, oracle paradox, manipulation amplification, death spiral. The path forward is USDC-margined hybrid architectures with active risk management (e.g., Vibe).

## Related Papers

- **02_perps_categories_zscore** — Bootstrap Trilemma, framework
- **04_proof_of_value** — Vibe LP economics, capital efficiency
- **16_vibe_full_derivation** — Dynamic pricing, defense hierarchy

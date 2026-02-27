# Section 1: Introduction

## 1.1 The Design Question

Perpetual futures—derivatives with no expiry that track an underlying asset via a funding rate mechanism—have become the dominant trading instrument in crypto, exceeding spot volumes on most major exchanges. The design question of *what currency to denominate collateral and settlement in* is not merely UX; it is a foundational architectural choice that determines risk profile, capital efficiency, failure modes, and economic sustainability.

---

## 1.2 Two Paradigms

### Linear (USDC-Margined)

- Collateral and PnL denominated in stablecoin
- Payoff is linear: a $1 move in the underlying generates $1 PnL regardless of direction
- Collateral value is invariant to the traded asset's price

### Inverse (Token-Margined)

- Collateral and PnL denominated in the traded asset itself
- Payoff is non-linear (hyperbolic): `PnL = Contracts × (1/Entry − 1/Exit)`
- Collateral value moves in lockstep with the traded asset—creating reflexive dynamics

---

## 1.3 Percolator: The Case Study

Percolator, authored by Anatoly Yakovenko (co-founder of Solana Labs), is a formally verified risk engine and Solana program for perpetual futures. The open-source suite includes:

- `percolator` — Formally verified Rust risk engine
- `percolator-prog` — Solana program wrapper
- `percolator-match` — Pluggable matcher (passive AMM or custom)
- `percolator-cli` — Command-line interface

**Percolator SOV** is a mainnet fork deployed for the $PERC memecoin: a fully token-margined inverted perpetual market with burned admin keys and a deflationary fee model.

---

## 1.4 The Thesis

This paper argues that the token-margined design, as instantiated in Percolator and its derivatives, is **structurally problematic**—not due to implementation bugs (the codebase is well-engineered and formally verified), but due to **economic and mathematical properties inherent to the inverse perpetual model** that no amount of software engineering can overcome.

---

## 1.5 Permissionless Self-Collateral: The Constraint

A permissionless perp platform where anyone can list a token and use that same token as collateral is not a neutral risk system—it is a **reflexive market machine**. The moment you combine:

- Permissionless listing
- Same-asset collateral

...you lose the right to curate risk. Every listed token creates endogenous risk: the protocol's own mechanics become a source of volatility, amplifying moves that would otherwise be benign.

This is not a criticism of Percolator's engineering—it is a design constraint that follows from the economic model.

---

## 1.6 Scope

We focus on:
- Token-margined perpetuals for **volatile assets** (especially low-cap / memecoins)
- Structural, not implementation, analysis
- Percolator and Percolator SOV as primary examples
- Comparison with USDC-margined hybrid alternatives (Vibe Trading)

---

*Next Section: Percolator Architecture →*

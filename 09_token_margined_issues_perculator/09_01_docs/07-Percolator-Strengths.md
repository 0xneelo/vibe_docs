# Section 7: What Percolator Gets Right

## 7.1 Engineering Achievements

Percolator is an impressive technical achievement:

| Achievement | Description |
|-------------|-------------|
| **Formal verification** | Kani harnesses verify conservation, isolation, no-teleport. 118/118 proofs pass. |
| **Pluggable matchers** | CPI-based architecture allows AMM, RFQ, or CLOB pricing logic |
| **Clean trust boundaries** | Risk engine (accounting), program (validation), matcher (LP-scoped) |
| **Balance sheet safety** | Invariant: "No user can withdraw more value than exists on the exchange balance sheet" rigorously enforced |
| **Fully on-chain** | No off-chain dependency; permissionless keeper crank |
| **Minimal, auditable** | Small state machine; easy to reason about |

---

## 7.2 What Engineering Cannot Fix

All structural problems arise from the **economic model**, not implementation:

| Problem | Engineering Fix? |
|---------|------------------|
| Reflexive collateral risk | No. Inherent to same-asset collateral. |
| Negative convexity | No. Inherent to inverse payoff. |
| LP lose-lose quadrant | No. Inherent to token-denominated settlement. |
| 1× leverage constraint | No. Mathematical limit. |
| Oracle latency exploitation | Partially. Requires off-chain signer (negates fully on-chain). |
| Spot-perp manipulation | No. Amplified by token-margining. |
| Death spiral on shorts | No. Inherent to inverse settlement. |
| Capital inefficiency | No. Inherent to isolated slab model. |

---

## 7.3 ADL: Survival vs. Credibility

Percolator's ADL/haircut prevents *technical* insolvency. But it does so by **confiscating trader profits**—converting protocol failure into user failure. The smart contract survives; the market's credibility does not.

Percolator succeeds as a **proof-of-concept** that Solana can run a fully on-chain, formally verified derivatives engine. As a **financial product** for volatile assets, the token-margined model is structurally unsound.

---

*Next Section: The Structurally Superior Alternative →*

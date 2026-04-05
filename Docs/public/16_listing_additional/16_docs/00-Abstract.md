# Permissionless Perps in Practice — Abstract

## Purpose

This note set translates **operator and trader observations** into a structured comparison of permissionless (or long-tail) perpetual designs. It is not a substitute for live protocol docs or audits. It exists to make three ideas explicit:

1. **Order-book venues** can add **instruments** or **liquidity programs** faster than they can create **generalized, dependable long-tail liquidity**—because depth still requires **makers** and **aligned economics**, not only a new row in an API.
2. **Venues respond differently** to that constraint: some expose **broad participation rails** (e.g. vault-based liquidity) without yet reaching **product–market fit** for thousands of thin markets; others **throttle listings** to match what an order book can realistically support.
3. The **Percolator wave** (and forks such as **Perk.fund**) re-open **permissionless listing**, but **USDC-settled, imbalanced books** and **missing vault/LP layers** reproduce **payout uncertainty** that headline metrics like open interest hide.

## Related Work (in this repo)

- [Listing, liquidity, and generalized bootstrap](../../03_listing_monopoly/03_docs/04z-Listing-And-Liquidity-Thesis.md) — why “listing monopoly” is shorthand for **listing + liquidity**
- [Why token-margined protocols are structurally problematic](../../07_token_margined_issues_perculator/08_docs/README.md) — full Percolator / token-collateral dissertation
- [Ode to the order book](../../04_ode_to_the_orderbook/05_docs/README.md) — majors vs long tail on CLOBs

---

*Next: [1. Order books — dYdX & Hyperliquid](./01-Order-Books-DYdX-Hyperliquid.md)*

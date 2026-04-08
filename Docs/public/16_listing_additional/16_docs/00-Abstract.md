# Permissionless Perps in Practice — Abstract

## Purpose

These notes are **an annex** to the [listing monopoly](../../03_listing_monopoly/03_docs/README.md) section of this repo. They add **extension material**—extra observations and comparisons—focused on **other permissionless (or long-tail) perpetual** platforms and how they are built and experienced in the wild. Together with that chapter, they situate real venues (order-book rails, pool-style systems, Percolator-family stacks) next to the thesis on **listing, liquidity, and generalized bootstrap**. The write-up translates **operator and trader observations** into a structured comparison; it is **not** a substitute for live protocol docs or audits. Three ideas run through the set:

1. **Order-book venues** can add **instruments** or **liquidity programs** faster than they can create **generalized, dependable long-tail liquidity**—because depth still requires **makers** and **aligned economics**, not only a new row in an API.
2. **Venues respond differently** to that constraint: some expose **broad participation rails** (e.g. vault-based liquidity) without yet reaching **product–market fit** for thousands of thin markets; others **throttle listings** to match what an order book can realistically support.
3. The **Percolator wave** (and forks such as **Perk.fund**) re-open **permissionless listing**, but **USDC-settled, imbalanced books** and **missing vault/LP layers** reproduce **payout uncertainty** that headline metrics like open interest hide.

## Related Work (in this repo)

- [Listing, liquidity, and generalized bootstrap](../../03_listing_monopoly/03_docs/04z-Listing-And-Liquidity-Thesis.md) — why “listing monopoly” is shorthand for **listing + liquidity**
- [Why token-margined protocols are structurally problematic](../../07_token_margined_issues_perculator/08_docs/README.md) — full Percolator / token-collateral dissertation
- [Ode to the order book](../../04_ode_to_the_orderbook/05_docs/README.md) — majors vs long tail on CLOBs

---

*Next: [1. Order books — dYdX & Hyperliquid](./01-Order-Books-DYdX-Hyperliquid.md)*

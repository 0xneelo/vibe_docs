# 16 — Listing Additional Notes

Field-level comparison of how major venues approach **permissionless or long-tail perpetuals**: order-book rails (dYdX MegaVault, Hyperliquid’s listing discipline), pool-style venues (GMX), and the **Percolator-family** wave (including Perk.fund). Complements the [listing monopoly thesis](../03_listing_monopoly/03_docs/README.md) and the [Percolator structural critique](../07_token_margined_issues_perculator/07_docs/README.md).

## Permissionless Perps in Practice: Order Books, Pools, and the Percolator Wave

These notes extend the [listing + liquidity thesis](../03_listing_monopoly/03_docs/04z-Listing-And-Liquidity-Thesis.md): **opening a market** is cheap; **making it tradeable** is not. We compare how leading designs respond to **bootstrap** (cold-start liquidity) versus **scale** (deep, continuous two-sided flow), then examine newer **Percolator-style** and forked systems where **settlement and imbalance** create trader-UX failures that raw “open interest” does not capture.

**Product surfaces change.** Concrete parameters (minimum deposits, lockups, auction cadence) are summarized as **observed or reported at drafting time**; verify against live documentation before relying on them for decisions.

→ See [16_docs/README.md](./16_docs/README.md) for the same table with editor-local file links.

---

## Table of Contents

| Section | File | Description |
|---------|------|-------------|
| **Abstract** | [00-Abstract.md](./16_docs/00-Abstract.md) | Scope, disclaimers, related reading |
| **1. Order books** | [01-Order-Books-DYdX-Hyperliquid.md](./16_docs/01-Order-Books-DYdX-Hyperliquid.md) | Bootstrap limits, MegaVault, Hyperliquid’s rare listings |
| **2. Collateralized pools** | [02-Collateralized-Pools-GMX.md](./16_docs/02-Collateralized-Pools-GMX.md) | Finite market lists, TVL tails, backstop mismatch |
| **3. Percolator wave** | [03-Percolator-Wave-Perc-Fund.md](./16_docs/03-Percolator-Wave-Perc-Fund.md) | Forks, Perk.fund, USDC settlement, link to Percolator dissertation |
| **4. Tech vs economics** | [04-Async-Tech-Sync-Economics.md](./16_docs/04-Async-Tech-Sync-Economics.md) | When matching is async on-chain but P&L still needs a counterparty |
| **5. Trader UX** | [05-Liquidity-As-Trader-Experience.md](./16_docs/05-Liquidity-As-Trader-Experience.md) | “Liquidity” as payout reliability; exchange deviation multiplier |
| **6. Summary** | [06-Summary.md](./16_docs/06-Summary.md) | Model map, why hybrid switching matters, related docs |

---

## Related Collections

- **[03_listing_monopoly](../03_listing_monopoly/03_docs/README.md)** — Lifecycle gap, listing + liquidity, generalized bootstrap
- **[07_token_margined_issues_perculator](../07_token_margined_issues_perculator/07_docs/README.md)** — Percolator architecture, token-margined failure modes, Vibe vs Percolator
- **[04_ode_to_the_orderbook](../04_ode_to_the_orderbook/04_docs/README.md)** — Why order books excel at majors and struggle at the long tail

---

*Listing monopoly — practical protocol landscape*

# Section 6: Summary — Model Map and Where the Gap Remains

## 6.1 Three coarse responses to long-tail perps

| Direction | Example posture | Strength | Weak spot for long tail |
|-----------|-----------------|----------|-------------------------|
| **CLOB + vault/LP rails** | dYdX MegaVault | Strong for **majors** when makers show up | **Bootstrap** and **PMF** for thousands of thin markets; **capital/lockup** friction |
| **CLOB + strict listing policy** | Hyperliquid-style auctions | **Honest** about depth limits; better UX for what lists | **Breadth** of permissionless listing |
| **Pool / oracle perps** | GMX-style | Can **bootstrap** some names | **Finite** universe; **tail TVL**; **backstop mismatch** vs narrative underlying |
| **Percolator-family** | Percolator, Perk.fund, forks | **Fast listing**, **on-chain** clarity | **One-sided books**, **USDC settlement** without **inventory**, **token-margined** structural risks (see dissertation) |

No row is “wrong”; each **optimizes a different segment**. The **unsolved** industry problem remains **generalized, dependable liquidity** for **many** long-tail perps—**without** **exchange deviation** collapsing trader UX.

---

## 6.2 Core vocabulary (from these notes)

- **Listing ≠ liquidity** — Symbols are cheap; **tradeable depth** is not.
- **Technically async, economically sync** — On-chain **timing** does not remove **counterparty and settlement** constraints.
- **Exchange deviation multiplier** — **Informal** handle for “does this perp **behave like** the underlying, or like **internal imbalance**?”

---

## 6.3 Related reading (in-repo)

1. [Listing, liquidity, and generalized bootstrap](../../03_listing_monopoly/03_docs/04z-Listing-And-Liquidity-Thesis.md)  
2. [Percolator dissertation — README](../../07_token_margined_issues_perculator/08_docs/README.md)  
3. [Ode to the order book](../../04_ode_to_the_orderbook/05_docs/README.md)  
4. [Framework: value in permissionless perps](../../13_framework_value_permissionless_perps/17_docs/README.md) *(if present in your checkout)*  

---

*End of 16 — Listing additional notes*

# Section 3: The Percolator Wave, Perk.fund, and Settlement Reality

## 3.1 What “Percolator” refers to here

**Percolator** (e.g. Anatoly Yakovenko’s open **perpetuals engine** direction on Solana) stands for a family of ideas: **token-margined** or **inverted** margining, **permissionless market creation**, and **on-chain** clearing primitives. The **engineering** is serious; the **economic** questions are separate.

This repository’s full treatment—including architecture, failure modes, and comparison to **USDC-margined hybrid** designs—is in the dissertation:

→ **[Why token-margined protocols are structurally problematic](../../07_token_margined_issues_perculator/08_docs/README.md)**  
Key entries: [Percolator architecture](../../07_token_margined_issues_perculator/08_docs/02-Percolator-Architecture.md), [Vibe vs Percolator](../../07_token_margined_issues_perculator/08_docs/09-Vibe-vs-Percolator.md).

The sections below only **anchor** that work against **newer forks and UIs** seen in the wild.

---

## 3.2 Perk.fund (Percolator-style fork): permissionless listing, fragile balance

**Perk.fund** (name as observed in product) illustrates how **fast listing** interacts with **USDC settlement** and **one-sided flow**:

- UI copy and market states can show **one-sided** positioning (e.g. **only longs**), with warnings that **funding** may not update until **shorts** appear, and **price may diverge from the oracle**.
- When **everyone is long** and **no shorts** arrive, the system lacks a **symmetric economic closure**: **longs’ P&L** must be **paid by someone**—if there is no **offsetting short book** and no **vault/LP layer** sized for the tail risk, **payouts become uncertain**.

**Interpretation.** This is **permissionless listing** without a **generalized liquidity and risk engine**. The contract may allow **async** entry (long now, short later), but **economics** still need a **counterparty or inventory path** at settlement horizons.

---

## 3.3 “No vaults” and pure peer matching

Some forks emphasize **traders vs traders** with **minimal pooled LP infrastructure**. That can feel **clean** (no LP game), but it **exports the entire bootstrap problem** to **whoever happens to be on the other side**:

- At **t = 0**, **no shorts** → **longs are structurally unmatched** in economic terms.
- **Open interest** can still show **non-zero** numbers while **cumulative payout reliability** is poor—see [Section 5](./05-Liquidity-As-Trader-Experience.md).

---

## 3.4 Token-as-collateral (Percolator / Anatoly direction)

Using the **token itself as margin** is one proposed way to **align inventory with the narrative** and ease **long-bias** imbalance. The dissertation explains why that **does not** magically remove **reflexivity, negative convexity, and oracle–spot attack surface**:

→ [Reflexivity & convexity](../../07_token_margined_issues_perculator/08_docs/03-Reflexivity-and-Convexity.md) · [Oracle & death spiral](../../07_token_margined_issues_perculator/08_docs/05-Oracle-Manipulation-Death-Spiral.md)

**Takeaway for this note:** token-margined **solves one bookkeeping angle** and **introduces others**. The **meta-problem** remains: **long-tail perps need a mechanism that switches** between **inventory modes**, **settlement rails**, and **matching regimes** as the book state changes—something a **single static AMM curve** or **pure CLOB** rarely provides alone.

---

*Next: [4. Async tech, sync economics](./04-Async-Tech-Sync-Economics.md)*

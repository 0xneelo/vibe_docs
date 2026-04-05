# Section 2: Collateralized Pools (GMX-style) and Finite Long Tails

## 2.1 A different bootstrap path

**GMX-style** (and similar **vault-backed**) perpetuals use **pooled collateral** and **oracle-priced** execution so that **liquidity is a protocol object**, not only a grid of resting orders. That can **bootstrap** markets that would never attract CLOB makers on day one.

The limitation, empirically, is **scale of the universe**: the same economics and risk framework that make a pool workable also force **curation**. You do not get **tens of thousands** of independent, equally deep pools without **risk exploding** or **TVL fragmenting** into dust.

---

## 2.2 Observed universe size and tail TVL

A quick scan of live pool lists (order-of-magnitude, **time-stamped in the transcript**) suggested on the order of **~100+** listed markets, not thousands—with **tail markets** carrying **very small TVL** (e.g. **low thousands of dollars** in notional support).

**Interpretation.** Even when **listing** is easier than on a tier-one CEX, **liquidity** is still **concentrated** in majors. Long-tail pools exist as **rows in a UI**, not as **reliable liquidity machines**.

---

## 2.3 Economic mismatch: what backs P&L vs what you think you trade

A recurring structural issue (also discussed in Percolator-adjacent contexts) is **mismatch between the collateral that backstops the pool** and **the underlying narrative of the perp**:

- Pool **inventory** may be dominated by **BTC/ETH/stable** exposure.
- The **index** may be a **small-cap** or **meme** token.

Traders mentally model “**I am long the oracle index**,” but the **economic backstop** is **another asset**. In stress, **correlation breaks**, **funding and fees** may not clear the socialized loss path traders expect, and **effective leverage** on the long tail is **not** the same as on majors.

This is not “GMX is bad”; it is **the same long-tail truth** as on CLOBs: **without a dedicated, aligned liquidity layer for each name**, **listing outruns liquidity**.

---

*Next: [3. Percolator wave & Perk.fund](./03-Percolator-Wave-Perc-Fund.md)*

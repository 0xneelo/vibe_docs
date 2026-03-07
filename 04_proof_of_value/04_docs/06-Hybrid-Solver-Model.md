# Section 6: The Hybrid Solver Model

## 6.1 Protocol-Owned Solver (POS)

A **protocol-owned (proprietary) solver** acts as the backstop—the central counterparty to all trades. Additional solvers can quote above the POS (better prices). This is the "Public Option" for liquidity: the POS is the Market Maker of Last Resort. It solves the cold-start problem that kills most intent protocols. When no external solver wants the trade, the POS steps in. The user always gets a quote.

---

## 6.2 The Liquidity Waterfall

**Tier 1: External Solvers (The Sharks)**  
Sophisticated HFT firms or AI agents see the order first. If they like the trade, they fill at a price better than the POS. User gets tight spread; protocol bears zero risk.

**Tier 2: The POS (The Safety Net)**  
If no external solver wants the trade (niche asset, high volatility), the POS steps in. Wider spread (safety premium). User gets filled; protocol captures high fees for taking the risk.

---

## 6.3 Whale Vaults: Risk Tranching

Whales and project owners stake tokens into vaults. The solver provides USDC and backstop insurance. Whales hold directional exposure to the token—something the solver cannot do. The solver uses whale inventory to market-make. This is a "Covered Call" architecture: the protocol writes covered perps on behalf of the whales. Solvers never face a "God Candle" wiping them out; that risk is absorbed by the whales, who earn yield on idle treasury.

---

## 6.4 Bell-Curve Flattening

Cross-market mutualization: markets with extreme profits contribute surplus to markets with extreme losses. If Market A is profitable and Market B is stressed, profit from A subsidizes B. This creates a "Too Big To Fail" mesh network. A single weak asset cannot destroy the protocol's reputation.

---

## 6.5 Pass-Through Execution & 70% to LPs

**Trader Wins**: Protocol sells whale inventory (market sell or short TWAP) and passes cash to trader. Zero price risk for protocol. Slippage is the trader's problem.

**Protocol Wins**: Protocol TWAP-buys tokens back into the vault. Buy only with TWAP to avoid pumping price against itself.

**70% of all fees** generated in perpetuity go to LPs—even when the market is matured and traders net each other. This is the "Landlord" model: LPs own the land (collateral); traders are tenants. The fee is rent for providing the capacity for the market to exist.

---

*Next Section: [07-Game-Theory-of-Listings.md](./07-Game-Theory-of-Listings.md) →*

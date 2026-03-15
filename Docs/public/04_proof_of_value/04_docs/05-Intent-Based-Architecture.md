# Section 5: Intent-Based Architecture

## 5.1 Moving Beyond the Casino Model

Instead of changing PumpFun or the DEX model, the solution is to build an **intent-based, solver-centric OTC derivatives protocol** like Vibe Trading. This moves from the "Casino" model (AMM/Bonding Curves) to an "Agency" model (Intent-Centric OTC).

This is technically superior for a "Truth Market" because it solves liquidity fragmentation and aligns with the AI nature of the era.

---

## 5.2 No Liquidity Pools Needed

**PumpFun model**: To launch a "Truth Token," someone must lock up real capital ($SOL) in a bonding curve. Capital inefficient.

**Intent-Based OTC model**:
- User (Maker): Signs an intent. "I bet $100 this video is fake."
- Solver (Taker): An AI agent or market maker sees the intent and fills it. "I accept that bet."
- Result: A bilateral smart contract is created on-chain.

**Why this matters**: You do not need a million dollars of liquidity to verify a niche fact. You need one counterparty. This allows the **long tail of information** to be verified. A market for a local news story with just two people trading—impossible on an AMM.

---

## 5.3 Vibe Trading = AI-to-AI Negotiation

The Solver is likely an AI Agent:
- User Intent: "Short this viral video (Leverage 10×)."
- Solver Algorithm: Scans the video, checks deepfake detectors, cross-references news, calculates probability of fake, quotes a price.
- Execution: If the "Vibes" (data signals) match, the trade executes.

This creates a **real-time automated verification layer**. Solvers become the world's most aggressive fact-checkers—not because they are moral, but because they want to win the spread.

---

## 5.4 The Long Tail Engine

The goal: Create a system that can spin up a **perpetual for any DEX token at any market cap and any liquidity**. This captures 99% of assets—anything can be tokenized. Later, specialize into niche categories (exact peer-to-peer "betting"). For now, the universal perp is the wedge.

**Strategic insight**: While everyone fights over the top 1% of assets (BTC, ETH, SOL) with razor-thin margins, the 99% (memecoins, new protocols, niche DAOs) have zero derivatives market. By enabling perps on any token, you financialize the reputation of every small asset on earth.

---

## 5.5 Solving the Wick of Death

Historically, perps on low-cap assets failed due to **Oracle Manipulation**: attacker buys spot, spikes price for one block, drains the Perp AMM.

**Intent/Solver solution**: Solvers do not rely on a manipulatable spot oracle. They **quote their own price**. If spot is being manipulated, the Solver widens the spread or refuses to quote. Human/AI judgment protects the protocol from the flash crash/pump exploit.

---

*Next Section: [06-Hybrid-Solver-Model.md](./06-Hybrid-Solver-Model.md) →*

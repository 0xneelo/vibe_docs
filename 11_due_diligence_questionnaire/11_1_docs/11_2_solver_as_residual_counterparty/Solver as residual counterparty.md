# 2.) Solver as residual counterparty


## When a solver takes the other side of a trade, how do they hedge that exposure in practice, especially for low cap tokens, and what happens if that liquidity disappears?

TL:DR 
Solvers are pre-hedging every exposure before accepting a trade.

The execution risk the solver faces is passed down to the user.

Solvers goal is to maximize UX but minimize risk for himself. 

If Liquidity dries up completly the Solver will pass down that spread onto the trader.

### How the solver hedges in practice (RFQ / intent workflow)

**1) Pre-trade: hedge-before-accept (key property of intent/RFQ)**

- Because execution is request-based, the solver does **not** have to blindly accept a fill. A user submits an intent (e.g., “20x long” on a low-cap token).
- Before the solver returns an executable quote (or before it finalizes acceptance), it computes risk parameters and **establishes the hedge** (or the backing) for the residual exposure it would carry.

**2) Primary hedge source for low-cap tokens: internal inventory / vault liquidity**

- In low-cap or easily front-runnable markets, the solver generally prefers **internal sourcing** (token inventory held in vaults / solver-controlled inventory) rather than immediately buying/selling on open DEX liquidity.
- The solver applies a **dynamic spread** based on market conditions, vault depth, volatility, and expected unwind cost. This spread is incorporated into the quote the trader receives.

**3) Secondary hedge source: external venues (DEX) via controlled execution**

- When external execution is necessary (e.g., rebalancing inventory, reducing residual delta, or unwinding exposure), the solver typically executes via controlled methods (e.g., **TWAP-style execution**) to reduce adverse selection and price impact.
- If opposing trader flow exists, the solver **nets** longs against shorts internally to reduce how much must be executed externally.

**4) Exit flow: unwind hedge and pass execution economics through**

- When a trader requests to close, the solver either:
    - nets the close against opposing demand (if available), or
    - executes the necessary hedge unwind against external liquidity and returns an exit price reflecting realized execution costs (slippage / price impact), plus any risk spread required by parameters.

---

### What happens if liquidity disappears?

Liquidity disappearing is treated as a **market integrity / execution feasibility** issue. In that state, the system cannot assume that positions can be unwound at “theoretical” prices; outcomes converge toward what the market can actually clear.

**1) If external liquidity is too thin to hedge/unwind**

- If the solver cannot sell/buy meaningful size externally (because liquidity is near-zero), then any attempted unwind would create extreme **price impact**.
- In that case, realized closeout prices will reflect the **true executable market**, meaning traders may experience large slippage on closes.

**2) Netting still works if there is opposing internal flow**

- If there are still shorts to net against longs (or vice versa), the solver can close positions **internally** to the extent of that opposing flow, reducing dependence on external liquidity.
- However, if the market is genuinely one-sided and external liquidity is gone, internal netting may be insufficient.

**3) Risk controls: tighten parameters, limit exposure, and potentially close/disable the market**

When liquidity deteriorates beyond thresholds, the solver can progressively move to a protective posture, typically including:

- widening spreads and increasing funding adjustments to discourage further one-sided buildup,
- lowering max leverage / open interest,
- enforcing stricter close/quote conditions,
- and, in extreme cases, triggering protective actions (e.g., forced de-risking, ADL-type mechanisms if part of the design) and **closing/delisting the market** when it is no longer safely tradable.

**4) Economic principle**

- Traders are ultimately closed out against **what can be executed**. If liquidity disappears, the system cannot sustainably pay profits that cannot be realized through netting or executable hedges.
- The solver’s mandate is to minimize unhedgeable residual exposure and protect LP/insurance resources through parameter tightening and market-level controls when external liquidity becomes unreliable.
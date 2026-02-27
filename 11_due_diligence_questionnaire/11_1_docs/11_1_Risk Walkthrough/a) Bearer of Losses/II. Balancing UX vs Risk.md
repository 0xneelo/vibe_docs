# 1 b II.) Balancing UX vs Risk


As a good mental model is to see the markets launching with 100% protocol collateralization (every position is 1:1 backed with a hedged asset (Tokens for Longs & USDC for shorts) while the solver is slowly “increasing” the leverage by decreasing the collateral ratio to 0% in the optimal scenario.

A perp DEX like hyperliquid has 0% collateralization, if you exclude their HLP which they have documented in the past that it is not acting as insurance fund.

## Tail-event profit cap and collateralization mental model

It is important to note that the **profit cap** is intended to be used **only in absolute tail events** (e.g., catastrophic gaps, clear manipulation/discontinuous pricing, or conditions where standard liquidation and hedging cannot safely clear). Under normal market conditions, the solver’s objective is to **maximize user experience** (tight spreads, higher usable open interest, minimal intervention) while preserving a **hard stop on losses** borne by the solver and LPs.

A helpful mental model is to view newly launched markets as starting at **100% protocol-side collateralization**: every unit of net exposure that the solver temporarily warehous­es is **fully backed 1:1 by hedged assets** (tokens to back long-side liabilities; USDC/stables to back short-side liabilities). As the market matures—more liquidity, more liquidation history, more reliable price formation, and higher confidence—the solver can **increase systemic leverage** by gradually **decreasing the protocol-side collateral ratio**, with the long-run “optimal” target being a more capital-efficient state.

### Context vs. mature perps venues (illustrative comparison)

In mature perp DEX designs, the protocol typically does **not** operate as a 1:1 pre-funded counterparty for all outcomes in all states; instead, it relies on margining, liquidations, risk limits, and backstops (e.g., auto-deleveraging / circuit breakers and dedicated buffers). Hyperliquid, for example, uses a community-owned vault (HLP) that provides liquidity, performs liquidations, and accrues platform fees—functionally acting as a liquidity backstop in stress scenarios.  Hyperliquid also routes protocol-level fee flows via an “Assistance Fund” mechanism at the L1 execution layer, which is distinct from HLP.

In Vibe’s framework, the differentiated approach is the ability to **start markets in a fully conservative, fully hedged posture** (high protocol-side collateralization and tight hard limits), and then **progressively relax** that posture as the solver’s confidence and the market’s integrity increase—while retaining an explicit **tail-event profit cap** as the final safety valve.

## Important note on the profit cap and extreme-event behavior

The **short-side profit cap** described earlier is intended to be applied **only in rare, tail-risk situations**—for example, catastrophic collapses, abrupt discontinuities, or other extreme “gap” events where normal liquidation and hedging processes are insufficient or where the market integrity is compromised.

### Why the cap exists in a permissionless market

Because Vibe is **permissionless**, any participant can create a market, and adversarial actors may attempt to launch or manipulate markets with the objective of extracting value from the system (e.g., by inducing extreme price moves, thin-liquidity dislocations, or other exploit-style dynamics).

In such cases, the solver’s priority is to **protect system capital** (including solver-owned reserves and LP-associated resources), rather than subsidize a market that exhibits high manipulation risk. The profit cap acts as an emergency brake that limits loss propagation in adversarial or discontinuous conditions.

### Insurance allocation is conditional, not automatic

A key design principle is that **the solver does not have to allocate global insurance to every market**. When the solver does not trust a newly created or suspicious market, it can allocate **zero** pro rata global insurance to that market. This materially reduces the ability of an extractor to “steal” external funds, because there is no additional global insurance pool assigned to be drained.

In simplified terms:

- If the solver allocates **0 global insurance** to a market, then any adverse outcomes are restricted largely to what is already within that market’s own liquidity and buffers (e.g., the market’s own LP deposits and any locally accumulated insurance), rather than pulling from external system reserves.

### Conservative launch posture; adaptive maturation over time

At launch, markets are treated conservatively because the solver has limited information. This can reduce early UX (lower leverage, tighter limits), but is intentional: the system starts in a **safety-first** configuration and becomes more capital-efficient as the market demonstrates reliability and the solver gains data.

In early-stage markets, the solver typically enforces:

- **Hard boundaries on maximum profit and/or open interest**
- **Conservative long and short limits** based on available token inventory and USDC
- **Minimal or zero allocation of global insurance**
- **Local insurance formation** primarily through liquidation flows and fees

As a market matures (more liquidity, more trade history, better liquidity conditions, fewer manipulation signals), the solver can gradually:

- increase allowable **open interest** and **systemic leverage** (on the system side),
- allocate a larger **pro rata share of global insurance**,
- improve execution quality (tighter spreads, more permissive parameters),
- and support a more “pure perp-like” experience where most trader P&L is exchanged across participants with robust, well-capitalized buffers behind the system.

This progression is designed to occur **smoothly, continuously, and automatically** as the solver updates its market classification and risk posture.

### 100% collateralized baseline and controlled de-risking

A useful mental model is that markets begin close to a **100% collateralized** state on the system side: the solver maintains sufficient backing (token inventory and/or stablecoin resources) to honor payouts under conservative assumptions. Over time, as the solver gains confidence and data, it can reduce the degree of system-side collateralization (i.e., increase capital efficiency) while still managing risk via:

- dynamic spreads and funding,
- inventory/hedging strategies,
- insurance allocation policy,
- and tail-event controls (including profit capping as a last resort).

### RFQ/intent structure enables post-trade and pre-execution risk tuning

Because execution is **request-for-quote (RFQ)/intent-based**, the solver can recalibrate parameters **per quote** using current market state and observed risk signals. This structure supports:

- real-time repricing (spreads, fees, funding adjustments),
- selective tightening in stressed conditions,
- and, in rare tail states, **profit backstopping/capping** to prevent loss propagation beyond defined buffers.

The solver’s objective is to operate such that these “emergency” mechanisms are rarely used. However, when a market dislocation exceeds expected bounds or exhibits adversarial characteristics, these controls provide a framework for keeping the system economically bounded.
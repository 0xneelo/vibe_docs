# Who loses money if the trade moves sharply against expectations?

In a sharp, adverse move (especially in low-cap / thin-liquidity markets), losses are absorbed in a defined sequence. Conceptually, the system first consumes the capital of participants directly taking directional risk, and only then draws on solver and insurance resources.

### Loss absorption waterfall (extreme move scenario)

Using a simple example: many traders are long, many are short, and the market crashes quickly.

1. **Losing traders (e.g., longs in a crash)**
- The first line of loss absorption is the **margin/balances of the losing side**.
- These balances are used to pay the **winning side’s** P&L (e.g., longs pay shorts).
- This is the normal and preferred state: **traders pay each other**.
1. **Liquidity Provider executed through the Solver ( LP vault capacity)**
- If the move is fast enough that trader margin alone is insufficient to cover the economic imbalance at that moment, the next buffer is the solver’s **hedging P&L and liquidity resources** associated with managing residual exposure.
- Practically, this includes the solver’s **USDC and/or inventory/positions established for hedging**, and may also include **LP vault capacity** to the extent the solver has borrowed/used vault liquidity for hedging operations (consistent with the protocol’s risk rules).
1. **Local (market-specific) insurance fund**
- Each market has a **localized insurance fund** that is funded primarily by liquidation flows in that specific market.
- If trader balances and solver hedging resources are depleted in an extreme dislocation, losses can be absorbed by this **local insurance fund**.
1. **Global insurance fund (pro rata allocation to the market)**
- In addition to local insurance, there is a **global insurance fund** funded by the solver and allocated **pro rata** across markets.
- Allocation is dynamic and depends on factors such as market volatility, velocity, and the size/health of the market’s local insurance fund.
- In an extreme tail event, after local insurance is exhausted, the system can draw on the market’s **pro rata share** of the global fund.

<aside>
🚨

Important to note that **maximum realizable profit on the short side is capped** by the aggregate protection pool available to that market at the time of settlement.

</aside>

**Formula (profit cap on shorts):**

$$
Max Short-Side Payout=LP Liquidity+Local Insurance Fund+Pro Rata Allocation of Global Insurance Fund
$$

> In words: short-side profits cannot exceed the combined availability of **LP liquidity**, the **market-specific (local) insurance**, and that market’s **pro rata share of the global insurance fund**.
> 

<aside>
🚨

This “profit cap” should only be used in the absolute tail event, the solvers goal is to maximize user experience while ensuring a hardstop on the losses for himself as well as for LPs.

read more:
[1 b II.) Balancing UX vs Risk](https://www.notion.so/1-b-II-Balancing-UX-vs-Risk-2efbff5b367a80808f7dcb2b73698250?pvs=21) 

</aside>

What happens after an extreme event

- If an event is sufficiently severe (e.g., sudden binary outcomes such as prediction-like “flip” events, catastrophic project failure, or extreme gap moves), risk limits and triggers may be hit.
- When these triggers are reached, the solver may take protective actions (e.g., widening spreads, adjusting funding aggressively, forced de-risking, and **ADL** if required by risk controls) to prevent uncontrolled depletion of LP or insurance resources.
- Markets may be **tiered** with explicit limits on how much loss the solver and system buffers can absorb; if limits are breached, positions may be forcibly reduced/closed and the market may be delisted depending on governance/risk policy.

### Plain-English summary

- **First losses are borne by losing traders.**
- If that is insufficient in a fast dislocation, losses next draw on **solver hedging resources (and any liquidity it used for hedging, including LP vault capacity if applicable).**
- Only in true tail events do losses reach the **local insurance fund**, and then the **market’s pro rata allocation of the global insurance fund**.

[1 b II.) Balancing UX vs Risk](https://www.notion.so/1-b-II-Balancing-UX-vs-Risk-2efbff5b367a80808f7dcb2b73698250?pvs=21)

[1 b II.) Balancing UX vs Risk](https://www.notion.so/1-b-II-Balancing-UX-vs-Risk-2efbff5b367a80808f7dcb2b73698250?pvs=21)
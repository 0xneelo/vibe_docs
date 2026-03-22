# 4.) Attractiveness for LPs

## Established Status Quo

At launch, LP deposits provide the initial liquidity and hedging capacity required to quote markets and support early trading activity. Over time, as participation increases and the market becomes more liquid, the solver can **reduce reliance on LP capital** and **increase systemic leverage** in a controlled manner. This improves capital efficiency and can increase LP yield, while maintaining execution quality and a competitive trading experience.

In other words, LP deposits are primarily used to **ignite** a market. Once sufficient two-sided flow exists, the system can transition toward a more "orderbook-like" equilibrium in which **longs and shorts are predominantly matched against each other**, minimizing the need for the solver to act as a residual counterparty.

Accordingly, Vibe's lifecycle progression can be summarized as:

1. **Bootstrapped stage:** fully asynchronous execution supported by LP deposits and conservative risk limits.
2. **Maturing stage:** increasing trader-to-trader netting, improving liquidity, and gradually reduced protocol-side collateralization.
3. **Mature stage:** predominantly trader-to-trader market, approaching a low protocol-side collateral model, with the solver primarily providing pricing, matching, and risk controls rather than balance-sheet support.

Vibe's model is therefore positioned as a **bootstrapping engine for permissionless perpetuals and derivatives**, analogous to how AMMs and launchpads are highly effective for bootstrapping spot liquidity. By supporting the full lifecycle—from market creation through maturation—Vibe aims to facilitate increasingly sophisticated markets over time, including perpetuals, long/short leverage, and potentially more complex derivatives (e.g., options), as the solver accumulates market data and improves its risk models.

<aside>
💡

Now that we have established how the solver uses LP deposits to **bootstrap new markets**, we can describe the intended market lifecycle more clearly.

Let's get to the most important question 👇

</aside>

---

## Why would an LP provide liquidity to Vibe, and what makes the model sustainable?

The core design insight behind Vibe's LP model is the **separation of two distinct liquidity roles**: (i) who provides the **stablecoin (USDC) liquidity** needed for settlement and hedging operations, and (ii) who provides the **token-side liquidity** that enables permissionless perpetual markets. These two roles have fundamentally different risk profiles, and Vibe assigns each to the party best positioned to bear it.

---

### The USDC side: solver-funded, not LP-funded

Vibe does **not** ask external LPs to deposit USDC. The stablecoin liquidity required for settlement, hedging, and cross-chain bridging is **self-funded by the protocol and the solver**.

In practice, the solver's USDC usage functions as a series of **short-term loans**: capital deployed on one chain is typically recovered on another within a short cycle. Because the solver can always **pre-hedge** before accepting exposure, the risk on these stablecoin flows is tightly bounded. The result is:

- **Extremely high capital efficiency** on the USDC side (the solver recycles capital rapidly rather than locking it).
- **No need for large external stablecoin pools**, eliminating the economic mismatch that plagues USDC-vault-based perp protocols.
- **Internal yield on solver-deployed USDC** is believed to exceed what could be earned through alternative deployments, making the system self-sustaining without external stablecoin LPs.

The rationale for keeping this pool closed (protocol-operated / team-funded) is straightforward: the solver has **full operational control** and can accurately model risk/reward. An external USDC LP, by contrast, would need to trust the operator entirely—and would demand yield commensurate with the perceived (high) risk of lending stablecoins to a leveraged low-cap perp protocol.

---

### Why USDC-vault protocols face a ~100x capital efficiency disadvantage

Protocols that rely on **external USDC vault deposits** to back leveraged perpetual markets on low-cap tokens face a structural problem: **perceived risk**.

- When presented with the proposition of depositing USDC to provide leverage for low-cap perps, institutional and sophisticated capital providers consistently assess the risk as **extremely high**.
- Protocols offering leveraged perps on low-cap assets with USDC-backed vaults have observed LP yield demands in the range of **50–80% annualized**—a level that is economically unsustainable to serve.
- This perceived risk **increases with leverage**: higher offered leverage requires deeper USDC backing, which requires higher yield to attract, creating a negative feedback loop.

Vibe's modeling and game-theoretical analysis estimates that token-based vaults achieve approximately **~100x greater capital efficiency** compared to USDC-vault-based low-cap perpetual protocols. The core reason is that Vibe eliminates the need to compensate external LPs for bearing a risk they are structurally poorly suited to assess or manage.

---

### The token side: aligning risk with holders who already bear it

Vibe's LP model for the token side is built on a simple observation: **token holders are already directionally exposed**.

A holder of Token X already bears the full price risk of that asset. For that holder, the **incremental risk** of depositing tokens into a Vibe vault—where the tokens are used as inventory backing for a perp market on that same asset—is materially lower than the risk they already accepted by holding the token in the first place.

This creates a natural alignment:

- **Token holders want utility for their holdings.** Staking, single-sided LP, and passive holding offer limited yield (often low single-digit APR). Depositing into a Vibe vault provides an additional yield source on an asset they already intend to hold.
- **Token holders want to support their ecosystem.** Project founders, early investors, whales, and community members are often motivated to add utility to their token, deepen its markets, and support the project's visibility—goals that a permissionless perp market directly serves.
- **Cost basis is often very low.** Many token depositors acquired their holdings at a fraction of current value. Committing a small percentage of supply to earn yield and create market infrastructure represents a favorable risk/reward from their perspective.
- **Yield expectations are modest.** Unlike USDC depositors demanding 50%+ APR, token holders are generally satisfied with incremental yield on top of their existing directional exposure—comparable to what single-sided staking protocols offer.

**Key economic principle:** Vibe allocates risk to the parties who are **already carrying that risk** and for whom the incremental exposure is smallest, rather than asking stablecoin holders to take on risk they are structurally averse to.

---

### Revenue sharing: 70% to token depositors/projects

To further incentivize token-side LP participation, Vibe distributes **70% of market revenue** to the projects and token depositors that provide liquidity. This revenue share is designed to establish **market dominance** in permissionless perp listings by making the economics unambiguously attractive for projects.

However, the team's conviction—supported by observed behavior—is that **most projects would provide liquidity even without promised profit share**. The motivations (ecosystem support, token utility, community signaling, low incremental risk) are sufficient on their own. The revenue share sweetens an already aligned deal.

---

### Market validation

Vibe has onboarded **160+ launch partners** prior to full product launch—before a live dashboard, before profit payouts were operational, and before permissionless listings were enabled. Projects have deposited **millions in token value** based on the design and the proposition alone.

This early traction reflects the structural demand that Vibe addresses: across the industry, **projects and token holders have treasuries and token holdings with limited productive use.** Exchange listings require stablecoin deposits. Market makers require stablecoin commitments. Uniswap single-sided liquidity effectively functions as a sell order. In each case, projects are asked to deploy scarce stablecoins or accept unfavorable terms.

Vibe inverts this dynamic: projects deposit the asset they **already hold and want to support**, earn revenue, and create a leveraged trading market—without committing stablecoins, without hiring market makers, and without the costs and dependencies of centralized exchange listings.

---

### Summary

| Dimension | USDC-vault protocols | Vibe (token-based vaults + solver-funded USDC) |
|---|---|---|
| Who provides stablecoins | External LPs | Solver / protocol (self-funded) |
| Who provides token inventory | N/A or protocol-funded | Token holders / projects |
| USDC LP yield demand | 50–80%+ APR (unsustainable) | Not applicable (no external USDC LPs) |
| Token LP yield expectation | N/A | Modest (comparable to staking) |
| Capital efficiency (est.) | Baseline | ~100x improvement |
| LP risk alignment | Stablecoin holders bear directional + leverage risk they don't want | Token holders bear incremental risk on exposure they already hold |
| Revenue share to LPs/projects | Varies | 70% of market revenue |


Read https://github.com/0xneelo/usdc_token_perps 
for an in-depth comparsion with a purely USDC based permissionless margin/perp protocol.
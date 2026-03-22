# 3.b) Solver Hedging Risk Considerations


### What happens if a solver cannot hedge?

Bootstrapping permissionless derivative markets is inherently risky—especially for **low-cap, newly listed assets (“Vibecaps”)**. For that reason, the core design principle is:

**The solver hedges (or fully backs) residual exposure *before* accepting a trade.**

This hedge-first capability is a key enabler of permissionless listings.

---

### Baseline design: hedge-first (default for permissionless perps)

- Under the intent/RFQ model, the solver can evaluate a request and **establish the hedge / backing inventory** before finalizing acceptance.
- For **Vibecaps**, hedge-first behavior is treated as a **hard requirement** due to manipulation and liquidity risk.
- For **majors**, an **auction model** (multiple solvers/MMs competing for best quotes) is typically more favorable; but for Vibecaps, such a model is generally less suitable.

---

### Why “solver cannot hedge” is usually an orderbook framing issue

The phrase “solver cannot hedge” often assumes the counterparty is **hard-committing to a fixed price** prior to execution (as in traditional orderbooks), where latency and external execution constraints can make hedging infeasible.

In Vibe’s engine, solver quotes are **soft commitments**: the solver has **last look** and can price within the user’s specified bounds (e.g., “20x TokenABC up to maxPrice”). This reduces situations where the solver is forced into an unhedgeable fill, under normal operations, to zero.

Unless it is favourable for the Solver to not hedge.

---

### What happens if hedging is constrained anyway?

In rare cases, hedging may become **economically or mechanically infeasible**, typically due to one or more of the following conditions:

- external liquidity is insufficient to execute a hedge without extreme price impact,
- price formation becomes unreliable or discontinuous,
- manipulation signals or other abnormal market behavior are detected.

In **Vibecaps**, these conditions are treated as potential market-integrity failures (e.g., a rug / liquidity pull). In that situation, the solver does not attempt to warehouse unbounded exposure. Instead, it can **trigger an emergency market freeze and orderly shutdown**, settling positions using the protocol’s defined closeout logic.

A simple example safeguard is a **liquidity-collapse trigger**: if measurable available liquidity drops abruptly, the market is frozen, positions are settled (profits/losses realized per the settlement rules), and the market is closed.

Trigger condition (example)

$$
\text{Freeze if } L_t \le 0.10 \cdot L_{t-60}
$$

Where:

- `L_t` = measured available liquidity at time `t` (now)
- `L_{t-60}` = measured available liquidity 60 seconds earlier

<aside>
💡

This “liquidity integrity” logic also makes the Vibecap Solver Engine well-suited for markets with **discontinuous outcomes** (e.g., prediction markets), where sudden liquidity or price regime shifts are expected and must be handled with explicit, automated guardrails.

</aside>

---

### When would the solver ever remain unhedged?

Any non-hedging is **purely strategic**, not a failure mode. It may occur only in more mature, higher-integrity markets where the solver explicitly chooses to warehouse limited exposure within defined risk limits—for example:

- inventory allows tolerable exposure,
- the solver intentionally increases system-side leverage to improve capital efficiency,
- or the solver has strong conviction in expected P&L dynamics.

**Key clarification:** this behavior is **not** the baseline for Vibecaps. Vibecaps are designed to operate hedge-first; if hedging cannot be done safely, the solver prices that risk into the quote or refuses the trade.
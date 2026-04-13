# 3.c II.) Trader Compensation - Solver default

## Who makes traders whole in a scenario where the solver defaults?

The answer depends on which type of solver defaults. As described in [I. Solver default](I.%20Solver%20default.md), the protocol distinguishes between the **protocol-owned solver** and **third-party solvers**, and the compensation mechanics differ accordingly. In both cases, the overarching design goal is **trade continuity**—not credit-default payouts.

---

### Protocol-owned solver: cannot default in the conventional sense

The protocol-owned solver is **not subject to liquidation** in the bootstrapping configuration. A "default" of the protocol-owned solver would mean that **all** of the following buffers have been fully depleted:

1. **LP vault deposits** (token-side liquidity)
2. **Solver inventory** (assets accumulated from trading operations)
3. **Global insurance fund** (continuously funded by trader losses and liquidation flows, allocated pro rata across markets)
4. **Local insurance funds** (per-market insurance funded by liquidation flows in that specific market)

For this state to be reached, the system would need to experience a catastrophic, protocol-wide event in which all protection layers are simultaneously exhausted. The protocol-owned solver is designed to **prevent this** by dynamically adjusting its posture before depletion occurs:

- **Widening spreads** and increasing funding rates to discourage one-sided buildup
- **Tightening risk parameters** (lower leverage, lower open interest limits)
- **Drawing on insurance funds** to absorb losses
- **Triggering ADL** (auto-deleveraging) to forcibly reduce system exposure

If, despite all of these mechanisms, the protocol-owned solver were to reach a fully depleted state: all positions would be closed, all vaults would settle to zero, and the protocol could restart once new LP deposits are made. This scenario is considered **theoretically possible but practically unreachable** given the layered protection design and the fact that each new market starts in a fully hedged mode and only progressively moves into a risk-taking posture as it generates income, builds local insurance, and feeds into the solver's balance sheet.

---

### Third-party solver default: CVA and position buyout

When the system matures to support **third-party solvers** (independent market makers), these solvers are subject to standard collateral and liquidation requirements.

**1) Collateral lockup: CVA (credit valuation adjustment)**

Every solver—including the protocol-owned solver—locks a **CVA buffer** per trade. The CVA is an amount of collateral posted to the system that is earmarked for counterparty compensation in the event of default:

- **Third-party solvers** are required to post CVA on every trade they participate in.
- The **size of the CVA** is a function of the solver's trust level and reputation. A new, unproven solver may be required to deposit significantly more insurance per trade than a solver with an established track record.
- If the solver falls below maintenance margin and is liquidated, the **CVA and maintenance margin** are distributed to the solver's counterparties (the traders holding positions against that solver).

**2) Primary resolution: protocol-owned solver buys out distressed positions**

The protocol's preferred outcome is **not** a liquidation payout followed by position closure. Instead, the protocol-owned solver acts as a **buyer of last resort** for the defaulted solver's positions:

- When a third-party solver is liquidated, the protocol-owned solver can **buy out all of the distressed positions**, similar to acquiring distressed assets in a corporate liquidation.
- The protocol-owned solver takes over as the new counterparty, absorbs the defaulted solver's CVA/discount, and continues providing quotes to the affected traders.
- **From the end user's perspective, nothing changes.** The counterparty swap happens in the background; the trader's position, margin, and P&L remain intact.

**3) Auction mechanism (multi-solver environment)**

In a mature multi-solver environment, the buyout can operate as a **competitive auction**: any active solver can bid on the distressed positions. The solver offering the best price acquires the positions and inherits the counterparty obligations. The protocol-owned solver participates in this auction and will **always step in as the measure of last resort** if no other solver bids.

---

### Summary: trader compensation by solver type

| Scenario | What happens to traders |
|---|---|
| **Third-party solver defaults** | Solver's CVA and maintenance margin are distributed to counterparties. In most cases (~90%), the protocol-owned solver buys out all positions and trade continues uninterrupted. |
| **Protocol-owned solver reaches depletion** | All protection layers (LP vaults, solver inventory, global + local insurance, ADL) must be exhausted first. If fully depleted: all positions close, all balances settle, protocol restarts on new deposits. Considered practically unreachable. |

---

### Design principle: trade continuity over credit-default payouts

The system is deliberately built to favor **continuity**. Rather than liquidating a solver and distributing payouts that force traders to re-establish positions in a disrupted market, the protocol is designed so that a healthy solver (typically the protocol-owned solver) can seamlessly assume the obligations of a distressed one. This means:

- Traders do not need to manage the counterparty risk of individual solvers.
- Position lifecycle (margin, funding, P&L) is uninterrupted.
- The protocol-owned solver's **non-liquidatable** status in the bootstrapping phase ensures there is always a backstop counterparty available to absorb distressed positions from third-party solver failures.

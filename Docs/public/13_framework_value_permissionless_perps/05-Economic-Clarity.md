# Section 5: Economic Clarity

## 5.1 Why Clarity Matters

Due diligence questionnaires (DDQs), auditors, and participants require a clear answer: **who bears risk, when, and how?** Ambiguity on this point undermines trust and prevents institutional participation.

Vibe's design allows for precise economic clarity. This section presents the risk allocation in DDQ-ready form.

---

## 5.2 Decomposition of Perp Fills

Each perp fill decomposes into two components at execution:

1. **Netted exposure** (matched long vs. short internally): P&L transfers **between traders**.
2. **Un-netted exposure** (residual imbalance): The trader's P&L is effectively against the **solver (and the liquidity it uses, including LP vault capacity)** until the solver rebalances/hedges.

---

## 5.3 Scenarios by Netting State

### Scenario 1: Trader Goes Long, 100% Netted vs. a Short

- **Price up**: Short trader pays long trader.
- **Price down**: Long trader pays short trader.
- **Risk holder**: Traders (trader-to-trader).

### Scenario 2: Trader Goes Long, 0% Netted (No Offsetting Short)

The **solver temporarily warehouses the residual short exposure** (directly or via hedging).

- **Price up**: Un-netted portion of long profits paid by solver's hedging P&L and/or liquidity resources (including LP vault capacity), per the venue's risk waterfall.
- **Price down**: Long trader pays losses; solver's residual exposure benefits.
- **Risk holder**: Solver (and LP vault capacity, per risk terms) until hedged.

### In Practice

The live system is a **continuous blend** (partial netting is most common). The solver's objective: keep the system close to delta-neutral, increasing LP returns while reducing risk.

---

## 5.4 End-to-End Trade Walkthrough

### Step 1 — Order Submission and Margining

- Trader submits order (direction, size, leverage).
- Margin posted; position opened at execution price.
- **Risk holder**: Trader (chose directional exposure and leverage).

### Step 2 — Execution and Netting

- Solver fills order; attempts to **net** against opposing flow.
- **Risk holder**:
  - Netted portion: **trader-to-trader**.
  - Un-netted portion: **solver-to-trader** (until hedged).

### Step 3 — Imbalance Management and Hedging

- Solver reduces exposure via: LP vault liquidity, hedging on external venues, dynamic incentives (spreads/funding).
- **Risk holder**: Solver (and LP vault capacity per risk terms) during carry; once hedged, dominant risk is basis/liquidity/execution.

### Step 4 — Ongoing Position Lifecycle

- Mark-to-market, funding, liquidations.
- **Risk holder**: Primarily traders (margin, liquidation); solver/LP exposure only to residual hedge imperfections and tail events.

### Step 5 — Closeout and Settlement

- Trader closes or is liquidated; P&L realized.
- Solver unwinds hedges; repays LP vault usage; fees and hedge P&L distributed.
- **Risk holder**: The party that held offsetting exposure during the position (traders for netted; solver/LP for un-netted residual).

---

## 5.5 "Who Loses Money If the Trade Moves Sharply Against Expectations?"

**If exposure was netted**: Value transfers **between longs and shorts**. Price up → shorts lose, longs win. Price down → longs lose, shorts win.

**If exposure was un-netted**: Trader faces **solver (and supporting liquidity)**. In a sharp move:
- Losing traders lose first (mark-to-market, liquidation, margin).
- Residual system loss not covered by trader margin and protections is allocated per the **documented risk waterfall** (insurance, LP vault exposure, per design).

---

## 5.6 The One-Sentence DDQ Statement

> **Traders bear directional P&L on their positions; when flow is balanced, traders pay each other; when flow is temporarily imbalanced, the solver warehouses and hedges the residual exposure using available liquidity (including LP vault capacity), with any tail outcomes allocated per the venue's disclosed risk waterfall.**

---

## 5.7 Defense Hierarchy (Summary)

Before ADL triggers, the protocol follows a deterministic defense stack:

1. **Dynamic pricing** (spread, funding, borrow) — internalize risk, recover from stressed market
2. **Local insurance** — per-market fund
3. **Global insurance** — cross-market allocation (subject to eligibility, caps)
4. **Bell-curve flattening** — transfer surplus from winner markets to stressed markets
5. **ADL** — only when budget/safety limits breached

This ensures economic clarity: participants know the escalation path and who bears what at each stage.

---

*Next Section: Comparative Advantage →*

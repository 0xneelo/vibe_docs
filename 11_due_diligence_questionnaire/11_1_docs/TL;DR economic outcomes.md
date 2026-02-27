# TL;DR economic outcomes

## by netting state

Each perp fill can be decomposed into two components at the moment of execution:

- **Netted exposure** (matched long vs. short internally): P&L transfers **between traders**.
- **Un-netted exposure** (residual imbalance): the trader’s P&L is effectively against the **solver (and the liquidity it uses, including LP vault capacity)** until the solver rebalances/hedges.
- 

Using your four scenarios (now DDQ-polished):

1. **Trader goes Long, 100% netted vs. a Short**
- **Price up:** short trader pays long trader.
- **Price down:** long trader pays short trader.
1. **Trader goes Long, 0% netted (no offsetting short at that moment)**
- The **solver temporarily warehoused the residual short exposure** (directly or via hedging).
- **Price up:** the un-netted portion of long profits is paid by the **solver’s hedging P&L and/or liquidity resources used to support the hedge (including LP vault capacity), per the venue’s risk waterfall**.  more mentioned here:  [1 b II.) Balancing UX vs Risk](https://www.notion.so/1-b-II-Balancing-UX-vs-Risk-2efbff5b367a80808f7dcb2b73698250?pvs=21)
- **Price down:** the long trader pays losses on the un-netted portion (typically via their margin / balance), and the solver’s residual exposure benefits correspondingly.

In practice, the live system is a **continuous blend** of these outcomes (partial netting is most common). The solver’s objective is to keep the system close to delta-neutral as it increases the returns for LPs while reducing their risk.

---

## End-to-End Perp Trade Walkthrough (Who holds risk at each step)

### Step 1 — Order submission and margining

- A trader submits an order (direction, size, leverage).
- Margin is posted and the position is opened at an execution price reflecting prevailing spreads/fees.
- **Risk holder:** the **trader** (they have chosen directional exposure and leverage).

### Step 2 — Execution and netting

- The solver fills the order and attempts to **net** it against opposing flow.
- **Risk holder:**
    - **Netted portion:** risk is **trader-to-trader**.
    - **Un-netted portion:** risk is temporarily **solver-to-trader** (until hedged/rebalanced).

### Step 3 — Imbalance management and hedging (where applicable)

- If there is an imbalance (e.g., more longs than shorts), the solver uses its toolbox to reduce exposure, which may include:
    - accessing **LP vault liquidity / credit capacity** to source inventory or stablecoins,
    - hedging on external venues (e.g., DEXs),
    - adjusting incentives (e.g., dynamic spreads / funding) to attract offsetting flow.
- **Risk holder:**
    - During the time the solver is carrying residual exposure (and/or while hedges are being established), risk sits with the **solver**, and **to the extent the solver relies on LP vault capacity, the LP vaults can be economically exposed under the documented risk terms**.
    - Once hedged, the dominant risk becomes **basis/liquidity/execution risk** (i.e., the hedge may not perfectly track, may slip, or may be hard to execute in fast markets).

### Step 4 — Ongoing position lifecycle (mark-to-market, funding, liquidations)

- Positions continuously mark-to-market.
- Traders may pay/receive funding and are subject to liquidation if margin falls below maintenance thresholds.
- In extreme conditions, risk controls (e.g., ADL, if enabled) can be used to reduce system exposure.
- **Risk holder:** primarily **traders** (via margin and liquidation), with **solver/LP exposure** only to residual hedge imperfections and system-tail events as defined in the risk waterfall.

### Step 5 — Closeout and settlement

- When a trader closes (or is liquidated), P&L is realized.
- The solver unwinds/rebalances hedges and repays LP vault borrow usage as applicable; fees and hedging P&L are distributed per vault terms.
- **Risk holder at settlement:** the party that held the effective offsetting exposure during the life of the position (other traders for netted flow; solver/LP capacity for any un-netted residual, subject to hedging effectiveness).

---

## “Who loses money if the trade moves sharply against expectations?”

This depends on whether the exposure was netted at the time and how effective hedging is during the move:

1. **If the exposure is netted:**
- A sharp move primarily transfers value **between longs and shorts**.
    - Price up → shorts lose, longs win.
    - Price down → longs lose, shorts win.
1. **If the exposure is un-netted (temporary imbalance):**
- The trader is effectively facing the **solver (and the liquidity supporting its risk management)** on that un-netted fraction.
- In a sharp move:
    - **Losing traders** lose first (via mark-to-market and liquidation up to their margin).
    - Any residual system loss that is not covered by trader margin and configured protections is allocated according to the **documented risk waterfall** (e.g., insurance/coverage mechanisms and/or LP vault exposure, depending on your design).

---

## One sentence that DDQs typically like (clear responsibility statement)

**Traders bear directional P&L on their positions; when flow is balanced, traders pay each other, and when flow is temporarily imbalanced, the solver warehouses and hedges the residual exposure using available liquidity (including LP vault capacity), with any tail outcomes allocated per the venue’s disclosed risk waterfall.**
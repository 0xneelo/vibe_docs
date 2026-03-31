What happens if a solver defaults during a period of high volatility?

If a solver “defaults,” it means the solver is undercollateralized relative to its obligations as a counterparty (i.e., it did not maintain sufficient margin on the accounts where it is facing user positions). The protocol supports multiple resolution modes depending on solver type and reputation, with the overarching goal of protecting end users and maintaining orderly settlement.

### Mode 1 — Strict liquidation (standard solver behavior)

In strict liquidation, the solver is treated like any other counterparty:

- If the solver falls below required margin (e.g., maintenance margin), it becomes **liquidatable**.
- The solver has risk parameters such as **maintenance margin**, a **liquidation fee**, and a locked **CVA-type buffer** (credit valuation adjustment / default buffer) associated with its counterparty accounts.
- Upon liquidation, these locked buffers (and any applicable fees) are transferred according to the liquidation rules, with the intent that **users are compensated** and the system is restored to a solvent state.

**Optional continuity mechanism:** Another solver may be permitted to **buy out / assume** the distressed positions at a discount, effectively taking over the positions and receiving the associated CVA/discount. This can allow the end user’s position to continue rather than being forcibly closed.

### Mode 2 — Soft liquidation (reputation-based / margin-call style)

For solvers with higher reputation (and in later versions, under a dynamic reputation system), the protocol can support a “soft liquidation” flow:

- The solver receives a **margin call**style notification to post additional collateral within defined constraints.
- If collateral is not restored, a **progressive slashing / de-risking** process occurs over time, ultimately converging to full liquidation if the shortfall is not cured.
- When the solver is fully liquidated, users receive the predefined locked buffers and any realized amounts owed under the liquidation rules.

This mode is intended to reduce unnecessary disruption in volatile markets while still enforcing solvency over time.

### Mode 3 — Protocol-operated solver (bootstrapping configuration)

In early phases, the system may use a **protocol-operated solver** (a protocol-owned solver) with special configuration:

- This solver can be flagged to **not be liquidated** in the early bootstrapping stage.
- This is a pragmatic design choice to reduce operational complexity during initial deployment and to avoid forcing conservative capital requirements that would materially reduce capital efficiency and user experience in low-cap markets.
- Importantly, **“not liquidatable” does not mean users are not paid**; it means the solver’s shortfall resolution is handled through protocol-level mechanisms and backstops rather than immediate forced liquidation of the solver account.

Conceptually, insolvency of a protocol-operated solver is treated as insolvency at the **protocol level**, and the operator is structurally aligned with the protocol’s long-term incentives. The intent is to progressively move toward a more trust-minimized configuration over time.

### Migration path toward full liquidation support

The protocol architecture is designed so that enabling liquidation for the protocol-operated solver is an explicit configuration choice (i.e., a “flag” that can be changed). As Vibe progresses toward a mature mainnet posture, the expectation is that this setting can be enabled so that the protocol-operated solver is subject to the same liquidation discipline as other solvers, provided sufficient engineering maturity and risk tooling are in place.

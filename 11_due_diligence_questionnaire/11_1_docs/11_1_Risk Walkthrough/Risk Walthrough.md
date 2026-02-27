# 1.) Risk Walkthrough

### Can you walk us through a perp trade end to end, clearly stating who holds risk at each step?

To answer this in a simplified but precise way, there are multiple scenarios that describe who economically bears P&L depending on whether the order is netted against opposing flow at the time of execution.

### Scenario set 1: 100% netted (long matched against a short)

**Scenario 1:** Trader goes long and there is another short (100% netted).

- If the token price goes up: **the short trader pays the long trader**.

**Scenario 2:** Trader goes long and there is another short (100% netted).

- If the token price goes down: **the long trader pays the short trader**.

**Result:** If the trade is **100% netted**, the **traders pay each other** (P&L is transferred between long and short, net of fees).

---

### Scenario set 2: 0% netted (no immediate opposing short; temporary imbalance)

**Scenario 3:** Trader goes long and there is no short at that moment (0% netted).

- If the token price goes up: **the solver pays the long trader’s profit** on the un-netted portion, using the solver’s available inventory/hedging resources (which may include **LP vault capacity / USDC balance** as defined by the system design).

**Scenario 4:** Trader goes long and there is no short at that moment (0% netted).

- If the token price goes down: **the trader pays the solver** on the un-netted portion (via the trader’s margin/balance).

**Result:** If the trade is **0% netted**, the trader’s P&L on the un-netted portion is effectively against the **solver**, and profits (when the trader wins) are paid from **solver inventory / LP vault resources**, while losses (when the trader loses) are paid from the **trader’s balance**.

---

### Practical reality and solver objective

The real market is a constant combination of these scenarios (often partially netted rather than 0% or 100%). The solver’s objective is to keep the system close to balanced—i.e., minimize time spent in the “un-netted inventory” case—and to manage any temporary imbalance via hedging and incentive mechanisms (e.g., spreads/funding), such that any profits paid out from inventory/LP vault capacity are offset by the solver’s overall risk-management and hedging performance over time.
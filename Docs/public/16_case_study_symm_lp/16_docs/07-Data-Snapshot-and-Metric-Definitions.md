# Data Snapshot and Metric Definitions

## 7.1 Sources Used

- `../16_data.md`
- provided dashboard screenshots (same SYMM session)

## 7.2 Data Values Referenced

From the provided dashboard state:

- Last updated: `20:48:23`
- Total Tokens: `2,501,328.4`
- Locked Tokens: `2,501,213.96`
- Free Tokens: `114.43`
- Total USDC: `5,819.41`
- User Profit: `-5,816.45`
- Total OI: `3,393,754.98`
- Long OI: `3,341,281.71`
- Short OI: `52,473.28`
- Current UPnL: `-7,999.32`
- Current Debt: `-5,895.90`
- Long Utilization: `131.48%`
- Open Interest (Quantity): `3,470,667.340516`
- Open positions: `289`
- Deposited tokens (case input): `2,501,328.4`
- Deposit-time SYMM price (case input): `$0.01`
- Current SYMM price (case input): `$0.007`
- Realized LP profit (case input): `$5,895.90`
- Unrealized LP profit (case input): `$7,999.32`

## 7.3 Metric Definitions (LP Perspective)

- **Current Debt**: users' already realized debt to LP.  
  - Negative value => LP realized profit.

- **Current UPnL**: users' current unrealized PnL.  
  - Negative value => LP unrealized profit at mark.

- **User Profit**: aggregate user-side profitability field at data cut.  
  - Negative value => users are net down, LP side is net up.

## 7.4 Interpretation Guardrails

- Do not treat one data cut as a full-cycle performance report.
- Do not sum heterogeneous fields unless accounting methodology confirms additivity.
- Distinguish clearly between realized and unrealized components in communications.

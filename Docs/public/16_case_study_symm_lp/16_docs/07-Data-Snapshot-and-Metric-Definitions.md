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
- Deposited tokens (sum of txs): `2,271,131`
- Current token balance: `2,501,328.4`
- Token delta: `+230,197.4` (`+10.14%`)
- Average deposit SYMM price (case input): `$0.01280`
- Total notional deposit (case input): `$29,089.967`
- Current SYMM price (case input): `$0.007`
- Realized LP profit (case input): `$5,895.90`
- Unrealized LP profit (case input): `$7,999.32`
- Average USDC yield per day (case input): `0.88%`
- Average USDC yield per year (case input): `319.87%`
- Average token yield per day (case input): `0.15%`
- Average token yield per year (case input): `55.46%`

Exact deposit transactions:

- `0x02ac33dfaebfd2f07ff35e4202753bdab5825702431200a4dae6c59b3bd075f5` - `24/01/2026 12:09:07` - `SYMM` - `620,000`
- `0x95466e0f334de737971012765849ce5eb0c1965ea3c8967fc8d95d9772fb8e06` - `06/01/2026 08:12:41` - `SYMM` - `825,925`
- `0xaef807a86785d9cf9e670f04dcf52f8bd02bf4fc7187aacd747bf87d4b9b2fe5` - `29/12/2025 11:49:29` - `SYMM` - `825,206`

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

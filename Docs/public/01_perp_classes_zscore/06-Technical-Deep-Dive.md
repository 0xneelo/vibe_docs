# Section 6: Technical Deep Dive

## 6.1 System Architecture Overview

a Permissionless OTC Derivatives Protocol operates as a multi-layer system combining on-chain settlement with off-chain computation. This hybrid approach balances the trustlessness of blockchain with the computational power needed for complex derivatives operations.

### 6.1.1 Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│         Trading Interface / API / Integrations           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   SOLVER LAYER                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ Quote Engine │ │ Risk Engine  │ │ Match Engine │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │  Liquidation │ │   Hedging    │ │  Graduation  │    │
│  │   Engine     │ │   Engine     │ │   Engine     │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 SETTLEMENT LAYER                         │
│         Smart Contracts / On-chain State                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │   Vaults     │ │  Positions   │ │  Insurance   │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   ORACLE LAYER                           │
│          Price Feeds / External Data                     │
└─────────────────────────────────────────────────────────┘
```

---

## 6.2 Settlement Layer (On-Chain)

### 6.2.1 Core Contracts

**Vault Contract**
Manages LP capital that backs Solver operations:
```
- deposit(amount) → LP shares
- withdraw(shares) → underlying
- getUtilization() → current capital usage
- getAvailableCapacity() → remaining capacity
```

**Position Contract**
Tracks all open positions:
```
- openPosition(market, size, side, margin)
- closePosition(positionId)
- modifyMargin(positionId, delta)
- getPosition(positionId) → Position struct
```

**Insurance Fund Contract**
Manages risk reserves:
```
- fund(amount) → add to insurance
- claim(amount) → draw from insurance (restricted)
- getBalance() → current fund size
- getUtilization() → claims vs deposits
```

### 6.2.2 State Management

**On-chain state (must be trustless)**:
- Position ownership
- Collateral balances
- Vault shares
- Insurance fund balance
- Settlement records

**Off-chain state (Solver managed)**:
- Order book state
- Risk calculations
- Market metrics
- Z-Score computations

### 6.2.3 Settlement Guarantees

All material financial state settles on-chain:

```
Trade Execution Flow:
1. User signs intent to trade
2. Solver validates and executes
3. Solver submits settlement proof
4. Contract verifies and updates state
5. Position/balance changes are final
```

> **TO:DO**: Add specific smart contract architecture details, including function signatures, access control patterns, and upgrade mechanisms.

---

## 6.3 Solver Layer (Off-Chain)

### 6.3.1 Quote Engine

The Quote Engine generates prices for trade execution:

**Inputs**:
- Oracle price feed
- Current inventory (Solver position)
- Market volatility
- Utilization rate
- Z-Score (market maturity)

**Pricing Model**:
```
Quote_Price = Oracle_Price × (1 + Spread)

Where:
Spread = Base_Spread + Inventory_Adjustment + Volatility_Premium

Base_Spread: Market-specific minimum
Inventory_Adjustment: Widens when Solver is overexposed
Volatility_Premium: Widens in volatile conditions
```

**Dynamic Spread Based on Z-Score**:
```
Z-Score    | Spread Multiplier | Rationale
-----------+-------------------+------------------
> 0.8      | 3.0x              | High Solver risk
0.5 - 0.8  | 2.0x              | Moderate risk
0.2 - 0.5  | 1.5x              | Lower risk
< 0.2      | 1.0x              | Minimal risk
```

### 6.3.2 Risk Engine

The Risk Engine manages protocol exposure:

**Position Limits**:
```
Max_Position_Size = f(
    vault_capacity,
    market_liquidity,
    volatility,
    z_score,
    current_exposure
)
```

**Margin Requirements**:
```
Initial_Margin = Notional × Initial_Margin_Rate
Maintenance_Margin = Notional × Maintenance_Margin_Rate

Where margin rates vary by:
- Asset volatility class
- Position size (larger = higher margin)
- Market maturity (Z-Score)
- Account risk score
```

**Real-time Monitoring**:
```
For each position:
  current_margin = deposited_margin + unrealized_pnl
  margin_ratio = current_margin / maintenance_margin
  
  if margin_ratio < 1.0:
    trigger_liquidation(position)
```

### 6.3.3 Match Engine

As markets mature, the Match Engine enables trader-to-trader matching:

**Matching Logic**:
```
For incoming order O:
  1. Check if natural counterparty exists
     - Scan pending intents on opposite side
     - If match found: execute peer-to-peer
  
  2. If no natural match:
     - Execute against Solver
     - Solver takes residual position
  
  3. Settlement:
     - Submit matched trade to chain
     - Update positions atomically
```

**Matching Priority**:
```
1. Price improvement (better than Solver quote)
2. Time priority (FIFO among equals)
3. Size optimization (minimize partial fills)
```

### 6.3.4 Liquidation Engine

**Liquidation Detection**:
```python
def check_liquidations():
    for position in all_positions:
        margin_ratio = position.margin / position.maintenance_requirement
        if margin_ratio < LIQUIDATION_THRESHOLD:
            queue_liquidation(position)
```

**Liquidation Execution**:
```
Liquidation Process:
1. Position identified as undercollateralized
2. Liquidation order created (opposite side)
3. Order executed against:
   a. Order book (if mature market)
   b. Solver (guaranteed fill)
   c. ADL (extreme cases)
4. Remaining margin distributed:
   - Penalty to insurance fund
   - Remainder to position holder
```

**Cascading Prevention**:
```
Safety Mechanisms:
- Incremental liquidations (partial close)
- Liquidation delays during extreme volatility
- Insurance fund injection before ADL
- Circuit breakers for market-wide events
```

### 6.3.5 Hedging Engine

The Solver manages its exposure through external hedging:

**Hedging Strategy**:
```
Net_Solver_Position = -Sum(All_Trader_Positions)

If Net_Solver_Position exceeds threshold:
  1. Identify hedging venues (CEX perps, other DEXs)
  2. Calculate optimal hedge
  3. Execute hedge trades
  4. Monitor and rebalance
```

**Hedging Considerations**:
- Cost of hedging vs. cost of exposure
- Liquidity on hedging venues
- Correlation assumptions
- Basis risk

> **TO:DO**: Detail specific hedging strategies, venue selection criteria, and rebalancing algorithms.

### 6.3.6 Graduation Engine

Monitors markets for order book readiness:

**Graduation Criteria Check**:
```python
def check_graduation_ready(market):
    metrics = get_market_metrics(market)
    
    criteria = {
        'z_score': metrics.z_score < 0.1,
        'daily_volume': metrics.daily_volume > MIN_VOLUME,
        'unique_traders': metrics.weekly_traders > MIN_TRADERS,
        'age': metrics.days_active > MIN_DAYS,
        'liquidation_rate': metrics.liq_rate < MAX_LIQ_RATE,
    }
    
    return all(criteria.values())
```

**Graduation Process**:
```
1. Market passes criteria for N consecutive days
2. Graduation proposal created
3. Order book initialized
4. Solver begins market making in book
5. AMM execution deprecated (book priority)
6. Transition period (both active)
7. AMM becomes backstop only
```

---

## 6.4 Oracle Layer

### 6.4.1 Price Feed Requirements

a Permissionless OTC Derivatives Protocol requires robust price feeds for:
- Trade execution pricing
- Margin calculations
- Liquidation triggers
- Funding rate anchoring

**Oracle Properties Required**:
| Property | Requirement | Rationale |
|----------|-------------|-----------|
| Freshness | < 1 second stale | Avoid stale price exploitation |
| Accuracy | ±0.1% vs true price | Fair execution |
| Manipulation resistance | Multi-source | No single point of failure |
| Availability | 99.9%+ uptime | Markets can't pause |

### 6.4.2 Multi-Oracle Architecture

```
┌──────────────────────────────────────────┐
│              ORACLE AGGREGATOR           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Pyth     │ │Chainlink │ │ Redstone │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│         ↓           ↓           ↓        │
│    ┌────────────────────────────────┐    │
│    │     Median/Validation Logic    │    │
│    └────────────────────────────────┘    │
│                    ↓                     │
│            Validated Price               │
└──────────────────────────────────────────┘
```

### 6.4.3 Bootstrap Market Oracles

For new tokens without established oracle feeds:

**DEX Price Derivation**:
```
For token with no Pyth/Chainlink feed:
1. Query DEX pools (Raydium, Orca, etc.)
2. Apply TWAP smoothing
3. Validate liquidity depth
4. Apply confidence bounds

Price = DEX_TWAP if liquidity > MIN_DEPTH else REJECT
```

**Oracle Risk Tiers**:
| Tier | Oracle Source | Max Leverage | OI Limit |
|------|---------------|--------------|----------|
| 1 | Pyth + Chainlink | 50x | High |
| 2 | Pyth only | 20x | Medium |
| 3 | DEX-derived | 10x | Low |
| 4 | Single source | 5x | Very Low |

---

## 6.5 Funding Rate Mechanism

### 6.5.1 Purpose

Funding rates anchor perpetual prices to spot:
- Perp > Spot → Longs pay shorts → Price decreases
- Perp < Spot → Shorts pay longs → Price increases

### 6.5.2 a Permissionless OTC Derivatives Protocol Funding Model

**Standard Funding**:
```
Funding_Rate = (Perp_Price - Spot_Price) / Spot_Price × K

Where K is a dampening constant
```

**Solver-Adjusted Funding**:
During bootstrap, funding adjusts for Solver position:
```
Adjusted_Rate = Base_Rate + Solver_Incentive

Solver_Incentive = f(Z_Score, Solver_Position_Direction)
```

When Solver is heavily exposed, funding incentivizes opposing positions.

### 6.5.3 Funding Payment Flow

```
Every funding_interval (e.g., 8 hours):
  
  For each position:
    funding_payment = position_size × funding_rate
    
    if position.side == LONG and funding_rate > 0:
      position.margin -= funding_payment
    elif position.side == SHORT and funding_rate > 0:
      position.margin += funding_payment
    # Vice versa for negative funding
```

---

## 6.6 Position Lifecycle

### 6.6.1 Opening a Position

```
User Request: Open 10 ETH long with 100 USDC margin

1. VALIDATION
   - Check margin ≥ initial_margin_required(size, leverage)
   - Check position size ≤ max_position_size(market)
   - Check OI headroom exists

2. QUOTE
   - Solver generates execution price
   - Entry_Price = Oracle + Spread

3. EXECUTION
   - User signs transaction
   - Margin transferred to vault
   - Position created on-chain

4. SOLVER UPDATE
   - Solver position updated
   - Z-Score recalculated
   - Risk parameters adjusted if needed
```

### 6.6.2 Managing a Position

```
Ongoing Position Management:

MARGIN OPERATIONS:
- Add margin: increase collateral, lower liquidation price
- Remove margin: if above initial margin, withdrawal allowed

PnL TRACKING:
- Unrealized PnL = Position_Size × (Current_Price - Entry_Price)
- Effective_Margin = Deposited_Margin + Unrealized_PnL - Fees_Accrued

FUNDING PAYMENTS:
- Applied every funding interval
- Deducted from/added to margin
```

### 6.6.3 Closing a Position

```
Close Request: Close 10 ETH long position

1. QUOTE
   - Exit_Price = Oracle - Spread (selling)
   
2. PNL CALCULATION
   - Realized_PnL = Size × (Exit_Price - Entry_Price)
   - Total_Fees = Entry_Fee + Exit_Fee + Accrued_Funding
   - Net_PnL = Realized_PnL - Total_Fees

3. SETTLEMENT
   - If Net_PnL > 0: User receives margin + PnL
   - If Net_PnL < 0: User receives margin - |PnL|
   - If margin insufficient: liquidation (shouldn't reach close)

4. SOLVER UPDATE
   - Solver position closes
   - Vault capital freed
```

---

## 6.7 Security Model

### 6.7.1 Trust Assumptions

**Trustless (on-chain)**:
- Position ownership
- Collateral custody
- Settlement finality
- Insurance fund access

**Trust in Solver (off-chain)**:
- Quote fairness (bounded by oracle)
- Execution quality
- Risk parameter setting
- Graduation decisions

### 6.7.2 Solver Constraints

Solver power is bounded:
```
Solver CAN:
- Set spreads (within bounds)
- Adjust risk parameters (within bounds)
- Execute trades at oracle-derived prices
- Trigger liquidations (verifiable on-chain)

Solver CANNOT:
- Steal user funds
- Execute at arbitrary prices
- Prevent withdrawals
- Modify past settlements
```

### 6.7.3 Security Mechanisms

| Risk | Mitigation |
|------|------------|
| Oracle manipulation | Multi-source aggregation, circuit breakers |
| Solver misconduct | On-chain verification, bounded parameters |
| Smart contract bugs | Audits, formal verification, gradual rollout |
| Economic attacks | Position limits, OI caps, insurance fund |

> **TO:DO**: Add detailed threat model and specific security audit requirements.

---

## 6.8 Technical Summary

a Permissionless OTC Derivatives Protocol's technical architecture enables:

| Capability | How Achieved |
|------------|--------------|
| Permissionless listing | DEX-derived oracles, isolated markets |
| Bootstrap liquidity | Solver as counterparty, LP vault |
| Market maturation | Z-Score tracking, graduation engine |
| Efficient operation | Transition to netting, order books |
| Security | Hybrid on/off-chain, bounded Solver |

---

*Next Section: Industry Implications →*

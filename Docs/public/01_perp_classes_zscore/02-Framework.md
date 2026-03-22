# Section 2: A Framework for Categorizing Perpetual Protocols

## 2.1 The Need for Systematic Categorization

The perpetual futures landscape has grown increasingly complex. New protocols launch regularly, each claiming innovation, yet lacking a common vocabulary to describe their architectures. This makes it difficult to:

- Compare protocols objectively
- Identify fundamental limitations
- Predict which designs will succeed for which use cases
- Understand why certain approaches fail

We propose a framework based on **two orthogonal dimensions** that capture the most critical architectural decisions in perpetual protocol design. These dimensions are:

1. **Matching Engine Architecture**: How are trades matched?
2. **Collateralization Architecture**: Who pays winning traders?

Additionally, we identify a third important dimension:

3. **Insurance Topology**: How is risk shared across markets?

---

## 2.2 Dimension 1: Matching Engine Architecture

The matching engine determines **how and when** trades are executed. This is the most fundamental architectural decision in any trading system.

### 2.2.1 Synchronous Matching

**Definition**: A synchronous matching engine requires both counterparties to be present simultaneously. A trade only executes when a buyer is matched with a seller in real-time.

**Canonical Example**: Order books (Hyperliquid, Binance, traditional exchanges)

**Mechanism**:
1. Traders submit limit orders (bids and asks)
2. Orders rest in the book until matched
3. When a bid price meets an ask price, execution occurs
4. Both parties are immediately committed

**Characteristics**:
- Requires liquidity on both sides
- Price discovery through order flow
- Can achieve tight spreads with sufficient volume
- Market makers essential for function
- **Cannot operate without participants on both sides**

**Advantages**:
- Capital efficient (no collateral pools needed)
- True price discovery
- Familiar to traders
- Well-understood risk models

**Disadvantages**:
- Requires existing liquidity to function
- Cold start problem for new markets
- Dependent on market maker participation
- Cannot serve low-liquidity assets

### 2.2.2 Asynchronous Matching

**Definition**: An asynchronous matching engine allows trades to execute against a persistent counterparty (protocol, AMM, or solver) without requiring immediate matching with another trader.

**Canonical Example**: Automated Market Makers (Uniswap for spot; GMX for perps)

**Mechanism**:
1. A liquidity pool or solver provides persistent counterparty
2. Traders execute against this counterparty at any time
3. No need for simultaneous buyer and seller
4. The counterparty absorbs directional flow

**Characteristics**:
- Can operate with one-sided flow
- Counterparty takes directional risk
- Pricing often oracle-based
- Spreads reflect counterparty risk premium
- **Can serve markets with minimal activity**

**Advantages**:
- Can bootstrap new markets
- 24/7 availability regardless of activity
- No dependency on market makers
- Permissionless listing possible

**Disadvantages**:
- Counterparty must be capitalized
- Typically wider spreads
- May have worse execution for large orders
- Requires careful risk management

### 2.2.3 The Spectrum

In practice, matching engines exist on a spectrum:

```
FULLY SYNCHRONOUS                              FULLY ASYNCHRONOUS
       |                                              |
       v                                              v
[Pure Order Book] --- [Hybrid Systems] --- [Pure vAMM]
   Hyperliquid         Intent-based            GMX v1
   Binance              Systems              Uniswap
```

**Key Insight**: The matching engine architecture fundamentally determines what markets the protocol can serve. Synchronous systems require demand; asynchronous systems can create supply.

---

## 2.3 Dimension 2: Collateralization Architecture

Collateralization determines **who pays winning traders** and how losses are absorbed. This is perhaps the most misunderstood dimension in perpetual protocol design.

### 2.3.1 Fully Netted Systems

**Definition**: In a fully netted system, longs pay shorts directly (and vice versa). There is no external collateral backing the system—all payouts come from other participants.

**Canonical Example**: Hyperliquid, Binance Futures, traditional futures exchanges

**Mechanism**:
1. For every long position, there must be an equal short position
2. When price moves up, longs profit and shorts lose
3. Shorts' losses directly fund longs' profits
4. The exchange is merely a clearinghouse

**Key Property**: **The sum of all profits and losses is always zero** (excluding fees)

```
Long Profit = Short Loss
Short Profit = Long Loss
System Net = 0
```

**Risk Management**:
- Liquidations close positions before losses exceed margin
- Insurance funds cover gaps from fast market moves
- Auto-deleveraging (ADL) as last resort: winning positions are reduced

**Advantages**:
- Extremely capital efficient
- Both sides can have high leverage
- Low fees possible (no LP risk premium)
- Proven model at scale

**Disadvantages**:
- Requires balanced flow (longs ≈ shorts)
- ADL risk in extreme conditions
- Cannot function with one-sided interest
- **Fundamentally incompatible with market bootstrap**

### 2.3.2 Fully Collateralized Systems

**Definition**: In a fully collateralized system, all potential payouts are backed by actual assets held in the protocol. An LP or vault provides the capital to pay winning traders.

**Canonical Example**: GMX v1, Gains Network, traditional options markets

**Mechanism**:
1. LPs deposit assets into a vault
2. Traders trade against the vault
3. Trader wins = Vault pays out
4. Trader loses = Vault receives payment
5. The vault's capital backs all open positions

**Key Property**: **Maximum possible payout is always collateralized**

```
If trader can win $X, vault must hold ≥ $X
Maximum System Loss = Vault Capital
```

**Risk Management**:
- Open interest caps based on vault size
- Maximum win limits per position
- Dynamic fees based on utilization
- LP risk pricing into spreads

**Advantages**:
- Can serve one-sided flow
- Deterministic payout capability
- Can bootstrap new markets
- No ADL risk for traders

**Disadvantages**:
- Capital inefficient (1:1 or worse collateralization)
- LPs take directional risk
- Higher fees to compensate LPs
- Limited leverage on LP side

### 2.3.3 The Collateralization Spectrum

```
FULLY NETTED                                    FULLY COLLATERALIZED
      |                                                  |
      v                                                  v
[Zero Collateral] --- [Partial] --- [Full Collateral]
  Pure P2P            Insurance        LP Vault
  Hyperliquid         Fund Backed      GMX v1
```

**Key Insight**: Netted systems are efficient but require two-sided flow. Collateralized systems can handle one-sided flow but at significant capital cost. **No existing protocol dynamically moves between these states.**

---

## 2.4 Dimension 3: Insurance Topology

The third dimension concerns how risk is distributed across multiple markets within a protocol.

### 2.4.1 Cross-Margin / Global Insurance

**Definition**: All markets share a common insurance fund and/or risk engine. Profits from one market can offset losses in another.

**Characteristics**:
- Unified margin account across markets
- Portfolio margining possible
- Systemic risk coupling
- Capital efficiency through diversification

**Examples**: Hyperliquid (cross-margin mode), Binance Futures

**Advantages**:
- Better capital efficiency for multi-market traders
- Insurance fund benefits from diversification
- Profitable markets subsidize struggling ones

**Disadvantages**:
- Contagion risk between markets
- Complex risk calculations
- One bad market can drain shared resources

### 2.4.2 Isolated Markets

**Definition**: Each market maintains its own separate insurance fund, risk parameters, and margin requirements. No cross-subsidization occurs.

**Characteristics**:
- Independent risk per market
- No contagion between markets
- Simpler risk model
- Markets sink or swim on their own

**Examples**: Most early perp protocols, GMX individual pools

**Advantages**:
- No contagion risk
- Clear per-market economics
- Easier to reason about
- Better for permissionless listing

**Disadvantages**:
- Less capital efficient
- No portfolio benefits
- Each market must be independently viable

### 2.4.3 Implications for Market Bootstrap

**For bootstrapping new markets, isolated architecture is superior:**

1. A new, unproven market cannot drain resources from established markets
2. Risk parameters can be conservative without affecting other markets
3. The market can prove itself before integration
4. Failure is contained

However, **as markets mature**, cross-margin benefits become attractive:

1. Traders want unified positions
2. Capital efficiency improves
3. Portfolio hedging becomes possible
4. Integration with broader ecosystem

**This suggests a progressive model**: markets start isolated and integrate as they mature.

---

## 2.5 The Complete Framework

Combining these dimensions, we can map any perpetual protocol:

```
                    COLLATERALIZATION
                    
           Fully Netted ←————————→ Fully Collateralized
                |                         |
    Sync   [Hyperliquid]              [Impossible*]
      ↑         |                         |
 MATCHING       |                         |
      ↓         |                         |
    Async  [Derp.fun**]               [GMX v1]
                |                         |
                
    * Synchronous + Fully Collateralized has no efficient implementation
    ** Fails at bootstrap as we will demonstrate
```

**Insurance Topology** adds a third axis:
- Cross-margin systems cluster toward established, netted protocols
- Isolated systems are more common in collateralized protocols

### 2.5.1 The Four Quadrants

**Quadrant 1: Synchronous + Fully Netted**
- Examples: Hyperliquid, Binance, dYdX
- Works: Established markets with two-sided flow
- Fails: Market bootstrap, low-liquidity assets

**Quadrant 2: Synchronous + Fully Collateralized**
- Examples: Rare/theoretical
- Challenge: Order book with full collateralization is capital-prohibitive
- No major protocol operates here

**Quadrant 3: Asynchronous + Fully Netted**
- Examples: Derp.fun, Imperial (attempts)
- Claimed benefit: Capital efficiency + permissionless
- Reality: **Fails catastrophically** (see Section 3)

**Quadrant 4: Asynchronous + Fully Collateralized**
- Examples: GMX v1, Gains Network, Wasabi
- Works: Market bootstrap possible
- Fails: Cannot scale due to capital inefficiency

---

## 2.6 Framework Implications

This framework reveals several critical insights:

### Insight 1: No Single Quadrant Solves Permissionless + Efficient

- Quadrant 1 cannot bootstrap
- Quadrant 3 fails at bootstrap
- Quadrant 4 cannot scale

### Insight 2: Market Lifecycle Requires Quadrant Traversal

A truly permissionless system must:
1. **Start** in Quadrant 4 (async + collateralized) for bootstrap
2. **Mature** through intermediate states
3. **Graduate** to Quadrant 1 (sync + netted) for efficiency

### Insight 3: Insurance Topology Should Follow Maturity

- New markets: Isolated (contain risk)
- Proven markets: Cross-margin (improve efficiency)

### Insight 4: The Industry Gap Explained

The gap between token launch and perp listing exists because:
- Quadrant 1 protocols (Hyperliquid) cannot list new assets
- Quadrant 4 protocols (GMX) have not scaled their model
- No protocol traverses quadrants dynamically

---

## 2.7 Summary

We have established a framework with three dimensions:

| Dimension | Spectrum | Trade-off |
|-----------|----------|-----------|
| Matching | Sync ↔ Async | Efficiency vs. Bootstrap |
| Collateralization | Netted ↔ Collateralized | Efficiency vs. Reliability |
| Insurance | Cross ↔ Isolated | Efficiency vs. Containment |

This framework enables systematic analysis of perpetual protocols and reveals why the market bootstrap problem has remained unsolved. In the next section, we apply this framework to analyze existing protocols in detail.

---

*Next Section: The Landscape of Existing Protocols →*

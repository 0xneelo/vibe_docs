# Section 3: The Landscape of Existing Protocols

## 3.1 Overview

Applying our framework to the existing perpetual futures landscape reveals distinct clusters of protocols, each with characteristic strengths and fundamental limitations. This section provides detailed analysis of major protocol categories and specific implementations.

---

## 3.2 Category 1: Synchronous + Fully Netted (Order Book Protocols)

### 3.2.1 Architecture Overview

Order book protocols represent the traditional exchange model adapted for decentralized environments. Key characteristics:

- **Central Limit Order Book (CLOB)** for price discovery
- **Matching engine** pairs buyers with sellers
- **Clearinghouse function** manages margin and settlements
- **Insurance fund** covers socialized losses

### 3.2.2 Hyperliquid: The Current Market Leader

**Architecture**:
- Custom L1 blockchain optimized for trading
- Fully on-chain order book with sub-second finality
- Cross-margin account system
- HLP (Hyperliquid LP) as backstop liquidity

**Market Position**:
- Dominant DEX perpetual volume (~$5B+ daily)
- 100+ listed markets
- Sub-millisecond latency for matching

**Listing Process (HIP-3)**:
Hyperliquid introduced HIP-3 for "permissionless" listing via auction:

1. Projects bid for listing slots
2. Highest bidder wins listing rights
3. Market is created with the project's parameters

**Critical Analysis**:
Despite being called "permissionless," HIP-3 has significant constraints:

- **Auction creates barrier**: Only well-funded projects can bid
- **Still requires existing interest**: Markets without traders fail post-listing
- **Human judgment persists**: Auction winners are still evaluated
- **No bootstrap mechanism**: The order book doesn't create liquidity

> **TO:DO**: Include specific data on HIP-3 auction outcomes, average bid amounts, and post-listing volume statistics for markets that succeeded vs. failed.

**Why Hyperliquid Cannot Bootstrap Markets**:

Consider what happens when listing a new, unknown token:

1. Market is created with empty order book
2. Trader wants to long → no asks exist
3. Trader wants to short → no bids exist
4. No trades occur → no price discovery
5. Market makers won't quote unknown assets
6. Market remains dead

The order book model is a **demand facilitator**, not a **demand creator**.

### 3.2.3 dYdX

**Architecture**:
- Originally on Ethereum L2 (StarkEx)
- Migrated to Cosmos app-chain
- Off-chain order book with on-chain settlement
- Cross-margin with insurance fund

**Comparison to Hyperliquid**:
- Similar fundamental architecture
- Different technology stack
- Same bootstrap limitations

### 3.2.4 Centralized Exchanges (Binance, Bybit, OKX)

For completeness, centralized exchanges share the same architectural category:

- Synchronous matching via order books
- Fully netted positions
- Insurance funds for socialized losses
- **Manual listing decisions**

The key difference is that centralized exchanges have:
- Established user bases to provide initial liquidity
- Market maker relationships for new listings
- Internal capital to bootstrap markets

Yet even with these advantages, centralized exchanges are **highly selective** about perpetual listings, demonstrating that the bootstrap problem exists even with resource advantages.

### 3.2.5 Summary: Order Book Limitations

| Strength | Limitation |
|----------|------------|
| Capital efficient | Cannot bootstrap |
| Low spreads possible | Requires existing liquidity |
| True price discovery | Market makers needed |
| Familiar UX | Selective listing |

**Conclusion**: Order book protocols are optimal for established markets but architecturally incapable of permissionless market creation.

---

## 3.3 Category 2: Asynchronous + Fully Collateralized (Vault Protocols)

### 3.3.1 Architecture Overview

Vault protocols enable trading against a collateral pool rather than other traders. Key characteristics:

- **Liquidity vault** holds assets to pay winners
- **Oracle-based pricing** (no order book)
- **Traders vs. vault** rather than traders vs. traders
- **LP risk** in exchange for fees

### 3.3.2 GMX v1: The Pioneer

**Architecture**:
- GLP vault holds basket of assets (ETH, BTC, stablecoins)
- Traders trade against GLP
- Oracle provides execution price
- Vault profits when traders lose, loses when traders win

**Mechanism Deep Dive**:

*For Long Positions*:
1. Trader deposits USDC as margin
2. Trader opens long ETH position
3. If ETH price rises: Vault pays profit in ETH
4. If ETH price falls: Trader's margin covers loss

The vault is essentially writing perpetual contracts to traders, fully collateralizing each position.

*Capital Requirements*:
```
If open interest = $100M long ETH
And max profit potential = 900% (10x leverage, 90% price increase)
Then vault must hold ≥ $900M in ETH
```

This is why GMX has **open interest caps** and **position size limits**.

**Why GMX Works for Bootstrap**:

Unlike order books, GMX can serve one-sided flow:
1. Only longs exist → vault takes the short side
2. Only shorts exist → vault takes the long side
3. No matching required → instant execution
4. Liquidity always available → markets always tradeable

**Why GMX Doesn't Scale**:

The same properties that enable bootstrap create scaling problems:

| Factor | Consequence |
|--------|-------------|
| Full collateralization | Massive capital requirements |
| LP directional risk | High fees to compensate |
| Oracle dependency | No true price discovery |
| Vault capacity limits | OI caps on all markets |

**Fee Structure Reflection**:
GMX fees (entry/exit + funding) reflect the LP risk premium. Traders pay more because LPs are taking counterparty risk.

> **TO:DO**: Include specific fee comparison data between GMX and Hyperliquid showing the cost difference for equivalent trades.

### 3.3.3 Gains Network (gTrade)

**Architecture**:
- Similar vault model to GMX
- gDAI vault provides collateral
- Synthetic positions (no physical underlying)
- Unique NFT-based market maker incentives

**Innovation**:
Gains introduced several optimizations:
- Smaller position collateral requirements
- Dynamic spread based on market conditions
- Decentralized keeper network

**Same Fundamental Limitations**:
Despite innovations, Gains faces the same constraints:
- Capital inefficiency
- LP risk premium in fees
- Scaling limitations

### 3.3.4 Wasabi Protocol

**Architecture**:
- Margin trading against liquidity pools
- Fully collateralized positions
- Focus on "exotic" assets

**Relevance**:
Wasabi demonstrates that the async + collateralized model can support any asset—the question is whether it can do so efficiently enough to matter.

### 3.3.5 Summary: Vault Protocol Limitations

| Strength | Limitation |
|----------|------------|
| Can bootstrap markets | Capital inefficient |
| Permissionless listing possible | High fees |
| No ADL risk | LP risk deters capital |
| Oracle-based (simple) | No price discovery |

**Conclusion**: Vault protocols solve bootstrap but cannot compete with order books on efficiency. They occupy a niche rather than becoming the dominant model.

---

## 3.4 Category 3: Asynchronous + Fully Netted (The Failed Experiments)

### 3.4.1 The Attractive but Flawed Concept

Several protocols have attempted to combine:
- **Asynchronous execution** (for permissionless listing)
- **Netted positions** (for capital efficiency)

In theory, this would give the best of both worlds. In practice, it fails.

### 3.4.2 Derp.fun Analysis

**Claimed Architecture**:
- Permissionless market creation
- Traders trade "against each other" asynchronously
- Dynamic funding rates incentivize balance
- No LP vault required

**The Fundamental Problem**:

Consider a new market launch:

1. **T=0**: Market created for token XYZ
2. **T=1**: Trader A opens 100 XYZ long
3. **T=2**: Price increases 10%
4. **T=3**: Trader A wants to close with profit

**Question**: Who pays Trader A's profit?

In a netted system, shorts pay longs. But:
- No shorts exist yet
- The protocol has no collateral
- Trader A cannot be paid

**Proposed Solution (Dynamic Funding)**:

Derp.fun's answer: "Extreme funding rates will incentivize shorts"

**Reality**:
```
Scenario: Token pumping 50%
Required short incentive: Enormous (paying to lose?)
Actual short interest: Zero (why short a pumping token?)
Result: Longs cannot be paid
```

This is not a theoretical problem—it is mathematically guaranteed to occur in any bootstrapping scenario.

### 3.4.3 Why Dynamic Incentives Cannot Solve This

The argument goes: "If funding is high enough, someone will take the other side."

**Counter-arguments**:

1. **No rational short**: During bootstrap, price discovery is uncertain. Shorting means betting against unknown momentum. No funding rate compensates for unlimited downside risk.

2. **Information asymmetry**: Early markets have informed traders (insiders, early holders). Why would anyone take the other side of an informed trade?

3. **Adverse selection**: If the funding rate to short is +500% APR, what does that signal? That everyone wants to be long. Why would you short?

4. **Game theory**: Knowing shorts won't come, longs won't enter either. The market fails to start.

### 3.4.4 Imperial and Similar Protocols

Multiple protocols have attempted variations:
- Isolated perpetual pools with netted accounting
- Virtual AMMs with implied counterparties
- "Community-backed" perpetual positions

**Common Failure Mode**:
All require someone to take losses during bootstrap. Without a defined, capitalized counterparty, this someone doesn't exist.

### 3.4.5 The Core Insight

**Asynchronous + Netted is a contradiction for bootstrap:**

- Asynchronous means "execute without matching"
- Netted means "all payouts come from other participants"
- Combined: "Execute without matching, but only pay from matches"

This is logically incoherent for new markets.

### 3.4.6 Summary: Failed Experiment Lessons

| What They Tried | Why It Fails |
|-----------------|--------------|
| Async execution | Requires counterparty |
| Netted accounting | No counterparty exists |
| Dynamic funding | Cannot force other side |
| Permissionless listing | Markets immediately break |

**Conclusion**: The async + netted combination is architecturally invalid for market bootstrap. Protocols attempting this approach will fail regardless of implementation quality.

---

## 3.5 Category 4: Hybrid Approaches (Partial Solutions)

### 3.5.1 Virtual AMMs (Perpetual Protocol v1)

**Concept**:
Use an AMM formula (like Uniswap's x*y=k) to price perpetual positions.

**Problems**:
- AMM formulas designed for spot, not derivatives
- No connection between AMM state and actual market conditions
- Funding rate mechanisms awkward to implement
- Manipulable through AMM dynamics

**Status**: Mostly abandoned approach

### 3.5.2 Intent-Based Systems

**Concept**:
Traders express "intents" (desired trades), and solvers compete to fill them.

**For Perpetuals**:
This creates an interesting middle ground:
- Asynchronous (intents can wait)
- Potentially netted (solver can batch)
- But solver must have capital to fill imbalances

**Current State**: Emerging category, not yet proven for perpetuals

> **TO:DO**: Add analysis of any specific intent-based perpetual implementations if they've launched by the time of publication.

---

## 3.6 Comparative Analysis Table

| Protocol | Matching | Collateral | Insurance | Bootstrap | Scale | Status |
|----------|----------|------------|-----------|-----------|-------|--------|
| Hyperliquid | Sync | Netted | Cross | ❌ | ✅ | Leader |
| dYdX | Sync | Netted | Cross | ❌ | ✅ | Active |
| GMX v1 | Async | Full | Isolated | ✅ | ❌ | Legacy |
| Gains | Async | Full | Mixed | ✅ | ❌ | Active |
| Derp.fun | Async | Netted | Isolated | ❌ | ❌ | Failing |
| Vibe | Hybrid | Hybrid | Hybrid | ✅ | ✅ | New |

---

## 3.7 The Gap in the Market

This analysis reveals a clear gap:

**No existing protocol can:**
1. Bootstrap markets permissionlessly (like GMX)
2. Scale efficiently (like Hyperliquid)
3. Transition between states as markets mature

**This gap is not accidental**—it reflects fundamental architectural constraints that require a novel approach to resolve.

---

*Next Section: The Bootstrap Trilemma →*

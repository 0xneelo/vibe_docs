# Section 3: LP Value Proposition

## 3.1 The Core Design Insight

Vibe separates two distinct liquidity roles:
1. **USDC liquidity**: For settlement, hedging, cross-chain operations
2. **Token liquidity**: For perp market inventory (covering long/short exposure)

These roles have fundamentally different risk profiles. Vibe assigns each to the party best positioned to bear it.

---

## 3.2 The USDC Side: Solver-Funded, Not LP-Funded

### 3.2.1 No External USDC LPs

Vibe does **not** ask external LPs to deposit USDC. The stablecoin liquidity required for settlement and hedging is **self-funded by the protocol and the solver**.

### 3.2.2 How It Works

The solver's USDC usage functions as **short-term deployment**: capital deployed on one chain is typically recovered on another within a short cycle. Because the solver can **pre-hedge** before accepting exposure, risk on these flows is tightly bounded.

**Implications**:
- Extremely high capital efficiency on the USDC side (rapid recycling, not locking)
- No need for large external stablecoin pools
- Internal yield on solver-deployed USDC believed to exceed alternative deployments
- System self-sustaining without external USDC LPs

### 3.2.3 Why Closed USDC Pool?

An external USDC LP would need to trust the operator entirely and would demand yield commensurate with perceived risk—lending stablecoins to a leveraged low-cap perp protocol is high-risk. Keeping the pool protocol-operated avoids this mismatch.

---

## 3.3 Why USDC-Vault Protocols Face ~100x Capital Efficiency Disadvantage

### 3.3.1 The Problem

Protocols relying on **external USDC vault deposits** to back leveraged perpetuals on low-cap tokens face a structural issue: **perceived risk**.

### 3.3.2 Observed LP Yield Demands

When presented with depositing USDC to provide leverage for low-cap perps, institutional and sophisticated capital providers assess risk as **extremely high**. Protocols have observed LP yield demands in the range of **50–80% annualized**—economically unsustainable to serve.

### 3.3.3 The Feedback Loop

- Higher offered leverage → deeper USDC backing required
- Deeper backing → higher yield demand
- Higher yield demand → higher fees/spreads required
- Higher fees → traders avoid the market
- Thin volume → protocol fails

### 3.3.4 The Capital Efficiency Estimate

Vibe's modeling and game-theoretical analysis estimates that **token-based vaults achieve approximately ~100x greater capital efficiency** compared to USDC-vault-based low-cap perpetual protocols. The core reason: Vibe eliminates the need to compensate external LPs for bearing risk they are structurally poorly suited to assess or manage.

---

## 3.4 The Token Side: Aligning Risk with Holders Who Already Bear It

### 3.4.1 The Observation

**Token holders are already directionally exposed.** A holder of Token X bears the full price risk of that asset. The **incremental risk** of depositing tokens into a Vibe vault—where tokens back a perp market on that same asset—is materially lower than the risk they already accepted by holding.

### 3.4.2 Natural Alignment

| Factor | Implication |
|--------|-------------|
| **Token holders want utility** | Staking, single-sided LP offer limited yield; Vibe provides additional yield on held assets |
| **Token holders support ecosystem** | Founders, early investors, whales want to add utility and deepen markets |
| **Cost basis often low** | Many depositors acquired at fraction of current value; committing a small % for yield is favorable |
| **Yield expectations modest** | Unlike USDC depositors demanding 50%+ APR, token holders satisfied with incremental yield (staking-level) |

**Key principle**: Vibe allocates risk to parties **already carrying that risk** and for whom incremental exposure is smallest.

---

## 3.5 Revenue Sharing: 70% to Token Depositors/Projects

To incentivize token-side LP participation, Vibe distributes **70% of market revenue** to projects and token depositors. This is designed to establish **market dominance** in permissionless perp listings by making economics unambiguously attractive.

**Observation**: The team's conviction—supported by behavior—is that **most projects would provide liquidity even without the profit share**. Motivations (ecosystem support, token utility, community signaling, low incremental risk) are sufficient. The revenue share sweetens an already aligned deal.

---

## 3.6 LP Value Summary Table

| Dimension | USDC-Vault Protocols | Vibe (Token Vaults + Solver-Funded USDC) |
|-----------|----------------------|------------------------------------------|
| Who provides stablecoins | External LPs | Solver / protocol (self-funded) |
| Who provides token inventory | N/A or protocol-funded | Token holders / projects |
| USDC LP yield demand | 50–80%+ APR (unsustainable) | Not applicable |
| Token LP yield expectation | N/A | Modest (staking-comparable) |
| Capital efficiency (est.) | Baseline | ~100x improvement |
| LP risk alignment | Stablecoin holders bear directional risk they don't want | Token holders bear incremental risk on exposure they already hold |
| Revenue share to LPs/projects | Varies | 70% of market revenue |

---

## 3.7 LP Profit Decomposition (Technical)

From the vibe_full_derivation specification, LP profit per market:

```
Π_m = Rev_m − Cost_m − α·Π_m_traders + Π_m_hedge − L_m_shortfall
```

Where:
- `Rev_m` = trading fees, spread, funding, liquidation fees, borrow revenue
- `Cost_m` = hedge cost, external borrow, operations
- `α` = counterparty share (Phase 1: ~1, Phase 2: ~0 as netting increases)
- `Π_m_traders` = aggregate trader PnL
- `Π_m_hedge` = solver hedge PnL
- `L_m_shortfall` = bad debt / liquidation shortfall

As markets mature, netting increases, `α` decreases, and LP risk exposure declines while revenue persists.

---

*Next Section: Trader and Project Value →*

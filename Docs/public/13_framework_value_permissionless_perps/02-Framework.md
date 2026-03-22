# Section 2: A Framework for Value Dimensions

## 2.1 The Four Constituencies

Proof of value requires demonstrating that each participant class benefits. We identify four constituencies:

| Constituency | Role | Value Sought |
|--------------|------|--------------|
| **LPs (Token Depositories)** | Provide token inventory for perp markets | Yield on held assets, ecosystem support |
| **Traders** | Open/close perp positions | Execution, leverage, hedging |
| **Projects** | Token issuers, treasury managers | Utility for token, market visibility |
| **Ecosystem** | Broader DeFi/crypto | Capital efficiency, price discovery |

A protocol that creates value for some constituencies at the expense of others is unstable. Value must be **aligned**—each party benefits from the participation of others.

---

## 2.2 Value Alignment

### 2.2.1 Positive-Sum Design

In a positive-sum design:
- More traders → more fees → more LP revenue → more LPs → deeper markets → better execution → more traders
- More projects → more markets → more diversity → more traders → more fees → more projects benefit
- LP deposits → markets can bootstrap → traders get access → projects get perp listings → ecosystem gains

**Vibe's alignment**: Token depositors earn 70% of revenue; traders get perp access; projects get utility without stablecoin commitment; ecosystem gets permissionless perps for long-tail assets.

### 2.2.2 Risk Alignment

Value alignment requires **risk alignment**: risk should flow to parties best positioned to bear it.

| Risk Type | Who Bears It (Vibe) | Why Aligned |
|-----------|---------------------|-------------|
| Directional (token price) | Token depositors | Already hold token; incremental exposure minimal |
| Counterparty (trader wins) | Solver + LP vault capacity | Solver hedges; vault backs residual |
| Execution (hedge slippage) | Solver | Operational expertise |
| Liquidation shortfall | Insurance → ADL | Escalation path defined |
| USDC deployment | Solver | Self-funded; short-cycle recycling |

**Misalignment example**: USDC-vault protocols ask stablecoin holders to bear directional risk on low-cap tokens. Stablecoin holders are structurally averse to this risk—hence 50–80% yield demands. Vibe avoids this by using token holders as inventory providers.

---

## 2.3 Value Metrics

### 2.3.1 LP Value Metrics

- **Revenue share**: 70% to token depositors
- **Capital efficiency**: ~100x vs. USDC-vault (estimated)
- **Yield expectation**: Modest (comparable to staking); no 50%+ demand
- **Risk-adjusted return**: Incremental risk on existing exposure

### 2.3.2 Trader Value Metrics

- **Market access**: Perps for tokens that otherwise have none
- **Execution quality**: Solver provides liquidity; spreads reflect risk
- **Payout certainty**: Defined counterparty; risk waterfall documented
- **Lifecycle**: Bootstrap (wide spreads) → Mature (tighter) → Graduate (order book)

### 2.3.3 Project Value Metrics

- **No stablecoin commitment**: Deposit tokens, not USDC
- **No market maker hire**: Solver handles execution
- **Revenue share**: 70% of market fees to depositors
- **Ecosystem support**: Deepen markets, add utility, signal commitment
- **Alternative cost**: Compare to CEX listing fees, MM arrangements, Uniswap single-sided (effective sell pressure)

### 2.3.4 Ecosystem Value Metrics

- **Capital efficiency**: Token inventory vs. full USDC collateralization
- **Permissionless listing**: Any token can have perp market
- **Price discovery**: Two-sided markets (long + short)
- **Lifecycle completion**: Connects fair launch to institutional (see Listing Monopoly paper)

---

## 2.4 Sustainability Criteria

For value to be durable, the protocol must satisfy:

1. **LP sustainability**: LPs earn sufficient risk-adjusted yield without protocol subsidy
2. **Trader sustainability**: Execution quality and payout certainty maintained
3. **Solver sustainability**: Hedge economics allow profitable operation
4. **No Ponzi dynamics**: Revenue from real trading, not new LP deposits
5. **Stress resilience**: Defense hierarchy handles volatility; ADL as last resort

---

## 2.5 Summary

The value framework has four dimensions (LP, Trader, Project, Ecosystem), requires alignment across them, and demands risk allocation to appropriate parties. Vibe's design scores well on each dimension. The following sections provide detail on LP value (Section 3), Trader and Project value (Section 4), economic clarity (Section 5), and comparative advantage (Section 6).

---

*Next Section: LP Value Proposition →*

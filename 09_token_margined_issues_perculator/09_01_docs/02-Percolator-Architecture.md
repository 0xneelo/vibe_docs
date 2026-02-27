# Section 2: Percolator Architecture

## 2.1 Design Overview

Percolator is a hybrid derivatives engine combining:

- **Synthetics-style risk**: Users trade against LP accounts (inventory holders). The engine enforces margin, liquidation, ADL/socialization, and withdrawal safety against a shared balance sheet.
- **Orderbook-style execution**: LPs provide a pluggable matcher program via CPI—can implement AMM, RFQ, or CLOB pricing logic.

**Key property**: One market = one slab account. Each market is an isolated unit with its own collateral vault, risk engine instance, and participants. No cross-margin across markets.

---

## 2.2 Architecture Diagram

```
┌──────────────────────────────────────────┐
│           PERCOLATOR PROGRAM              │
│  (Solana on-chain, formally verified)     │
├──────────────────────────────────────────┤
│  SLAB (Market Instance)                   │
│  ├── Header + Config                      │
│  ├── RiskEngine (zero-copy, in-place)     │
│  ├── User Accounts                        │
│  ├── LP Accounts                          │
│  └── Vault (token collateral)             │
├──────────────────────────────────────────┤
│  MATCHER (External program via CPI)       │
│  ├── Passive (oracle ± spread)            │
│  └── Custom (LP-deployed)                 │
├──────────────────────────────────────────┤
│  ORACLE (DexScreener / Pyth / Authority)  │
└──────────────────────────────────────────┘
```

---

## 2.3 The Inverted Market Mode

Percolator supports "inverted" mode where internal price representation is `1/price`. For SOL/USD inverted, collateralized in SOL:

- **Going long** = long USD exposure (profit if SOL drops)
- **Going short** = short USD exposure (profit if SOL rises)
- **Collateral, fees, funding, PnL** — all denominated in SOL

In Percolator SOV, PERC serves simultaneously as collateral token, traded asset, and settlement currency.

---

## 2.4 The SOV Model

Percolator SOV markets itself as a "Store of Value" protocol:

- Trading fees (0.30%) accumulate in on-chain insurance fund denominated in PERC
- Admin key burned → insurance fund permanently locked
- Claim: "Every trade shrinks the circulating supply of PERC"
- Oracle: DexScreener (Meteora pools) with 5% per-push circuit breaker

---

## 2.5 Key Parameters (Mainnet)

| Parameter | Value |
|-----------|-------|
| Collateral | PERC (SPL token) |
| Initial Margin | 10% (10x max leverage) |
| Maintenance Margin | 5% |
| Trading Fee | 0.30% |
| Liquidation Fee | 1% |
| Oracle Source | DexScreener (Meteora pools) |
| Price Cap | 5% per push |
| Vault Balance | ~251.7M PERC |
| Open Interest | ~24.7M PERC |
| Effective Utilization | ~9.8% |

---

## 2.6 Engineering Achievements

Percolator demonstrates significant technical excellence:

- **Formal verification**: Kani harnesses verify conservation, isolation, no-teleport. 118/118 proofs pass.
- **Pluggable matchers**: CPI-based architecture allows arbitrary pricing logic
- **Clean trust boundaries**: Risk engine (accounting), program (validation), matcher (LP-scoped)
- **Balance sheet invariant**: "No user can withdraw more value than exists on the exchange balance sheet"

These achievements do not mitigate the economic failures we analyze in the following sections.

---

*Next Section: Reflexivity and Negative Convexity →*

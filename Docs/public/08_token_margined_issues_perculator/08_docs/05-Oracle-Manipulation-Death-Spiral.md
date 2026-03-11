# Section 5: Oracle Paradox, Manipulation, and Death Spiral

## 5.1 The Oracle Trilemma

On-chain derivatives face a fundamental trilemma. You can achieve at most two of three:

1. **Guaranteed execution** (users can always trade)
2. **Fair pricing** (execution at market value)
3. **LP safety** (LPs not drained by informed flow)

---

## 5.2 The Circuit Breaker Paradox

Percolator SOV uses a 5% per-push circuit breaker on its oracle (DexScreener/Meteora). This creates a deterministic exploitation window:

1. Real price on DEX jumps to $1.50 (50% pump)
2. On-chain oracle capped at $1.05 (5% max update)
3. Attacker **knows** the oracle must catch up
4. Attacker opens 10× long at $1.05
5. Oracle walks up: $1.10… $1.15… $1.20…
6. Attacker closes at $1.50

**Result**: Attacker purchased a winning ticket *after* the numbers were drawn. LP drained risk-free.

### 5.2.1 The Paradox

| Fix | New Problem |
|-----|-------------|
| No circuit breaker | Flash loan manipulation |
| Circuit breaker | Latency arbitrage (oracle front-running) |
| Reject trades on volatility | Market freezes; terrible UX |
| Dynamic spreads | Requires off-chain signer; defeats "fully on-chain" goal |

---

## 5.3 The Passive Matcher Vulnerability

The shipped `percolator-match` uses:

```
bid = floor(oracle_price × 9950 / 10000)   // Oracle - 0.5%
ask = ceil(oracle_price × 10050 / 10000)   // Oracle + 0.5%
```

Fixed 50bps spread around oracle. Whenever real-world price moves >0.5% before oracle updates, the matcher sells at a loss. For volatile memecoins, this happens constantly.

A production fix requires an off-chain signer (RFQ-style), which negates "fully on-chain" and introduces centralization.

---

## 5.4 Spot-Perp Manipulation

### 5.4.1 The Pump-and-Dump Attack

**Phase 1 — The Pump:**
1. Open 10× long on Percolator perp
2. Buy token on spot (Raydium/Meteora), pumping price
3. Oracle updates (slowly through circuit breaker)
4. Cash out long—receive large token amount
5. Collateral appreciated during pump (reflexive gain)

**Phase 2 — The Dump:**
1. Open large short
2. Sell accumulated tokens on spot, crashing price
3. Oracle updates downward
4. Close short—receive exponentially more tokens (inverse payoff)
5. Drain the vault

### 5.4.2 Why Token-Margining Amplifies

USDC-margined: attacker funds manipulation with real USDC; perp PnL bounded in USDC; LP collateral (USDC) unaffected.

Token-margined: attacker uses same token for manipulation; perp PnL unbounded in token terms; LP collateral devalues during dump; circuit breaker creates guaranteed arbitrage in both phases.

---

## 5.5 The Shorting Death Spiral

### 5.5.1 Mechanism

1. Traders open large short positions
2. Price declines (selling pressure, downturn, or manipulation)
3. Shorts are "winning"—protocol must pay them tokens
4. As price drops, each dollar of profit requires **exponentially more tokens**
5. Vault hemorrhages at accelerating rate
6. Remaining LPs face liquidation
7. LP liquidation creates additional selling pressure
8. **Feedback loop**: price drop → payout explosion → vault depletion → LP liquidation → more selling → deeper drop

### 5.5.2 Numerical Example

| Price Level | Short Profit (USD) | Token Payout | Vault Drain Rate |
|-------------|--------------------|--------------|------------------|
| $1.00 → $0.80 | $0.20/contract | 0.25 tokens | Moderate |
| $0.80 → $0.50 | $0.375/contract | 0.75 tokens | High |
| $0.50 → $0.10 | $0.80/contract | 8.0 tokens | Catastrophic |
| $0.10 → $0.01 | $0.09/contract | 9.0 tokens | Terminal |

The payout curve is hyperbolic. The vault runs out of tokens precisely when it needs the most.

### 5.5.3 ADL as Band-Aid

Percolator's defense: Auto-Deleveraging (ADL) via haircut-ratio. When the vault cannot cover obligations, winning traders' profits are forcibly reduced.

This prevents technical insolvency but:
- **Traders who won do not get paid** — destroys trust
- **The market is dead** — no rational trader enters a market where profits can be confiscated
- **ADL is controlled crash** — protocol admits it cannot honor obligations

---

*Next Section: Capital Inefficiency and Historical Precedent →*

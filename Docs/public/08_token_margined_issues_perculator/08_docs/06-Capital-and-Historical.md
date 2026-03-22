# Section 6: Capital Inefficiency and Historical Precedent

## 6.1 Capital Inefficiency

### 6.1.1 No Cross-Margin

Percolator: one market = one slab. Each market has its own isolated vault. Result:

- Trader with BTC-PERP and ETH-PERP cannot net exposure
- LP in multiple markets must fund each separately
- Positive PnL in one market cannot offset margin in another

For professional market makers, this is disqualifying. Capital requirements scale linearly with markets served.

### 6.1.2 Collateral Lock-Up

Even when LP is perfectly hedged (net position = 0), the risk engine locks collateral based on gross OI, not net. Necessary to prevent withdrawal-rug scenarios, but:

- LP capital is trapped for duration of all user positions
- Cannot redeploy to higher-opportunity markets
- LP becomes "hostage" to open interest

### 6.1.3 JIT Limitation

Atomic deposit-and-trade (JIT liquidity) is possible, but capital remains locked in the slab after the trade. Unlike RFQ systems (e.g., Symmio) where market makers keep capital off-chain until needed, Percolator LPs must commit on-chain for the full lifetime of resulting positions.

---

## 6.2 Historical Precedent: The Graveyard

### 6.2.1 Futureswap V1 (Ethereum)

- **Design**: LPs deposited ETH; pricing via bonding curve
- **Failure**: Toxic arbitrage—bonding curve lagged real prices; bots front-ran and drained LPs
- **Outcome**: Shut down shortly after launch
- **Lesson**: Oracle latency in token-margined systems is structural, not a tuning problem

### 6.2.2 Drift V1 (Solana)

- **Design**: Dynamic vAMM with token collateral (including LUNA)
- **Failure**: LUNA crash May 2022—token collateral went to zero while protocol owed millions to short sellers
- **Outcome**: Insurance drained; protocol paused and relaunched as V2 with USDC-based liquidity
- **Lesson**: Token-margined systems fail catastrophically during black swans in the underlying

### 6.2.3 Synthetix Inverse Synths (Ethereum)

- **Design**: Inverse synthetics (iETH, iBTC) appreciating when underlying declined
- **Failure**: Unbounded liability—90% ETH drop would create 900% iETH gain, massive claims on SNX debt pool
- **Outcome**: Deprecated; hard price limits imposed (freezing token at extremes), making product unusable
- **Lesson**: Inverse payoff + shared collateral = inherently incompatible with volatile assets

### 6.2.4 BitMEX (Centralized)

- **Context**: BitMEX invented the perpetual swap; originally BTC-margined inverse only
- **Observation**: Even with centralized risk management, professional MMs, and massive insurance, BitMEX introduced USDC-margined linear contracts because inverse reflexive risks were too expensive to manage in high volatility
- **Lesson**: If the largest perpetual exchange in history found coin-margining problematic with BTC, the model is categorically unsuitable for low-cap memecoins

---

## 6.3 Summary

The issues are not theoretical. Futureswap, Drift, Synthetix, and BitMEX's evolution all confirm: token-margined / inverse designs suffer from structural failure modes that protocol engineering cannot fix. The industry has already voted with its capital and product choices.

---

*Next Section: What Percolator Gets Right →*

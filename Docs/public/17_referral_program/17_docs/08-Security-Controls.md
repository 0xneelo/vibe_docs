# Section 8: Security Controls

## 8.1 Critical Risk Surfaces

The referral stack is exposed to:

- points ledger tampering,
- signer compromise,
- claim replay and over-issuance,
- and operational blind spots during launch volatility.

## 8.2 Minimum Control Set

1. **Signer isolation** with key rotation and approval controls.
2. **Replay-safe claims** using nonces and expiry.
3. **Audit trails** for tier and admin policy overrides.
4. **Anomaly monitoring** for reward spikes and attribution outliers.

## 8.3 Cooldown and Verification

A cooldown window before transferability can reduce the impact of fraudulent reward injections.
Cooldown is not a complete defense, but a useful circuit breaker when paired with active monitoring.

## 8.4 Operational Readiness

High-growth launch phases require:

- incident runbooks,
- clear freeze scopes,
- and fail-safe paths for payout and withdrawal anomalies.

## 8.5 Design Principle

Incentive systems should fail closed on settlement, not fail open on growth.
Speed can be regained after verification; credibility cannot be regained after silent inflation.


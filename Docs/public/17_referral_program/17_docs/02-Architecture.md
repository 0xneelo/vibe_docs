# Section 2: Architecture

## 2.1 Component Boundaries

The referral stack spans three planes:

1. **On-chain identity and settlement**
2. **Off-chain attribution and policy logic**
3. **User-facing access and claims UX**

## 2.2 Canonical Flow

1. User onboards and receives base referral identity.
2. Trades and referrals generate fee-linked activity.
3. Indexing services compute rolling windows and tiers.
4. Referral code activation is gated by policy thresholds (for example, reaching rakeback tier 2 or cumulative trading volume such as $10M).
5. Claim authorizations are issued with replay-safe signatures.
6. Users settle claims through a claim contract path.

## 2.3 Referral Code Activation Policy

Referral identity and referral code activation are separate states.

A user can hold identity metadata at onboarding, while reward-eligible code activation requires one of:

- a minimum performance threshold (for example, rakeback tier 2), or
- a minimum cumulative trading threshold (for example, $10M volume).

Administrative exceptions are allowed for selected parties, including:

- strategic partners,
- designated contributors,
- and users who materially helped test during closed alpha or pre-beta.

Pre-beta is treated as a transition period (roughly 30-60 days after beta launch) where referral codes may exist but are not yet globally activated for normal reward routing.

## 2.4 Trust Boundaries

The architecture should explicitly separate:

- **deterministic state** (identity, claim consumption, nonces),
- **policy state** (tier tables, private overlays),
- **monitoring state** (anomaly and reconciliation pipelines).

## 2.5 Failure Modes to Design Against

- signer key compromise,
- stale or inconsistent index data,
- referral graph mutation without audit trails,
- and claim replay or double-credit paths.

## 2.6 Target Principle

Keep policy agility off-chain where needed, but make settlement integrity on-chain by default.
If a rule can change quickly, it must be transparently versioned.
If value can be claimed, it must be cryptographically constrained.


# Section 3: Rakeback Design

## 3.1 Dual-Channel Model

Rakeback is modeled as two channels:

- **Self channel**: reward from own fee generation.
- **Referral channel**: reward from downline fee generation.

Both channels should be windowed and deterministic, typically on rolling 30-day aggregates.

## 3.2 Tiering Constraints

Tier systems must satisfy:

- transparent public tables for default users,
- clean override model for private commercial agreements,
- and no ambiguity on boundary behavior at threshold edges.

## 3.3 Immediate vs Claim-Based UX

A claim-based model is operationally simple early on, but introduces user friction and signer risk.
A net-fee or same-flow rebate model improves UX but requires stronger real-time determinism.

## 3.4 Public vs Private Economics

Private partner terms are a practical requirement in many growth phases.
They should be implemented as explicit overlays, not hidden side effects in core public policy.

## 3.5 Policy Clarity

The system must define:

- whether referral depth is one-level or multi-level,
- whether referee perks are uniform,
- and whether referrer benefits stack additively or with caps.

Without these definitions, growth incentives become adversarial and difficult to reason about.


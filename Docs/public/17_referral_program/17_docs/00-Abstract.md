# Abstract

The referral layer is a market-formation primitive, not only a distribution feature.

This paper frames referral architecture around one core objective: increase high-quality market listings while preserving fee integrity and minimizing abuse surfaces.

Three structural tensions define the design space:

1. **On-chain trust vs off-chain flexibility**  
   Referral identity and claim settlement benefit from on-chain guarantees, while partner-specific economics often require configurable off-chain logic.

2. **Growth speed vs gaming resistance**  
   Open referral issuance drives adoption, but unbounded issuance and unequal perks can produce code shopping, self-referral loops, and attribution disputes.

3. **Simple rewards vs composable reward markets**  
   Basic rakeback is understandable and immediate. Points, packs, and artifacts add engagement depth but require stronger accounting, anti-inflation controls, and clear eligibility rules.

The proposed architecture is phased:
- start with access-gated launch and constrained incentives,
- unify access and referral identity,
- then expand into optional-code participation with standardized benefits and market-level economics.

Security posture is treated as first-class:
- minimize privileged signers,
- enforce replay-safe claim paths,
- use cooldowns and anomaly checks for reward bridging,
- and separate public policy from private commercial overlays.

The result is a referral program that scales with listings, aligns incentives across traders, creators, and partners, and remains auditable under growth.


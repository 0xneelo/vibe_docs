# 17 — Referral Program Architecture

This paper documents how a referral system can evolve from invite-gated onboarding to a scalable, incentive-aligned growth layer.

The model combines:
- on-chain referral identity
- tiered rakeback for traders and referrers
- points and reward abstractions
- market-level partner economics
- operational safeguards

---

## Table of Contents

| Section | File | Description |
|---------|------|-------------|
| **Abstract** | [00-Abstract.md](./00-Abstract.md) | Scope, thesis, and contribution |
| **1. System baseline** | [01-System-Baseline.md](./01-System-Baseline.md) | Current referral, rakeback, and points structure |
| **2. Architecture** | [02-Architecture.md](./02-Architecture.md) | On-chain/off-chain boundaries and claim flow |
| **3. Rakeback design** | [03-Rakeback-Design.md](./03-Rakeback-Design.md) | Two-channel rakeback and tier policy |
| **4. Points and rewards** | [04-Points-and-Rewards.md](./04-Points-and-Rewards.md) | Points integrity, finalization, and utility |
| **5. Referral economics** | [05-Referral-Economics.md](./05-Referral-Economics.md) | Anti-gaming and referral code policy |
| **6. Access phasing** | [06-Access-Phasing.md](./06-Access-Phasing.md) | Pre-beta -> beta -> open participation |
| **7. LP and category layer** | [07-LP-and-Category-Layer.md](./07-LP-and-Category-Layer.md) | Pool referrals and partner fee overlays |
| **8. Security controls** | [08-Security-Controls.md](./08-Security-Controls.md) | Cooldowns, monitoring, and trust boundaries |
| **9. Metrics framework** | [09-Metrics-Framework.md](./09-Metrics-Framework.md) | Public KPIs and reporting standards |
| **10. Open decisions** | [10-Open-Decisions.md](./10-Open-Decisions.md) | Pending policy and implementation choices |
| **11. Conclusion** | [11-Conclusion.md](./11-Conclusion.md) | Summary and roadmap priorities |
| **12. Rewards, packs, and artifacts** | [12-Rewards-Packs-Artifact-System.md](./12-Rewards-Packs-Artifact-System.md) | Full game-layer design and TGE accounting model |
| **13. Hypothetical: tokenized points perps** | [13-Hypothetical-Tokenized-Points-Perps.md](./13-Hypothetical-Tokenized-Points-Perps.md) | Future-facing case study on permissionless point-token derivatives |

---

*Referral architecture for market-first growth*


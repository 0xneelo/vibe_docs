# OTC 2 OrderBook: Solving the Market Bootstrap Problem in Permissionless Perpetuals

**A Technical Paper on Market Architecture and the Path to Autonomous Derivative Markets**

---

## Abstract

The creation of new derivative markets faces a fundamental challenge: the mechanisms that work for established, liquid markets fail catastrophically when bootstrapping markets from zero. Despite the explosive growth of perpetual futures trading—now exceeding spot volumes on major cryptocurrency exchanges—the industry lacks a systematic approach to creating new markets. Current listing processes remain fundamentally human-driven, opaque, and incapable of scaling to meet the demand for derivative exposure on the thousands of new tokens launched daily.

This paper makes three primary contributions:

**First**, we introduce a novel categorization framework for perpetual futures protocols based on two critical dimensions: matching engine synchronicity (synchronous vs. asynchronous) and collateralization architecture (fully netted vs. fully collateralized). This framework reveals why existing protocol designs are fundamentally incompatible with permissionless market creation.

**Second**, we identify and formalize the "Bootstrap Trilemma"—demonstrating that existing protocols can achieve at most two of three desirable properties: permissionless listing, capital efficiency, and reliable counterparty guarantees. We show mathematically why this trilemma exists and why single-architecture protocols cannot escape it.

**Third**, we present an OTC derivatives architecture that combines OTC RFQs and order books. In this paper, we refer to this model as the **OTC 2 OB Hybrid** or just**`hybrid-otc2ob`**. It enables the permissionless issuance of derivatives at any market cap and is the first system capable of spanning the full spectrum from fully collateralized, asynchronous markets to fully netted, synchronous order books. This dynamic architecture allows markets to launch permissionlessly and mature autonomously, transitioning across market structures without human intervention. In doing so, it resolves the bootstrap trilemma through temporal separation of concerns.

Our analysis draws on empirical data from existing protocols, theoretical foundations in market microstructure, and practical considerations for implementation. We demonstrate that an OTC Derivatives Protocol's approach not only solves the technical challenges of market bootstrap but creates a new paradigm for transparent, rule-based market creation that benefits the entire crypto ecosystem.

---

## Keywords

Perpetual Futures, Market Microstructure, Automated Market Makers, Order Books, Decentralized Finance, Market Bootstrap, Liquidity Provision, Derivatives Trading

---

## Paper Structure

| Section | Title | Description |
|---------|-------|-------------|
| 1 | Introduction | The market creation gap and its implications |
| 2 | Framework | Categorizing perpetual protocols along key dimensions |
| 3 | Landscape Analysis | Deep dive into existing protocol architectures |
| 4 | The Bootstrap Trilemma | Formalizing the fundamental constraints |
| 5 | OTC 2 OB Hybrid | The permissionless hybrid solution and maturation process |
| 6 | Technical Deep Dive | Implementation details and mechanisms |
| 7 | Industry Implications | Market-wide effects and opportunities |
| 8 | Competitive Analysis | Barriers to replication |
| 9 | Conclusion | Summary and future directions |

---

*perp classes z-score - Version 1.0 — February 2026*

# Vibe Pillars

## Paper Overview

This paper explains the three core pillars Vibe must solve to make permissionless perpetual markets viable for low-cap and newly launched tokens. The central argument is that these are not separate design questions but a coupled system:

1. The protocol must resist exploitation in a leveraged environment.
2. The protocol must provide a reliable counterparty even when natural two-sided flow is weak.
3. The protocol must offer enough yield and capital efficiency for liquidity providers and risk bearers to stay in the system.

Traditional order books partially solve these issues for mature assets through synchronous matching, but they break down at the long-tail edge where markets are thin, fragmented, and not continuously active. Vibe's hybrid solver architecture exists to solve exactly that gap.

---

## Table of Contents

| Section | File | Description |
|---------|------|-------------|
| **Abstract** | [00-Abstract.md](./00-Abstract.md) | Executive summary of the three-pillar thesis |
| **1. Introduction** | [01-Introduction.md](./01-Introduction.md) | Why low-cap perpetuals are structurally hard |
| **2. Pillar One: Exploit Resistance** | [02-Pillar-One-Exploit-Resistance.md](./02-Pillar-One-Exploit-Resistance.md) | Margin, leverage, and protocol safety |
| **3. Pillar Two: Bootstrap and Counterparty** | [03-Pillar-Two-Bootstrap-and-Counterparty.md](./03-Pillar-Two-Bootstrap-and-Counterparty.md) | Why low-cap markets cannot rely on synchronous matching |
| **4. Pillar Three: LP Yield and Capital Efficiency** | [04-Pillar-Three-LP-Yield-and-Capital-Efficiency.md](./04-Pillar-Three-LP-Yield-and-Capital-Efficiency.md) | How makers must be paid without breaking the system |
| **5. The Coupled Design Problem** | [05-The-Coupled-Design-Problem.md](./05-The-Coupled-Design-Problem.md) | How each pillar constrains the others |
| **6. Conclusion** | [06-Conclusion.md](./06-Conclusion.md) | Why Vibe's architecture is defined by these constraints |

---

## Core Thesis

- Leverage makes exploit resistance non-negotiable.
- Low-cap markets cannot depend on continuous synchronous matching.
- A solver or designated counterparty solves bootstrap, but introduces capital and yield requirements.
- Capital efficiency is therefore not a nice-to-have; it is what keeps the bootstrap layer alive.
- Vibe should be understood as a system designed around these three pillars rather than as a simple perp venue.

---

## Source

Based primarily on `13_transcripts/13_transcript.md`, with supporting context from the broader Vibe research set on order books, market bootstrap, listing economics, and LP structure.

---

*Version 1.0 — March 2026*


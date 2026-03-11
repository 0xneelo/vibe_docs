# DDQ - General Introduction

# 

Vibe Trading aims to enable permissionless leveraged trading by combining several core technologies into a new financial primitive

1. **Margin trading protocol**
2. **Perpetuals protocol**
3. **Request-based (“intent”) settlement layer**
4. **Bilateral OTC derivatives primitives**
5. **Proprietary solver technology**
6. **User vaults for liquidity tokens**

## Why this architecture is needed

**What Vibe has learnt from the failed experiments of the past**

Traditional on-chain “permissionless” margin trading typically requires **1:1 backing** (or near 1:1) for leveraged exposure at execution time, which is **capital-inefficient** and has historically constrained market depth, increased spreads, and limited the scalability of permissionless leverage markets.

Additionally there is a high risk associated with providing USDC to permissionless margin protocol vaults, as there is a simple supply attack where a user builds up a huge spot position in an asset, then opens a margin trading position, then uses his spot position to sell, emptying the margin protocol vault. Therefore purely 1:1 backed margin protocols are not sufficient to create a permissionlessleverage protocol.

**Vibe solution to these and all sequential issues**

Vibe uses a **hybrid liquidity model** that blends **margin mechanics** with **perpetuals mechanics**. The objective is to improve capital efficiency for liquidity providers (LPs), which can support **higher sustainable yields** and **lower trading costs** (fees and spreads) for traders—making permissionless perpetuals more economically viable.

## Liquidity sourcing via user vaults

The “margin” component is supported through **user vaults** that accept deposits in supported tokens (“liquidity tokens”). These vaults provide an on-chain pool of assets that the solver can draw on—subject to protocol rules and risk parameters—to support liquidity and hedging needs for leveraged markets.

## Intent-based settlement and the solver’s role

Vibe is built on a **request-based (intent) stack**, where traders submit trade requests and an automated counterparty—referred to as the **solver**—provides executable quotes in real time. The solver is responsible for:

- **Pricing** (quoting spreads and execution prices)
- **Assessing and managing risk** (inventory exposure, hedge feasibility, parameter selection)
- **Setting per-quote parameters** in real time (e.g., dynamic spreads, dynamic funding, and other controls)

## Perpetuals execution as an asynchronous matching engine

The perpetuals layer is managed by the solver acting as an **asynchronous matching engine**: it seeks to match long and short trader flow **without requiring synchronous, order-book-style matching**. When opposing flow is available, exposure is netted between traders. When opposing flow is not available, the solver may temporarily act as the **residual counterparty**, using the hybrid margin/perps design and available vault liquidity (under defined constraints) to manage exposure until the system rebalances.

Below is a compendium of useful information from prior documentation. 
These texts were drafted iteratively over time; as a result, some concepts and statements may be repeated across multiple sections.

[Margin & Liquidation System of vibe](https://www.notion.so/Margin-Liquidation-System-of-vibe-249bff5b367a80358ba1f12012a94c4e?pvs=21) 

[Liquidity Programs (Buybacks, Acquire & JIT)](https://www.notion.so/Liquidity-Programs-Buybacks-Acquire-JIT-24abff5b367a8002b27be55fe3ae4461?pvs=21) 

[**Turning your perpetual listing into a Perpetual Bid**](https://www.notion.so/Turning-your-perpetual-listing-into-a-Perpetual-Bid-24ebff5b367a80519db4fa0317dcf3d5?pvs=21) 

[A Practical Guide to Liquidity‑Provision on Vibe](https://www.notion.so/A-Practical-Guide-to-Liquidity-Provision-on-Vibe-236bff5b367a802097befdac4c8475d1?pvs=21) 

## DDQ Questions

## Answers to DDQ

[TL:DR economic outcomes](https://www.notion.so/TL-DR-economic-outcomes-2eebff5b367a8026b2f9c4d020a54a00?pvs=21)

[1.) Risk Walkthrough](https://www.notion.so/1-Risk-Walkthrough-2eebff5b367a802aaef8f9c9a9fbaec6?pvs=21)

[1 b II.) Balancing UX vs Risk](https://www.notion.so/1-b-II-Balancing-UX-vs-Risk-2efbff5b367a80808f7dcb2b73698250?pvs=21) 

[2.) Solver as residual counterparty](https://www.notion.so/2-Solver-as-residual-counterparty-2efbff5b367a80d18d54de947d53d740?pvs=21)

[3.) Solver Worst-Case Scenarios](https://www.notion.so/3-Solver-Worst-Case-Scenarios-2efbff5b367a808da473ca4744bf65b2?pvs=21)

[4.) Attractiveness for LPs](https://www.notion.so/4-Attractiveness-for-LPs-2efbff5b367a806ab9acdd6359157391?pvs=21)

## DDQ Questions

## Answers to DDQ

[TL:DR economic outcomes](https://www.notion.so/TL-DR-economic-outcomes-2eebff5b367a8026b2f9c4d020a54a00?pvs=21)

[1.) Risk Walkthrough](https://www.notion.so/1-Risk-Walkthrough-2eebff5b367a802aaef8f9c9a9fbaec6?pvs=21)

[1 b II.) Balancing UX vs Risk](https://www.notion.so/1-b-II-Balancing-UX-vs-Risk-2efbff5b367a80808f7dcb2b73698250?pvs=21) 

[2.) Solver as residual counterparty](https://www.notion.so/2-Solver-as-residual-counterparty-2efbff5b367a80d18d54de947d53d740?pvs=21)


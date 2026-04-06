# Informal intro: what the derivation is for (and what it is not)

This note sits **before** the formal definitions and equations. It records the reasoning behind why the full mathematical specification is written the way it is, and how it should be read.

---

## The open problem is not “solvable by math alone”

The derivation paper is aimed at an **open problem**: how to run perpetual-style leverage on markets—especially long-tail and low-liquidity contexts—without pretending the environment is a static, fully known game.

We do **not** believe that problem can be closed with a single algorithm that “solves the market.” If markets were fully algorithmically solvable in that sense, **there would be little left to trade**: a live market depends on **inefficiencies**—some created by participants acting on incomplete information, others exploited by those with better information or positioning. Capital and incentives matter as much as symbols on a page.

So the spec is **not** claiming: *here is the formula that fixes offering leverage on low caps.* The formulas are **not** a solution in that strong sense.

---

## What the math *is* for: sharpening the problem

The role of the mathematics in this folder is closer to:

- Making the **structure of the problem** explicit (state, controls, risks, constraints).
- Showing how **local risk**, **global coupling** (e.g. flattening, insurance), and **ADL** interact in one frame.
- Giving a **language** for where the system is on spectrums such as **netting vs asynchrony**, **solver leverage vs conservatism**, and **trader UX vs LP economics**.

In other words: the math helps say **what the tension is** and **what knobs might exist**—not that turning those knobs to a fixed optimum ends the game.

---

## The operational idea (separate from “the formula”)

The **product/protocol proposal** is not identical to the master objective written on paper. Informally, the direction is:

1. **Start at z-score zero** (or an equivalent “cold start” regime): flows are **not fully netted**; matching is **highly asynchronous**; a **residual solver** sits in the middle of the flow.
2. The solver begins from something like **1× systemic leverage** in spirit: **fully hedged** in aggregate, using available **capital** to stay hedged across positions.
3. **Increase effective leverage gradually** only as the process supports it; when stress appears, **ADL and similar tools step in**—a “two steps forward, one step back” loop rather than a one-way ratchet.
4. Over time, **better algorithms** (including **external solvers**) can improve *how* and *when* to move—but still as **approximation and control**, not as “solving” the market.

So: we believe there is a **path** and a **problem shape** we can name; we do not claim to know **exact timing** or **full dynamics** ex ante. We make **assumptions**, **approximations**, and **updates** from live data—moving **up** the z-score / netting spectrum when conditions allow, and **down** again when not, using ADL and parameter resets as part of learning and safety.

---

## Trader UX vs LP efficiency (the deliberate tradeoff)

Near **z-score zero**, **traders** can already get an experience **close to trading a standard perp** (leverage, flow, familiar surfaces), while **LP-side efficiency** is intentionally **lower**—more conservative, more costly in capital terms.

As the system **moves “up”** along the spectrum (more netting, more efficiency for LPs, more revenue potential for liquidity providers), it **risks** more on **trader UX** and tail outcomes. The formal objective and risk terms in the spec are partly there to make that **balance** explicit rather than hand-waved.

---

## Information and traversal

Moving **up** the spectrum is also an **information** process: you learn from flow, stress, and recoveries. **ADL** and stepping **back** are not only “failure modes”—they are part of how the system **corrects** and **recalibrates** rather than pretending a static model was always right.

Long term, **Vibe’s** direction includes **opening solver competition**: others can propose **better** control policies. The goal is **not** to discover the unique algorithm that “ends” the market, but to **approximate better**—when to move **up** on the z-score / netting dimension, when to move **inward** toward a more **netted, cross-market** posture, and when to move **down and outward** toward something more **async, collateralized, and isolated**.

---

## How to read the rest of `15_docs/`

Treat the numbered documents as:

- A **rigorous map** of states, controls, and safeguards.
- A **single coherent framing** of profit, risk, insurance, and ADL—not a proof that one static optimum exists for all futures.

If something in the formal sections reads like a “final answer,” prefer this intro: it is almost certainly meant as a **scaffold for control and iteration**, not a closed-form end to strategic behavior in real markets.

---

*This note is informal by design; the normative and definitional content lives in [01_abstract.md](01_abstract.md) and the following numbered sections.*

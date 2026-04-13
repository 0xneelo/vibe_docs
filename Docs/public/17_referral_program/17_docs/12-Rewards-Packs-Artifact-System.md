# Section 12: Rewards, Packs, and Artifact System

## 12.1 Core Shift (Not finalized)

This section is a future-facing thought experiment.

It describes what *could* be built permissionlessly around on-chain point representations and pack-linked assets. It is **not** a statement of current product policy, and it is **not** an announcement of an endorsed feature.

The reward architecture separates base value from game mechanics:

- **Points are the reward ledger**
- **Vibe Packs" and artifacts are the gamified reward ledger**

This separation keeps the core accounting simple while enabling engagement and secondary-market behavior.

## 12.2 End-to-End Loop

1. Users earn points off-chain.
2. Points are claimed on-chain with a vesting delay.
3. Claimed points can be held or converted into packs.
4. Packs can be held, traded, or opened.
5. Opened packs mint artifacts that carry embedded points and optional boosts.
6. Users can hold or trade points, packs, and artifacts.
7. Airdrop eligibility is calculated from total qualifying point exposure across all three forms.

## 12.3 User Flow

### Earn
- Trading activity
- LP participation
- Referral contribution

### Claim
- Points are finalized off-chain first.
- Users claim on-chain to move into economically active state.

### Vesting
- First claim enters a 7-day vesting window.
- Subsequent daily claims unlock on a rolling 7-day schedule.

### Convert and Manage Exposure
- Hold points for direct exposure.
- Hold packs for unopened expected-value exposure.
- Open packs for artifact exposure with variance and optional boosts.

## 12.4 Point System Requirements

### Distribution
- Daily distribution cadence
- Deterministic formula inputs (fees, volume, LP, referrals)
- Source-bucketed accounting

### Finalization
- End-of-day finalization before balances are considered claimable
- No real-time "final points" display if it increases gaming risk

### Value States
- **Unclaimed off-chain points**: provisional and non-transferable
- **Claimed on-chain points**: transferable and economically active

## 12.5 Pack System

### Supply Design
- Fixed total pack supply
- Rarity distribution by class (for example: common to rare tiers)

### Behavior
- Packs can be held, traded, or opened
- Unopened packs retain deterministic base value semantics at policy level
- Market price can trade above or below expected value

### Contents and EV
- Typical pack contains multiple artifacts
- Expected output can be slightly deflationary versus input points to preserve scarcity
- Upside remains available through low-probability high-rarity outcomes

## 12.6 Artifact System

### Core Properties
- Finite artifact catalog
- Rarity classes
- Embedded point value per artifact
- Optional functional boost fields

### Slots and Inventory
- Three equip slots: head, body, item
- Unlimited unequipped inventory
- Artifacts are persistent assets, not consumables

### Behavior
- Unequipped artifacts still retain embedded point exposure
- Equipped artifacts can apply boosts under explicit policy rules

## 12.7 Artifact Economy and Secondary Market

The model creates a pre-TGE market structure:

- packs trade as expected-value containers,
- artifacts trade as rarity-plus-exposure assets,
- points trade as direct exposure once transferable.

Demand is supported by three motives:
- exposure to future TGE allocation,
- utility boosts,
- and rarity/speculation.

## 12.8 Referral Integration

Referral contributes to the same economic loop by accelerating point accumulation, which increases pack and artifact access.

Potential reward surfaces include:
- fee share,
- point share,
- and milestone rewards such as pack unlocks.

The system objective is to align referral rewards with long-term inventory exposure, not only immediate payout.

## 12.9 TGE Allocation Rule

Final allocation should be computed from total qualifying point exposure:

- claimed points in wallet
- point value represented by held packs (under defined valuation rule)
- embedded point value in held artifacts

Unclaimed off-chain points should not count.

## 12.10 Guardrails

1. **Simplicity**: keep the core flow stable (earn -> claim -> hold/convert -> TGE accounting).
2. **Supply control**: fixed or tightly governed issuance.
3. **Fairness**: transparent EV and rarity probabilities.
4. **Security**: vesting delay, anomaly monitoring, and auditable state transitions.

## 12.11 Rollout Notes from Transcript

The transcript suggests a phased launch narrative:

- beta access period with invite-code gating,
- referral activation in the following phase,
- on-chain transferability and packs introduced in later milestones.

Exact dates and caps should be treated as operational planning inputs, not immutable protocol guarantees.

## 12.12 Related Hypothetical Scenario

For a forward-looking case study on how external builders could permissionlessly create tokenized point exposure and eventually list perp markets around that exposure, see:

- [Section 13: Hypothetical Scenarios for Tokenized Points Perpetual Markets](./13-Hypothetical-Tokenized-Points-Perps.md)




# Section 4: Points and Rewards

## 4.1 Points as Economic State

If points can influence tradable outcomes, they must be treated as economic state, not marketing metadata.

The transcript clearly distinguishes:
- fee-linked points (high integrity requirement),
- engagement points (high abuse risk if made liquid).

## 4.2 Finalization and Eligibility

A robust model should include:

- end-of-day or end-of-epoch finalization,
- explicit bucketing by source,
- and clear eligibility rules for on-chain conversion and TGE weighting.

## 4.3 Bridging Model

A phased bridge from off-chain balances to on-chain representation can reduce attack surface:

- user-initiated claim paths,
- cooldown before transferability,
- anomaly checks before release.

## 4.4 Packs and Artifacts

Packs and artifacts turn points into a composable game layer.
This can improve retention, but only if:

- issuance remains bounded,
- probabilities are disclosed,
- and TGE accounting is explicit across held points, packs, and artifacts.

## 4.5 Integrity Requirement

Reward composability is only valuable if users trust supply and attribution.
Every reward layer should map back to a verifiable source-of-truth path.

## 4.6 Extended Model

For the complete packs and artifacts design, including vesting flow, expected-value policy, slot mechanics, and TGE accounting across direct and embedded exposure, see:

- [Section 12: Rewards, Packs, and Artifact System](./12-Rewards-Packs-Artifact-System.md)


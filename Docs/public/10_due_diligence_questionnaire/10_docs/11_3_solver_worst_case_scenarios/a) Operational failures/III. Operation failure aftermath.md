# 3.a III.) Operation failure aftermath

## What happens financially, for a user, if a solver fails

If a solver experiences an operational failure (i.e., becomes unresponsive), the financial impact to the user is primarily the **time-to-exit delay** between the user’s intent to close and the on-chain forced close finalization. Because trading is executed off-chain (state-channel style) under normal operation, the chain is not immediately aware of the user’s close request until the user invokes the on-chain escape path.

### Financial outcome in plain terms

- The user is not “stuck” waiting for the solver to recover.
- The user can close the position using **Force Close**, and the main financial cost is **exposure to market movement during the forced-close latency window**.
- In the described configuration, this latency is on the order of **~2 minutes**, and it is expected to be reduced further as the system hardens.

### Illustrative timeline (example)

Below is a simplified timing sequence showing what the user experiences when the solver is unresponsive:

1. **T + 1:** User submits a close request via the off-chain state channel.
2. **T + 30:** Solver is confirmed unresponsive (based on UI/protocol timeout assumptions).
3. **T + 31:** User submits the close request **on-chain** (Force Close initiation).
4. **T + 33:** On-chain request is confirmed; a protocol timer starts (≈ 60 seconds in this example).
5. **T + 93:** Timer completes; the user can now obtain a proof that the relevant price level was hit after the request timestamp (using recent candle data / proof rules).
6. **T + 95:** User submits the proof on-chain; the position is closed without solver cooperation.

### What the user “loses” financially

- The user does not lose funds *because* the solver is offline; rather, they incur **incremental price risk** during the time it takes to execute the Force Close path.
- In the example above, the incremental risk window is approximately **two minutes** (plus block confirmation and proof generation overhead).

### Continuous improvement expectation

The protocol has a clear engineering path to reduce these delays over time. Earlier versions may require longer windows (e.g., several minutes); the stated direction is to compress this toward **seconds-level** response as infrastructure and proof systems mature, without compromising the integrity of the forced-close mechanism.
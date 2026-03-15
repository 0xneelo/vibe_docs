## What happens operationally if a solver fails (unresponsive / offline)

If a solver becomes non-operational (e.g., does not respond to open/close requests), the system is designed to fail over from the off-chain intent/RFQ path to an **on-chain “escape hatch”** that allows users to close positions without solver cooperation.

### Normal flow: off-chain intent execution

- The user submits an **open** or **close** request to the solver via the intent/RFQ pathway.
- Under normal conditions, the solver responds with a quote/acceptance and the position is updated off-chain (state-channel style).

### Failure detection: no solver response

- If the solver does not respond within a short UI-defined timeout (typically seconds, depending on the frontend configuration), the frontend prompts the user to use the emergency on-chain route.

### Emergency route: Force Close (on-chain escape hatch)

1. **User posts an on-chain Force Close request** for the position they want to close.
2. A **protocol timer** starts. If the solver remains unresponsive beyond the defined window (e.g., up to ~2 minutes in the described configuration), the user can proceed to finalize the close without the solver.
3. The user obtains a **price proof** showing that the market traded at (or through) the requested close price after the Force Close request timestamp (typically using **1-minute candle data**, with freshness constraints such as “≤ ~60 seconds old” relative to the relevant interval).
4. The user submits this proof on-chain to **finalize the close**, and the contract closes the position even while the solver is offline.

### Price proof sourcing (decentralized)

- The proof is generated via a decentralized network of nodes/endpoints that can produce a verifiable proof using:
    - the user’s account/position data, and
    - the market price series (e.g., 1-minute candles) for the relevant asset.

### Key outcome

Even if the solver is unresponsive, users are not limited to “wait and withdraw later.” They can **force-close positions on-chain within minutes**, using a recent price proof, which is materially more practical for leveraged trading during volatile conditions.
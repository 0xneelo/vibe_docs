# Risk Analysis and Edge Cases

## 4.1 Core Risk Statement

The source speaker explicitly notes that outcomes could have differed if traders had won instead of lost. This is the central risk: LP returns are not one-way; they are regime-dependent.

At the provided dashboard mark, both **Current Debt** and **Current UPnL** are negative, which is LP-favorable under your sign convention. This strengthens the case outcome but does not remove forward regime risk.

## 4.2 Principal Risk Vectors

1. **Directional reversal risk**  
   If trader crowding and price direction align against LP positioning, LP profitability can compress or turn negative.

2. **Unrealized PnL volatility risk**  
   Marked gains can change quickly; unrealized profits (`Current UPnL`) are not secured until they move into realized debt/cash outcomes.

3. **Leverage amplification risk**  
   High user leverage can increase both fee/funding opportunities and tail-loss velocity.

4. **Liquidity stress risk**  
   In thin markets, liquidation and slippage dynamics can deteriorate quickly in fast moves.

5. **Concentration risk**  
   Heavy dependence on one asset/community behavior can create fragile outcomes.

## 4.3 Hedge Logic and Residual Exposure

The case argues that insiders can reduce downside concern by depositing only a small share of total token holdings (for example 5-20%) and keeping the majority uncommitted.  

This creates a split exposure:

- retained token stack preserves upside participation,
- LP allocation monetizes trading activity and directional imbalances.

Residual risk remains if market conditions change sharply or if user profitability rises persistently.

## 4.4 Edge Cases to Test Before Scaling

- prolonged uptrend with profitable long traders;
- chop regime with low directional edge but persistent fees;
- sudden gap move with thin order book;
- community activity decay reducing open interest and turnover.

## 4.5 Governance and Transparency Requirements

To present this as institutional-grade evidence, publish:

- methodology for PnL attribution,
- explicit sign-convention dictionary for all dashboard fields,
- vault accounting policy for realized/unrealized treatment,
- scenario-based stress test assumptions,
- clear disclosures on survivorship and selection bias.

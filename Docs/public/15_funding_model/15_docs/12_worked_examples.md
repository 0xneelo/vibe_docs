# 12. Worked Examples

## Example 1: Normal Operation

### Given State

```
Market: $BERT
Token price: $10
Token holdings: 5,000 tokens ($50,000)
Longs: $60,000
Shorts: $50,000
```

### Calculations

**Step 1: Netting**
```
Netted = min(60,000, 50,000) = $50,000
```

**Step 2: Solver Exposure**
```
E_usd = |L − S| = |60,000 − 50,000| = $10,000
Direction: LONG (L > S)
```

**Step 3: Token Utilization**
```
C_usd = P × T = 10 × 5,000 = $50,000
u₁ = E_usd / C_usd = 10,000 / 50,000 = 20%
```

**Step 4: Regime Determination**
```
u₁ = 20% < u* = 80%  →  NORMAL regime
```

**Step 5: Funding Rate**
```
f = f_base = 30% APR
f_8h = 30% / (3 × 365) = 0.027% per 8h
```

### Result

| Metric | Value |
|--------|-------|
| Utilization | 20% |
| Regime | NORMAL |
| Funding | 30% APR |
| Insurance Mode | No |
| ADL Risk | None |

---

## Example 2: Stress Regime

### Given State

```
Market: $BERT
Token price: $10
Token holdings: 5,000 tokens ($50,000)
Longs: $120,000
Shorts: $80,000
```

### Calculations

**Step 1: Netting**
```
Netted = min(120,000, 80,000) = $80,000
```

**Step 2: Solver Exposure**
```
E_usd = |120,000 − 80,000| = $40,000
Direction: LONG
```

**Step 3: Token Utilization**
```
u₁ = 40,000 / 50,000 = 80%
```

**Step 4: Skew**
```
skew = (L − S) / (L + S) = (120,000 − 80,000) / 200,000 = 20%
```

**Step 5: Regime Determination**
```
u₁ = 80% = u*  →  At STRESS boundary
```

**Step 6: Funding Rate (Stress Curve)**
```
Normalized stress: s = (u − u*) / (1 − u*) = (0.80 − 0.80) / 0.20 = 0

f = f_base + a × s^p = 0.30 + 1.0 × 0² = 30% APR
```

(Just at the kink, no increase yet)

**Step 7: If u₁ = 90%**
```
s = (0.90 − 0.80) / (1 − 0.80) = 0.50
f = 0.30 + 1.0 × 0.50² = 0.30 + 0.25 = 55% APR
```

### Result

| u₁ | Regime | Funding (APR) |
|----|--------|---------------|
| 80% | STRESS (boundary) | 30% |
| 85% | STRESS | 39% |
| 90% | STRESS | 55% |
| 95% | CRITICAL | 100% (then ramp) |

---

## Example 3: Emergency with Acceleration

### Given State

```
Market: $BERT
Token price: $10
Token holdings: 5,000 tokens ($50,000)
Longs: $120,000
Shorts: $60,000
Utilization above critical for 6 days (> T_grace = 5 days)
Loss intensity ℓ = 0.10%/hour
```

### Calculations

**Step 1: Emergency Regime Check**
```
E_usd = |120,000 − 60,000| = $60,000
u₁ = 60,000 / 50,000 = 120%

u₁ > u_crit (95%) AND time > T_grace (5 days)
→  EMERGENCY regime
```

**Step 2: Acceleration Multiplier**
```
ℓ = 0.10%/hour
ℓ₀ = 0.03%/hour (noise floor)
ℓ₁ = 0.20%/hour (stress threshold)
k = 2.0

ratio = (ℓ − ℓ₀) / (ℓ₁ − ℓ₀) = (0.10 − 0.03) / (0.20 − 0.03) = 0.41
m = 1 + k × clip(ratio, 0, 1) = 1 + 2.0 × 0.41 = 1.82×
```

**Step 3: Effective Time**
```
Assume t_eff = 3.0 days (accumulated)

After 1 more day at m = 1.82:
t_eff_new = 3.0 + 1.82 × 1.0 = 4.82 days
```

**Step 4: Emergency Funding**
```
f_emergency = f_base + b × t_eff^q
            = 0.30 + 0.08 × 4.82^1.5
            = 0.30 + 0.08 × 10.58
            = 0.30 + 0.85
            = 115% APR
```

**Step 5: Check Cap**
```
f = min(115%, f_max) = min(115%, 300%) = 115% APR
```

### Result

| Metric | Value |
|--------|-------|
| Utilization | 120% |
| Regime | EMERGENCY |
| Loss intensity | 0.10%/hour |
| Multiplier | 1.82× |
| Effective time | 4.82 days |
| Funding | 115% APR |

---

## Example 4: Insurance Mode Activation

### Given State

```
Market: $BERT
Token price: $10
Token holdings: 5,000 tokens ($50,000)
Longs: $120,000
Shorts: $60,000
Local insurance: $100,000
Global allocation: $10,000
Aenigma (A): 3.0
```

### Calculations

**Step 1: Unhedged Exposure**
```
E_usd = $60,000
C_usd = $50,000
Unhedged = max(0, E_usd − C_usd) = $10,000
```

**Step 2: Exposure Loss Estimate**
```
L(E) = E_usd × (A − 1) = 60,000 × (3 − 1) = $120,000

But for unhedged portion:
L_unhedged = 10,000 × (3 − 1) = $20,000
```

**Step 3: Insurance Budget**
```
η_loc = 30%, η_glob = 100%

B_ins = η_loc × I_loc + η_glob × I_m_glob
      = 0.30 × 100,000 + 1.0 × 10,000
      = $40,000
```

**Step 4: Insurance Utilization**
```
u₂ = L_unhedged / B_ins = 20,000 / 40,000 = 50%
```

**Step 5: Effective Utilization**
```
u_eff = max(u₁, u₂) = max(120%, 50%) = 120%
```

**Step 6: Dynamic Spread (Insurance Mode)**

Since we're in insurance mode:
```
Base spread: 0.10%
Long open:  0.10% × (1 + 2 × 0.50) = 0.20%  (+100%)
Short open: 0.10% × (1 − 1 × 0.50) = 0.05%  (−50%)
```

### Result

| Metric | Value |
|--------|-------|
| Unhedged exposure | $10,000 |
| Loss estimate | $20,000 |
| Insurance budget | $40,000 |
| Insurance utilization | 50% |
| Mode | INSURANCE |
| Long spread | 0.20% (+100%) |
| Short spread | 0.05% (−50%) |

---

## Example 5: Bell-Curve Flattening

### Given Data (5 Markets)

| Market | Π_m (raw profit) |
|--------|------------------|
| A | +$80,000 |
| B | +$20,000 |
| C | +$5,000 |
| D | −$10,000 |
| E | −$45,000 |

**Total: $50,000**

### Calculations

**Step 1: Distribution Stats**
```
μ = 50,000 / 5 = $10,000
σ = √[(1/4) × ((80-10)² + (20-10)² + (5-10)² + (-10-10)² + (-45-10)²)]
  = √[(1/4) × (4900 + 100 + 25 + 400 + 3025)] × 1000
  = √(2112.5) × 1000 ≈ $45,960
```

**Step 2: Cutoffs (k = 1.0)**
```
U = μ + k×σ = 10,000 + 45,960 = $55,960
L = μ − k×σ = 10,000 − 45,960 = −$35,960
```

**Step 3: Tail Identification**

| Market | Π_m | E_m (excess) | S_m (shortfall) |
|--------|-----|--------------|-----------------|
| A | +80,000 | 80,000 − 55,960 = 24,040 | 0 |
| B | +20,000 | 0 | 0 |
| C | +5,000 | 0 | 0 |
| D | −10,000 | 0 | 0 |
| E | −45,000 | 0 | −35,960 − (−45,000) = 9,040 |

```
E = $24,040 (total excess)
S = $9,040 (total shortfall)
```

**Step 4: Transfer Pool (β = 0.8)**
```
T = 0.8 × min(24,040, 9,040) = 0.8 × 9,040 = $7,232
```

**Step 5: Allocations**
```
τ_A = 7,232 × (24,040 / 24,040) = $7,232 (tax from A)
γ_E = 7,232 × (9,040 / 9,040) = $7,232 (subsidy to E)
```

**Step 6: Flattened Profits**

| Market | Π_m (raw) | τ_m | γ_m | Π'_m (flattened) |
|--------|-----------|-----|-----|------------------|
| A | +80,000 | 7,232 | 0 | **+72,768** |
| B | +20,000 | 0 | 0 | +20,000 |
| C | +5,000 | 0 | 0 | +5,000 |
| D | −10,000 | 0 | 0 | −10,000 |
| E | −45,000 | 0 | 7,232 | **−37,768** |

**Total before: $50,000**
**Total after: $50,000** ✓

### Result

A's extreme profit reduced by $7,232 (9%)
E's extreme loss reduced by $7,232 (16%)
Distribution compressed toward mean.

---

## Example 6: ADL Trigger

### Given State

```
Market: $BERT
Token price: $10
Token holdings: 5,000 tokens ($50,000)
E_usd: $100,000
Local insurance: $100,000 (30% = $30,000 available)
Global allocation: $10,000 (100% = $10,000 available)
Aenigma (A): 3.0
Insurance already spent: $40,000 (exhausted)
```

### Calculations

**Step 1: Defense Budget**
```
B_m_def = B_m_loc + B_m_glob = 30,000 + 10,000 = $40,000
x_m = $40,000 (fully spent)
```

**Step 2: Stress Demand**
```
L(E) = 100,000 × (3 − 1) = $200,000
D_m = max(0, L(E) − Rev) 

Assume Rev = $50,000:
D_m = max(0, 200,000 − 50,000) = $150,000
```

**Step 3: Residual Stress**
```
D_m_res = max(0, D_m − x_m) = max(0, 150,000 − 40,000) = $110,000
```

**Step 4: ADL Trigger Check**

**Condition A:**
```
x_m = B_m_def? Yes ($40,000 = $40,000)
D_m_res > 0? Yes ($110,000 > 0)
→ Condition A: TRUE
```

**Condition B:**
```
E_safe = P × T_abs / A = 10 × 5,000 / 3 = $16,667
E_usd > E_safe? $100,000 > $16,667? YES
→ Condition B: TRUE
```

**Step 5: ADL Required**
```
ADL_trigger = TRUE (both conditions met)
```

**Step 6: ADL Amount**
```
Target: E_safe = $16,667
Current: E_usd = $100,000

a_m = 1 − (E_safe / E_usd) = 1 − (16,667 / 100,000) = 83.3%
```

### Result

| Metric | Value |
|--------|-------|
| Insurance spent | $40,000 (exhausted) |
| Residual stress | $110,000 |
| ADL triggered | YES |
| ADL amount | 83.3% of positions |
| Post-ADL exposure | $16,667 |

---

## Example 7: Complete Defense Sequence

### Scenario: Market Pump with Shorts Closing

**T = 0 (Start)**
```
Longs: $80,000, Shorts: $70,000
E_usd = $10,000, u₁ = 20%
Status: NORMAL, no action needed
```

**T = 1 (Shorts start closing)**
```
Longs: $80,000, Shorts: $50,000
E_usd = $30,000, u₁ = 60%
Status: NORMAL, elevated monitoring
```

**T = 2 (More shorts close)**
```
Longs: $80,000, Shorts: $35,000
E_usd = $45,000, u₁ = 90%
Status: STRESS
Action: Funding at 55% APR, spreads +50%
```

**T = 3 (Critical utilization)**
```
Longs: $80,000, Shorts: $25,000
E_usd = $55,000, u₁ = 110%
Status: EMERGENCY
Action: 
  - Emergency funding ramp active
  - Unhedged exposure = $5,000
  - Switch to insurance mode
```

**T = 4 (Insurance deployment)**
```
Unhedged exposure: $10,000
Insurance deployed: $20,000
Status: INSURANCE MODE
Action:
  - Negative spreads for shorts (rebates)
  - Local insurance covering losses
```

**T = 5 (Insurance exhausted)**
```
Unhedged exposure: $20,000
Insurance exhausted: $40,000
Residual stress: $30,000
Status: ADL TRIGGERED
Action: Deleverage 60% of winning longs
```

**T = 6 (Post-ADL)**
```
E_usd reduced to $16,667
Status: Recovering
Action: 
  - Rebuild insurance from fees
  - Maintain elevated rates
  - Monitor closely
```

---

## Summary: Key Thresholds

| Threshold | Value | Triggers |
|-----------|-------|----------|
| Optimal utilization (u*) | 80% | Stress pricing |
| Critical utilization | 95% | Emergency regime |
| Insurance mode | u₁ > 100% | Aggressive pricing + insurance |
| ADL | Insurance exhausted | Force close positions |

---

*End of Full Derivation*

---

## Appendix: Quick Reference Formulas

### Utilization
```
u₁ = E_usd / C_usd
u₂ = L(E) / B_ins
```

### Funding (Stress)
```
f = f_base + a × ((u − u*) / (1 − u*))^p
```

### Funding (Emergency)
```
f = f_base + b × t_eff^q
t_eff += m(ℓ) × Δt
m(ℓ) = 1 + k × clip((ℓ − ℓ₀)/(ℓ₁ − ℓ₀), 0, 1)
```

### Bell-Curve Flattening
```
T = β × min(E, S)
τ_m = T × E_m / E
γ_m = T × S_m / S
Π'_m = Π_m − τ_m + γ_m
```

### ADL
```
a_m = 1 − (E_safe / E_current)
E(t+1) = (1 − a_m) × E(t)
```

---

*Last updated: January 2026*

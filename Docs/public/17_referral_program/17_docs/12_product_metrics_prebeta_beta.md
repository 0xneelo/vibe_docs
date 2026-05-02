# Product Metrics Framework

This chapter defines a public KPI framework for the referral program rollout.
It is written for external readers tracking product maturity, growth quality, and market depth.

---

## 1) Phase definitions

- **Beta access-gated:** Access-gated onboarding and controlled market growth.
- **Beta:** Referral mechanics and attribution are live at broader scale.
- **Open phase:** Access is broadly available, with referral benefits acting as an accelerator layer.

---

## 2) North-star metric

### Market creation velocity

The primary metric is the rate of high-quality market listings.
This reflects whether the platform is continuously expanding tradable opportunities.

### Why this matters

- Listings are the top-of-funnel for both trader demand and fee generation.
- More high-quality listings increase discovery, retention, and partner value.

---

## 3) Supporting KPI set

| KPI | What it measures | Why it matters |
|-----|------------------|----------------|
| New listings per week | Supply growth | Tracks chapter-level growth objective |
| Active markets | Market depth | Distinguishes creation from sustained activity |
| Time-to-first-listing | Onboarding efficiency | Measures friction for new creators |
| Weekly active listers | Creator retention | Indicates repeat supply behavior |
| Referral attach rate | Growth loop health | Shows attribution participation |
| Traders per active market | Demand distribution | Detects concentration risk |
| Fee-generating volume | Monetization quality | Links usage to economic output |

---

## 4) Phase targets (illustrative)

Targets should be finalized in public release notes for each milestone.
Illustrative rollout bands:

- **Pre-beta:** controlled growth with stable operations and no critical flow outages.
- **Beta:** measurable referral attribution, stronger listing velocity, and improved market activation rates.
- **Open phase:** broad participation with consistent quality controls and predictable conversion funnels.

---

## 5) Dashboard architecture

Minimum external dashboard views:

1. **Acquisition funnel**
   - Code issued -> signup -> first deposit -> first trade -> first listing
2. **Market supply**
   - New listings/day, active markets, repeat listers
3. **Market demand**
   - Trades per market decile, depth concentration, turnover
4. **Integrity**
   - Anomaly flags, suspicious volume ratio, false-positive rate over time

---

## 6) Reporting standards

- Publish metrics with clear phase labels.
- Separate organic growth from partner campaign imports.
- Keep definitions stable across periods to avoid artificial trend shifts.
- Version KPI formulas whenever scoring logic changes.

---

## 7) Guardrails

- Do not optimize headline KPIs by lowering market quality thresholds.
- Keep anti-gaming controls active when incentive surfaces expand.
- Ensure referral growth does not outpace monitoring and dispute tooling.

---

## 8) Related chapters

- [06_access_codes_three_phase_plan.md](06_access_codes_three_phase_plan.md)
- [04_points_economy_and_leaderboards.md](04_points_economy_and_leaderboards.md)
- [11_delivery_timeline_milestones.md](11_delivery_timeline_milestones.md)

import { Check, ChevronDown, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

import { SiteHeader } from "@/components/SiteHeader";

type ScenarioKey = "normal" | "gradual_stress" | "sudden_spike" | "sustained_emergency" | "solver_losses";
type Regime = "normal" | "stress" | "emergency";

interface SimPoint {
  day: number;
  hour?: number;
  funding_rate: number;
  funding_rate_8h?: number;
  utilization_smoothed: number;
  utilization?: number;
  multiplier: number;
  regime: Regime;
  pnl_pct: number;
  pnl?: number;
  equity?: number;
  initial_equity?: number;
  loss?: number;
  max_solver_loss?: number;
  adl_proximity: number;
  adl_triggered?: boolean;
  t_eff: number;
  hours_above_critical?: number;
  loss_intensity?: number;
  loss_intensity_pct?: number;
}

interface ModelParams {
  F_base: number;
  F_max: number;
  U_optimal: number;
  U_critical: number;
  T_grace: number;
  k: number;
  max_solver_loss: number;
}

interface RegimeEvent {
  index: number;
  day: number;
  from: Regime | null;
  to: Regime;
  util: number;
  funding: number;
}

const DEFAULT_PARAMS: ModelParams = {
  F_base: 0.3,
  F_max: 3,
  U_optimal: 0.8,
  U_critical: 0.95,
  T_grace: 5,
  k: 2,
  max_solver_loss: 500_000,
};

const MODEL_COEFFS = {
  a: 1,
  p: 2,
  b: 0.08,
  q: 1.5,
  l0: 0.0003,
  l1: 0.002,
};

const SCENARIOS: { key: ScenarioKey; label: string }[] = [
  { key: "sustained_emergency", label: "Sustained Emergency" },
  { key: "gradual_stress", label: "Gradual Stress" },
  { key: "sudden_spike", label: "Sudden Spike" },
  { key: "solver_losses", label: "Solver Losses" },
  { key: "normal", label: "Normal Operation" },
];

const REGIME_TO_NUM: Record<Regime, number> = {
  normal: 1,
  stress: 2,
  emergency: 3,
};

const LOCAL_MODEL = {
  a: 1,
  p: 2,
  b: 0.08,
  q: 1.5,
  l0: 0.0003,
  l1: 0.002,
  m_max: 5,
  ema_fast_window: 8,
  ema_slow_window: 72,
  ema_util_window: 24,
  max_daily_change: 0.3,
  initial_equity: 2_000_000,
  initial_price: 1,
  initial_utilization: 0.5,
  default_unhedged_delta: 0.03,
  funding_capture_ratio: 0.45,
  fee_apr: 0.24,
  spread_apr: 0.14,
  liquidation_apr_max: 0.2,
  other_revenue_apr: 0.03,
  operating_cost_apr: 0.06,
};

function createSeededRandom(seed: number) {
  let t = seed >>> 0;
  let spare: number | null = null;
  const uniform = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = (mean = 0, stdDev = 1) => {
    if (spare !== null) {
      const value = spare;
      spare = null;
      return mean + stdDev * value;
    }
    const u1 = Math.max(uniform(), 1e-12);
    const u2 = uniform();
    const mag = Math.sqrt(-2 * Math.log(u1));
    const z0 = mag * Math.cos(2 * Math.PI * u2);
    const z1 = mag * Math.sin(2 * Math.PI * u2);
    spare = z1;
    return mean + stdDev * z0;
  };
  return { uniform, gauss };
}

function scenarioUtilization(hour: number, scenario: ScenarioKey, rng: ReturnType<typeof createSeededRandom>) {
  switch (scenario) {
    case "normal":
      return clamp(0.55 + 0.08 * Math.sin((hour / 24) * 2 * Math.PI) + rng.gauss(0, 0.015), 0.35, 0.75);
    case "gradual_stress": {
      const progress = Math.min(1, hour / (30 * 24));
      const base = 0.5 + 0.47 * progress;
      return clamp(base + rng.gauss(0, base > 0.9 ? 0.01 : 0.02), 0.4, 0.99);
    }
    case "sudden_spike":
      if (hour < 24 * 5) return 0.6 + rng.gauss(0, 0.02);
      if (hour < 24 * 7) return 0.96 + rng.gauss(0, 0.01);
      if (hour < 24 * 20) {
        const progress = (hour - 24 * 7) / (24 * 13);
        return 0.96 - 0.2 * progress + rng.gauss(0, 0.02);
      }
      return 0.7 + rng.gauss(0, 0.03);
    case "solver_losses":
      if (hour < 24 * 3) return 0.62 + (hour / (24 * 3)) * 0.34;
      return 0.96 + rng.gauss(0, 0.008);
    case "sustained_emergency":
    default:
      if (hour < 24 * 3) return 0.6 + (hour / (24 * 3)) * 0.36;
      return 0.96 + rng.gauss(0, 0.005);
  }
}

function defaultPrice(previousPrice: number, rng: ReturnType<typeof createSeededRandom>) {
  return Math.max(0.0001, previousPrice * (1 + rng.gauss(0, 0.004)));
}

function calculateNormalizedStress(utilization: number, params: ModelParams) {
  if (utilization <= params.U_optimal) {
    return 0;
  }
  return clamp((utilization - params.U_optimal) / Math.max(1e-9, 1 - params.U_optimal), 0, 1);
}

function calculateStressFunding(utilization: number, params: ModelParams) {
  const s = calculateNormalizedStress(utilization, params);
  return Math.min(params.F_max, params.F_base + LOCAL_MODEL.a * Math.pow(s, LOCAL_MODEL.p));
}

function calculateEmergencyFunding(tEff: number, params: ModelParams) {
  const ramp = LOCAL_MODEL.b * Math.pow(Math.max(tEff, 0), LOCAL_MODEL.q);
  return Math.min(params.F_max, params.F_base + ramp);
}

function calculateAccelerationMultiplier(lossIntensity: number, params: ModelParams) {
  const normalized = (lossIntensity - LOCAL_MODEL.l0) / Math.max(1e-9, LOCAL_MODEL.l1 - LOCAL_MODEL.l0);
  const clamped = clamp(normalized, 0, 1);
  return Math.min(LOCAL_MODEL.m_max, 1 + params.k * clamped);
}

function downsampleHistory(history: SimPoint[], maxPoints = 1000) {
  if (history.length <= maxPoints) {
    return history;
  }
  const step = Math.max(1, Math.floor(history.length / maxPoints));
  return history.filter((_, index) => index % step === 0);
}

function simulateFundingHistory(params: ModelParams, scenario: ScenarioKey, durationDays: number, seed = 42): SimPoint[] {
  const rng = createSeededRandom(seed);
  const durationHours = clamp(Math.round(durationDays * 24), 24, 365 * 24);

  let hour = 0;
  let fundingRate = params.F_base;
  let regime: Regime = "normal";
  let hoursAboveCritical = 0;
  let emergencyStartHour: number | null = null;
  let tEff = 0;
  let emergencyLocked = false;
  let emaUtilFast = LOCAL_MODEL.initial_utilization;
  let emaUtilSlow = LOCAL_MODEL.initial_utilization;
  let emaLossFast = 0;
  let emaLossSlow = 0;
  let prevEquity = LOCAL_MODEL.initial_equity;

  let utilization = LOCAL_MODEL.initial_utilization;
  let tokenPrice = LOCAL_MODEL.initial_price;
  let equity = LOCAL_MODEL.initial_equity;

  const emaUpdate = (current: number, value: number, window: number) => {
    const alpha = 2 / (window + 1);
    return alpha * value + (1 - alpha) * current;
  };

  const determineRegime = (smoothedUtil: number): Regime => {
    const graceHours = Math.round(params.T_grace * 24);
    const exitThreshold = Math.max(params.U_optimal, params.U_critical - 0.05);

    if (smoothedUtil >= params.U_critical) {
      hoursAboveCritical += 1;
    } else {
      const decay = smoothedUtil < params.U_critical - 0.02 ? 1 : 0;
      hoursAboveCritical = Math.max(0, hoursAboveCritical - decay);
    }

    if (emergencyLocked) {
      if (smoothedUtil < exitThreshold) {
        emergencyLocked = false;
        return "stress";
      }
      return "emergency";
    }

    if (smoothedUtil < params.U_optimal) return "normal";
    if (smoothedUtil < params.U_critical) return "stress";
    if (hoursAboveCritical >= graceHours) {
      emergencyLocked = true;
      return "emergency";
    }
    return "stress";
  };

  const snapshots: SimPoint[] = [];
  const enforceNonNegativePnl = scenario !== "solver_losses";

  for (let h = 0; h < durationHours; h += 1) {
    utilization = clamp(scenarioUtilization(h, scenario, rng), 0, 1);
    const nextPrice = defaultPrice(tokenPrice, rng);
    const priceReturn = (nextPrice - tokenPrice) / Math.max(tokenPrice, 1e-9);

    const utilFactor = Math.max(utilization, 0.2);
    const stressFactor = Math.max(0, (utilization - params.U_optimal) / Math.max(1e-9, 1 - params.U_optimal));

    const fundingIncome = (equity * Math.max(fundingRate, params.F_base) * LOCAL_MODEL.funding_capture_ratio * utilFactor) / (365 * 24);
    const feeIncome = (equity * LOCAL_MODEL.fee_apr * utilFactor) / (365 * 24);
    const spreadUplift = 1 + 2.5 * stressFactor;
    const spreadIncome = (equity * LOCAL_MODEL.spread_apr * utilFactor * spreadUplift) / (365 * 24);
    const liquidationIncome = (equity * LOCAL_MODEL.liquidation_apr_max * stressFactor) / (365 * 24);
    const otherIncome = (equity * LOCAL_MODEL.other_revenue_apr) / (365 * 24);

    const operatingCost = (equity * LOCAL_MODEL.operating_cost_apr) / (365 * 24);
    const inventoryDrag = Math.abs(LOCAL_MODEL.default_unhedged_delta) * LOCAL_MODEL.initial_equity * Math.abs(priceReturn) * 0.1;
    const hourlyNet = fundingIncome + feeIncome + spreadIncome + liquidationIncome + otherIncome - operatingCost - inventoryDrag;

    let shockDrag = 0;
    if (scenario === "solver_losses") {
      if (h < 24 * 4) {
        shockDrag = LOCAL_MODEL.initial_equity * 0.00085;
      } else if (h < 24 * 10) {
        const decay = 1 - (h - 24 * 4) / (24 * 6);
        shockDrag = LOCAL_MODEL.initial_equity * 0.00035 * Math.max(0, decay);
      }
    }

    let nextEquity = Math.max(0, equity + hourlyNet - Math.max(0, shockDrag));
    if (enforceNonNegativePnl) {
      nextEquity = Math.max(nextEquity, LOCAL_MODEL.initial_equity);
    }

    tokenPrice = Math.max(0.0001, nextPrice);
    equity = nextEquity;

    const deltaEquity = equity - prevEquity;
    const rawLossIntensity = Math.max(0, -deltaEquity) / Math.max(equity, 1e-9);
    emaLossFast = emaUpdate(emaLossFast, rawLossIntensity, LOCAL_MODEL.ema_fast_window);
    emaLossSlow = emaUpdate(emaLossSlow, rawLossIntensity, LOCAL_MODEL.ema_slow_window);
    const lossIntensity = Math.max(emaLossFast, emaLossSlow);

    emaUtilFast = emaUpdate(emaUtilFast, utilization, LOCAL_MODEL.ema_util_window);
    emaUtilSlow = emaUpdate(emaUtilSlow, utilization, LOCAL_MODEL.ema_slow_window);
    const smoothedUtil = emaUtilFast;

    const previousRegime = regime;
    regime = determineRegime(smoothedUtil);

    if (regime === "normal") {
      fundingRate = params.F_base;
      tEff = 0;
      emergencyStartHour = null;
    } else if (regime === "stress") {
      const targetFunding = calculateStressFunding(smoothedUtil, params);
      if (previousRegime === "emergency" && tEff > 0) {
        tEff = Math.max(0, tEff - 0.002);
      }
      fundingRate = targetFunding;
    } else {
      if (emergencyStartHour === null) {
        emergencyStartHour = hour;
        const stressFunding = calculateStressFunding(smoothedUtil, params);
        const aboveBase = Math.max(0, stressFunding - params.F_base);
        if (aboveBase > 0 && LOCAL_MODEL.b > 0) {
          tEff = Math.pow(aboveBase / LOCAL_MODEL.b, 1 / LOCAL_MODEL.q);
        }
      }
      const multiplier = calculateAccelerationMultiplier(lossIntensity, params);
      tEff += multiplier * (1 / 24);
      const targetFunding = calculateEmergencyFunding(tEff, params);
      const maxHourlyChange = LOCAL_MODEL.max_daily_change / 24;
      const delta = clamp(targetFunding - fundingRate, -maxHourlyChange, maxHourlyChange);
      fundingRate += delta;
    }

    prevEquity = equity;
    hour += 1;

    const pnl = equity - LOCAL_MODEL.initial_equity;
    const loss = Math.max(0, LOCAL_MODEL.initial_equity - equity);
    const adlProximity = Math.min(100, (loss / Math.max(params.max_solver_loss, 1e-9)) * 100);

    snapshots.push({
      hour,
      day: hour / 24,
      utilization,
      utilization_smoothed: smoothedUtil,
      funding_rate: fundingRate,
      funding_rate_8h: (fundingRate / (3 * 365)) * 100,
      regime,
      loss_intensity: lossIntensity,
      loss_intensity_pct: lossIntensity * 100,
      multiplier: calculateAccelerationMultiplier(lossIntensity, params),
      t_eff: tEff,
      equity,
      initial_equity: LOCAL_MODEL.initial_equity,
      pnl,
      pnl_pct: (pnl / LOCAL_MODEL.initial_equity) * 100,
      loss,
      max_solver_loss: params.max_solver_loss,
      adl_proximity: adlProximity,
      adl_triggered: loss >= params.max_solver_loss,
      hours_above_critical: hoursAboveCritical,
    });
  }

  return downsampleHistory(snapshots);
}

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function FundingSimulatorPage() {
  const [scenario, setScenario] = useState<ScenarioKey>("sustained_emergency");
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const scenarioDropdownRef = useRef<HTMLDivElement | null>(null);

  const [durationDays, setDurationDays] = useState(30);
  const [params, setParams] = useState<ModelParams>(DEFAULT_PARAMS);
  const [history, setHistory] = useState<SimPoint[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const latest = history.length ? history[history.length - 1] : null;
  const active = history.length ? history[clamp(selectedIndex, 0, history.length - 1)] : null;

  const chartSeries = useMemo(
    () => ({
      day: history.map((p) => p.day),
      funding: history.map((p) => p.funding_rate * 100),
      util: history.map((p) => p.utilization_smoothed * 100),
      regime: history.map((p) => REGIME_TO_NUM[p.regime]),
      teff: history.map((p) => p.t_eff),
      pnl: history.map((p) => p.pnl_pct),
      adl: history.map((p) => p.adl_proximity),
      lossIntensity: history.map((p) => p.loss_intensity_pct ?? (p.loss_intensity ?? 0) * 100),
    }),
    [history],
  );

  const regimeEvents = useMemo<RegimeEvent[]>(() => {
    const events: RegimeEvent[] = [];
    let prev: Regime | null = null;
    history.forEach((point, index) => {
      if (point.regime !== prev) {
        events.push({
          index,
          day: point.day,
          from: prev,
          to: point.regime,
          util: point.utilization_smoothed,
          funding: point.funding_rate,
        });
        prev = point.regime;
      }
    });
    return events;
  }, [history]);

  useEffect(() => {
    void loadDefaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!history.length) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex(history.length - 1);
  }, [history]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!scenarioDropdownRef.current) {
        return;
      }
      if (!scenarioDropdownRef.current.contains(event.target as Node)) {
        setScenarioOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setScenarioOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function loadDefaults() {
    try {
      const merged = { ...DEFAULT_PARAMS };
      setParams(merged);
      await runSimulation({ ...merged, durationDays, scenario });
      setApiError(null);
    } catch {
      setApiError(
        `Could not initialize the local funding simulation.`,
      );
    }
  }

  async function runSimulation(overrides?: Partial<ModelParams> & { durationDays?: number; scenario?: ScenarioKey }) {
    const nextParams = { ...params, ...overrides };
    const nextDays = overrides?.durationDays ?? durationDays;
    const nextScenario = overrides?.scenario ?? scenario;
    setLoading(true);
    try {
      await Promise.resolve();
      const localHistory = simulateFundingHistory(nextParams, nextScenario, nextDays, 42);
      setHistory(localHistory);
      setApiError(null);
    } catch {
      setApiError(
        `Couldn't run the local funding simulation.`,
      );
    } finally {
      setLoading(false);
    }
  }

  const adlStatus = useMemo(() => {
    if (!latest) {
      return "Safe";
    }
    if (latest.adl_triggered) {
      return "ADL Triggered";
    }
    if (latest.adl_proximity >= 75) {
      return "High risk";
    }
    if (latest.adl_proximity >= 50) {
      return "Rising risk";
    }
    return "Safe";
  }, [latest]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1700px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="space-y-5">
              <header className="card-surface-main funding-enter p-6">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Funding Rate Model Simulator</h1>
                <p className="mt-2 max-w-4xl text-base leading-7 text-foreground/70">
                  Choose a scenario, run the model, and inspect funding, utilization, and ADL risk over time.
                </p>
              </header>

              {apiError ? <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">{apiError}</div> : null}

              <section className="card-surface-main funding-enter funding-enter--d1 p-4 sm:p-5">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.11em] text-foreground/65">Simulation setup</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="text-sm text-foreground/82">
                    Scenario
                    <div ref={scenarioDropdownRef} className="relative mt-1">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl border border-white/14 bg-white/[0.03] px-3 py-2 text-left text-sm text-foreground transition hover:border-white/24 hover:bg-white/[0.07] focus-visible:border-white/30 focus-visible:outline-none"
                        aria-haspopup="listbox"
                        aria-expanded={scenarioOpen}
                        onClick={() => setScenarioOpen((open) => !open)}
                      >
                        <span>{SCENARIOS.find((item) => item.key === scenario)?.label ?? "Choose scenario"}</span>
                        <ChevronDown className={`h-4 w-4 text-foreground/60 transition ${scenarioOpen ? "rotate-180" : ""}`} />
                      </button>
                      {scenarioOpen ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-30 rounded-xl border border-white/14 bg-background/95 p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                          <div className="max-h-56 overflow-y-auto rounded-lg reader-scrollbar">
                            {SCENARIOS.map((item) => {
                              const selected = item.key === scenario;
                              return (
                                <button
                                  key={item.key}
                                  type="button"
                                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                                    selected
                                      ? "border-white/28 bg-white/[0.12] text-foreground"
                                      : "border-transparent bg-transparent text-foreground/80 hover:border-white/12 hover:bg-white/[0.07]"
                                  }`}
                                  onClick={() => {
                                    setScenario(item.key);
                                    setScenarioOpen(false);
                                  }}
                                >
                                  <span>{item.label}</span>
                                  {selected ? <Check className="h-4 w-4 text-foreground/75" /> : null}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </label>
                  <StepNumberField label="Duration (days)" value={durationDays} min={1} max={365} step={1} onChange={setDurationDays} />
                  <StepNumberField
                    label="Base Funding (% APR)"
                    value={Math.round(params.F_base * 100)}
                    min={0}
                    max={1000}
                    step={1}
                    onChange={(next) => setParams((p) => ({ ...p, F_base: next / 100 }))}
                  />
                  <StepNumberField
                    label="Max Funding (% APR)"
                    value={Math.round(params.F_max * 100)}
                    min={100}
                    max={2000}
                    step={10}
                    onChange={(next) => setParams((p) => ({ ...p, F_max: next / 100 }))}
                  />
                  <StepNumberField
                    label="Optimal Utilization (%)"
                    value={Math.round(params.U_optimal * 100)}
                    min={50}
                    max={95}
                    step={1}
                    onChange={(next) => setParams((p) => ({ ...p, U_optimal: next / 100 }))}
                  />
                  <StepNumberField
                    label="Critical Utilization (%)"
                    value={Math.round(params.U_critical * 100)}
                    min={80}
                    max={99}
                    step={1}
                    onChange={(next) => setParams((p) => ({ ...p, U_critical: next / 100 }))}
                  />
                </div>

                <details className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/68">
                    Advanced controls
                  </summary>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <StepNumberField
                      label="Grace Period (days)"
                      value={params.T_grace}
                      min={1}
                      max={14}
                      step={1}
                      onChange={(next) => setParams((p) => ({ ...p, T_grace: next }))}
                    />
                    <StepNumberField
                      label="Max Acceleration (k)"
                      value={params.k}
                      min={0}
                      max={5}
                      step={0.5}
                      onChange={(next) => setParams((p) => ({ ...p, k: next }))}
                    />
                    <StepNumberField
                      label="Max Solver Loss (ADL)"
                      value={params.max_solver_loss}
                      min={10_000}
                      max={10_000_000}
                      step={50_000}
                      onChange={(next) => setParams((p) => ({ ...p, max_solver_loss: next }))}
                    />
                  </div>
                </details>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void runSimulation()}
                    disabled={loading}
                    className="rounded-lg border border-white/20 bg-white/[0.08] px-4 py-2 text-sm font-medium transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/[0.12] active:scale-[0.98] focus-visible:border-white/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Running..." : "Run simulation"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDurationDays(30);
                      setScenario("sustained_emergency");
                      void loadDefaults();
                    }}
                    className="rounded-lg border border-white/16 bg-white/[0.03] px-4 py-2 text-sm text-foreground/85 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/[0.08] active:scale-[0.98] focus-visible:border-white/30 focus-visible:outline-none"
                  >
                    Reset defaults
                  </button>
                </div>
              </section>

              <section className="funding-enter funding-enter--d2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Funding rate now"
                  value={latest ? `${(latest.funding_rate * 100).toFixed(1)}% APR` : "--"}
                  subValue={latest ? `${(latest.funding_rate_8h ?? (latest.funding_rate * 100) / (365 * 3)).toFixed(4)}% per 8h` : "--"}
                />
                <StatCard
                  label="Current regime"
                  value={latest ? latest.regime.toUpperCase() : "--"}
                  subValue={latest?.regime === "emergency" ? `Emergency timer: ${latest.t_eff.toFixed(2)} days` : " "}
                />
                <StatCard
                  label="Utilization"
                  value={latest ? `${(latest.utilization_smoothed * 100).toFixed(1)}%` : "--"}
                  subValue={
                    latest
                      ? latest.utilization_smoothed < params.U_optimal
                        ? "Below target"
                        : latest.utilization_smoothed < params.U_critical
                          ? "In stress band"
                          : "Critical"
                      : "--"
                  }
                />
                <StatCard label="ADL proximity" value={latest ? `${latest.adl_proximity.toFixed(1)}%` : "--"} subValue={adlStatus} />
              </section>

              <section className="funding-enter funding-enter--d3 grid gap-4 xl:grid-cols-2">
                <ChartCard title="Funding Rate Over Time" values={chartSeries.funding} xValues={chartSeries.day} xLabel="Day" yLabel="% APR" />
                <ChartCard title="Utilization Over Time" values={chartSeries.util} xValues={chartSeries.day} xLabel="Day" yLabel="Util %" />
                <ChartCard title="Solver PnL (%)" values={chartSeries.pnl} xValues={chartSeries.day} xLabel="Day" yLabel="PnL %" />
                <ChartCard title="ADL Proximity (%)" values={chartSeries.adl} xValues={chartSeries.day} xLabel="Day" yLabel="%" />
              </section>

              <details className="card-surface-main funding-enter funding-enter--d4 p-4 sm:p-5">
                <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.11em] text-foreground/65">
                  Advanced charts and formulas
                </summary>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <ChartCard
                    title="Regime Transitions (1/2/3)"
                    values={chartSeries.regime}
                    xValues={chartSeries.day}
                    xLabel="Day"
                    yLabel="Regime"
                  />
                  <ChartCard title="Effective Time (t_eff)" values={chartSeries.teff} xValues={chartSeries.day} xLabel="Day" yLabel="days" />
                  <ChartCard
                    title="Loss Intensity (%/h)"
                    values={chartSeries.lossIntensity}
                    xValues={chartSeries.day}
                    xLabel="Day"
                    yLabel="%/h"
                  />
                </div>
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  <FormulaCard
                    title="Normal Regime (U <= U*)"
                    tone="text-emerald-300"
                    formula={"F = F_base"}
                    details={`${(params.F_base * 100).toFixed(0)}% APR`}
                  />
                  <FormulaCard
                    title="Stress Regime (U* < U < U_crit)"
                    tone="text-amber-300"
                    formula={"F = F_base + a * s^p,  s = (U - U*) / (1 - U*)"}
                    details={`a=${MODEL_COEFFS.a}, p=${MODEL_COEFFS.p}`}
                  />
                  <FormulaCard
                    title="Emergency Regime"
                    tone="text-rose-300"
                    formula={"F = min(F_base + b * t_eff^q, F_max)"}
                    details={`b=${MODEL_COEFFS.b}, q=${MODEL_COEFFS.q}`}
                  />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <ParamChip label="U*" value={`${(params.U_optimal * 100).toFixed(0)}%`} />
                  <ParamChip label="U_crit" value={`${(params.U_critical * 100).toFixed(0)}%`} />
                  <ParamChip label="T_grace" value={`${params.T_grace} days`} />
                  <ParamChip label="k" value={`${params.k.toFixed(2)}x`} />
                  <ParamChip label="F_base" value={`${(params.F_base * 100).toFixed(0)}% APR`} />
                  <ParamChip label="F_max" value={`${(params.F_max * 100).toFixed(0)}% APR`} />
                  <ParamChip label="Max Loss" value={formatUsd(params.max_solver_loss)} />
                  <ParamChip label="l0 / l1" value={`${(MODEL_COEFFS.l0 * 100).toFixed(4)}% / ${(MODEL_COEFFS.l1 * 100).toFixed(4)}%`} />
                </div>
              </details>
            </section>

            <aside className="card-surface-sidebar funding-enter funding-enter--d2 h-fit p-4 xl:sticky xl:top-20">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/65">Calculation timeline</h3>
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, history.length - 1)}
                  value={clamp(selectedIndex, 0, Math.max(0, history.length - 1))}
                  onChange={(event) => setSelectedIndex(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/15 accent-blue-300"
                  disabled={!history.length}
                />
                <span className="min-w-[64px] text-right text-sm tabular-nums text-foreground/78">{active ? `Day ${active.day.toFixed(1)}` : "Day 0.0"}</span>
              </div>
              <div className="mb-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/14 bg-white/[0.04] px-2 py-1.5 text-sm text-foreground/85 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/[0.08] active:scale-[0.98] focus-visible:border-white/30 focus-visible:outline-none"
                  onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                  disabled={!history.length}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/14 bg-white/[0.04] px-2 py-1.5 text-sm text-foreground/85 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/[0.08] active:scale-[0.98] focus-visible:border-white/30 focus-visible:outline-none"
                  onClick={() => setSelectedIndex((prev) => Math.min(history.length - 1, prev + 1))}
                  disabled={!history.length}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/14 bg-white/[0.04] px-2 py-1.5 text-sm text-foreground/85 transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/[0.08] active:scale-[0.98] focus-visible:border-white/30 focus-visible:outline-none"
                  onClick={() => setSelectedIndex(history.length - 1)}
                  disabled={!history.length}
                >
                  Latest
                </button>
              </div>

              <div className="space-y-4 text-[13px] leading-6">
                <LogSection title="Current state">
                  <LogRow label="Time" value={active ? `Hour ${active.hour ?? Math.round(active.day * 24)} (Day ${active.day.toFixed(2)})` : "--"} />
                  <LogRow label="Regime" value={active ? active.regime.toUpperCase() : "--"} emphasis={regimeToTone(active?.regime)} />
                  <LogRow label="Funding" value={active ? `${(active.funding_rate * 100).toFixed(2)}% APR` : "--"} emphasis="blue" />
                </LogSection>

                <LogSection title="Utilization">
                  <LogRow label="Current" value={active ? `${((active.utilization ?? active.utilization_smoothed) * 100).toFixed(2)}%` : "--"} />
                  <LogRow label="Smoothed (EMA)" value={active ? `${(active.utilization_smoothed * 100).toFixed(2)}%` : "--"} />
                  <LogRow label="Gap to U* target" value={active ? formatSignedPercent((active.utilization_smoothed - params.U_optimal) * 100) : "--"} />
                  <LogRow label="Gap to U_crit" value={active ? formatSignedPercent((active.utilization_smoothed - params.U_critical) * 100) : "--"} />
                </LogSection>

                <LogSection title="Emergency tracking">
                  <LogRow label="Effective emergency time (t_eff)" value={active ? `${active.t_eff.toFixed(4)} days` : "--"} emphasis="purple" />
                </LogSection>

                <LogSection title="Solver state">
                  <LogRow label="Starting equity" value={active ? formatUsd(active.initial_equity ?? 2_000_000) : "--"} />
                  <LogRow label="Current equity" value={active ? formatUsd(active.equity ?? active.initial_equity ?? 2_000_000) : "--"} />
                  <LogRow label="Unrealized PnL" value={active ? `${(active.pnl ?? 0) >= 0 ? "+" : ""}${formatUsd(active.pnl ?? 0)}` : "--"} />
                  <LogRow label="PnL %" value={active ? `${(active.pnl_pct ?? 0) >= 0 ? "+" : ""}${(active.pnl_pct ?? 0).toFixed(2)}%` : "--"} />
                </LogSection>

                <LogSection title="ADL status">
                  <LogRow label="Current loss" value={active ? formatUsd(active.loss ?? 0) : "--"} />
                  <LogRow label="ADL loss limit" value={formatUsd(active?.max_solver_loss ?? params.max_solver_loss)} />
                  <LogRow label="Proximity" value={active ? `${active.adl_proximity.toFixed(1)}%` : "--"} emphasis="yellow" />
                  <LogRow
                    label="Status"
                    value={active ? (active.adl_triggered ? "ADL Triggered" : active.adl_proximity >= 75 ? "High risk" : active.adl_proximity >= 50 ? "Rising risk" : "Safe") : "--"}
                    emphasis={active?.adl_triggered ? "red" : active && active.adl_proximity >= 50 ? "yellow" : "green"}
                  />
                </LogSection>

                <details className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-2">
                  <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/68">
                    Advanced diagnostics
                  </summary>
                  <div className="mt-3 space-y-4">
                    <LogSection title="Emergency tracking details">
                      <LogRow label="Hours above critical" value={`${active?.hours_above_critical ?? 0}`} />
                      <LogRow label="Grace period" value={`${params.T_grace * 24}h (${params.T_grace}d)`} />
                      <LogRow
                        label="Progress"
                        value={
                          active
                            ? `${Math.min(100, ((active.hours_above_critical ?? 0) / Math.max(1, params.T_grace * 24)) * 100).toFixed(1)}%`
                            : "--"
                        }
                      />
                    </LogSection>

                    <LogSection title="Funding calculation">
                      <CalcBox text={buildFundingCalcText(active, params)} />
                    </LogSection>

                    <LogSection title="Acceleration details">
                      <LogRow label="Loss intensity" value={active ? `${(active.loss_intensity_pct ?? (active.loss_intensity ?? 0) * 100).toFixed(4)}%/h` : "--"} />
                      <LogRow label="Multiplier" value={active ? `${active.multiplier.toFixed(2)}x` : "--"} emphasis="purple" />
                      <CalcBox text={buildAccelCalcText(active, params.k)} />
                    </LogSection>

                    <LogSection title="Regime events">
                      <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-2 reader-scrollbar">
                        {regimeEvents.length ? (
                          regimeEvents.map((event) => (
                            <div key={`${event.index}-${event.to}`} className="mb-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5">
                              <p className="text-[12px] leading-5 text-foreground/88">
                                Day {event.day.toFixed(1)}: {event.from ? `${event.from.toUpperCase()} -> ` : "START -> "}
                                {event.to.toUpperCase()}
                              </p>
                              <p className="text-[11px] text-foreground/60">
                                Util {(event.util * 100).toFixed(1)}%, Funding {(event.funding * 100).toFixed(1)}%
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[12px] text-foreground/62">No transitions logged yet.</p>
                        )}
                      </div>
                    </LogSection>
                  </div>
                </details>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue }: { label: string; value: string; subValue: string }) {
  return (
    <div className="card-surface-main p-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-foreground/55">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-foreground/60">{subValue}</p>
    </div>
  );
}

function FormulaCard({ title, formula, details, tone }: { title: string; formula: string; details: string; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${tone}`}>{title}</p>
      <pre className="mt-2 overflow-x-auto text-[13px] leading-6 text-foreground/86">{formula}</pre>
      <p className="mt-1 text-[11px] text-foreground/55">{details}</p>
    </div>
  );
}

function ParamChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.1em] text-foreground/56">{label}</p>
      <p className="mt-1 text-base text-foreground/90">{value}</p>
    </div>
  );
}

function LogSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-1.5 border-b border-white/12 pb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/76">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function regimeToTone(regime?: Regime) {
  if (regime === "emergency") {
    return "red" as const;
  }
  if (regime === "stress") {
    return "yellow" as const;
  }
  return "green" as const;
}

function LogRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: "green" | "yellow" | "red" | "blue" | "purple";
}) {
  const colorClass =
    emphasis === "green"
      ? "text-emerald-300"
      : emphasis === "yellow"
        ? "text-amber-300"
        : emphasis === "red"
          ? "text-rose-300"
          : emphasis === "blue"
            ? "text-blue-300"
            : emphasis === "purple"
              ? "text-violet-300"
              : "text-foreground/82";
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/6 pb-1.5 text-[12px] last:border-b-0">
      <span className="text-foreground/62">{label}</span>
      <span className={`text-right tabular-nums text-[12px] ${colorClass}`}>{value}</span>
    </div>
  );
}

function CalcBox({ text }: { text: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.03] p-2 text-[11px] leading-6 text-foreground/80">
      {text}
    </pre>
  );
}

function buildFundingCalcText(point: SimPoint | null, params: ModelParams) {
  if (!point) {
    return "// Run simulation to view calculation log.";
  }
  if (point.regime === "normal") {
    return `// Normal regime\nF = F_base\nF = ${(params.F_base * 100).toFixed(2)}%\n-> Funding = ${(point.funding_rate * 100).toFixed(2)}% APR`;
  }
  if (point.regime === "stress") {
    const s = Math.max(0, (point.utilization_smoothed - params.U_optimal) / Math.max(1e-6, 1 - params.U_optimal));
    const stress = MODEL_COEFFS.a * Math.pow(s, MODEL_COEFFS.p);
    return `// Stress regime\ns = (U - U*) / (1 - U*) = ${s.toFixed(4)}\nF = F_base + a * s^p\nF = ${(params.F_base * 100).toFixed(2)}% + ${(stress * 100).toFixed(2)}%\n-> Funding = ${(point.funding_rate * 100).toFixed(2)}% APR`;
  }
  const ramp = MODEL_COEFFS.b * Math.pow(Math.max(0, point.t_eff), MODEL_COEFFS.q);
  const uncapped = params.F_base + ramp;
  const capped = Math.min(uncapped, params.F_max);
  return `// Emergency regime\nF = min(F_base + b * t_eff^q, F_max)\nF = min(${(uncapped * 100).toFixed(2)}%, ${(params.F_max * 100).toFixed(2)}%)\n-> Funding = ${(capped * 100).toFixed(2)}% APR`;
}

function buildAccelCalcText(point: SimPoint | null, k: number) {
  if (!point) {
    return "// No data";
  }
  const loss = (point.loss_intensity_pct ?? (point.loss_intensity ?? 0) * 100) / 100;
  if (loss < MODEL_COEFFS.l0) {
    return `// No acceleration (l < l0)\nl = ${(loss * 100).toFixed(4)}%, l0 = ${(MODEL_COEFFS.l0 * 100).toFixed(4)}%\nm = 1.00x`;
  }
  if (loss >= MODEL_COEFFS.l1) {
    return `// Max acceleration (l >= l1)\nl = ${(loss * 100).toFixed(4)}%, l1 = ${(MODEL_COEFFS.l1 * 100).toFixed(4)}%\nm = 1 + k = ${(1 + k).toFixed(2)}x`;
  }
  const normalized = (loss - MODEL_COEFFS.l0) / Math.max(1e-9, MODEL_COEFFS.l1 - MODEL_COEFFS.l0);
  return `// Partial acceleration\nnormalized = ${normalized.toFixed(4)}\nm = 1 + k * normalized = ${(1 + k * normalized).toFixed(2)}x`;
}

function ChartCard({
  title,
  values,
  xValues,
  xLabel,
  yLabel,
}: {
  title: string;
  values: number[];
  xValues: number[];
  xLabel: string;
  yLabel: string;
}) {
  const [revealedPoints, setRevealedPoints] = useState(values.length);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const revealFrameRef = useRef<number | null>(null);

  const width = 1000;
  const height = 520;
  const leftPad = 110;
  const rightPad = 28;
  const topPad = 24;
  const bottomPad = 86;

  const yMinRaw = values.length ? Math.min(...values) : 0;
  const yMaxRaw = values.length ? Math.max(...values) : 1;
  const yPadding = (yMaxRaw - yMinRaw || 1) * 0.12;
  const yMin = yMinRaw - yPadding;
  const yMax = yMaxRaw + yPadding;
  const ySpan = Math.max(yMax - yMin, 1e-6);

  const xMin = xValues.length ? Math.min(...xValues) : 0;
  const xMax = xValues.length ? Math.max(...xValues) : 1;
  const xSpan = Math.max(xMax - xMin, 1e-6);

  const plotWidth = width - leftPad - rightPad;
  const plotHeight = height - topPad - bottomPad;

  const visibleCount = Math.max(0, Math.min(revealedPoints, values.length));
  const animatedValues = values.slice(0, visibleCount);
  const animatedX = xValues.slice(0, visibleCount);

  const points = animatedValues
    .map((v, i) => {
      const xv = animatedX[i] ?? i;
      const x = leftPad + ((xv - xMin) / xSpan) * plotWidth;
      const y = topPad + (1 - (v - yMin) / ySpan) * plotHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const t = i / 3;
    const value = yMax - t * ySpan;
    const y = topPad + t * plotHeight;
    return { value, y };
  });

  const xTicks = [
    { value: xMin, x: leftPad },
    { value: xMin + xSpan / 2, x: leftPad + plotWidth / 2 },
    { value: xMax, x: leftPad + plotWidth },
  ];

  useEffect(() => {
    if (revealFrameRef.current !== null) {
      window.cancelAnimationFrame(revealFrameRef.current);
    }

    if (!values.length) {
      setRevealedPoints(0);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setRevealedPoints(values.length);
      return;
    }

    const durationMs = Math.min(4200, Math.max(1000, values.length * 26));
    const startAt = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startAt) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const nextCount = Math.max(1, Math.round(eased * values.length));
      setRevealedPoints(nextCount);
      if (progress < 1) {
        revealFrameRef.current = window.requestAnimationFrame(animate);
      }
    };

    setRevealedPoints(1);
    revealFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (revealFrameRef.current !== null) {
        window.cancelAnimationFrame(revealFrameRef.current);
      }
    };
  }, [values, xValues]);

  function getPointPosition(index: number) {
    const xv = xValues[index] ?? index;
    const yv = values[index] ?? 0;
    const x = leftPad + ((xv - xMin) / xSpan) * plotWidth;
    const y = topPad + (1 - (yv - yMin) / ySpan) * plotHeight;
    return { x, y, xv, yv };
  }

  function handleMouseMove(event: ReactMouseEvent<SVGSVGElement>) {
    if (!visibleCount || !values.length) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const viewX = (mouseX / rect.width) * width;
    const clampedViewX = clamp(viewX, leftPad, leftPad + plotWidth);
    const hoveredDataX = xMin + ((clampedViewX - leftPad) / plotWidth) * xSpan;

    let nearest = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < visibleCount; i += 1) {
      const distance = Math.abs((xValues[i] ?? i) - hoveredDataX);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = i;
      }
    }

    setHoveredIndex(nearest);
    setTooltipPos({ x: mouseX, y: mouseY });
  }

  function handleMouseLeave() {
    setHoveredIndex(null);
    setTooltipPos(null);
  }

  const hoveredPoint = hoveredIndex !== null && hoveredIndex < values.length ? getPointPosition(hoveredIndex) : null;

  return (
    <article className="card-surface-main transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-foreground/68">{title}</p>
      <div className="relative h-[320px] rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:h-[360px]">
        {values.length ? (
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {yTicks.map((tick) => (
              <g key={`y-${tick.y}`}>
                <line
                  x1={leftPad}
                  x2={leftPad + plotWidth}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="rgba(255,255,255,0.12)"
                  strokeDasharray="6 7"
                  strokeWidth="1"
                />
                <text x={leftPad - 12} y={tick.y + 5} fontSize="20" textAnchor="end" fill="rgba(220,228,255,0.78)">
                  {tick.value.toFixed(1)}
                </text>
              </g>
            ))}
            {xTicks.map((tick) => (
              <g key={`x-${tick.x}`}>
                <line
                  x1={tick.x}
                  x2={tick.x}
                  y1={topPad}
                  y2={topPad + plotHeight}
                  stroke="rgba(255,255,255,0.09)"
                  strokeDasharray="4 8"
                  strokeWidth="1"
                />
                <text x={tick.x} y={topPad + plotHeight + 30} fontSize="19" textAnchor="middle" fill="rgba(220,228,255,0.74)">
                  {tick.value.toFixed(0)}
                </text>
              </g>
            ))}
            <line x1={leftPad} x2={leftPad} y1={topPad} y2={topPad + plotHeight} stroke="rgba(210,220,255,0.55)" strokeWidth="2" />
            <line
              x1={leftPad}
              x2={leftPad + plotWidth}
              y1={topPad + plotHeight}
              y2={topPad + plotHeight}
              stroke="rgba(210,220,255,0.55)"
              strokeWidth="2"
            />
            <polyline fill="none" stroke="rgba(130,179,255,0.95)" strokeWidth="6" points={points} />
            {hoveredPoint ? (
              <>
                <line
                  x1={hoveredPoint.x}
                  x2={hoveredPoint.x}
                  y1={topPad}
                  y2={topPad + plotHeight}
                  stroke="rgba(160,205,255,0.36)"
                  strokeWidth="1.5"
                  strokeDasharray="5 7"
                />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="7" fill="rgba(130,179,255,1)" />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="12" fill="rgba(130,179,255,0.24)" />
              </>
            ) : null}
            <text x={leftPad + plotWidth / 2} y={height - 14} fontSize="22" textAnchor="middle" fill="rgba(230,235,255,0.82)">
              {xLabel}
            </text>
            <text
              transform={`translate(28 ${topPad + plotHeight / 2}) rotate(-90)`}
              fontSize="22"
              textAnchor="middle"
              fill="rgba(230,235,255,0.82)"
            >
              {yLabel}
            </text>
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/50">No data yet.</div>
        )}
        {hoveredPoint && tooltipPos ? (
          <div
            className="pointer-events-none absolute z-20 rounded-md border border-white/20 bg-black/85 px-3 py-2 text-[12px] text-foreground shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
            style={{
              left: `${Math.min(tooltipPos.x + 14, 560)}px`,
              top: `${Math.max(tooltipPos.y - 42, 8)}px`,
            }}
          >
            <p className="leading-4 text-foreground/88">{xLabel}: {hoveredPoint.xv.toFixed(2)}</p>
            <p className="mt-0.5 leading-4 font-medium">{yLabel}: {hoveredPoint.yv.toFixed(3)}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function StepNumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const clamped = Number.isFinite(value) ? clamp(value, min, max) : min;
  const display = step < 1 ? clamped.toFixed(2) : Math.round(clamped).toString();

  function apply(next: number) {
    if (!Number.isFinite(next)) {
      return;
    }
    onChange(clamp(next, min, max));
  }

  return (
    <label className="text-sm text-foreground/82">
      {label}
      <div className="relative mt-1">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={display}
          onChange={(event) => apply(Number(event.target.value))}
          className="w-full rounded-xl border border-white/14 bg-white/[0.03] px-3 py-2 pr-[86px] text-sm text-foreground [appearance:textfield] transition hover:border-white/24 focus:border-white/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-65"
        />
        <div className="absolute inset-y-0 right-0 flex items-center rounded-r-xl border-l border-white/14 bg-white/[0.04]">
          <button
            type="button"
            className="inline-flex h-full w-10 items-center justify-center text-foreground/65 transition hover:bg-white/[0.08] hover:text-foreground focus-visible:bg-white/[0.08] focus-visible:outline-none"
            onClick={() => apply(clamped - step)}
            aria-label={`Decrease ${label}`}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="inline-flex h-full w-10 items-center justify-center border-l border-white/14 text-foreground/65 transition hover:bg-white/[0.08] hover:text-foreground focus-visible:bg-white/[0.08] focus-visible:outline-none"
            onClick={() => apply(clamped + step)}
            aria-label={`Increase ${label}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </label>
  );
}

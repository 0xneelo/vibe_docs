import Plotly from "plotly.js-dist-min";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { SiteHeader } from "@/components/SiteHeader";

const X_RANGE = 2;
const Y_RANGE = 2;
const Z_MAX = 1;
const PULL_STRENGTH = 0.06;
const NOISE_STRENGTH = 0.015;
const FRAME_MS = 35;
const N_STEPS = 250;

const APEX = { x: 0, y: 0, z: Z_MAX };

const BEHAVIOR = {
  NORMAL: 0,
  REBEL: 1,
  STRAGGLER: 2,
  WANDERER: 3,
  EARLY_RISER: 4,
  EDGE_HUGGER: 5,
} as const;

type Behavior = (typeof BEHAVIOR)[keyof typeof BEHAVIOR];

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Ball extends Vec3 {
  base: Vec3;
  angle: number;
  behavior: Behavior;
  rebelTarget: Vec3;
  lagFactor: number;
  wanderTarget: Vec3;
  wanderTimer: number;
  noiseMultiplier: number;
  pullMultiplier: number;
  zThreshold: number;
  uniformPos: { x: number; y: number };
  uniformZ: number;
  age: number;
}

interface ControlsState {
  gravity: number;
  hSpread: number;
  vSpread: number;
  zScoreLimit: number;
  outlierPct: number;
  ballCount: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function randomBasePosition(): Vec3 {
  const angle = Math.random() * 2 * Math.PI;
  const radius = Math.sqrt(Math.random()) * Math.max(X_RANGE, Y_RANGE);
  return {
    x: Math.cos(angle) * radius * (X_RANGE / Math.max(X_RANGE, Y_RANGE)),
    y: Math.sin(angle) * radius * (Y_RANGE / Math.max(X_RANGE, Y_RANGE)),
    z: 0,
  };
}

function randomVolumePosition(): Vec3 {
  return {
    x: (Math.random() - 0.5) * 2 * X_RANGE,
    y: (Math.random() - 0.5) * 2 * Y_RANGE,
    z: Math.random() * Z_MAX,
  };
}

function getNormalTargetWithForces(ball: Ball, g: number, hs: number, vs: number, zLimit: number): Vec3 {
  const maxRadius = Math.max(X_RANGE, Y_RANGE);
  const gravityFraction = g / 2;
  const hSpreadFraction = hs / 2;
  const vSpreadFraction = vs / 2;
  const zLimitFraction = zLimit / 2;

  const canGoUp = gravityFraction >= ball.zThreshold;
  const targetZ = canGoUp ? lerp(Z_MAX * zLimitFraction, ball.uniformZ * Z_MAX * zLimitFraction, vSpreadFraction) : 0;

  const baseRadius = Math.hypot(ball.base.x, ball.base.y);
  const gravityRadius = lerp(baseRadius, 0, gravityFraction);
  const gravityX = Math.cos(ball.angle) * gravityRadius * (X_RANGE / maxRadius);
  const gravityY = Math.sin(ball.angle) * gravityRadius * (Y_RANGE / maxRadius);

  return {
    x: lerp(gravityX, ball.uniformPos.x, hSpreadFraction),
    y: lerp(gravityY, ball.uniformPos.y, hSpreadFraction),
    z: targetZ,
  };
}

function getTargetPosition(ball: Ball, controls: ControlsState): Vec3 {
  const g = clamp(controls.gravity, 0, 2);
  const hs = clamp(controls.hSpread, 0, 2);
  const vs = clamp(controls.vSpread, 0, 2);
  const zLimit = clamp(controls.zScoreLimit, 0, 2);

  switch (ball.behavior) {
    case BEHAVIOR.REBEL:
      return {
        x: lerp(ball.base.x, ball.rebelTarget.x, g * 0.15),
        y: lerp(ball.base.y, ball.rebelTarget.y, g * 0.15),
        z: lerp(ball.base.z, ball.rebelTarget.z, g * 0.2),
      };
    case BEHAVIOR.WANDERER:
      return ball.wanderTarget;
    case BEHAVIOR.EDGE_HUGGER: {
      const edgeRadius = Math.max(X_RANGE, Y_RANGE) * (1 - g * 0.15);
      const edgeZ = Math.min(g * 0.4, Z_MAX * 0.5);
      return {
        x: Math.cos(ball.angle) * edgeRadius * (X_RANGE / Math.max(X_RANGE, Y_RANGE)),
        y: Math.sin(ball.angle) * edgeRadius * (Y_RANGE / Math.max(X_RANGE, Y_RANGE)),
        z: edgeZ,
      };
    }
    case BEHAVIOR.EARLY_RISER: {
      const earlyG = Math.min(2, g * 1.8);
      if (earlyG > 1) {
        return APEX;
      }
      const earlyZ = earlyG * Z_MAX * 0.9;
      const earlyRadius = (1 - earlyG * 0.8) * 0.3;
      return {
        x: Math.cos(ball.angle) * earlyRadius,
        y: Math.sin(ball.angle) * earlyRadius,
        z: earlyZ,
      };
    }
    case BEHAVIOR.STRAGGLER:
      return getNormalTargetWithForces(ball, g * ball.lagFactor, hs, vs, zLimit);
    default:
      return getNormalTargetWithForces(ball, g, hs, vs, zLimit);
  }
}

function createBalls(ballCount: number, outlierPct: number): Ball[] {
  const clampedCount = clamp(Math.round(ballCount), 50, 800);
  const clampedOutlierPct = clamp(Math.round(outlierPct), 0, 60);
  const balls: Ball[] = [];

  const rebelThresh = clampedOutlierPct * 0.22;
  const stragglerThresh = rebelThresh + clampedOutlierPct * 0.22;
  const wandererThresh = stragglerThresh + clampedOutlierPct * 0.22;
  const earlyRiserThresh = wandererThresh + clampedOutlierPct * 0.13;
  const edgeHuggerThresh = earlyRiserThresh + clampedOutlierPct * 0.22;

  for (let i = 0; i < clampedCount; i++) {
    const base = randomBasePosition();
    const angle = Math.atan2(base.y, base.x);
    const behaviorRoll = Math.random() * 100;

    let behavior: Behavior = BEHAVIOR.NORMAL;
    if (behaviorRoll < rebelThresh) {
      behavior = BEHAVIOR.REBEL;
    } else if (behaviorRoll < stragglerThresh) {
      behavior = BEHAVIOR.STRAGGLER;
    } else if (behaviorRoll < wandererThresh) {
      behavior = BEHAVIOR.WANDERER;
    } else if (behaviorRoll < earlyRiserThresh) {
      behavior = BEHAVIOR.EARLY_RISER;
    } else if (behaviorRoll < edgeHuggerThresh) {
      behavior = BEHAVIOR.EDGE_HUGGER;
    }

    const uniformMode = clampedOutlierPct === 0;
    balls.push({
      ...base,
      base,
      angle,
      behavior,
      rebelTarget: randomVolumePosition(),
      lagFactor: 0.2 + Math.random() * 0.3,
      wanderTarget: randomVolumePosition(),
      wanderTimer: 0,
      noiseMultiplier: uniformMode ? 1 : 0.5 + Math.random() * 1.5,
      pullMultiplier: uniformMode ? 1 : 0.6 + Math.random() * 0.8,
      zThreshold: Math.random(),
      uniformPos: {
        x: (Math.random() - 0.5) * 2 * X_RANGE,
        y: (Math.random() - 0.5) * 2 * Y_RANGE,
      },
      uniformZ: Math.random(),
      age: 0,
    });
  }

  return balls;
}

function stepSimulation(balls: Ball[], controls: ControlsState) {
  for (const ball of balls) {
    if (ball.behavior === BEHAVIOR.WANDERER) {
      ball.wanderTimer += 1;
      if (ball.wanderTimer > 30 + Math.random() * 40) {
        const driftStrength = controls.gravity * 0.3;
        ball.wanderTarget = {
          x: ball.wanderTarget.x * 0.7 + (Math.random() - 0.5) * X_RANGE * 0.6,
          y: ball.wanderTarget.y * 0.7 + (Math.random() - 0.5) * Y_RANGE * 0.6,
          z: clamp(ball.wanderTarget.z + (Math.random() - 0.3) * 0.3 * driftStrength, 0, Z_MAX),
        };
        ball.wanderTimer = 0;
      }
    }

    const target = getTargetPosition(ball, controls);
    const noiseScale = NOISE_STRENGTH * ball.noiseMultiplier;
    const noise = {
      x: (Math.random() - 0.5) * 2 * noiseScale,
      y: (Math.random() - 0.5) * 2 * noiseScale,
      z: (Math.random() - 0.5) * noiseScale,
    };

    if (controls.outlierPct > 0 && Math.random() < 0.01) {
      noise.x += (Math.random() - 0.5) * 0.3;
      noise.y += (Math.random() - 0.5) * 0.3;
      noise.z += (Math.random() - 0.5) * 0.15;
    }

    const effectivePull = PULL_STRENGTH * ball.pullMultiplier;
    ball.x = clamp(ball.x + (target.x - ball.x) * effectivePull + noise.x, -X_RANGE, X_RANGE);
    ball.y = clamp(ball.y + (target.y - ball.y) * effectivePull + noise.y, -Y_RANGE, Y_RANGE);
    ball.z = clamp(ball.z + (target.z - ball.z) * effectivePull + noise.z, 0, Z_MAX);
    ball.age += 1;
  }
}

function hslToHex(h: number, s: number, l: number) {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getHeightColor(z: number) {
  const t = clamp(z / Z_MAX, 0, 1);
  const hue = 280 - t * 160;
  return hslToHex(hue, 80, 55);
}

function getApexPlaneColor(x: number, y: number) {
  const maxRadius = Math.hypot(X_RANGE, Y_RANGE);
  const radius = Math.hypot(x, y);
  const hue = 120 - clamp(radius / maxRadius, 0, 1) * 120;
  return hslToHex(hue, 85, 50);
}

function getTraces(balls: Ball[]) {
  const topThreshold = 0.88;
  const belowX: number[] = [];
  const belowY: number[] = [];
  const belowZ: number[] = [];
  const belowColors: string[] = [];

  const topX: number[] = [];
  const topY: number[] = [];
  const topZ: number[] = [];
  const topColors: string[] = [];

  for (const b of balls) {
    if (b.z >= topThreshold * Z_MAX) {
      topX.push(b.x);
      topY.push(b.y);
      topZ.push(b.z);
      topColors.push(getApexPlaneColor(b.x, b.y));
    } else {
      belowX.push(b.x);
      belowY.push(b.y);
      belowZ.push(b.z);
      belowColors.push(getHeightColor(b.z));
    }
  }

  return [
    {
      x: belowX,
      y: belowY,
      z: belowZ,
      type: "scatter3d",
      mode: "markers",
      marker: { size: 5, color: belowColors, opacity: 0.9, line: { width: 0 } },
      showlegend: false,
      hovertemplate: "X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.0%}<extra></extra>",
    },
    {
      x: topX,
      y: topY,
      z: topZ,
      type: "scatter3d",
      mode: "markers",
      marker: { size: 6, color: topColors, opacity: 1, line: { width: 0 } },
      showlegend: false,
      hovertemplate: "X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.0%}<br>(Top plane)<extra></extra>",
    },
  ];
}

const plotly = Plotly as {
  newPlot: (target: HTMLDivElement, data: unknown, layout: unknown, config: unknown) => Promise<void>;
  react: (target: HTMLDivElement, data: unknown, layout: unknown, config: unknown) => Promise<void>;
  purge: (target: HTMLDivElement) => void;
};

export function ZScoreSimulatorPage() {
  const plotRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const stepRef = useRef(0);

  const [controls, setControls] = useState<ControlsState>({
    gravity: 1,
    hSpread: 0.2,
    vSpread: 0.35,
    zScoreLimit: 2,
    outlierPct: 23,
    ballCount: 300,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const completion = useMemo(() => Math.round((currentStep / N_STEPS) * 100), [currentStep]);
  const topPlanePct = useMemo(() => {
    if (!ballsRef.current.length) {
      return 0;
    }
    const topCount = ballsRef.current.filter((b) => b.z >= 0.88).length;
    return Math.round((topCount / ballsRef.current.length) * 100);
  }, [currentStep]);

  const layout = useMemo(
    () => ({
      margin: { l: 0, r: 0, t: 44, b: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: { text: "Cone Traversal: Markets converge upward", font: { color: "rgba(235,240,255,0.94)", size: 16 } },
      scene: {
        xaxis: { title: "Project field X", gridcolor: "rgba(148,163,184,0.25)", range: [-X_RANGE, X_RANGE] },
        yaxis: { title: "Project field Y", gridcolor: "rgba(148,163,184,0.25)", range: [-Y_RANGE, Y_RANGE] },
        zaxis: {
          title: "Systemic leverage (%)",
          gridcolor: "rgba(148,163,184,0.25)",
          range: [0, Z_MAX],
          tickvals: [0, 0.2, 0.4, 0.6, 0.8, 1],
          ticktext: ["0%", "20%", "40%", "60%", "80%", "100%"],
        },
        aspectmode: "cube",
        camera: { eye: { x: 1.8, y: 1.8, z: 1 } },
      },
    }),
    [],
  );

  const config = useMemo(() => ({ responsive: true, displaylogo: false }), []);

  function renderPlot() {
    if (!plotRef.current) {
      return;
    }
    void plotly.react(plotRef.current, getTraces(ballsRef.current), layout, config);
  }

  function resetBalls(nextControls = controls) {
    ballsRef.current = createBalls(nextControls.ballCount, nextControls.outlierPct);
    stepRef.current = 0;
    setCurrentStep(0);
    renderPlot();
  }

  function stopAnimation() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
  }

  function tick() {
    if (stepRef.current >= N_STEPS) {
      stopAnimation();
      return;
    }
    stepSimulation(ballsRef.current, controls);
    stepRef.current += 1;
    setCurrentStep(stepRef.current);
    renderPlot();
    timerRef.current = window.setTimeout(tick, FRAME_MS);
  }

  function runSimulation() {
    if (isRunning) {
      return;
    }
    resetBalls();
    setIsRunning(true);
    setIsPaused(false);
    timerRef.current = window.setTimeout(tick, FRAME_MS);
  }

  function pauseOrResume() {
    if (!isRunning) {
      return;
    }
    if (isPaused) {
      setIsPaused(false);
      timerRef.current = window.setTimeout(tick, FRAME_MS);
      return;
    }
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
  }

  useEffect(() => {
    if (!plotRef.current) {
      return;
    }
    ballsRef.current = createBalls(controls.ballCount, controls.outlierPct);
    void plotly.newPlot(plotRef.current, getTraces(ballsRef.current), layout, config);
    return () => {
      stopAnimation();
      if (plotRef.current) {
        plotly.purge(plotRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRunning) {
      return;
    }
    resetBalls(controls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.ballCount, controls.outlierPct, controls.gravity, controls.hSpread, controls.vSpread, controls.zScoreLimit]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-[30px] border border-white/14 bg-[linear-gradient(150deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_45%,rgba(43,116,255,0.08))] p-4 shadow-[0_22px_70px_rgba(9,16,46,0.45)] sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/12 bg-black/20 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/62">Z-score lab</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                  Cone Traversal Market Simulator
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-white/16 bg-white/[0.08] px-3 py-1 text-foreground/84">Progress {completion}%</span>
                <span className="rounded-full border border-emerald-200/28 bg-emerald-300/14 px-3 py-1 text-emerald-100/95">
                  Top plane {topPlanePct}%
                </span>
                <span className="rounded-full border border-sky-200/25 bg-sky-300/14 px-3 py-1 text-sky-100/95">
                  Step {currentStep}/{N_STEPS}
                </span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
              <aside className="space-y-4">
                <div className="rounded-2xl border border-emerald-200/22 bg-emerald-300/[0.1] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100/92">Traversal states</p>
                  <ul className="mt-3 space-y-2.5 text-sm leading-6 text-foreground/80">
                    <li>Base: fragmented bilateral markets with siloed margin.</li>
                    <li>Mid: inward drift, partial netting, lower coordination drag.</li>
                    <li>Apex: globally margined and netted system-level structure.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/62">Model notes</p>
                  <ul className="mt-3 space-y-2 text-sm text-foreground/75">
                    <li>Outliers model behavior under adverse coordination.</li>
                    <li>Gravity captures systemic pull toward shared infrastructure.</li>
                    <li>Horizontal/vertical spread controls field dispersion.</li>
                  </ul>
                </div>
              </aside>

              <section className="rounded-2xl border border-white/16 bg-black/22 p-3 shadow-[0_14px_44px_rgba(8,12,34,0.46)]">
                <div className="rounded-xl border border-white/12 bg-white/[0.02] p-2">
                  <div ref={plotRef} className="h-[560px] w-full" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={runSimulation}
                    disabled={isRunning}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-200/35 bg-sky-300/20 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-sky-300/30 disabled:opacity-60"
                  >
                    <Play className="h-4 w-4" />
                    Run
                  </button>
                  <button
                    type="button"
                    onClick={pauseOrResume}
                    disabled={!isRunning}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.05] px-4 py-2 text-sm font-medium text-foreground/92 transition hover:bg-white/[0.1] disabled:opacity-50"
                  >
                    <Pause className="h-4 w-4" />
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopAnimation();
                      resetBalls();
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.05] px-4 py-2 text-sm font-medium text-foreground/92 transition hover:bg-white/[0.1]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </section>

              <aside className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-foreground/65">Control deck</p>
                <div className="space-y-3">
                  <RangeField
                    label="Gravity"
                    min={0}
                    max={2}
                    step={0.01}
                    value={controls.gravity}
                    disabled={isRunning}
                    onChange={(value) => setControls((prev) => ({ ...prev, gravity: value }))}
                  />
                  <RangeField
                    label="H-spread"
                    min={0}
                    max={2}
                    step={0.01}
                    value={controls.hSpread}
                    disabled={isRunning}
                    onChange={(value) => setControls((prev) => ({ ...prev, hSpread: value }))}
                  />
                  <RangeField
                    label="V-spread"
                    min={0}
                    max={2}
                    step={0.01}
                    value={controls.vSpread}
                    disabled={isRunning}
                    onChange={(value) => setControls((prev) => ({ ...prev, vSpread: value }))}
                  />
                  <RangeField
                    label="Z-score limit"
                    min={0}
                    max={2}
                    step={0.01}
                    value={controls.zScoreLimit}
                    disabled={isRunning}
                    onChange={(value) => setControls((prev) => ({ ...prev, zScoreLimit: value }))}
                  />
                  <RangeField
                    label="Outlier %"
                    min={0}
                    max={60}
                    step={1}
                    value={controls.outlierPct}
                    disabled={isRunning}
                    onChange={(value) => setControls((prev) => ({ ...prev, outlierPct: Math.round(value) }))}
                  />
                  <RangeField
                    label="Ball count"
                    min={50}
                    max={800}
                    step={10}
                    value={controls.ballCount}
                    disabled={isRunning}
                    onChange={(value) => setControls((prev) => ({ ...prev, ballCount: Math.round(value) }))}
                  />
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  disabled,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const displayValue = value.toFixed(step < 1 ? 2 : 0);
  const pct = ((value - min) / Math.max(max - min, 1e-9)) * 100;
  const sliderStyle = {
    "--slider-pct": `${clamp(pct, 0, 100)}%`,
  } as CSSProperties;

  return (
    <label className="block rounded-xl border border-white/14 bg-white/[0.04] px-3.5 py-2.5 shadow-[0_2px_8px_rgba(10,10,18,0.24)]">
      <p className="text-[0.9rem] font-medium tracking-[-0.01em] text-foreground/90">{label}</p>
      <div className="mt-2.5 flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          style={sliderStyle}
          className="PB-range-slider PB-range-slider--themed PB-range-slider--figma w-full disabled:cursor-not-allowed disabled:opacity-55"
        />
        <span className="PB-range-slidervalue min-w-[64px] text-right text-sm tabular-nums text-foreground/88">
          {displayValue}
        </span>
      </div>
    </label>
  );
}

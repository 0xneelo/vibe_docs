import { ArrowUpRight, Sigma, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const simulatorLinks = [
  {
    label: "Funding Model Chapter",
    description: "Read assumptions, formulas, and section breakdown",
    to: "/chapters/15-funding-model",
  },

  {
    label: "Abstract",
    description: "We specify a solver-managed perp market system where the primary objective is to maximize global returns and minimize localized risk",
    to: "/docs/15-funding-model/15-docs/00-abstract",
  },
  {
    label: "Bell Curve Flattening",
    description: "As we expect some markets to have big trader wins and some to have big trader losses we can flatten the distribution by transferring PnL from the right tail, to the left tail (losing markets).",
    to: "/docs/15-funding-model/15-docs/06-bell-curve-flattening",
  },

];

export function FundingModelTeaserSection() {
  return (
    <section className="relative z-20 w-full px-4 pt-6 pb-20 sm:pt-8 sm:pb-24">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-black/35 p-4 shadow-glow backdrop-blur-md sm:p-6">
        <div className="grid gap-8 sm:gap-9 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:p-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/72">
                <Sparkles className="h-3.5 w-3.5" />
                New in Library
              </p>
              <h3 className="mt-4 max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
                Funding Rate Model: full derivation, defense layers, and charted scenarios.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/74 sm:text-[15px]">
              Explore our two simulator environments: the Funding Simulator for regime and PnL dynamics, and the Z-Score Cone
              Traversal Simulator for market-structure convergence behavior.
              </p>
             
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/simulations/funding"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/[0.12]"
                >
                  Open Funding Simulator
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/simulations/z-score"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/14 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground/90 transition hover:border-white/24 hover:bg-white/[0.08]"
                >
                  Open Z-Score Simulator
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

             
              </div>
            </div>

            <div className="rounded-2xl border border-white/12 bg-black/30 p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-foreground/60">
                Read up on our high level derivation and liquidity logic:
              </p>
              <div className="mt-3 grid gap-2.5">
                {simulatorLinks.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm text-foreground/85 transition hover:border-white/20 hover:bg-white/[0.09]"
                  >
                    <span>
                      <span className="block">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-foreground/58">{item.description}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 opacity-65 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-foreground/55">
                Built for protocol researchers who want live experimentation and formal chapter context in one place.
              </p>
            </div>
          </div>
      </div>
    </section>
  );
}

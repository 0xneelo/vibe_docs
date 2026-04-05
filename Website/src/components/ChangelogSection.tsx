import { ArrowUpRight, Newspaper } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { ChangelogList } from "@/components/ChangelogList";
import { changelogEntriesResolved } from "@/data/changelog";

export function ChangelogSection() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/" || location.hash !== "#whats-new") {
      return;
    }
    const el = document.getElementById("whats-new");
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [location.hash, location.pathname]);

  return (
    <section
      id="whats-new"
      className="relative z-20 w-full px-4 pb-6 pt-2 sm:pb-8 sm:pt-4"
      aria-labelledby="changelog-heading"
    >
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[30px] border border-white/10 bg-black/35 p-4 shadow-glow backdrop-blur-md sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="max-w-md shrink-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/72">
              <Newspaper className="h-3.5 w-3.5" />
              What&apos;s new
            </p>
            <h2
              id="changelog-heading"
              className="mt-3 text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl"
            >
              Latest updates to the paper and site
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground/68">
              Copy and links live in{" "}
              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-[12px] text-foreground/80">
                src/data/changelog.ts
              </code>
              . Dates use the latest{" "}
              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-[12px] text-foreground/80">
                git log
              </code>{" "}
              on mapped paths (
              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-[12px] text-foreground/80">
                scripts/changelog_git_paths.json
              </code>
              ), then{" "}
              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-[12px] text-foreground/80">dateManual</code> if
              git has no commit for that path yet. A cookie stores your last visit so we can highlight what&apos;s new.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <Link
                to="/changelog"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/88 underline decoration-white/25 underline-offset-4 transition hover:decoration-white/50"
              >
                Full changelog
                <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
              </Link>
              <Link
                to="/library"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 underline decoration-white/20 underline-offset-4 transition hover:decoration-white/45"
              >
                Library
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </div>
          </div>

          <ChangelogList entries={changelogEntriesResolved} limit={12} variant="compact" />
        </div>
      </div>
    </section>
  );
}

import { ArrowUpRight, Newspaper } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

import { changelogEntriesResolved } from "@/data/changelog";

function formatChangelogDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ChangelogSection() {
  const location = useLocation();
  const sorted = useMemo(
    () => [...changelogEntriesResolved].sort((a, b) => b.date.localeCompare(a.date)),
    [],
  );
  const visible = sorted.slice(0, 8);

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
              ), then <code className="rounded bg-white/[0.08] px-1 py-0.5 text-[12px] text-foreground/80">dateManual</code>{" "}
              if git has no commit for that path yet.
            </p>
            <Link
              to="/library"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/88 underline decoration-white/25 underline-offset-4 transition hover:decoration-white/50"
            >
              Full library
              <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
            </Link>
          </div>

          <ul className="min-w-0 flex-1 space-y-0 divide-y divide-white/10">
            {visible.map((entry) => (
              <li key={entry.id} className="py-3.5 first:pt-0 sm:py-4">
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-4">
                  <time
                    dateTime={entry.date}
                    className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/50"
                  >
                    {formatChangelogDate(entry.date)}
                  </time>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold tracking-[-0.02em] text-foreground">{entry.title}</p>
                    <p className="mt-1 text-sm leading-6 text-foreground/65">{entry.description}</p>
                    {entry.href ? (
                      <p className="mt-2">
                        {entry.href.startsWith("http") ? (
                          <a
                            href={entry.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/90 transition hover:text-foreground"
                          >
                            {entry.linkLabel ?? "Details"}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-75" />
                          </a>
                        ) : (
                          <Link
                            to={entry.href}
                            className="inline-flex items-center gap-1 text-sm font-medium text-foreground/90 transition hover:text-foreground"
                          >
                            {entry.linkLabel ?? "Details"}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-75" />
                          </Link>
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

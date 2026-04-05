import { ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { usePreviousVisitDay } from "@/context/LastVisitContext";
import type { ChangelogEntryResolved } from "@/data/changelog";

export function formatChangelogDate(isoDay: string): string {
  const [y, m, d] = isoDay.split("-").map(Number);
  if (!y || !m || !d) return isoDay;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isEntryNewSinceVisit(entryDate: string, previousVisitDay: string | null): boolean {
  if (!previousVisitDay) {
    return false;
  }
  return entryDate > previousVisitDay;
}

type ChangelogListProps = {
  entries: ChangelogEntryResolved[];
  /** If set, only show this many rows (after sort). */
  limit?: number;
  variant?: "compact" | "full";
};

export function ChangelogList({ entries, limit, variant = "compact" }: ChangelogListProps) {
  const previousVisitDay = usePreviousVisitDay();

  const { sorted, markerIndex, newCount, allNewSinceVisit } = useMemo(() => {
    const sortedInner = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const sliced = typeof limit === "number" ? sortedInner.slice(0, limit) : sortedInner;

    let markerIdx: number | null = null;
    if (previousVisitDay) {
      const idx = sliced.findIndex((e) => e.date <= previousVisitDay);
      markerIdx = idx === -1 ? null : idx;
    }

    const newCnt = previousVisitDay
      ? sliced.filter((e) => e.date > previousVisitDay).length
      : 0;

    const allNew =
      Boolean(previousVisitDay) && sliced.length > 0 && newCnt === sliced.length;

    return {
      sorted: sliced,
      markerIndex: markerIdx,
      newCount: newCnt,
      allNewSinceVisit: allNew,
    };
  }, [entries, limit, previousVisitDay]);

  const pillNew =
    variant === "full"
      ? "rounded-full border border-amber-400/35 bg-amber-400/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-100/95"
      : "rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-amber-100/90";

  const pillMarker =
    variant === "full"
      ? "rounded-full border border-sky-400/35 bg-sky-500/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-sky-100/95"
      : "rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-sky-100/90";

  const dateClass =
    variant === "full"
      ? "shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-foreground/50"
      : "shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/50";

  return (
    <div className="min-w-0 flex-1">
      {allNewSinceVisit ? (
        <p
          className={
            variant === "full"
              ? "mb-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3 text-sm text-foreground/80"
              : "mb-3 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-xs text-foreground/75"
          }
        >
          Every update in this list is <span className="font-semibold text-foreground/90">new</span> since your
          last visit ({formatChangelogDate(previousVisitDay!)}).
        </p>
      ) : null}

      {!allNewSinceVisit && newCount > 0 && variant === "full" ? (
        <p className="mb-4 text-sm text-foreground/65">
          <span className="font-semibold text-foreground/88">{newCount}</span>{" "}
          {newCount === 1 ? "update" : "updates"} since your last visit
          {previousVisitDay ? ` (${formatChangelogDate(previousVisitDay)})` : ""}.
        </p>
      ) : null}

      <ul className="space-y-0 divide-y divide-white/10">
        {sorted.map((entry, index) => {
          const isNew = isEntryNewSinceVisit(entry.date, previousVisitDay);
          const showMarker = markerIndex !== null && index === markerIndex;

          return (
            <li key={entry.id} className={variant === "full" ? "py-5 first:pt-0 sm:py-6" : "py-3.5 first:pt-0 sm:py-4"}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
                <time dateTime={entry.date} className={dateClass}>
                  {formatChangelogDate(entry.date)}
                </time>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={
                        variant === "full"
                          ? "text-lg font-semibold tracking-[-0.02em] text-foreground"
                          : "font-semibold tracking-[-0.02em] text-foreground"
                      }
                    >
                      {entry.title}
                    </p>
                    {isNew ? <span className={pillNew}>Since your last visit</span> : null}
                    {showMarker ? (
                      <span className={pillMarker} title="Newest item you had already seen on your last visit">
                        Last time you were here
                      </span>
                    ) : null}
                  </div>
                  <p
                    className={
                      variant === "full"
                        ? "mt-2 text-[15px] leading-7 text-foreground/68"
                        : "mt-1 text-sm leading-6 text-foreground/65"
                    }
                  >
                    {entry.description}
                  </p>
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
          );
        })}
      </ul>
    </div>
  );
}

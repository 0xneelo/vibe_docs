import { Filter, X } from "lucide-react";

import {
  CHANGELOG_IMPACT_LABELS,
  CHANGELOG_TAG_LABELS,
  type ChangelogFiltersState,
  type ChangelogImpact,
  collectDistinctTags,
  defaultChangelogFilters,
} from "@/data/changelogMeta";
import type { ChangelogFilterable } from "@/data/changelogMeta";
import { cn } from "@/lib/utils";

type ChangelogFiltersProps = {
  entries: ChangelogFilterable[];
  filters: ChangelogFiltersState;
  onChange: (next: ChangelogFiltersState) => void;
  filteredCount: number;
  totalCount: number;
  /** Narrow sticky column: vertical control groups, full-width toggles. */
  variant?: "default" | "sidebar";
};

export function ChangelogFilters({
  entries,
  filters,
  onChange,
  filteredCount,
  totalCount,
  variant = "default",
}: ChangelogFiltersProps) {
  const isSidebar = variant === "sidebar";
  const distinctTags = collectDistinctTags(entries);
  const hasActiveFilters =
    filters.impact !== "all" ||
    filters.tags.size > 0 ||
    filters.newChapterOnly ||
    filters.newSectionOnly;

  const setImpact = (impact: ChangelogFiltersState["impact"]) => {
    onChange({ ...filters, impact });
  };

  const toggleTag = (tag: string) => {
    const next = new Set(filters.tags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    onChange({ ...filters, tags: next });
  };

  const clear = () => {
    onChange(defaultChangelogFilters());
  };

  return (
    <div
      className={cn(
        "space-y-4",
        isSidebar
          ? ""
          : "mb-6 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground/85">
          <Filter className="h-4 w-4 shrink-0 text-foreground/55" aria-hidden />
          Filters
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-lg border border-white/14 px-2.5 py-1 text-xs font-medium text-foreground/75 transition hover:border-white/25 hover:bg-white/[0.06]"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/50">Impact</p>
        <div
          className={cn(
            "flex gap-2",
            isSidebar ? "flex-wrap lg:flex-col lg:flex-nowrap" : "flex-wrap",
          )}
        >
          {(["all", "major", "medium", "minor"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setImpact(key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                isSidebar && "lg:w-full lg:text-center",
                filters.impact === key
                  ? "border-white/35 bg-white/[0.12] text-foreground"
                  : "border-white/12 bg-white/[0.03] text-foreground/75 hover:border-white/22 hover:bg-white/[0.07]",
              )}
            >
              {key === "all" ? "All sizes" : CHANGELOG_IMPACT_LABELS[key as ChangelogImpact]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/50">Tags</p>
        <div
          className={cn(
            "flex gap-2",
            isSidebar ? "flex-wrap lg:flex-col lg:flex-nowrap" : "flex-wrap",
          )}
        >
          {distinctTags.map((tag) => {
            const active = filters.tags.has(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                  isSidebar && "lg:w-full lg:text-center",
                  active
                    ? "border-violet-400/45 bg-violet-500/15 text-foreground"
                    : "border-white/10 bg-white/[0.02] text-foreground/70 hover:border-white/18",
                )}
              >
                {CHANGELOG_TAG_LABELS[tag as keyof typeof CHANGELOG_TAG_LABELS] ?? tag}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          "flex gap-4",
          isSidebar ? "flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col lg:gap-3" : "flex-wrap",
        )}
      >
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/78">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/25 bg-white/[0.04] text-violet-500 focus:ring-violet-500/40"
            checked={filters.newChapterOnly}
            onChange={(e) => onChange({ ...filters, newChapterOnly: e.target.checked })}
          />
          New chapter only
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/78">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/25 bg-white/[0.04] text-violet-500 focus:ring-violet-500/40"
            checked={filters.newSectionOnly}
            onChange={(e) => onChange({ ...filters, newSectionOnly: e.target.checked })}
          />
          New section only
        </label>
      </div>

      <p className="text-xs text-foreground/55">
        Showing <span className="font-semibold text-foreground/80">{filteredCount}</span> of{" "}
        <span className="text-foreground/70">{totalCount}</span> updates
      </p>

      <div
        className="border-t border-white/10 pt-4"
        role="note"
        aria-label="What each filter means"
      >
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/45">
          How filters work
        </p>
        <dl className="space-y-2.5 text-[11px] leading-snug text-foreground/55">
          <div>
            <dt className="font-medium text-foreground/72">Impact</dt>
            <dd className="mt-0.5">
              Rough size of the release for readers—major is large or structural, medium is a clear slice of work, minor
              is small fixes or light edits.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground/72">Tags</dt>
            <dd className="mt-0.5">
              Topic buckets we assign per row. With several tags selected, an entry is kept if it matches{" "}
              <strong className="font-medium text-foreground/68">any</strong> of them (OR), not all.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground/72">New chapter only</dt>
            <dd className="mt-0.5">Limits the list to updates that shipped a whole new library chapter or collection.</dd>
          </div>
          <div>
            <dt className="font-medium text-foreground/72">New section only</dt>
            <dd className="mt-0.5">
              Keeps entries that added a new section or a substantial new page inside material that was already
              published.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

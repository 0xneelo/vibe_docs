import { useMemo, useState } from "react";

import { ChangelogFilters } from "@/components/ChangelogFilters";
import { ChangelogList, formatChangelogDate } from "@/components/ChangelogList";
import { SiteHeader } from "@/components/SiteHeader";
import { usePreviousVisitDay } from "@/context/LastVisitContext";
import { changelogEntriesResolved } from "@/data/changelog";
import {
  defaultChangelogFilters,
  filterChangelogEntries,
  type ChangelogFiltersState,
} from "@/data/changelogMeta";

export function ChangelogPage() {
  const previousVisitDay = usePreviousVisitDay();
  const [filters, setFilters] = useState<ChangelogFiltersState>(defaultChangelogFilters);

  const filteredEntries = useMemo(
    () => filterChangelogEntries(changelogEntriesResolved, filters),
    [filters],
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <SiteHeader />

        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="mb-8 lg:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">Site</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">Changelog</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/65">
              Every paper and product update we publish here. Each row includes an{" "}
              <strong className="font-semibold text-foreground/85">impact</strong> level,{" "}
              <strong className="font-semibold text-foreground/85">tags</strong>, optional{" "}
              <strong className="font-semibold text-foreground/85">file counts</strong> (approximate), and flags for
              brand-new chapters vs new sections. Dates still come from git where mapped; see{" "}
              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-[13px] text-foreground/80">changelog.ts</code>.
            </p>
            {previousVisitDay ? (
              <p className="mt-3 text-sm text-foreground/58">
                Your last recorded visit (UTC day):{" "}
                <span className="font-medium text-foreground/80">{formatChangelogDate(previousVisitDay)}</span>. We store
                that in a first-party cookie so we can label what changed since then.
              </p>
            ) : (
              <p className="mt-3 text-sm text-foreground/58">
                First visit in this browser: we will remember today&apos;s timestamp for next time (cookie, first-party,
                one year).
              </p>
            )}
          </section>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
            <aside
              className="card-surface-sidebar flex w-full shrink-0 flex-col overflow-hidden lg:sticky lg:top-24 lg:z-30 lg:max-h-[calc(100vh-7rem)] lg:w-64 xl:w-[17.5rem]"
              aria-label="Changelog filters"
            >
              <div className="reader-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-5 lg:overscroll-contain">
                <ChangelogFilters
                  variant="sidebar"
                  entries={changelogEntriesResolved}
                  filters={filters}
                  onChange={setFilters}
                  filteredCount={filteredEntries.length}
                  totalCount={changelogEntriesResolved.length}
                />
              </div>
            </aside>

            <section className="card-surface-main min-w-0 flex-1 p-5 sm:p-8">
              <ChangelogList entries={filteredEntries} variant="full" showMeta />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

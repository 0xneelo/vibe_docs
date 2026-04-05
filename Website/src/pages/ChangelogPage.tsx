import { ChangelogList, formatChangelogDate } from "@/components/ChangelogList";
import { SiteHeader } from "@/components/SiteHeader";
import { usePreviousVisitDay } from "@/context/LastVisitContext";
import { changelogEntriesResolved } from "@/data/changelog";

export function ChangelogPage() {
  const previousVisitDay = usePreviousVisitDay();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <SiteHeader />

        <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">Site</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">Changelog</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/65">
              Every paper and product update we publish here. Dates prefer the latest git commit on linked paths; see{" "}
              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-[13px] text-foreground/80">changelog.ts</code>{" "}
              and{" "}
              <code className="rounded bg-white/[0.08] px-1 py-0.5 text-[13px] text-foreground/80">
                changelog_git_paths.json
              </code>
              .
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

          <section className="card-surface-main p-5 sm:p-8">
            <ChangelogList entries={changelogEntriesResolved} variant="full" />
          </section>
        </main>
      </div>
    </div>
  );
}

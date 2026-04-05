/**
 * Site changelog — home “What’s new”, notification bar, sorted by resolved date.
 *
 * **Dates are hybrid:**
 * - For each `id` listed in `Website/scripts/changelog_git_paths.json`, `prebuild` runs
 *   `git log -1 --format=%cs -- <paths>` and writes `changelog-dates.generated.json`.
 * - If git returns nothing (path never committed, shallow clone, etc.), we use `dateManual`
 *   (`YYYY-MM-DD`).
 *
 * Remote GitHub shows the same commit dates as your local repo after you push; we do not call the
 * GitHub API.
 */
import rawDatesFile from "./changelog-dates.generated.json";

const gitDates: Record<string, string> =
  (rawDatesFile as { dates?: Record<string, string> }).dates ?? {};

export type ChangelogEntry = {
  /** Stable id; must match a key in changelog_git_paths.json when using git dates */
  id: string;
  /** Fallback when git produces no date for this id */
  dateManual?: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
};

export function resolveChangelogDate(entry: ChangelogEntry): string {
  const fromGit = gitDates[entry.id];
  if (fromGit) return fromGit;
  if (entry.dateManual) return entry.dateManual;
  return "1970-01-01";
}

export type ChangelogEntryResolved = ChangelogEntry & { date: string };

export const changelogEntries: ChangelogEntry[] = [
  {
    id: "listing-additional",
    dateManual: "2026-04-05",
    title: "Chapter 16: Listing Additional Notes",
    description:
      "Order-book bootstrap (dYdX MegaVault, Hyperliquid cadence), GMX-style pool limits, Percolator/Perk.fund wave, and async-tech vs sync-economics.",
    href: "/collections/16-listing-additional",
    linkLabel: "Open chapter",
  },
  {
    id: "site-collection-landing",
    dateManual: "2026-04-05",
    title: "Chapter landing pages show full README intros",
    description:
      "Collection overviews no longer strip the first paragraph, so chapter blurbs and tables of contents render on /collections again.",
    href: "/library",
    linkLabel: "Browse library",
  },
  {
    id: "listing-monopoly-4z",
    dateManual: "2026-04-05",
    title: "Listing Monopoly: Section 4Z (listing + liquidity)",
    description:
      "Clarifies that durable power is listing plus zero-cost-style liquidity generation, not permissionless symbols alone.",
    href: "/docs/03-listing-monopoly/03-docs/04z-listing-and-liquidity-thesis",
    linkLabel: "Read section",
  },
  {
    id: "funding-model",
    dateManual: "2026-03-31",
    title: "Funding Rate Model chapter & simulators",
    description:
      "Formal derivation, defensive controls, Funding Simulator and Z-Score cone traversal for hands-on exploration.",
    href: "/collections/15-funding-model",
    linkLabel: "Funding chapter",
  },
];

export const changelogEntriesResolved: ChangelogEntryResolved[] = changelogEntries.map((entry) => ({
  ...entry,
  date: resolveChangelogDate(entry),
}));

/**
 * Site changelog — home “What’s new”, notification bar, sorted by resolved date.
 *
 * **This list is curated:** add a row when you ship something user-visible. Use `impact`, `tags`,
 * `filesChanged` (approximate file count from `git show --shortstat` when relevant), and
 * `newChapter` / `newSection` so filters and badges stay meaningful.
 *
 * **Dates are hybrid:** see `changelog-dates.generated.json` from `changelog_git_paths.json` + `dateManual`.
 */
import rawDatesFile from "./changelog-dates.generated.json";

import type { ChangelogImpact, ChangelogTag } from "./changelogMeta";

const gitDates: Record<string, string> =
  (rawDatesFile as { dates?: Record<string, string> }).dates ?? {};

export type ChangelogEntry = {
  id: string;
  dateManual?: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  /** Rough size of the change for readers and filters. */
  impact: ChangelogImpact;
  /** Filterable categories (see `CHANGELOG_TAG_LABELS` in changelogMeta). */
  tags: ChangelogTag[];
  /** Approximate number of files touched (from git stats or estimate). Omit if unknown. */
  filesChanged?: number;
  /** Entire new chapter/collection landed. */
  newChapter?: boolean;
  /** New section or substantial new file inside an existing chapter. */
  newSection?: boolean;
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
    href: "/chapters/16-listing-additional",
    linkLabel: "Open chapter",
    impact: "major",
    tags: ["docs", "chapter", "listing"],
    filesChanged: 27,
    newChapter: true,
  },
  {
    id: "site-collection-landing",
    dateManual: "2026-04-05",
    title: "Chapter landing pages show full README intros",
    description:
      "Collection overviews no longer strip the first paragraph, so chapter blurbs and tables of contents render on /chapters again.",
    href: "/library",
    linkLabel: "Browse library",
    impact: "medium",
    tags: ["website"],
    filesChanged: 3,
  },
  {
    id: "listing-monopoly-4z",
    dateManual: "2026-04-05",
    title: "Listing Monopoly: Section 4Z (listing + liquidity)",
    description:
      "Clarifies that durable power is listing plus zero-cost-style liquidity generation, not permissionless symbols alone.",
    href: "/docs/03-listing-monopoly/03-docs/04z-listing-and-liquidity-thesis",
    linkLabel: "Read section",
    impact: "medium",
    tags: ["docs", "listing", "chapter"],
    filesChanged: 8,
    newSection: true,
  },
  {
    id: "funding-model",
    dateManual: "2026-03-31",
    title: "Funding Rate Model chapter & simulators",
    description:
      "Formal derivation and defensive controls; local TypeScript and optional API funding simulators; Z-score cone traversal UI; major docs structure refresh around the funding chapter.",
    href: "/chapters/15-funding-model",
    linkLabel: "Funding chapter",
    impact: "major",
    tags: ["docs", "chapter", "funding", "simulators"],
    filesChanged: 45,
    newSection: true,
  },
  {
    id: "homepage-katex-apr1",
    dateManual: "2026-04-01",
    title: "Homepage hero refresh and math-aware docs rendering",
    description:
      "Vibe Paper positioning, equation-like markdown code blocks upgraded to KaTeX display math, quieter reader styling, and clearer simulation copy hierarchy.",
    href: "/",
    linkLabel: "Home",
    impact: "medium",
    tags: ["website", "homepage", "docs"],
    filesChanged: 6,
  },
  {
    id: "site-home-mar30",
    dateManual: "2026-03-30",
    title: "Market velocity homepage, mobile nav, and GitHub Pages routing",
    description:
      "Social proof ticker and video layering, responsive chapter and simulation dropdowns, basename-aware SPA routing for `/vibe_docs/`, and a rebuilt docs website shell.",
    href: "/",
    linkLabel: "Home",
    impact: "major",
    tags: ["website", "homepage"],
    filesChanged: 22,
  },
  {
    id: "symm-case-mar26",
    dateManual: "2026-03-26",
    title: "SYMM LP case study: reconciled metrics",
    description:
      "Public SYMM liquidity-provider case study updated with exact deposits, yield metrics, and benchmark reconciliation.",
    href: "/chapters/12-case-study-symm-lp",
    linkLabel: "Case study",
    impact: "minor",
    tags: ["docs", "case-study"],
    filesChanged: 9,
  },
  {
    id: "drafts-restructure-mar9",
    dateManual: "2026-03-09",
    title: "Vibe paper drafts, figures, and folder restructure",
    description:
      "New draft material and assets under `Docs/public`, with a cleaner chapter folder layout for ongoing writing.",
    href: "/library",
    linkLabel: "Library",
    impact: "medium",
    tags: ["docs", "bootstrap"],
    filesChanged: 18,
  },
  {
    id: "orderbook-series-mar7",
    dateManual: "2026-03-07",
    title: "Order book essay series and docs standardization",
    description:
      "Ode to the order book (parts 1–2) and related structure work: consistent numbering, navigation, and removal of stale TODO trees.",
    href: "/chapters/04-ode-to-the-orderbook",
    linkLabel: "Order book (part 1)",
    impact: "major",
    tags: ["docs", "order-book", "chapter"],
    filesChanged: 24,
    newChapter: true,
  },
  {
    id: "info-convergence-feb28",
    dateManual: "2026-02-28",
    title: "Information–trade convergence dissertation",
    description:
      "New dissertation chapter on information and trade convergence, plus framework and due-diligence questionnaire realignment.",
    href: "/chapters/14-information-trade-convergence",
    linkLabel: "Open chapter",
    impact: "major",
    tags: ["docs", "dissertation", "chapter"],
    filesChanged: 16,
    newSection: true,
  },
  {
    id: "repo-bootstrap-feb27",
    dateManual: "2026-02-27",
    title: "Public docs repository bootstrap",
    description:
      "Initial open-source drop: Z-score perp taxonomy, proof of value, USDC vs token-margined perps, listing game theory, pillars, and the first wave of Vibe papers.",
    href: "/library",
    linkLabel: "Library",
    impact: "major",
    tags: ["docs", "bootstrap", "chapter"],
    filesChanged: 80,
    newChapter: true,
  },
];

export const changelogEntriesResolved: ChangelogEntryResolved[] = changelogEntries.map((entry) => ({
  ...entry,
  date: resolveChangelogDate(entry),
}));

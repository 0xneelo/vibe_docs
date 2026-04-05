/**
 * Site changelog — home “What’s new”, notification bar, sorted by resolved date.
 *
 * **This list is curated:** add a row when you ship something user-visible. Many historical rows
 * below were summarized from `git log` so the page is not empty; keep extending the array as you
 * publish more chapters or site changes.
 *
 * **Dates are hybrid:**
 * - For each `id` in `Website/scripts/changelog_git_paths.json`, prebuild runs `git log` and
 *   writes `changelog-dates.generated.json`.
 * - Otherwise `dateManual` is the calendar day (often from the relevant commit date).
 *
 * Remote GitHub matches local git after push; we do not call the GitHub API.
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
      "Formal derivation and defensive controls; local TypeScript and optional API funding simulators; Z-score cone traversal UI; major docs structure refresh around the funding chapter.",
    href: "/collections/15-funding-model",
    linkLabel: "Funding chapter",
  },
  {
    id: "homepage-katex-apr1",
    dateManual: "2026-04-01",
    title: "Homepage hero refresh and math-aware docs rendering",
    description:
      "Vibe Paper positioning, equation-like markdown code blocks upgraded to KaTeX display math, quieter reader styling, and clearer simulation copy hierarchy.",
    href: "/",
    linkLabel: "Home",
  },
  {
    id: "site-home-mar30",
    dateManual: "2026-03-30",
    title: "Market velocity homepage, mobile nav, and GitHub Pages routing",
    description:
      "Social proof ticker and video layering, responsive chapter and simulation dropdowns, basename-aware SPA routing for `/vibe_docs/`, and a rebuilt docs website shell.",
    href: "/",
    linkLabel: "Home",
  },
  {
    id: "symm-case-mar26",
    dateManual: "2026-03-26",
    title: "SYMM LP case study: reconciled metrics",
    description:
      "Public SYMM liquidity-provider case study updated with exact deposits, yield metrics, and benchmark reconciliation.",
    href: "/collections/12-case-study-symm-lp",
    linkLabel: "Case study",
  },
  {
    id: "drafts-restructure-mar9",
    dateManual: "2026-03-09",
    title: "Vibe paper drafts, figures, and folder restructure",
    description:
      "New draft material and assets under `Docs/public`, with a cleaner chapter folder layout for ongoing writing.",
    href: "/library",
    linkLabel: "Library",
  },
  {
    id: "orderbook-series-mar7",
    dateManual: "2026-03-07",
    title: "Order book essay series and docs standardization",
    description:
      "Ode to the order book (parts 1–2) and related structure work: consistent numbering, navigation, and removal of stale TODO trees.",
    href: "/collections/04-ode-to-the-orderbook",
    linkLabel: "Order book (part 1)",
  },
  {
    id: "info-convergence-feb28",
    dateManual: "2026-02-28",
    title: "Information–trade convergence dissertation",
    description:
      "New dissertation chapter on information and trade convergence, plus framework and due-diligence questionnaire realignment.",
    href: "/collections/14-information-trade-convergence",
    linkLabel: "Open chapter",
  },
  {
    id: "repo-bootstrap-feb27",
    dateManual: "2026-02-27",
    title: "Public docs repository bootstrap",
    description:
      "Initial open-source drop: Z-score perp taxonomy, proof of value, USDC vs token-margined perps, listing game theory, pillars, and the first wave of Vibe papers.",
    href: "/library",
    linkLabel: "Library",
  },
];

export const changelogEntriesResolved: ChangelogEntryResolved[] = changelogEntries.map((entry) => ({
  ...entry,
  date: resolveChangelogDate(entry),
}));

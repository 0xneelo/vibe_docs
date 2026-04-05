export type ChangelogImpact = "major" | "medium" | "minor";

/** Minimal shape for filtering (matches `ChangelogEntry`). */
export type ChangelogFilterable = {
  impact: ChangelogImpact;
  tags: string[];
  newChapter?: boolean;
  newSection?: boolean;
};

/** Shared labels for changelog tags (filter chips + entry pills). */
export const CHANGELOG_TAG_LABELS = {
  docs: "Docs",
  website: "Website",
  chapter: "Chapter",
  listing: "Listing",
  funding: "Funding",
  simulators: "Simulators",
  homepage: "Homepage",
  "case-study": "Case study",
  "order-book": "Order book",
  dissertation: "Dissertation",
  bootstrap: "Bootstrap",
} as const satisfies Record<string, string>;

export const CHANGELOG_IMPACT_LABELS: Record<ChangelogImpact, string> = {
  major: "Major",
  medium: "Medium",
  minor: "Minor",
};

export type ChangelogTag = keyof typeof CHANGELOG_TAG_LABELS;

export type ChangelogFiltersState = {
  impact: "all" | ChangelogImpact;
  /** Empty = no tag filter; otherwise entry must match at least one selected tag. */
  tags: Set<string>;
  newChapterOnly: boolean;
  newSectionOnly: boolean;
};

export function defaultChangelogFilters(): ChangelogFiltersState {
  return {
    impact: "all",
    tags: new Set(),
    newChapterOnly: false,
    newSectionOnly: false,
  };
}

export function collectDistinctTags(entries: ChangelogFilterable[]): string[] {
  const s = new Set<string>();
  for (const e of entries) {
    for (const t of e.tags) {
      s.add(t);
    }
  }
  return [...s].sort((a, b) =>
    (CHANGELOG_TAG_LABELS[a] ?? a).localeCompare(CHANGELOG_TAG_LABELS[b] ?? b),
  );
}

export function filterChangelogEntries<T extends ChangelogFilterable>(
  entries: T[],
  f: ChangelogFiltersState,
): T[] {
  return entries.filter((e) => {
    if (f.impact !== "all" && e.impact !== f.impact) {
      return false;
    }
    if (f.newChapterOnly && !e.newChapter) {
      return false;
    }
    if (f.newSectionOnly && !e.newSection) {
      return false;
    }
    if (f.tags.size > 0) {
      const hit = e.tags.some((t) => f.tags.has(t));
      if (!hit) {
        return false;
      }
    }
    return true;
  });
}

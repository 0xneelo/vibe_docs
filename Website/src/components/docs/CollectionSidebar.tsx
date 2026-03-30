import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type { DocCollection, DocPage } from "@/lib/docs";
import { cn } from "@/lib/utils";

interface CollectionSidebarProps {
  collections: DocCollection[];
  pagesByCollection: Map<string, DocPage[]>;
  activePageId?: string;
}

export function CollectionSidebar({
  collections,
  pagesByCollection,
  activePageId,
}: CollectionSidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return collections.map((collection) => ({
        collection,
        pages: pagesByCollection.get(collection.slug) ?? [],
      }));
    }

    return collections
      .map((collection) => {
        const pages = (pagesByCollection.get(collection.slug) ?? []).filter((page) =>
          `${page.title} ${page.summary}`.toLowerCase().includes(normalized),
        );
        return { collection, pages };
      })
      .filter((entry) => entry.pages.length > 0 || entry.collection.title.toLowerCase().includes(normalized));
  }, [collections, pagesByCollection, query]);

  return (
    <aside className="reader-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[24px] border border-white/10 bg-white/[0.03] p-4 shadow-glow">
      <div className="mb-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/45">
          Browse papers
        </p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter pages..."
          className="w-full rounded-2xl border border-input bg-white/[0.03] px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-foreground/35 focus:border-white/20"
        />
      </div>

      <div className="space-y-5">
        {filtered.map(({ collection, pages }) => (
          <section key={collection.slug} className="space-y-2">
            <Link
              to={collection.href}
              className="block text-xs font-semibold uppercase tracking-[0.12em] text-foreground/45 transition hover:text-foreground/80"
            >
              {collection.title}
            </Link>

            <div className="space-y-1">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  to={page.href}
                  className={cn(
                    "block rounded-2xl border border-transparent px-3 py-2 text-sm text-foreground/65 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground",
                    activePageId === page.id && "border-white/10 bg-white/[0.07] text-foreground",
                  )}
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

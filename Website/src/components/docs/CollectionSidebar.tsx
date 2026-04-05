import { ChevronDown } from "lucide-react";
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
  const [openCollections, setOpenCollections] = useState<Record<string, boolean>>({});

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

  const hasQuery = query.trim().length > 0;

  function toggleCollection(slug: string) {
    setOpenCollections((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  }

  return (
    <aside className="card-surface-sidebar sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden">
      <div className="reader-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-5">
        <div className="mb-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/56">
            Browse chapters
          </p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter pages..."
            className="w-full rounded-2xl border border-indigo-100/22 bg-indigo-200/10 px-4 py-3 text-sm text-foreground outline-none ring-0 placeholder:text-foreground focus:border-sky-200/36"
          />
        </div>

        <div className="space-y-5">
          {filtered.map(({ collection, pages }) => (
            <section key={collection.slug} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleCollection(collection.slug)}
                className="flex w-full items-center justify-between rounded-xl border border-indigo-100/16 bg-indigo-300/8 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition hover:border-sky-200/26 hover:bg-sky-300/10 hover:text-foreground"
              >
                <span className="truncate pr-2">{collection.title}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform",
                    (hasQuery || openCollections[collection.slug]) && "rotate-180",
                  )}
                />
              </button>

              {hasQuery || openCollections[collection.slug] ? (
                <div className="space-y-1">
                  <Link
                    to={collection.href}
                    className="block rounded-xl border border-transparent px-3 py-2 text-xs font-medium uppercase tracking-[0.08em] text-foreground/62 transition hover:border-sky-100/20 hover:bg-sky-300/10 hover:text-foreground/86"
                  >
                    Open chapter
                  </Link>
                  {pages.map((page) => (
                    <Link
                      key={page.id}
                      to={page.href}
                      className={cn(
                        "block rounded-2xl border border-transparent px-3 py-2 text-sm text-foreground/76 transition hover:border-sky-100/20 hover:bg-sky-300/10 hover:text-foreground",
                        activePageId === page.id && "border-sky-200/28 bg-sky-300/16 text-foreground",
                      )}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}

import { Link } from "react-router-dom";

import { SiteHeader } from "@/components/SiteHeader";
import { useDocs } from "@/lib/docs";

function displayChapterTitle(title: string) {
  return title.replace(/^\s*\d{1,2}\s*[-–—:]\s*/, "");
}

export function LibraryPage() {
  const { collections, loading, error } = useDocs();
  const totalPages = collections.reduce((sum, collection) => sum + collection.pageCount, 0);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <SiteHeader />

        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="mb-8">
            <p className="text-xs font-semibold tracking-[0.14em] text-foreground/55 uppercase">Research Index</p>
            <h1 className="mt-2 text-5xl font-semibold tracking-[-0.05em] text-foreground sm:text-6xl">Chapters</h1>
            <p className="mt-4 max-w-2xl text-base text-foreground/65">
              Every chapter in one place, ordered for fast scanning.
            </p>
            {!loading && !error ? (
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-white/14 bg-white/[0.04] px-3 py-1 text-foreground/72">
                  {collections.length} chapters
                </span>
                <span className="rounded-full border border-white/14 bg-white/[0.04] px-3 py-1 text-foreground/72">
                  {totalPages} pages
                </span>
              </div>
            ) : null}
          </section>

          {loading ? <LibraryState message="Loading chapters..." /> : null}
          {error ? <LibraryState message={error} /> : null}

          {!loading && !error ? (
            <section className="card-surface-main overflow-hidden">
              {collections.map((collection, index) => (
                <Link
                  key={collection.slug}
                  to={collection.href}
                  className="group block border-b border-white/8 px-5 py-4 transition last:border-b-0 hover:bg-white/[0.06]"
                >
                  <div className="grid items-start gap-4 sm:grid-cols-[56px_minmax(0,1fr)_auto]">
                    <div className="text-3xl leading-none font-semibold tracking-[-0.05em] text-foreground/22 transition group-hover:text-foreground/40">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold tracking-[-0.03em] text-foreground">
                        {displayChapterTitle(collection.title)}
                      </h2>
                      <p className="mt-1.5 text-sm leading-6 text-foreground/58">
                        {collection.summary || "Chapter overview and section index."}
                      </p>
                    </div>
                    <span className="mt-0.5 shrink-0 rounded-full border border-white/14 bg-black/25 px-2.5 py-1 text-xs text-foreground/68">
                      {collection.pageCount} pages
                    </span>
                  </div>
                </Link>
              ))}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function LibraryState({ message }: { message: string }) {
  return (
    <div className="card-surface-main p-6 text-sm text-foreground/60">
      {message}
    </div>
  );
}

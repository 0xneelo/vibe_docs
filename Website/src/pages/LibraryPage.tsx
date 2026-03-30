import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { AmbientVideoBackground } from "@/components/AmbientVideoBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { useDocs } from "@/lib/docs";

const LIBRARY_VIDEO_OPACITY = 0.24;
const LIBRARY_OVERLAY_OPACITY = 0.62;

export function LibraryPage() {
  const { collections, loading, error } = useDocs();
  const totalPages = collections.reduce((sum, collection) => sum + collection.pageCount, 0);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientVideoBackground
        videoOpacity={LIBRARY_VIDEO_OPACITY}
        overlayOpacity={LIBRARY_OVERLAY_OPACITY}
      />

      <div className="relative z-10">
        <SiteHeader />

        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="mb-8">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">Library</h1>
            <p className="mt-3 max-w-2xl text-base text-foreground/65">
              Explore the complete whitepaper archive by collection.
            </p>
            {!loading && !error ? (
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-foreground/55">
                <span className="rounded-full border border-white/10 px-3 py-1">{collections.length} collections</span>
                <span className="rounded-full border border-white/10 px-3 py-1">{totalPages} pages</span>
              </div>
            ) : null}
          </section>

          {loading ? <LibraryState message="Loading collections..." /> : null}
          {error ? <LibraryState message={error} /> : null}

          {!loading && !error ? (
            <section className="grid gap-3 sm:grid-cols-2">
              {collections.map((collection) => (
                <Link
                  key={collection.slug}
                  to={collection.href}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 transition hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">{collection.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-foreground/60">
                        {collection.summary || "Collection overview and paginated whitepaper sections."}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-foreground/45 transition group-hover:text-foreground" />
                  </div>
                  <p className="mt-3 text-xs text-foreground/50">{collection.pageCount} pages</p>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-foreground/60">
      {message}
    </div>
  );
}

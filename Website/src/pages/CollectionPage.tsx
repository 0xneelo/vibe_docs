import { ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { AmbientVideoBackground } from "@/components/AmbientVideoBackground";
import { SiteHeader } from "@/components/SiteHeader";
import { PageToc } from "@/components/docs/PageToc";
import { useDocs } from "@/lib/docs";

const COLLECTION_VIDEO_OPACITY = 0.2;
const COLLECTION_OVERLAY_OPACITY = 0.64;

export function CollectionPage() {
  const { collectionSlug = "" } = useParams();
  const { collectionBySlug, pagesByCollection, loading, error } = useDocs();

  if (loading) {
    return <CollectionState message="Loading collection..." />;
  }

  if (error) {
    return <CollectionState message={error} />;
  }

  const collection = collectionBySlug.get(collectionSlug);
  if (!collection) {
    return <Navigate to="/library" replace />;
  }

  const pages = pagesByCollection.get(collection.slug) ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientVideoBackground
        videoOpacity={COLLECTION_VIDEO_OPACITY}
        overlayOpacity={COLLECTION_OVERLAY_OPACITY}
      />

      <div className="relative z-10">
        <SiteHeader />

        <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_260px] sm:px-6 lg:px-8">
          <section className="space-y-6">
            <header>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
                {collection.overviewTitle || collection.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-foreground/65">
                {collection.summary || "Collection overview and entry point into the whitepaper sections."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-foreground/55">
                <span className="rounded-full border border-white/10 px-3 py-1">Collection</span>
                <span className="rounded-full border border-white/10 px-3 py-1">{pages.length} sections</span>
              </div>
            </header>

            <article className="content-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <div className="doc-content" dangerouslySetInnerHTML={{ __html: collection.overviewHtml }} />
            </article>

            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">Paper sections</h2>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-foreground/55">
                  {pages.length} sections
                </span>
              </div>

              <div className="grid gap-3">
                {pages.map((page) => (
                  <Link
                    key={page.id}
                    to={page.href}
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 transition hover:bg-white/[0.05]"
                  >
                    <div>
                      <div className="text-base font-semibold text-foreground">{page.title}</div>
                      <div className="mt-1 text-sm text-foreground/55">{page.summary || page.relativePath}</div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-foreground/45 transition group-hover:text-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          </section>

          <div className="hidden lg:block">
            <PageToc headings={collection.overviewHeadings} />
          </div>
        </main>
      </div>
    </div>
  );
}

function CollectionState({ message }: { message: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientVideoBackground
        videoOpacity={COLLECTION_VIDEO_OPACITY}
        overlayOpacity={COLLECTION_OVERLAY_OPACITY}
      />
      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-foreground/60">
            {message}
          </div>
        </main>
      </div>
    </div>
  );
}

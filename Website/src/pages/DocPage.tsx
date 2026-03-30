import { Navigate, useParams } from "react-router-dom";

import { SiteHeader } from "@/components/SiteHeader";
import { CollectionSidebar } from "@/components/docs/CollectionSidebar";
import { DocPager } from "@/components/docs/DocPager";
import { PageToc } from "@/components/docs/PageToc";
import { useDocs } from "@/lib/docs";

export function DocPage() {
  const { collectionSlug = "", "*": pageSlug = "" } = useParams();
  const {
    collections,
    pagesByCollection,
    pageById,
    pageByRoute,
    collectionBySlug,
    loading,
    error,
  } = useDocs();

  if (loading) {
    return <DocState message="Loading whitepaper page..." />;
  }

  if (error) {
    return <DocState message={error} />;
  }

  const page = pageByRoute.get(`${collectionSlug}/${pageSlug}`);
  const collection = collectionBySlug.get(collectionSlug);

  if (!page || !collection) {
    return <Navigate to="/library" replace />;
  }

  const previousPage = page.prevId ? pageById.get(page.prevId) : undefined;
  const nextPage = page.nextId ? pageById.get(page.nextId) : undefined;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto grid w-full max-w-[1680px] gap-6 px-4 py-8 lg:grid-cols-[300px_minmax(0,1fr)_260px] lg:px-8">
        <div className="hidden lg:block">
          <CollectionSidebar
            collections={collections}
            pagesByCollection={pagesByCollection}
            activePageId={page.id}
          />
        </div>

        <section className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 shadow-glow">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/45">
              {collection.title}
            </p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-foreground/65">
              {page.summary || collection.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-foreground/45">
              <span className="rounded-full border border-white/10 px-3 py-1">{page.relativePath}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">
                {page.headings.length} headings indexed
              </span>
            </div>
          </div>

          <article className="content-auto rounded-[32px] border border-white/10 bg-white/[0.03] p-6 shadow-glow sm:p-8">
            <div className="doc-content" dangerouslySetInnerHTML={{ __html: page.html }} />
          </article>

          <DocPager previousPage={previousPage} nextPage={nextPage} />
        </section>

        <div className="hidden lg:block">
          <PageToc headings={page.headings} />
        </div>
      </main>
    </div>
  );
}

function DocState({ message }: { message: string }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-sm text-foreground/60 shadow-glow">
          {message}
        </div>
      </main>
    </div>
  );
}

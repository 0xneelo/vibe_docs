import { useEffect, useMemo, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";

import { SiteHeader } from "@/components/SiteHeader";
import { CollectionSidebar } from "@/components/docs/CollectionSidebar";
import { DocQuietShell, DocReadingGrid } from "@/components/docs/DocSiteLayout";
import { DocPager } from "@/components/docs/DocPager";
import { PageToc } from "@/components/docs/PageToc";
import { useDocs } from "@/lib/docs";
import { renderMath } from "@/lib/renderMath";

export function DocPage() {
  const contentRef = useRef<HTMLDivElement | null>(null);
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
  const cleanedPageHtml = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(page.html, "text/html");
    const firstHeading = doc.body.querySelector("h1");
    if (firstHeading) {
      firstHeading.remove();
    }
    return doc.body.innerHTML;
  }, [page.html]);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }
    renderMath(contentRef.current);
  }, [cleanedPageHtml]);

  return (
    <DocQuietShell>
      <SiteHeader />

      <DocReadingGrid>
        <div className="hidden lg:block">
          <CollectionSidebar
            collections={collections}
            pagesByCollection={pagesByCollection}
            activePageId={page.id}
          />
        </div>

        <section className="min-w-0 space-y-6">
          <div className="card-surface-main p-5 sm:p-7 lg:p-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/45">
              {collection.title}
            </p>
            <h1 className="max-w-[24ch] text-[clamp(2rem,4.6vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-foreground">
              {page.title}
            </h1>
            <p className="mt-4 max-w-[68ch] text-[1rem] leading-8 text-foreground/68">
              {page.summary || collection.summary}
            </p>
          </div>

          <article className="card-surface-main content-auto min-w-0 overflow-x-clip p-6 sm:p-8">
            <div ref={contentRef} className="doc-content" dangerouslySetInnerHTML={{ __html: cleanedPageHtml }} />
          </article>

          <DocPager previousPage={previousPage} nextPage={nextPage} />
        </section>

        <div className="hidden lg:block">
          <PageToc headings={page.headings} />
        </div>
      </DocReadingGrid>
    </DocQuietShell>
  );
}

function DocState({ message }: { message: string }) {
  return (
    <DocQuietShell>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="card-surface-main p-6 text-sm text-foreground/60">
          {message}
        </div>
      </main>
    </DocQuietShell>
  );
}

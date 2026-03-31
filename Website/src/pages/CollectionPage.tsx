import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { SiteHeader } from "@/components/SiteHeader";
import { CollectionSidebar } from "@/components/docs/CollectionSidebar";
import { useDocs } from "@/lib/docs";

export function CollectionPage() {
  const { collectionSlug = "" } = useParams();
  const { collections, collectionBySlug, pagesByCollection, loading, error } = useDocs();

  if (loading) {
    return <CollectionState message="Loading chapter..." />;
  }

  if (error) {
    return <CollectionState message={error} />;
  }

  const collection = collectionBySlug.get(collectionSlug);
  if (!collection) {
    return <Navigate to="/library" replace />;
  }

  const pages = pagesByCollection.get(collection.slug) ?? [];
  const cleanedOverviewHtml = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(collection.overviewHtml, "text/html");
    const chapterPrefix = collection.key.slice(0, 2);

    const firstHeading = doc.body.querySelector("h1");
    if (firstHeading) {
      firstHeading.remove();
    }

    const firstParagraph = doc.body.querySelector("p");
    if (firstParagraph) {
      firstParagraph.remove();
    }

    const githubBase = "https://github.com/0xneelo/vibe_docs/blob/main/Docs/public";
    doc.body.querySelectorAll("a").forEach((anchor) => {
      const label = (anchor.textContent ?? "").trim();
      const readmeMatch = label.match(/([0-9]{2}_docs\/README\.md)$/i);
      const hrefMatch = (anchor.getAttribute("href") ?? "").match(/([0-9]{2}_docs\/README\.md)/i);
      const docsPath = readmeMatch?.[1] ?? hrefMatch?.[1];
      if (!docsPath) {
        return;
      }

      const standardizedLabel = `${chapterPrefix}_docs/README.md`;
      anchor.textContent = standardizedLabel;
      anchor.setAttribute("href", `${githubBase}/${collection.key}/${docsPath}`);
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");

      const parentParagraph = anchor.closest("p");
      if (parentParagraph) {
        parentParagraph.innerHTML = `&rarr; See <a href="${githubBase}/${collection.key}/${docsPath}" target="_blank" rel="noopener noreferrer">${standardizedLabel}</a> for source files.`;
      }
    });

    if (collection.key === "15_funding_model") {
      const interactiveHeading = Array.from(doc.body.querySelectorAll("h2")).find((heading) =>
        /interactive simulators/i.test((heading.textContent ?? "").trim()),
      );
      if (interactiveHeading) {
        const next = interactiveHeading.nextElementSibling;
        if (next && next.tagName.toLowerCase() === "ul") {
          next.remove();
        }

        const intro = doc.createElement("p");
        intro.textContent =
          "Use these live simulator pages to test funding dynamics and visualize Z-score cone traversal behavior under different market stress conditions.";
        interactiveHeading.insertAdjacentElement("afterend", intro);

        const list = doc.createElement("ul");
        list.innerHTML = `
          <li><a href="/simulations/funding">Funding Simulator</a></li>
          <li><a href="/simulations/z-score">Z-Score Cone Traversal Simulator</a></li>
        `;
        intro.insertAdjacentElement("afterend", list);
      }
    }

    return doc.body.innerHTML;
  }, [collection.key, collection.overviewHtml]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <SiteHeader />

        <main className="mx-auto grid w-full max-w-[1680px] gap-6 px-4 py-8 lg:grid-cols-[300px_minmax(0,1fr)_260px] lg:px-8">
          <div className="hidden lg:block">
            <CollectionSidebar
              collections={collections}
              pagesByCollection={pagesByCollection}
            />
          </div>

          <section className="space-y-6">
            <header className="card-surface-main px-5 py-6 sm:px-7">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground/56 uppercase">Chapter landing</p>
              <h1 className="mt-2 text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
                {collection.overviewTitle || collection.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-white/14 bg-white/[0.05] px-3 py-1 text-foreground/72">Chapter</span>
                <span className="rounded-full border border-white/14 bg-white/[0.05] px-3 py-1 text-foreground/72">{pages.length} sections</span>
              </div>
            </header>

            <article className="card-surface-main content-auto p-6 sm:p-8">
              <p className="mb-5 max-w-[68ch] text-[1rem] leading-8 text-foreground/68">
                {collection.summary || "Chapter overview and entry point into the whitepaper sections."}
              </p>
              <div className="doc-content" dangerouslySetInnerHTML={{ __html: cleanedOverviewHtml }} />
            </article>

            <section className="card-surface-main overflow-hidden">
              <div className="border-b border-white/8 px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Paper sections</h2>
              </div>
              <div>
                {pages.map((page, index) => (
                  <Link
                    key={page.id}
                    to={page.href}
                    className="group grid items-start gap-4 border-b border-white/8 px-5 py-4 transition last:border-b-0 hover:bg-white/[0.06] sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:px-6"
                  >
                    <div className="hidden text-2xl leading-none font-semibold tracking-[-0.05em] text-foreground/22 transition group-hover:text-foreground/40 sm:block">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-semibold tracking-[-0.02em] text-foreground">{page.title}</div>
                      <div className="mt-1.5 text-sm leading-6 text-foreground/58">{page.summary || page.relativePath}</div>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                ))}
              </div>
            </section>
          </section>

          <div className="hidden lg:block" aria-hidden="true" />
        </main>
      </div>
    </div>
  );
}

function CollectionState({ message }: { message: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-10">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="card-surface-main p-6 text-sm text-foreground/60">
            {message}
          </div>
        </main>
      </div>
    </div>
  );
}

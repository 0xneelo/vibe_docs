import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface DocHeading {
  id: string;
  title: string;
  level: number;
}

export interface DocCollection {
  key: string;
  slug: string;
  title: string;
  summary: string;
  href: string;
  overviewTitle: string;
  overviewHtml: string;
  overviewHeadings: DocHeading[];
  pageIds: string[];
  pageCount: number;
}

export interface DocPage {
  id: string;
  collectionKey: string;
  collectionSlug: string;
  relativePath: string;
  routeSlug: string;
  href: string;
  title: string;
  summary: string;
  html: string;
  headings: DocHeading[];
  prevId: string | null;
  nextId: string | null;
}

export interface DocsPayload {
  generatedAt: string;
  collections: DocCollection[];
  pages: DocPage[];
}

interface DocsContextValue {
  data: DocsPayload | null;
  loading: boolean;
  error: string | null;
  collections: DocCollection[];
  pages: DocPage[];
  collectionBySlug: Map<string, DocCollection>;
  pageById: Map<string, DocPage>;
  pageByRoute: Map<string, DocPage>;
  pagesByCollection: Map<string, DocPage[]>;
}

const DocsContext = createContext<DocsContextValue | null>(null);

export function DocsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DocsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocs() {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.BASE_URL}generated/docs-data.json`);
        if (!response.ok) {
          throw new Error(`Failed to load docs data (${response.status})`);
        }
        const payload = (await response.json()) as DocsPayload;
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load docs data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDocs();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<DocsContextValue>(() => {
    const collections = data?.collections ?? [];
    const pages = data?.pages ?? [];
    const collectionBySlug = new Map(collections.map((collection) => [collection.slug, collection]));
    const pageById = new Map(pages.map((page) => [page.id, page]));
    const pageByRoute = new Map(pages.map((page) => [`${page.collectionSlug}/${page.routeSlug}`, page]));
    const pagesByCollection = new Map<string, DocPage[]>();

    collections.forEach((collection) => {
      pagesByCollection.set(
        collection.slug,
        collection.pageIds.map((id) => pageById.get(id)).filter(Boolean) as DocPage[],
      );
    });

    return {
      data,
      loading,
      error,
      collections,
      pages,
      collectionBySlug,
      pageById,
      pageByRoute,
      pagesByCollection,
    };
  }, [data, error, loading]);

  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>;
}

export function useDocs() {
  const context = useContext(DocsContext);
  if (!context) {
    throw new Error("useDocs must be used within a DocsProvider.");
  }
  return context;
}

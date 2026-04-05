import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";

import { GlobalBackground } from "@/components/GlobalBackground";
import { LastVisitProvider } from "@/context/LastVisitContext";
import { DocsProvider } from "@/lib/docs";

const HomePage = lazy(() => import("@/pages/HomePage").then((module) => ({ default: module.HomePage })));
const LibraryPage = lazy(() => import("@/pages/LibraryPage").then((module) => ({ default: module.LibraryPage })));
const CollectionPage = lazy(() =>
  import("@/pages/CollectionPage").then((module) => ({ default: module.CollectionPage })),
);
const DocPage = lazy(() => import("@/pages/DocPage").then((module) => ({ default: module.DocPage })));
const FundingSimulatorPage = lazy(() =>
  import("@/pages/FundingSimulatorPage").then((module) => ({ default: module.FundingSimulatorPage })),
);
const ZScoreSimulatorPage = lazy(() =>
  import("@/pages/zScoreModelPage").then((module) => ({ default: module.ZScoreSimulatorPage })),
);
const ChangelogPage = lazy(() =>
  import("@/pages/ChangelogPage").then((module) => ({ default: module.ChangelogPage })),
);

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

/** Old bookmarks and external links used `/collections/:slug`. */
function CollectionsToChaptersRedirect() {
  const { collectionSlug } = useParams();
  if (!collectionSlug) {
    return <Navigate to="/library" replace />;
  }
  return <Navigate to={`/chapters/${collectionSlug}`} replace />;
}

export default function App() {
  return (
    <DocsProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <LastVisitProvider>
          <GlobalBackground />
          <div className="relative z-10">
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/simulations/funding-local" element={<FundingSimulatorPage mode="local" />} />
                <Route path="/simulations/funding-api" element={<FundingSimulatorPage mode="api" />} />
                <Route path="/local-funding" element={<Navigate to="/simulations/funding-local" replace />} />
                <Route path="/simulations/funding" element={<Navigate to="/simulations/funding-local" replace />} />
                <Route path="/simulations/z-score" element={<ZScoreSimulatorPage />} />
                <Route path="/funding-model" element={<Navigate to="/simulations/funding" replace />} />
                <Route path="/chapters/:collectionSlug" element={<CollectionPage />} />
                <Route path="/collections/:collectionSlug" element={<CollectionsToChaptersRedirect />} />
                <Route path="/docs/:collectionSlug/*" element={<DocPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </LastVisitProvider>
      </BrowserRouter>
    </DocsProvider>
  );
}

function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-sm text-foreground/60 shadow-glow">
        Loading...
      </div>
    </div>
  );
}

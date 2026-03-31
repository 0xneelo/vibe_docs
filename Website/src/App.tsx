import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { GlobalBackground } from "@/components/GlobalBackground";
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

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <DocsProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <GlobalBackground />
        <div className="relative z-10">
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/local-funding" element={<FundingSimulatorPage />} />
              <Route path="/simulations/funding" element={<Navigate to="/local-funding" replace />} />
              <Route path="/simulations/z-score" element={<ZScoreSimulatorPage />} />
              <Route path="/funding-model" element={<Navigate to="/simulations/funding" replace />} />
              <Route path="/collections/:collectionSlug" element={<CollectionPage />} />
              <Route path="/docs/:collectionSlug/*" element={<DocPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
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

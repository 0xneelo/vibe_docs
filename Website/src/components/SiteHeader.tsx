import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useDocs } from "@/lib/docs";

export function SiteHeader() {
  const location = useLocation();
  const { collections } = useDocs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const externalLinks = [
    { label: "Website", href: "https://vibe.trading" },
    { label: "Github", href: "https://github.com/0xneelo/vibe_docs" },
    { label: "Trade now", href: "https://closed-alpha.vibe.trading" },
    { label: "Twitter", href: "https://twitter.com/vibe_trading" },
  ];
  const simulations = [
    { title: "Funding Simulator", href: "/simulations/funding", description: "Funding dynamics and solver PnL" },
    { title: "Z-Score Cone Traversal", href: "/simulations/z-score", description: "3D convergence field model" },
  ];
  const isHome = location.pathname === "/";
  const isLibrary = location.pathname.startsWith("/library");
  const isCollections = location.pathname.startsWith("/collections");
  const isSimulations = location.pathname.startsWith("/simulations") || location.pathname.startsWith("/funding-model");
  const isReaderRoute = true;
  const showCollectionsDropdown = location.pathname === "/library";
  const showSimulationsDropdown = true;

  const navButtonClass = (active: boolean) =>
    cn(
      "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition",
      active
        ? "bg-white/[0.12] text-foreground"
        : "text-foreground/78 hover:bg-white/[0.06] hover:text-foreground",
    );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="relative mx-auto flex w-full max-w-[1600px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-8 w-auto rounded-md" />
        </Link>

        <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 lg:flex">
          <div className="flex items-center gap-7">
            {externalLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto text-base text-foreground/84 transition hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-1 md:ml-auto md:flex">
          <Link to="/" className={navButtonClass(isHome)}>
            Home
          </Link>
          <Link to="/library" className={navButtonClass(isLibrary)}>
            Library
          </Link>
          <div className="group relative">
            <Link to="/library" className={navButtonClass(isCollections)}>
              Chapters
            </Link>

            {showCollectionsDropdown ? (
              <div className="collections-dropdown-panel">
                <div className="collections-dropdown">
                  <div className="collections-dropdown-list collections-scrollbar">
                  {collections.map((collection) => (
                    <Link
                      key={collection.slug}
                      to={collection.href}
                      className="collections-dropdown-item"
                    >
                      <p className="text-sm font-medium text-foreground">{collection.title}</p>
                      <p className="mt-0.5 text-xs text-foreground/55">{collection.pageCount} pages</p>
                    </Link>
                  ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="group relative">
            <Link to="/simulations/funding" className={navButtonClass(isSimulations)}>
              Simulations
            </Link>

            {showSimulationsDropdown ? (
              <div className="collections-dropdown-panel">
                <div className="collections-dropdown">
                  <div className="collections-dropdown-list collections-scrollbar">
                    {simulations.map((sim) => (
                      <Link key={sim.href} to={sim.href} className="collections-dropdown-item">
                        <p className="text-sm font-medium text-foreground">{sim.title}</p>
                        <p className="mt-0.5 text-xs text-foreground/55">{sim.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {isReaderRoute ? (
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-foreground transition hover:bg-white/[0.08] md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        ) : null}
      </div>

      {isReaderRoute && mobileMenuOpen ? (
        <div className="pointer-events-none absolute inset-x-0 top-full z-[60] flex justify-center px-4 pt-2 md:hidden">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/15 bg-background/95 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="grid gap-2">
              <Link
                to="/"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                  isHome
                    ? "border-white/35 bg-white/[0.14] text-foreground"
                    : "border-white/12 bg-white/[0.03] text-foreground/85 hover:bg-white/[0.08]",
                )}
              >
                Home
              </Link>
              <Link
                to="/library"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                  isLibrary
                    ? "border-white/35 bg-white/[0.14] text-foreground"
                    : "border-white/12 bg-white/[0.03] text-foreground/85 hover:bg-white/[0.08]",
                )}
              >
                Library
              </Link>
              <Link
                to="/library"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                  isCollections
                    ? "border-white/35 bg-white/[0.14] text-foreground"
                    : "border-white/12 bg-white/[0.03] text-foreground/85 hover:bg-white/[0.08]",
                )}
              >
                Chapters
              </Link>
              <Link
                to="/simulations/funding"
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition",
                  isSimulations
                    ? "border-white/35 bg-white/[0.14] text-foreground"
                    : "border-white/12 bg-white/[0.03] text-foreground/85 hover:bg-white/[0.08]",
                )}
              >
                Simulations
              </Link>
              <div className="mt-1 rounded-xl border border-white/10 bg-white/[0.02] p-2">
                <div className="grid grid-cols-2 gap-2">
                  {externalLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 px-2 py-2 text-center text-xs text-foreground/82 transition hover:bg-white/[0.06]"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {location.pathname === "/library" ? (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-2 reader-scrollbar">
                {collections.map((collection) => (
                  <Link
                    key={collection.slug}
                    to={collection.href}
                    className="block rounded-lg px-2 py-2 text-xs text-foreground/80 transition hover:bg-white/[0.06]"
                  >
                    {collection.title}
                  </Link>
                ))}
              </div>
            ) : null}
            {isSimulations ? (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-2 reader-scrollbar">
                {simulations.map((sim) => (
                  <Link
                    key={sim.href}
                    to={sim.href}
                    className={cn(
                      "block rounded-lg px-2 py-2 text-xs transition hover:bg-white/[0.06]",
                      location.pathname === sim.href ? "text-foreground" : "text-foreground/80",
                    )}
                  >
                    {sim.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

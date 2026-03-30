import { BookOpenText, ChevronLeft, LibraryBig, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useDocs } from "@/lib/docs";

export function SiteHeader() {
  const location = useLocation();
  const { collections } = useDocs();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === "/";
  const isLibrary = location.pathname.startsWith("/library");
  const isCollections = location.pathname.startsWith("/collections");
  const isReaderRoute = isLibrary || isCollections || location.pathname.startsWith("/docs");
  const showCollectionsDropdown = location.pathname === "/library";

  const navButtonClass = (active: boolean) =>
    cn(
      "uiverse-nav-btn",
      active && "uiverse-nav-btn--active",
    );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-8 w-auto rounded-md" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.08em] text-foreground/70 uppercase">
              Whitepaper Library
            </span>
            <span className="text-sm text-foreground/50">Docs/public research hub</span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/" className={navButtonClass(isHome)}>
            <span className="uiverse-nav-btn__label">
              <ChevronLeft className="h-4 w-4" />
              Home
            </span>
          </Link>
          <Link to="/library" className={navButtonClass(isLibrary)}>
            <span className="uiverse-nav-btn__label">
              <LibraryBig className="h-4 w-4" />
              Library
            </span>
          </Link>
          <div className="group relative">
            <Link to="/library" className={navButtonClass(isCollections)}>
              <span className="uiverse-nav-btn__label">
                <BookOpenText className="h-4 w-4" />
                Collections
              </span>
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
                <ChevronLeft className="h-4 w-4" />
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
                <LibraryBig className="h-4 w-4" />
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
                <BookOpenText className="h-4 w-4" />
                Collections
              </Link>
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
          </div>
        </div>
      ) : null}
    </header>
  );
}

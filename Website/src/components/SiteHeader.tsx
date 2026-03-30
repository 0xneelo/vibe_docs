import { BookOpenText, ChevronLeft, LibraryBig } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";
import { useDocs } from "@/lib/docs";

export function SiteHeader() {
  const location = useLocation();
  const { collections } = useDocs();
  const isHome = location.pathname === "/";
  const isLibrary = location.pathname.startsWith("/library");
  const isCollections = location.pathname.startsWith("/collections");
  const showCollectionsDropdown = location.pathname === "/library";

  const navButtonClass = (active: boolean) =>
    cn(
      "uiverse-nav-btn",
      active && "uiverse-nav-btn--active",
    );

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

        <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
}

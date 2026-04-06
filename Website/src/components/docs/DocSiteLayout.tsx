import type { ReactNode } from "react";

/**
 * Applies `doc-page--quiet` so doc prose, cards, KaTeX, and math-expand mobile rules
 * from `doc-quiet-funding.css` / `math-expand-button.css` match on every reading surface.
 */
export function DocQuietShell({ children }: { children: ReactNode }) {
  return <div className="doc-page--quiet min-h-screen">{children}</div>;
}

/**
 * Shared grid for chapter landing and per-page docs: sidebar + column + TOC (or spacer).
 */
export function DocReadingGrid({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto grid w-full max-w-[1680px] min-w-0 overflow-x-clip gap-6 px-4 py-8 lg:grid-cols-[300px_minmax(0,1fr)_260px] lg:px-8">
      {children}
    </main>
  );
}

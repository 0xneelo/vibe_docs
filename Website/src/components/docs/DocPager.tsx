import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import type { DocPage } from "@/lib/docs";

interface DocPagerProps {
  previousPage?: DocPage;
  nextPage?: DocPage;
}

export function DocPager({ previousPage, nextPage }: DocPagerProps) {
  if (!previousPage && !nextPage) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {previousPage ? (
        <Link
          to={previousPage.href}
          className="card-surface-main card-surface-main-hover rounded-[24px] p-5"
        >
          <span className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/45">
            <ArrowLeft className="h-4 w-4" />
            Previous
          </span>
          <div className="text-lg font-semibold tracking-[-0.02em] text-foreground">{previousPage.title}</div>
        </Link>
      ) : (
        <div />
      )}

      {nextPage ? (
        <Link
          to={nextPage.href}
          className="card-surface-main card-surface-main-hover rounded-[24px] p-5 text-right"
        >
          <span className="mb-3 flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/45">
            Next
            <ArrowRight className="h-4 w-4" />
          </span>
          <div className="text-lg font-semibold tracking-[-0.02em] text-foreground">{nextPage.title}</div>
        </Link>
      ) : null}
    </div>
  );
}

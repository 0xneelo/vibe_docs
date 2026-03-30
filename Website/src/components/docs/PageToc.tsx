import type { DocHeading } from "@/lib/docs";
import { cn } from "@/lib/utils";

interface PageTocProps {
  headings: DocHeading[];
}

export function PageToc({ headings }: PageTocProps) {
  const visibleHeadings = headings.filter((heading) => heading.level <= 3);

  return (
    <aside className="sticky top-24 self-start">
      <div className="reader-scrollbar max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain rounded-[24px] border border-white/10 bg-white/[0.03] p-4 shadow-glow">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/45">
          On this page
        </p>

        {visibleHeadings.length <= 1 ? (
          <p className="text-sm text-foreground/50">This page is short and does not need a table of contents.</p>
        ) : (
          <div className="space-y-1 pb-1">
            {visibleHeadings.slice(1).map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={cn(
                  "block rounded-lg px-2 py-1.5 text-sm text-foreground/60 transition hover:bg-white/[0.05] hover:text-foreground",
                  heading.level === 3 && "pl-5 text-foreground/50",
                )}
              >
                {heading.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

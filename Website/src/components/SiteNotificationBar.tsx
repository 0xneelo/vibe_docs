import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { changelogEntriesResolved } from "@/data/changelog";

function formatBannerDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Slim bar under the navbar: newest changelog row by resolved date (git + manual). */
export function SiteNotificationBar() {
  const latest = useMemo(() => {
    if (changelogEntriesResolved.length === 0) return null;
    return [...changelogEntriesResolved].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, []);

  if (!latest) {
    return null;
  }

  const whatsNewHref = "/#whats-new";

  return (
    <div className="border-t border-white/[0.08] bg-gradient-to-r from-violet-500/[0.12] via-blue-500/[0.08] to-transparent">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-1.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
        <p className="min-w-0 text-center text-[13px] leading-snug text-foreground/88 sm:text-left sm:text-sm">
          <span className="font-semibold text-foreground/95">Update</span>
          <span className="mx-1.5 text-foreground/40" aria-hidden>
            ·
          </span>
          <time className="text-foreground/55" dateTime={latest.date}>
            {formatBannerDate(latest.date)}
          </time>
          <span className="mx-1.5 text-foreground/40" aria-hidden>
            —
          </span>
          <span>{latest.title}</span>
        </p>
        <div className="flex shrink-0 items-center justify-center gap-3 sm:justify-end">
          {latest.href ? (
            latest.href.startsWith("http") ? (
              <a
                href={latest.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[13px] font-medium text-foreground/90 underline decoration-white/25 underline-offset-2 transition hover:decoration-white/50"
              >
                {latest.linkLabel ?? "Open"}
                <ChevronRight className="h-3.5 w-3.5 opacity-80" />
              </a>
            ) : (
              <Link
                to={latest.href}
                className="inline-flex items-center gap-0.5 text-[13px] font-medium text-foreground/90 underline decoration-white/25 underline-offset-2 transition hover:decoration-white/50"
              >
                {latest.linkLabel ?? "Open"}
                <ChevronRight className="h-3.5 w-3.5 opacity-80" />
              </Link>
            )
          ) : null}
          <Link
            to={whatsNewHref}
            className="inline-flex items-center gap-0.5 text-[13px] font-medium text-foreground/70 transition hover:text-foreground"
          >
            All updates
            <ChevronRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>
      </div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { readLastVisitCalendarDay, writeLastVisitNow } from "@/lib/lastVisitCookie";

const LastVisitContext = createContext<string | null>(null);

/**
 * Captures the visitor's previous session calendar day (UTC) from a cookie, then refreshes the
 * cookie to "now" for the next visit. First-time visitors get `null`.
 */
export function LastVisitProvider({ children }: { children: ReactNode }) {
  const [previousVisitDay] = useState(() => readLastVisitCalendarDay());

  useEffect(() => {
    writeLastVisitNow();
  }, []);

  return <LastVisitContext.Provider value={previousVisitDay}>{children}</LastVisitContext.Provider>;
}

export function usePreviousVisitDay(): string | null {
  return useContext(LastVisitContext);
}

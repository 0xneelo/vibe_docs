const COOKIE_NAME = "vibe_docs_last_visit_iso";
const MAX_AGE_SEC = 365 * 24 * 60 * 60;

function baseCookiePath(): string {
  const base = import.meta.env.BASE_URL;
  if (base === "/" || base === "") {
    return "/";
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function parseCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const prefix = `${name}=`;
  for (const part of document.cookie.split(";")) {
    const s = part.trim();
    if (s.startsWith(prefix)) {
      return decodeURIComponent(s.slice(prefix.length));
    }
  }
  return null;
}

/** Calendar day YYYY-MM-DD (UTC) from stored ISO visit timestamp, or null if missing/invalid. */
export function readLastVisitCalendarDay(): string | null {
  const raw = parseCookie(COOKIE_NAME);
  if (!raw) {
    return null;
  }
  const t = Date.parse(raw);
  if (Number.isNaN(t)) {
    return null;
  }
  return new Date(t).toISOString().slice(0, 10);
}

/** Persist "now" so the *next* session can compare against changelog entry dates. */
export function writeLastVisitNow(): void {
  if (typeof document === "undefined") {
    return;
  }
  const value = encodeURIComponent(new Date().toISOString());
  const path = baseCookiePath();
  document.cookie = `${COOKIE_NAME}=${value}; Path=${path}; Max-Age=${MAX_AGE_SEC}; SameSite=Lax`;
}

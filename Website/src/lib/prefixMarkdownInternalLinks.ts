/**
 * Build an app-root URL that works on GitHub Pages (`base` = `/vibe_docs/`) and locally (`/`).
 * Use for raw `<a href>` in `innerHTML`; React `<Link to>` already respects `basename`.
 */
export function withViteBase(appPath: string): string {
  const trimmed = appPath.replace(/^\/+/, "");
  const base = import.meta.env.BASE_URL ?? "/";
  if (!base || base === "/") {
    return `/${trimmed}`;
  }
  const baseNorm = base.endsWith("/") ? base : `${base}/`;
  return `${baseNorm}${trimmed}`;
}

/**
 * Markdown HTML uses root-absolute paths (`/docs/...`, `/chapters/...`). On GitHub Pages the
 * app lives under `import.meta.env.BASE_URL` (e.g. `/vibe_docs/`). Raw `<a href>` does not get
 * React Router's basename, so clicks go to the wrong origin path. Rewrite in the DOM after parse.
 */
export function prefixMarkdownInternalLinks(root: HTMLElement): void {
  const base = import.meta.env.BASE_URL;
  if (!base || base === "/") {
    return;
  }

  const baseNorm = base.endsWith("/") ? base : `${base}/`;

  root.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") ?? "";
    if (!href || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
      return;
    }
    if (href.startsWith("#")) {
      return;
    }
    if (href.startsWith(baseNorm) || href.includes("/vibe_docs/")) {
      return;
    }

    const [pathPart, ...hashParts] = href.split("#");
    const hash = hashParts.length > 0 ? `#${hashParts.join("#")}` : "";
    const path = pathPart.split("?")[0];

    const isAppInternal =
      path.startsWith("/docs/") ||
      path.startsWith("/chapters/") ||
      path.startsWith("/simulations/") ||
      path.startsWith("/content-assets/") ||
      path === "/library" ||
      path === "/library/" ||
      path.startsWith("/library/");

    if (!isAppInternal) {
      return;
    }

    const withoutLeadingSlash = pathPart.startsWith("/") ? pathPart.slice(1) : pathPart;
    anchor.setAttribute("href", `${baseNorm}${withoutLeadingSlash}${hash}`);
  });
}

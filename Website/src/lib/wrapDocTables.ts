const SCROLL_CLASS = "doc-table-x-scroll";

/** Wrap each table so wide grids scroll horizontally instead of breaking the page layout. */
export function wrapTablesInDocBody(body: HTMLElement): void {
  body.querySelectorAll("table").forEach((table) => {
    const parent = table.parentElement;
    if (parent?.classList.contains(SCROLL_CLASS)) {
      return;
    }
    const doc = table.ownerDocument;
    const wrap = doc.createElement("div");
    wrap.className = SCROLL_CLASS;
    table.replaceWith(wrap);
    wrap.appendChild(table);
  });
}

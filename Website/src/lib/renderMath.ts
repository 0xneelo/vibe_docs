import katex from "katex";
import renderMathInElement from "katex/contrib/auto-render";
import { attachMathExpandButtons } from "@/lib/attachMathExpandButtons";

let modalEl: HTMLDivElement | null = null;
let modalBodyEl: HTMLDivElement | null = null;

function closeFormulaModal() {
  if (!modalEl) {
    return;
  }
  modalEl.classList.remove("is-open");
  document.body.classList.remove("doc-math-modal-open");
}

function ensureFormulaModal() {
  if (modalEl && modalBodyEl) {
    return { modalEl, modalBodyEl };
  }

  const modal = document.createElement("div");
  modal.className = "doc-math-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Expanded formula");

  const panel = document.createElement("div");
  panel.className = "doc-math-modal__panel";

  const header = document.createElement("div");
  header.className = "doc-math-modal__header";

  const title = document.createElement("p");
  title.className = "doc-math-modal__title";
  title.textContent = "Expanded Formula";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "doc-math-modal__close";
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", closeFormulaModal);

  const body = document.createElement("div");
  body.className = "doc-math-modal__body";

  header.append(title, closeButton);
  panel.append(header, body);
  modal.append(panel);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeFormulaModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeFormulaModal();
    }
  });

  document.body.appendChild(modal);
  modalEl = modal;
  modalBodyEl = body;
  return { modalEl: modal, modalBodyEl: body };
}

function openFormulaModal(sourceDisplay: HTMLElement) {
  const { modalEl: modal, modalBodyEl: body } = ensureFormulaModal();
  body.innerHTML = "";
  body.appendChild(sourceDisplay.cloneNode(true));
  modal.classList.add("is-open");
  document.body.classList.add("doc-math-modal-open");
}

function looksLikeMathCode(text: string) {
  if (!text || text.length > 700) {
    return false;
  }
  if (/(^|\n)\s*(const|let|var|function|class|import|export)\b/.test(text)) {
    return false;
  }
  return /[ΣΠμστγβδα√∈≤≥∞]|:=|_m|\\sum|\\frac|\\sqrt|\\max|\\min|[=]/.test(text);
}

function normalizeMathText(source: string) {
  return source
    .replaceAll("Π", "\\Pi")
    .replaceAll("Σ", "\\sum")
    .replaceAll("μ", "\\mu")
    .replaceAll("σ", "\\sigma")
    .replaceAll("τ", "\\tau")
    .replaceAll("γ", "\\gamma")
    .replaceAll("β", "\\beta")
    .replaceAll("δ", "\\delta")
    .replaceAll("α", "\\alpha")
    .replaceAll("√", "\\sqrt")
    .replaceAll("∈", "\\in")
    .replaceAll("≤", "\\le")
    .replaceAll("≥", "\\ge")
    .replaceAll("∞", "\\infty")
    .replaceAll("−", "-")
    .replaceAll("·", "\\cdot ")
    .replaceAll("×", "\\times ")
    .replaceAll("²", "^2")
    // Keep currency values valid inside KaTeX math mode.
    .replace(/\$(?=\d)/g, "\\$")
    // Use proper approx operator when prose has "(approx)".
    .replace(/\(approx\)/gi, "\\approx");
}

function renderEquationCodeBlocks(container: HTMLElement) {
  const codeBlocks = Array.from(container.querySelectorAll<HTMLElement>("pre > code"));
  for (const code of codeBlocks) {
    const pre = code.parentElement;
    if (!pre) {
      continue;
    }
    const raw = code.textContent?.trim() ?? "";
    if (!looksLikeMathCode(raw)) {
      continue;
    }

    const normalized = normalizeMathText(raw);
    const html = katex.renderToString(normalized, {
      displayMode: true,
      throwOnError: false,
      strict: "ignore",
    });
    const host = document.createElement("div");
    host.innerHTML = html;
    const rendered = host.firstElementChild as HTMLElement | null;
    if (!rendered || !rendered.classList.contains("katex-display")) {
      continue;
    }
    pre.replaceWith(rendered);
  }
}

export function renderMath(container: HTMLElement) {
  renderMathInElement(container, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
    strict: "ignore",
  });

  renderEquationCodeBlocks(container);
  attachMathExpandButtons(container, openFormulaModal);
}

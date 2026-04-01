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

  attachMathExpandButtons(container, openFormulaModal);
}

export function attachMathExpandButtons(
  container: HTMLElement,
  onExpand: (display: HTMLElement) => void,
) {
  const displays = Array.from(container.querySelectorAll<HTMLElement>(".katex-display"));
  for (const display of displays) {
    if (display.closest(".doc-math-display-wrap")) {
      continue;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "doc-math-display-wrap doc-math-display-wrap--icon";
    display.parentNode?.insertBefore(wrapper, display);
    wrapper.appendChild(display);

    const actions = document.createElement("div");
    actions.className = "doc-math-expand-actions doc-math-expand-actions--icon";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "doc-math-expand-btn doc-math-expand-btn--icon fullscreen-btn";
    button.setAttribute("aria-label", "Expand formula");
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 448 512");
    icon.setAttribute("height", "1em");
    icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z",
    );
    path.setAttribute("fill", "white");
    icon.append(path);
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.textContent = "Fullscreen";
    button.append(icon, tooltip);
    button.addEventListener("click", () => onExpand(display));

    actions.append(button);
    wrapper.appendChild(actions);
  }
}

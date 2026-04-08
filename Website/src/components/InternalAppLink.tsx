import type { MouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { withViteBase } from "@/lib/prefixMarkdownInternalLinks";

type Props = {
  to: string;
  className?: string;
  children: ReactNode;
};

/**
 * Client-side navigation like `react-router-dom` Link, but `href` includes `import.meta.env.BASE_URL`
 * (e.g. `/vibe_docs/simulations/z-score` on GitHub Pages) so “Copy link” and shares work.
 */
export function InternalAppLink({ to, className, children }: Props) {
  const navigate = useNavigate();
  const path = to.replace(/^\/+/, "");
  const href = withViteBase(path);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) {
      return;
    }
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

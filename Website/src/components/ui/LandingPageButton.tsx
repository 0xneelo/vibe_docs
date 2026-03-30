import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface LandingPageButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  altLabel?: string;
}

export function LandingPageButton({
  label,
  altLabel,
  className,
  type = "button",
  ...props
}: LandingPageButtonProps) {
  const chars = label.split("");
  const secondaryLabel = altLabel ?? label;

  return (
    <span className={cn("lp-btn-wrapper", className)}>
      <button type={type} className="lp-btn" {...props}>
        <span className="lp-txt-wrapper" aria-hidden="true">
          <span className="lp-txt-1">
            {chars.map((char, index) => (
              <span key={`${char}-${index}`} className="lp-btn-letter">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
          <span className="lp-txt-2">{secondaryLabel}</span>
        </span>
      </button>
    </span>
  );
}

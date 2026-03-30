import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap border border-transparent font-medium tracking-[0.005em] transition-[background-color,color,border-color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-xl bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(106,79,255,0.24)] hover:bg-primary/88 hover:shadow-[0_6px_18px_rgba(106,79,255,0.3)]",
        ghost:
          "rounded-xl border-white/10 text-foreground/80 hover:border-white/15 hover:bg-white/[0.04] hover:text-foreground",
        outline:
          "rounded-xl border-white/12 bg-white/[0.02] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/20 hover:bg-white/[0.06]",
        hero:
          "rounded-full bg-primary px-6 py-3 text-base text-primary-foreground shadow-[0_8px_28px_rgba(106,79,255,0.28)] hover:bg-primary/88 hover:shadow-[0_10px_32px_rgba(106,79,255,0.34)]",
        heroSecondary:
          "liquid-glass rounded-full border-white/12 px-6 py-3 text-base text-foreground shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:border-white/18 hover:bg-white/[0.07]",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-9 px-4 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

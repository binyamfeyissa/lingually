import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono font-medium uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:pointer-events-none disabled:opacity-40 select-none rounded-none";

    const variants = {
      primary: "bg-invert-bg text-invert-fg hover:opacity-85 active:opacity-95 border border-transparent",
      secondary: "border border-line-strong bg-bg text-ink hover:bg-invert-bg hover:text-invert-fg",
      outline: "border border-line bg-transparent hover:border-line-strong hover:bg-bg-raised text-ink",
      ghost: "text-muted hover:text-ink hover:bg-line/20",
      danger: "border border-danger/60 text-danger hover:bg-danger hover:text-white",
      subtle: "bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30",
    };

    const sizes = {
      sm: "h-7 px-2.5 text-[10px] gap-1.5",
      md: "h-9 px-3.5 text-[11px] gap-2",
      lg: "h-11 px-5 text-xs gap-2.5",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

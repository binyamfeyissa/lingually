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
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variants = {
      primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm",
      secondary: "bg-surface-muted text-foreground hover:bg-surface-subtle border border-surface-border",
      outline: "border border-surface-border bg-transparent hover:bg-surface-muted text-foreground",
      ghost: "hover:bg-surface-muted text-foreground/80 hover:text-foreground",
      danger: "bg-danger text-white hover:bg-danger-dark active:bg-red-700",
      subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-300",
    };

    const sizes = {
      sm: "h-8 px-2.5 text-xs rounded-md gap-1.5",
      md: "h-9 px-3.5 text-sm rounded-md gap-2",
      lg: "h-11 px-5 text-base rounded-lg gap-2.5",
      icon: "h-9 w-9 p-0 rounded-md",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

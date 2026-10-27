import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-subtle text-foreground/80",
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    outline: "border border-surface-border text-foreground/70",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-tight",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-bg-sunken text-muted border border-line",
    brand: "bg-accent/10 text-accent border border-accent/30",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    danger: "bg-danger/10 text-danger border border-danger/30",
    outline: "border border-line-strong text-ink",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] font-medium rounded-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

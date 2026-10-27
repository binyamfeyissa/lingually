import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-9 w-full rounded-md border border-surface-border bg-surface px-3 py-1 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-foreground/60">{helperText}</p>}
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="text-xs text-foreground/60">{helperText}</p>}
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-foreground/70">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "flex h-9 w-full rounded-md border border-surface-border bg-surface px-3 py-1 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

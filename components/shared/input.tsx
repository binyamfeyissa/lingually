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
          <label htmlFor={inputId} className="block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-9 w-full rounded-none border border-line bg-bg px-3 py-1 text-xs text-ink placeholder:text-muted/50 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-ink disabled:cursor-not-allowed disabled:opacity-40 font-mono transition-colors",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="font-mono text-[10px] text-muted">{helperText}</p>}
        {error && <p className="font-mono text-[10px] text-danger">{error}</p>}
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
          <label htmlFor={inputId} className="block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "flex min-h-[80px] w-full rounded-none border border-line bg-bg px-3 py-2 text-xs text-ink placeholder:text-muted/50 focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-ink disabled:cursor-not-allowed disabled:opacity-40 font-mono transition-colors",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {helperText && !error && <p className="font-mono text-[10px] text-muted">{helperText}</p>}
        {error && <p className="font-mono text-[10px] text-danger">{error}</p>}
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
          <label htmlFor={selectId} className="block font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "flex h-9 w-full rounded-none border border-line bg-bg px-3 py-1 text-xs text-ink focus:border-line-strong focus:outline-none focus:ring-1 focus:ring-ink disabled:cursor-not-allowed disabled:opacity-40 font-mono transition-colors",
            error && "border-danger focus:border-danger focus:ring-danger",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg text-ink">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="font-mono text-[10px] text-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

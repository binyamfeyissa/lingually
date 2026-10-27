import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "lg",
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative w-full rounded-xl border border-surface-border bg-surface p-6 shadow-xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col",
          maxWidths[maxWidth],
          className
        )}
      >
        <div className="flex items-start justify-between pb-3 border-b border-surface-border">
          <div>
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-foreground/60">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-foreground/50 hover:bg-surface-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto pt-4 flex-1">{children}</div>
      </div>
    </div>
  );
}

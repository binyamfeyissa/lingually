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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-100"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative w-full rounded-none border border-line-strong bg-bg p-6 shadow-2xl animate-in zoom-in-95 duration-100 max-h-[90vh] flex flex-col",
          maxWidths[maxWidth],
          className
        )}
      >
        {/* Corner ticks */}
        <span className="tick top-[-5px] left-[-5px]" />
        <span className="tick top-[-5px] right-[-5px]" />
        <span className="tick bottom-[-5px] left-[-5px]" />
        <span className="tick bottom-[-5px] right-[-5px]" />

        <div className="flex items-start justify-between pb-3 border-b border-line">
          <div>
            {title && (
              <h2 id="modal-title" className="font-display text-base font-semibold text-ink tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 font-mono text-[11px] text-muted">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-muted hover:text-ink hover:bg-line/20 rounded-none transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto pt-4 flex-1">{children}</div>
      </div>
    </div>
  );
}

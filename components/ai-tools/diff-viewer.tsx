"use client";

import React, { useState } from "react";
import { computeWordDiff } from "@/lib/utils/diff";
import { Check, X, Copy, Columns, Rows } from "lucide-react";
import { Button } from "../shared/button";
import { cn } from "@/lib/utils/cn";

export interface DiffViewerProps {
  originalText: string;
  suggestedText: string;
  onAccept: () => void;
  onReject: () => void;
  onCopy?: () => void;
  title?: string;
  selectionOnly?: boolean;
}

export function DiffViewer({
  originalText,
  suggestedText,
  onAccept,
  onReject,
  onCopy,
  title = "Suggested Changes",
  selectionOnly = false,
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<"inline" | "side-by-side">("inline");
  const [copied, setCopied] = useState(false);

  const diff = computeWordDiff(originalText, suggestedText);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

  return (
    <div className="rounded-lg border border-surface-border bg-surface overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-muted border-b border-surface-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{title}</span>
          {selectionOnly && (
            <span className="text-[10px] bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300 font-medium px-1.5 py-0.5 rounded">
              Selection only
            </span>
          )}
          <span className="text-[11px] text-foreground/50">
            (+{diff.additionsCount} / -{diff.deletionsCount})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "inline" ? "side-by-side" : "inline")}
            className="p-1 text-foreground/60 hover:text-foreground rounded hover:bg-surface transition-colors"
            title={viewMode === "inline" ? "Switch to Side-by-Side view" : "Switch to Inline Diff view"}
          >
            {viewMode === "inline" ? <Columns className="h-3.5 w-3.5" /> : <Rows className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Content View */}
      <div className="p-3 text-sm max-h-[360px] overflow-y-auto leading-relaxed font-sans">
        {viewMode === "inline" ? (
          <div className="whitespace-pre-wrap select-text">
            {diff.parts.map((part, index) => {
              if (part.added) {
                return (
                  <span
                    key={index}
                    className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 font-medium underline decoration-emerald-500 underline-offset-2 px-0.5 rounded-sm"
                  >
                    {part.value}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span
                    key={index}
                    className="bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200 line-through opacity-70 px-0.5 rounded-sm"
                  >
                    {part.value}
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                Original
              </div>
              <div className="text-xs text-foreground/80 whitespace-pre-wrap">{originalText}</div>
            </div>
            <div className="p-2.5 rounded border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                Suggested Replacement
              </div>
              <div className="text-xs text-foreground/90 whitespace-pre-wrap font-medium">
                {suggestedText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface-muted/60 border-t border-surface-border">
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs gap-1">
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy text"}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            className="text-xs gap-1 border-surface-border hover:bg-surface-subtle"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAccept}
            className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="h-3.5 w-3.5" />
            Accept & Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

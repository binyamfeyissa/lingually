"use client";

import React, { useState } from "react";
import { computeWordDiff } from "@/lib/utils/diff";
import { Check, X, Copy, Columns, Rows } from "lucide-react";
import { Button } from "../shared/button";
import { cn } from "@/lib/utils/cn";

export interface DiffViewerProps {
  original?: string;
  originalText?: string;
  modified?: string;
  suggestedText?: string;
  onAccept: () => void;
  onReject: () => void;
  onCopy?: () => void;
  title?: string;
  selectionOnly?: boolean;
}

export function DiffViewer({
  original,
  originalText,
  modified,
  suggestedText,
  onAccept,
  onReject,
  onCopy,
  title = "SUGGESTED REWRITE",
  selectionOnly = false,
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<"inline" | "side-by-side">("inline");
  const [copied, setCopied] = useState(false);

  const orig = originalText ?? original ?? "";
  const sug = suggestedText ?? modified ?? "";

  const diff = computeWordDiff(orig, sug);

  const handleCopy = () => {
    navigator.clipboard.writeText(sug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopy) onCopy();
  };

  return (
    <div className="rounded-none border border-line bg-bg-raised overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-bg border-b border-line font-mono text-[11px] uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">{title}</span>
          {selectionOnly && (
            <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-1 py-0.2">
              SELECTION
            </span>
          )}
          <span className="text-[10px] text-muted">
            (+{diff.additionsCount} / -{diff.deletionsCount})
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "inline" ? "side-by-side" : "inline")}
            className="p-1 text-muted hover:text-ink transition-colors"
            title={viewMode === "inline" ? "Switch to Side-by-Side view" : "Switch to Inline Diff view"}
          >
            {viewMode === "inline" ? <Columns className="h-3 w-3" /> : <Rows className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Content View */}
      <div className="p-3 text-xs max-h-[360px] overflow-y-auto leading-relaxed font-sans">
        {viewMode === "inline" ? (
          <div className="whitespace-pre-wrap select-text">
            {diff.parts.map((part, index) => {
              if (part.added) {
                return (
                  <span
                    key={index}
                    className="bg-accent/15 text-accent font-semibold px-0.5 rounded-none"
                  >
                    {part.value}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span
                    key={index}
                    className="bg-danger/15 text-danger line-through opacity-80 px-0.5 rounded-none"
                  >
                    {part.value}
                  </span>
                );
              }
              return <span key={index}>{part.value}</span>;
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-line bg-bg">
              <div className="font-mono text-[9px] uppercase tracking-wider text-danger mb-1">
                ORIGINAL
              </div>
              <div className="text-[11px] text-muted whitespace-pre-wrap">{orig}</div>
            </div>

            <div className="p-2 border border-line bg-bg">
              <div className="font-mono text-[9px] uppercase tracking-wider text-accent mb-1">
                MODIFIED
              </div>
              <div className="text-[11px] text-ink font-medium whitespace-pre-wrap">{sug}</div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-bg border-t border-line">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-[10px]"
        >
          {copied ? <Check className="h-3 w-3 mr-1 text-emerald-500" /> : <Copy className="h-3 w-3 mr-1" />}
          <span>{copied ? "COPIED" : "COPY"}</span>
        </Button>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onReject}
            className="h-6 px-2.5 text-[10px]"
          >
            DISMISS
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onAccept}
            className="h-6 px-3 text-[10px]"
          >
            <Check className="h-3 w-3 mr-1" />
            <span>ACCEPT</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

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
  const [viewMode, setViewMode] = useState<"inline" | "clean" | "side-by-side">("inline");
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

  const renderFormattedInlineText = (text: string) => {
    if (!text) return null;
    if (!text.includes("**") && !text.includes("*") && !text.includes("`")) {
      return text;
    }
    const parts = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-semibold text-ink">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={match.index} className="italic text-ink">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code key={match.index} className="font-mono text-[10px] bg-bg px-0.5 border border-line">
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return <React.Fragment>{parts}</React.Fragment>;
  };

  const renderCleanFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const isBullet = /^\s*[-*•]\s+(.*)$/.exec(line);
      const content = isBullet ? isBullet[1] : line;

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-0.5 ml-2 text-ink">
            <span className="text-accent font-bold">•</span>
            <div>{renderFormattedInlineText(content)}</div>
          </div>
        );
      }

      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }

      return (
        <div key={idx} className="text-ink my-0.5">
          {renderFormattedInlineText(content)}
        </div>
      );
    });
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

        {/* View mode toggle: DIFF vs CLEAN TEXT vs SIDE-BY-SIDE (Bug 46) */}
        <div className="flex items-center gap-1 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => setViewMode("inline")}
            className={cn(
              "px-1.5 py-0.5 border transition-colors",
              viewMode === "inline"
                ? "bg-invert-bg text-invert-fg border-invert-bg font-semibold"
                : "bg-bg text-muted border-line hover:text-ink"
            )}
            title="Inline diff showing word changes"
          >
            DIFF
          </button>
          <button
            type="button"
            onClick={() => setViewMode("clean")}
            className={cn(
              "px-1.5 py-0.5 border transition-colors",
              viewMode === "clean"
                ? "bg-invert-bg text-invert-fg border-invert-bg font-semibold"
                : "bg-bg text-muted border-line hover:text-ink"
            )}
            title="Clean text formatted without deletions"
          >
            CLEAN TEXT
          </button>
          <button
            type="button"
            onClick={() => setViewMode("side-by-side")}
            className={cn(
              "p-1 border transition-colors",
              viewMode === "side-by-side"
                ? "bg-invert-bg text-invert-fg border-invert-bg"
                : "bg-bg text-muted border-line hover:text-ink"
            )}
            title="Side-by-side original and modified comparison"
          >
            <Columns className="h-2.5 w-2.5" />
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
                    {renderFormattedInlineText(part.value)}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span
                    key={index}
                    className="bg-danger/15 text-danger line-through opacity-80 px-0.5 rounded-none"
                  >
                    {renderFormattedInlineText(part.value)}
                  </span>
                );
              }
              return <span key={index}>{renderFormattedInlineText(part.value)}</span>;
            })}
          </div>
        ) : viewMode === "clean" ? (
          <div className="select-text space-y-1">
            {renderCleanFormattedText(sug)}
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
              <div className="text-[11px] text-ink font-medium select-text">
                {renderCleanFormattedText(sug)}
              </div>
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

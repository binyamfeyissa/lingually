"use client";

import React from "react";
import { GrammarResult, GrammarChange } from "@/types/writing-tools";
import { DiffViewer } from "./diff-viewer";
import { Badge } from "../shared/badge";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export interface GrammarToolProps {
  originalText: string;
  result?: GrammarResult;
  isStreaming?: boolean;
  onAccept: (replacementText: string) => void;
  onReject: () => void;
  selectionOnly?: boolean;
}

export function GrammarTool({
  originalText,
  result,
  isStreaming = false,
  onAccept,
  onReject,
  selectionOnly = false,
}: GrammarToolProps) {
  if (isStreaming) {
    return (
      <div className="p-4 rounded-lg border border-surface-border bg-surface-muted/50 space-y-3 animate-pulse">
        <div className="flex items-center gap-2 text-xs font-medium text-brand-600">
          <Sparkles className="h-4 w-4 animate-spin" />
          Analyzing grammar, spelling, and sentence syntax...
        </div>
        <div className="h-20 bg-surface-subtle rounded-md" />
      </div>
    );
  }

  if (!result) return null;

  const hasIssues = result.changes && result.changes.length > 0;

  return (
    <div className="space-y-3">
      {/* Summary Banner */}
      <div className="p-3 rounded-lg border border-surface-border bg-surface flex items-start gap-2.5 text-xs">
        {hasIssues ? (
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        )}
        <div>
          <div className="font-semibold text-foreground">
            {hasIssues
              ? `${result.changes.length} suggestion${result.changes.length === 1 ? "" : "s"} identified`
              : "No grammatical issues detected"}
          </div>
          <p className="text-foreground/70 mt-0.5">
            {result.summary || (hasIssues ? "Review the individual changes below." : "Your text looks clean and grammatically sound.")}
          </p>
        </div>
      </div>

      {/* Structured Suggestions List */}
      {hasIssues && (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {result.changes.map((change: GrammarChange, idx: number) => (
            <div
              key={idx}
              className="p-2.5 rounded-md border border-surface-border bg-surface hover:border-brand-300 transition-colors text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-rose-600 dark:text-rose-400 line-through">
                  {change.original}
                </span>
                <span className="text-foreground/40 text-[10px]">→</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {change.replacement}
                </span>
                <Badge variant="outline" className="text-[10px] ml-auto uppercase">
                  {change.category}
                </Badge>
              </div>
              <p className="text-foreground/60 text-[11px]">{change.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full Diff Viewer with Accept/Reject actions */}
      <DiffViewer
        originalText={originalText}
        suggestedText={result.correctedText}
        onAccept={() => onAccept(result.correctedText)}
        onReject={onReject}
        title="Corrected Text Comparison"
        selectionOnly={selectionOnly}
      />
    </div>
  );
}

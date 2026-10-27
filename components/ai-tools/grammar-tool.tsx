"use client";

import React from "react";
import { GrammarResult, GrammarChange } from "@/types/writing-tools";
import { DiffViewer } from "./diff-viewer";
import { Badge } from "../shared/badge";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export interface GrammarToolProps {
  originalText?: string;
  result?: GrammarResult;
  isStreaming?: boolean;
  onAccept?: (replacementText: string) => void;
  onApplyReplacement?: (replacementText: string) => void;
  onReject?: () => void;
  onDismiss?: () => void;
  selectionOnly?: boolean;
}

export function GrammarTool({
  originalText,
  result,
  isStreaming = false,
  onAccept,
  onApplyReplacement,
  onReject,
  onDismiss,
  selectionOnly = false,
}: GrammarToolProps) {
  const handleApply = onApplyReplacement || onAccept || (() => {});
  const handleCancel = onDismiss || onReject || (() => {});
  const orig = originalText || "";

  if (isStreaming) {
    return (
      <div className="p-3 border border-line bg-bg-raised space-y-2 animate-pulse">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-accent">
          <Sparkles className="h-3.5 w-3.5 animate-spin" />
          <span>ANALYZING SYNTAX & GRAMMAR...</span>
        </div>
        <div className="h-16 bg-bg-sunken" />
      </div>
    );
  }

  if (!result) return null;

  const hasIssues = result.changes && result.changes.length > 0;

  return (
    <div className="space-y-2.5 font-mono">
      {/* Summary Banner */}
      <div className="p-2.5 border border-line bg-bg flex items-start gap-2 text-xs">
        {hasIssues ? (
          <AlertCircle className="h-3.5 w-3.5 text-danger shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
        )}
        <div>
          <div className="font-semibold text-ink text-[11px] uppercase tracking-wider">
            {hasIssues
              ? `${result.changes.length} SUGGESTION${result.changes.length === 1 ? "" : "S"} IDENTIFIED`
              : "NO GRAMMATICAL ISSUES DETECTED"}
          </div>
          <p className="font-sans text-muted text-[11px] mt-0.5">
            {result.summary || (hasIssues ? "Review the individual changes below." : "Your text looks clean and grammatically sound.")}
          </p>
        </div>
      </div>

      {/* Structured Suggestions List */}
      {hasIssues && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {result.changes.map((change: GrammarChange, idx: number) => (
            <div
              key={idx}
              className="p-2 border border-line bg-bg-raised text-xs space-y-1"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-danger line-through">
                  {change.original}
                </span>
                <span className="text-muted">→</span>
                <span className="font-semibold text-accent">
                  {change.replacement}
                </span>
                <Badge variant="outline" className="text-[9px] ml-auto uppercase">
                  {change.category}
                </Badge>
              </div>
              <p className="font-sans text-muted text-[10px]">{change.explanation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full Diff Viewer with Accept/Reject actions */}
      <DiffViewer
        originalText={orig}
        suggestedText={result.correctedText}
        onAccept={() => handleApply(result.correctedText)}
        onReject={handleCancel}
        title="CORRECTED TEXT"
        selectionOnly={selectionOnly}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { RewriteAlternative, AIResult } from "@/types/writing-tools";
import { DiffViewer } from "./diff-viewer";
import { cn } from "@/lib/utils/cn";

export interface AlternativesViewProps {
  originalText?: string;
  alternatives?: RewriteAlternative[];
  result?: AIResult;
  onAccept?: (text: string) => void;
  onApplyAlternative?: (text: string) => void;
  onReject?: () => void;
  onDismiss?: () => void;
  selectionOnly?: boolean;
}

export function AlternativesView({
  originalText,
  alternatives,
  result,
  onAccept,
  onApplyAlternative,
  onReject,
  onDismiss,
  selectionOnly = false,
}: AlternativesViewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const alts = alternatives || result?.alternatives || [];
  const orig = originalText || result?.originalText || "";
  const handleApply = onApplyAlternative || onAccept || (() => {});
  const handleCancel = onDismiss || onReject || (() => {});

  if (!alts || alts.length === 0) return null;

  const activeAlternative = alts[selectedIndex] || alts[0];

  return (
    <div className="space-y-2.5 font-mono">
      {/* Alternatives Tabs */}
      {alts.length > 1 && (
        <div className="flex gap-px bg-line p-px">
          {alts.map((alt, idx) => (
            <button
              key={alt.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "flex-1 py-1 px-2 text-[10px] uppercase tracking-wider transition-colors text-center rounded-none",
                selectedIndex === idx
                  ? "bg-invert-bg text-invert-fg font-semibold"
                  : "bg-bg text-muted hover:text-ink"
              )}
            >
              {alt.label || `OPT ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Diff comparison for selected alternative */}
      <DiffViewer
        originalText={orig}
        suggestedText={activeAlternative.text}
        onAccept={() => handleApply(activeAlternative.text)}
        onReject={handleCancel}
        title={activeAlternative.label || `OPTION ${selectedIndex + 1}`}
        selectionOnly={selectionOnly}
      />
    </div>
  );
}

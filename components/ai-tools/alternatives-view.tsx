"use client";

import React, { useState } from "react";
import { RewriteAlternative } from "@/types/writing-tools";
import { DiffViewer } from "./diff-viewer";
import { cn } from "@/lib/utils/cn";

export interface AlternativesViewProps {
  originalText: string;
  alternatives: RewriteAlternative[];
  onAccept: (text: string) => void;
  onReject: () => void;
  selectionOnly?: boolean;
}

export function AlternativesView({
  originalText,
  alternatives,
  onAccept,
  onReject,
  selectionOnly = false,
}: AlternativesViewProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!alternatives || alternatives.length === 0) return null;

  const activeAlternative = alternatives[selectedIndex] || alternatives[0];

  return (
    <div className="space-y-3">
      {/* Alternatives Tabs */}
      {alternatives.length > 1 && (
        <div className="flex gap-1.5 p-1 bg-surface-muted rounded-lg border border-surface-border">
          {alternatives.map((alt, idx) => (
            <button
              key={alt.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all text-center",
                selectedIndex === idx
                  ? "bg-surface text-foreground shadow-sm font-semibold"
                  : "text-foreground/60 hover:text-foreground"
              )}
            >
              {alt.label || `Option ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Diff comparison for selected alternative */}
      <DiffViewer
        originalText={originalText}
        suggestedText={activeAlternative.text}
        onAccept={() => onAccept(activeAlternative.text)}
        onReject={onReject}
        title={activeAlternative.label || `Option ${selectedIndex + 1}`}
        selectionOnly={selectionOnly}
      />
    </div>
  );
}

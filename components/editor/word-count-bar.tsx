"use client";

import React from "react";
import { calculateTextStatistics } from "@/lib/analysis/statistics";
import { calculateReadability } from "@/lib/analysis/readability";
import { Clock, BookOpen, BarChart2, History, Check, Loader2 } from "lucide-react";
import { Button } from "../shared/button";
import { cn } from "@/lib/utils/cn";

export interface WordCountBarProps {
  plainText: string;
  saveStatus: "saved" | "saving" | "unsaved";
  onOpenAnalysis: () => void;
  onOpenHistory: () => void;
}

export function WordCountBar({
  plainText,
  saveStatus,
  onOpenAnalysis,
  onOpenHistory,
}: WordCountBarProps) {
  const stats = calculateTextStatistics(plainText);
  const readability = calculateReadability(plainText);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-surface-border bg-surface text-xs text-foreground/70 select-none">
      {/* Left: Counts and Reading Speed */}
      <div className="flex items-center gap-4">
        <span className="font-mono">
          <strong className="text-foreground">{stats.wordCount}</strong> words
        </span>
        <span className="font-mono text-foreground/50">
          {stats.characterCount} chars
        </span>
        <span className="hidden sm:flex items-center gap-1 text-foreground/60">
          <Clock className="h-3.5 w-3.5" />
          {stats.readingTimeMinutes < 1 ? "< 1 min" : `~${stats.readingTimeMinutes} min read`}
        </span>
        {readability.isReliableForLanguage && stats.wordCount >= 5 && (
          <span className="hidden md:flex items-center gap-1 text-foreground/60">
            <BookOpen className="h-3.5 w-3.5" />
            {readability.readingEaseLabel} ({Math.round(readability.fleschReadingEase)})
          </span>
        )}
      </div>

      {/* Right: Autosave status & Analysis trigger buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium mr-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              Saved locally
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="text-foreground/40 italic">Unsaved changes</span>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenHistory}
          className="h-7 text-xs gap-1 text-foreground/70"
          title="Open Revision History"
        >
          <History className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">History</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenAnalysis}
          className="h-7 text-xs gap-1 text-foreground/70"
          title="Open Writing Analysis & Readability"
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Analysis</span>
        </Button>
      </div>
    </div>
  );
}

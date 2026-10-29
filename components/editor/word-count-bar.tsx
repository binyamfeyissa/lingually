"use client";

import React from "react";
import { calculateTextStatistics } from "@/lib/analysis/statistics";
import { calculateReadability } from "@/lib/analysis/readability";
import { Clock, BookOpen, BarChart2, History, Check, Loader2 } from "lucide-react";

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
    <div className="flex items-center justify-between px-4 py-1.5 border-t border-line bg-bg font-mono text-[11px] text-muted select-none shrink-0">
      {/* Left: Monospace HUD Metrics */}
      <div className="flex items-center gap-4">
        <span>
          {"WORDS // "}<strong className="text-ink font-semibold">{stats.wordCount}</strong>
        </span>
        <span className="hidden sm:inline">
          {"CHARS // "}<span className="text-ink">{stats.characterCount}</span>
        </span>
        <span className="hidden md:inline">
          {"READ // "}<span className="text-ink">{stats.readingTimeMinutes < 1 ? "< 1m" : `~${stats.readingTimeMinutes}m`}</span>
        </span>
        {readability.isReliableForLanguage && stats.wordCount >= 5 && (
          <span className="hidden lg:inline">
            {"READABILITY // "}<span className="text-ink uppercase">{readability.readingEaseLabel} ({Math.round(readability.fleschReadingEase)})</span>
          </span>
        )}
      </div>

      {/* Right: Autosave telemetry & Modals */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-accent font-semibold">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>SAVING</span>
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              <span>SAVED (LOCAL)</span>
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="text-muted/60" title="Autosaves automatically as you type or navigate">
              UNSAVED (AUTOSAVING)
            </span>
          )}
        </div>

        <div className="h-3.5 w-px bg-line" />

        <button
          onClick={onOpenHistory}
          className="h-6 px-2 border border-line hover:border-line-strong hover:bg-bg-raised text-muted hover:text-ink text-[10px] uppercase tracking-wider flex items-center gap-1 transition"
          title="Open Revision History"
        >
          <History className="h-3 w-3" />
          <span className="hidden sm:inline">HISTORY</span>
        </button>

        <button
          onClick={onOpenAnalysis}
          className="h-6 px-2 border border-line hover:border-line-strong hover:bg-bg-raised text-muted hover:text-ink text-[10px] uppercase tracking-wider flex items-center gap-1 transition"
          title="Open Writing Analysis & Readability"
        >
          <BarChart2 className="h-3 w-3" />
          <span className="hidden sm:inline">METRICS</span>
        </button>
      </div>
    </div>
  );
}

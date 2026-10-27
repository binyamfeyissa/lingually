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
    <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 select-none shrink-0">
      {/* Left: Counts and Reading Speed */}
      <div className="flex items-center gap-4">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          <strong className="font-semibold text-slate-900 dark:text-white">{stats.wordCount}</strong> words
        </span>
        <span className="text-slate-400 font-mono text-[11px]">
          {stats.characterCount} chars
        </span>
        <span className="hidden sm:flex items-center gap-1 text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{stats.readingTimeMinutes < 1 ? "< 1 min read" : `~${stats.readingTimeMinutes} min read`}</span>
        </span>
        {readability.isReliableForLanguage && stats.wordCount >= 5 && (
          <span className="hidden md:flex items-center gap-1 text-slate-500">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span>{readability.readingEaseLabel} ({Math.round(readability.fleschReadingEase)})</span>
          </span>
        )}
      </div>

      {/* Right: Autosave status & Analysis trigger buttons */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium mr-2">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-[#0268cc]">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              <span>Saved locally</span>
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="text-slate-400 italic">Unsaved</span>
          )}
        </div>

        <button
          onClick={onOpenHistory}
          className="h-7 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 transition"
          title="Open Revision History"
        >
          <History className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">History</span>
        </button>

        <button
          onClick={onOpenAnalysis}
          className="h-7 px-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 transition"
          title="Open Writing Analysis & Readability"
        >
          <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Analysis</span>
        </button>
      </div>
    </div>
  );
}

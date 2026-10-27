"use client";

import React, { useState } from "react";
import { calculateTextStatistics } from "@/lib/analysis/statistics";
import { calculateReadability } from "@/lib/analysis/readability";
import { analyzeAIWritingIndicators } from "@/lib/analysis/heuristics";
import { Modal } from "../shared/modal";
import { Tabs } from "../shared/tabs";
import {
  BarChart2,
  BookOpen,
  Clock,
  Sparkles,
  Info,
  ShieldAlert,
  Type,
  FileText,
  AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
}

export function AnalysisDrawer({ isOpen, onClose, text }: AnalysisDrawerProps) {
  const [tab, setTab] = useState<"stats" | "readability" | "heuristics">("stats");

  const stats = calculateTextStatistics(text);
  const readability = calculateReadability(text);
  const heuristics = analyzeAIWritingIndicators(text);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Writing Analysis & Readability"
      description="Deterministic metrics calculated locally in your browser."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <Tabs
          activeTab={tab}
          onChange={(t) => setTab(t as any)}
          tabs={[
            { id: "stats", label: "Text Statistics", icon: <BarChart2 className="h-3.5 w-3.5" /> },
            { id: "readability", label: "Readability Scores", icon: <BookOpen className="h-3.5 w-3.5" /> },
            { id: "heuristics", label: "AI Indicators", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
          ]}
        />

        {tab === "stats" && (
          <div className="space-y-4 text-xs">
            {/* Primary counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-surface-border bg-surface text-center">
                <div className="text-foreground/60 text-[11px] font-medium">Words</div>
                <div className="text-2xl font-bold text-foreground mt-0.5">{stats.wordCount}</div>
              </div>
              <div className="p-3 rounded-lg border border-surface-border bg-surface text-center">
                <div className="text-foreground/60 text-[11px] font-medium">Characters</div>
                <div className="text-2xl font-bold text-foreground mt-0.5">{stats.characterCount}</div>
                <div className="text-[10px] text-foreground/40">({stats.characterCountNoSpaces} no spaces)</div>
              </div>
              <div className="p-3 rounded-lg border border-surface-border bg-surface text-center">
                <div className="text-foreground/60 text-[11px] font-medium">Sentences</div>
                <div className="text-2xl font-bold text-foreground mt-0.5">{stats.sentenceCount}</div>
              </div>
              <div className="p-3 rounded-lg border border-surface-border bg-surface text-center">
                <div className="text-foreground/60 text-[11px] font-medium">Paragraphs</div>
                <div className="text-2xl font-bold text-foreground mt-0.5">{stats.paragraphCount}</div>
              </div>
            </div>

            {/* Averages & Reading Speed */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-surface-border bg-surface">
                <div className="text-foreground/60 text-[11px]">Avg. Words / Sentence</div>
                <div className="text-lg font-semibold text-foreground mt-0.5">{stats.averageWordsPerSentence}</div>
              </div>
              <div className="p-3 rounded-lg border border-surface-border bg-surface">
                <div className="text-foreground/60 text-[11px]">Avg. Chars / Word</div>
                <div className="text-lg font-semibold text-foreground mt-0.5">{stats.averageCharactersPerWord}</div>
              </div>
              <div className="p-3 rounded-lg border border-surface-border bg-surface">
                <div className="text-foreground/60 text-[11px] flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Reading Time
                </div>
                <div className="text-lg font-semibold text-foreground mt-0.5">
                  {stats.readingTimeMinutes < 1 ? "< 1 min" : `~${stats.readingTimeMinutes} min`}
                </div>
                <div className="text-[10px] text-foreground/40">at 200 wpm</div>
              </div>
              <div className="p-3 rounded-lg border border-surface-border bg-surface">
                <div className="text-foreground/60 text-[11px] flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Speaking Time
                </div>
                <div className="text-lg font-semibold text-foreground mt-0.5">
                  {stats.speakingTimeMinutes < 1 ? "< 1 min" : `~${stats.speakingTimeMinutes} min`}
                </div>
                <div className="text-[10px] text-foreground/40">at 130 wpm</div>
              </div>
            </div>

            {/* Vocabulary Richness & Frequent Words */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-surface-border bg-surface space-y-1.5">
                <div className="font-semibold text-foreground">Lexical Richness (Type-Token Ratio)</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
                    {Math.round(stats.lexicalDiversity * 100)}%
                  </span>
                  <span className="text-foreground/50 text-[11px]">
                    ({stats.uniqueWordCount} unique words out of {stats.wordCount})
                  </span>
                </div>
                <p className="text-[11px] text-foreground/60">
                  Higher diversity indicates rich vocabulary with low repetitive word usage.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-surface-border bg-surface space-y-1.5">
                <div className="font-semibold text-foreground">Frequent Key Terms</div>
                {stats.frequentWords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {stats.frequentWords.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-surface-muted text-foreground/80 font-mono text-[11px]"
                      >
                        {item.word} <span className="opacity-50">({item.count})</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-foreground/50">Not enough content to extract key terms.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "readability" && (
          <div className="space-y-3.5 text-xs">
            {!readability.isReliableForLanguage && (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="leading-relaxed">{readability.languageNote}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Flesch Reading Ease */}
              <div className="p-4 rounded-lg border border-surface-border bg-surface text-center space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
                  Flesch Reading Ease
                </div>
                <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                  {readability.fleschReadingEase}
                </div>
                <div className="text-xs font-semibold text-foreground">{readability.readingEaseLabel}</div>
                <p className="text-[10px] text-foreground/50 pt-1">
                  0-30: Very difficult (post-grad) • 60-70: Standard (plain English) • 90-100: Very easy
                </p>
              </div>

              {/* Flesch-Kincaid Grade Level */}
              <div className="p-4 rounded-lg border border-surface-border bg-surface text-center space-y-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
                  Flesch-Kincaid Grade Level
                </div>
                <div className="text-3xl font-extrabold text-foreground">
                  {readability.fleschKincaidGradeLevel}
                </div>
                <div className="text-xs font-semibold text-foreground">{readability.gradeLevelLabel}</div>
                <p className="text-[10px] text-foreground/50 pt-1">
                  Reflects US school grade required to understand the text on first reading.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-surface-border bg-surface">
                <div className="font-semibold text-foreground">Coleman-Liau Index</div>
                <div className="text-xl font-bold mt-1 text-foreground">{readability.colemanLiauIndex}</div>
                <p className="text-[10px] text-foreground/50 mt-0.5">Calculated from character lengths rather than syllables.</p>
              </div>

              <div className="p-3 rounded-lg border border-surface-border bg-surface">
                <div className="font-semibold text-foreground">Gunning Fog Index</div>
                <div className="text-xl font-bold mt-1 text-foreground">{readability.gunningFogIndex}</div>
                <p className="text-[10px] text-foreground/50 mt-0.5">Estimates years of formal education needed for comprehension.</p>
              </div>
            </div>
          </div>
        )}

        {tab === "heuristics" && (
          <div className="space-y-3.5 text-xs">
            <div className="p-4 rounded-lg border border-surface-border bg-surface text-center space-y-1">
              <div className="text-xs text-foreground/60 font-semibold uppercase tracking-wider">
                Overall Stylistic Indicator
              </div>
              <div className="text-3xl font-extrabold text-foreground">{heuristics.overallIndicatorScore} / 100</div>
              <div className="text-xs font-medium text-brand-600 dark:text-brand-400">{heuristics.overallAssessment}</div>
            </div>

            <div className="p-3 rounded-md bg-amber-50/70 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed">
              <strong className="block mb-0.5">Statistical Heuristic Notice:</strong>
              {heuristics.disclaimer}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

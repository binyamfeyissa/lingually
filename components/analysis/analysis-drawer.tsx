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
  ShieldAlert,
} from "lucide-react";

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
      title="WRITING METRICS & READABILITY"
      description="Deterministic linguistic statistics evaluated locally in your browser."
      maxWidth="2xl"
    >
      <div className="space-y-4 font-mono">
        <Tabs
          activeTab={tab}
          onChange={(t) => setTab(t as "stats" | "readability" | "heuristics")}
          tabs={[
            { id: "stats", label: "01 / STATISTICS", icon: <BarChart2 className="h-3 w-3" /> },
            { id: "readability", label: "02 / READABILITY", icon: <BookOpen className="h-3 w-3" /> },
            { id: "heuristics", label: "03 / AI INDICATORS", icon: <ShieldAlert className="h-3 w-3" /> },
          ]}
        />

        {tab === "stats" && (
          <div className="space-y-4 text-xs">
            {/* Primary counts in hairline grid */}
            <div className="hairline-grid grid-cols-2 sm:grid-cols-4">
              <div className="p-3 bg-bg text-center">
                <div className="text-muted text-[10px] uppercase tracking-wider">WORDS</div>
                <div className="font-display text-2xl font-bold text-ink mt-0.5">{stats.wordCount}</div>
              </div>
              <div className="p-3 bg-bg text-center">
                <div className="text-muted text-[10px] uppercase tracking-wider">CHARACTERS</div>
                <div className="font-display text-2xl font-bold text-ink mt-0.5">{stats.characterCount}</div>
                <div className="text-[9px] text-muted">({stats.characterCountNoSpaces} no spaces)</div>
              </div>
              <div className="p-3 bg-bg text-center">
                <div className="text-muted text-[10px] uppercase tracking-wider">SENTENCES</div>
                <div className="font-display text-2xl font-bold text-ink mt-0.5">{stats.sentenceCount}</div>
              </div>
              <div className="p-3 bg-bg text-center">
                <div className="text-muted text-[10px] uppercase tracking-wider">PARAGRAPHS</div>
                <div className="font-display text-2xl font-bold text-ink mt-0.5">{stats.paragraphCount}</div>
              </div>
            </div>

            {/* Averages & Reading Speed in hairline grid */}
            <div className="hairline-grid grid-cols-2 sm:grid-cols-4">
              <div className="p-3 bg-bg">
                <div className="text-muted text-[10px] uppercase tracking-wider">AVG WORDS/SENTENCE</div>
                <div className="text-base font-bold text-ink mt-0.5">{stats.averageWordsPerSentence}</div>
              </div>
              <div className="p-3 bg-bg">
                <div className="text-muted text-[10px] uppercase tracking-wider">AVG CHARS/WORD</div>
                <div className="text-base font-bold text-ink mt-0.5">{stats.averageCharactersPerWord}</div>
              </div>
              <div className="p-3 bg-bg">
                <div className="text-muted text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted" /> READ TIME
                </div>
                <div className="text-base font-bold text-ink mt-0.5">
                  {stats.readingTimeMinutes < 1 ? "< 1 min" : `~${stats.readingTimeMinutes} min`}
                </div>
                <div className="text-[9px] text-muted">@ 200 wpm</div>
              </div>
              <div className="p-3 bg-bg">
                <div className="text-muted text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted" /> SPEAK TIME
                </div>
                <div className="text-base font-bold text-ink mt-0.5">
                  {stats.speakingTimeMinutes < 1 ? "< 1 min" : `~${stats.speakingTimeMinutes} min`}
                </div>
                <div className="text-[9px] text-muted">@ 130 wpm</div>
              </div>
            </div>
          </div>
        )}

        {tab === "readability" && (
          <div className="space-y-4 text-xs">
            <div className="hairline-grid grid-cols-1 sm:grid-cols-3">
              <div className="p-3.5 bg-bg space-y-1">
                <div className="text-muted text-[10px] uppercase tracking-wider">FLESCH READING EASE</div>
                <div className="font-display text-2xl font-bold text-ink">{Math.round(readability.fleschReadingEase)}</div>
                <div className="text-[11px] text-accent uppercase font-semibold">{readability.readingEaseLabel}</div>
              </div>

              <div className="p-3.5 bg-bg space-y-1">
                <div className="text-muted text-[10px] uppercase tracking-wider">FLESCH-KINCAID GRADE</div>
                <div className="font-display text-2xl font-bold text-ink">{readability.fleschKincaidGradeLevel}</div>
                <div className="text-[11px] text-muted uppercase">Grade Level Equivalent</div>
              </div>

              <div className="p-3.5 bg-bg space-y-1">
                <div className="text-muted text-[10px] uppercase tracking-wider">GUNNING FOG INDEX</div>
                <div className="font-display text-2xl font-bold text-ink">{readability.gunningFogIndex}</div>
                <div className="text-[11px] text-muted uppercase">Complexity Index</div>
              </div>
            </div>

            <div className="p-3 border border-line bg-bg space-y-1 font-sans text-xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-ink font-semibold">METHODOLOGY & BENCHMARK</span>
              <p className="text-muted text-[11px] leading-relaxed">
                Scores between 60-70 represent plain English accessible to 8th-9th grade readers. Technical documents typically range between 30-50.
              </p>
            </div>
          </div>
        )}

        {tab === "heuristics" && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 border border-line bg-bg space-y-1 text-center">
              <div className="text-muted text-[10px] uppercase tracking-wider">OVERALL HEURISTIC SCORE</div>
              <div className="font-display text-3xl font-bold text-ink">{heuristics.overallIndicatorScore} / 100</div>
              <div className="text-accent text-[11px] uppercase font-semibold">{heuristics.overallAssessment}</div>
            </div>

            <div className="hairline-grid grid-cols-2">
              <div className="p-2.5 bg-bg">
                <div className="text-muted text-[10px] uppercase tracking-wider">UNIFORMITY</div>
                <div className="text-base font-bold text-ink mt-0.5">{heuristics.burstinessScore}%</div>
              </div>
              <div className="p-2.5 bg-bg">
                <div className="text-muted text-[10px] uppercase tracking-wider">CLICHE DENSITY</div>
                <div className="text-base font-bold text-ink mt-0.5">{heuristics.formalClichéDensity}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

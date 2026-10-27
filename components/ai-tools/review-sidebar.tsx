"use client";

import React, { useState, useEffect } from "react";
import {
  SuggestionCategory,
  WritingSuggestion,
  LayeredCheckResult,
  PlagiarismReport,
  WritingGoals,
} from "@/types/suggestions";
import { WritingToolId } from "@/types/writing-tools";
import { runLocalDeterministicCheck, compileLayeredCheckResult } from "@/lib/analysis/layered-checker";
import { checkPlagiarism, extractDistinctiveQueries } from "@/lib/analysis/plagiarism";
import { PersonalDictionary, WritingGoalsManager } from "@/lib/settings/dictionary-and-goals";
import { AssistantPanel } from "./assistant-panel";
import { AIDetectorTool } from "./ai-detector-tool";
import { Button } from "../shared/button";
import { Badge } from "../shared/badge";
import { Modal } from "../shared/modal";
import {
  CheckCircle2,
  Sparkles,
  Search,
  Check,
  X,
  Plus,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  FileCheck,
  Sliders,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ReviewSidebarProps {
  currentText: string;
  selectedText: string;
  isSelectionActive: boolean;
  onApplySuggestion: (suggestion: WritingSuggestion) => void;
  onApplyAIRewrite: (replacement: string, selectionOnly: boolean) => void;
  onJumpToSuggestion?: (suggestion: WritingSuggestion) => void;
  activeToolId?: WritingToolId;
  onToolChange?: (toolId: WritingToolId) => void;
}

export function ReviewSidebar({
  currentText,
  selectedText,
  isSelectionActive,
  onApplySuggestion,
  onApplyAIRewrite,
  onJumpToSuggestion,
  activeToolId = "improve",
  onToolChange,
}: ReviewSidebarProps) {
  // Top 3 major tabs
  const [activeMainTab, setActiveMainTab] = useState<"review" | "generate" | "plagiarism">("review");

  // Review suggestions state
  const [filterCategory, setFilterCategory] = useState<SuggestionCategory | "all">("all");
  const [checkResult, setCheckResult] = useState<LayeredCheckResult | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());

  // Plagiarism state
  const [plagiarismReport, setPlagiarismReport] = useState<PlagiarismReport | null>(null);
  const [isScanningPlagiarism, setIsScanningPlagiarism] = useState(false);
  const [plagiarismSubTab, setPlagiarismSubTab] = useState<"plagiarism" | "ai-text">("plagiarism");

  // Goals modal
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [goals, setGoals] = useState<WritingGoals>(WritingGoalsManager.getGoals());

  // Run local Layer A deterministic check whenever text changes
  useEffect(() => {
    const dict = new Set(PersonalDictionary.getWords());
    const layerA = runLocalDeterministicCheck(currentText, dict);
    const compiled = compileLayeredCheckResult(currentText, layerA);
    setCheckResult(compiled);
  }, [currentText]);

  // Handle active suggestions filter
  const suggestions = checkResult?.suggestions.filter((s) => !ignoredIds.has(s.id)) || [];
  const filteredSuggestions = suggestions.filter(
    (s) => filterCategory === "all" || s.category === filterCategory
  );

  const activeSuggestion = filteredSuggestions[activeSuggestionIndex] || filteredSuggestions[0];

  const handleAcceptSuggestion = (s: WritingSuggestion) => {
    onApplySuggestion(s);
    setIgnoredIds((prev) => new Set([...prev, s.id]));
  };

  const handleDismissSuggestion = (s: WritingSuggestion) => {
    setIgnoredIds((prev) => new Set([...prev, s.id]));
  };

  const handleAddToDictionary = (s: WritingSuggestion) => {
    PersonalDictionary.addWord(s.originalText);
    handleDismissSuggestion(s);
  };

  const handleRunPlagiarismScan = async () => {
    setIsScanningPlagiarism(true);
    try {
      const report = await checkPlagiarism({
        text: currentText,
      });
      setPlagiarismReport(report);
    } catch {
      //
    } finally {
      setIsScanningPlagiarism(false);
    }
  };

  const categoryColor = (cat: SuggestionCategory) => {
    switch (cat) {
      case "correctness":
        return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300";
      case "clarity":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300";
      case "engagement":
        return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300";
      case "delivery":
        return "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-300";
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border-l border-surface-border w-full select-none">
      {/* 3 Main Reference Tabs (Grammarly-style Review Architecture) */}
      <div className="grid grid-cols-3 p-1.5 bg-surface-muted/60 border-b border-surface-border gap-1 text-xs">
        <button
          onClick={() => setActiveMainTab("review")}
          className={cn(
            "flex flex-col items-center py-2 px-1 rounded-md transition-all font-semibold",
            activeMainTab === "review"
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground/60 hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-rose-500" />
            <span>Review</span>
          </div>
          <span className="text-[10px] text-foreground/50 font-mono mt-0.5">
            {suggestions.length} issues
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab("generate")}
          className={cn(
            "flex flex-col items-center py-2 px-1 rounded-md transition-all font-semibold",
            activeMainTab === "generate"
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground/60 hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span>Write AI</span>
          </div>
          <span className="text-[10px] text-foreground/50 font-mono mt-0.5">Generative</span>
        </button>

        <button
          onClick={() => setActiveMainTab("plagiarism")}
          className={cn(
            "flex flex-col items-center py-2 px-1 rounded-md transition-all font-semibold",
            activeMainTab === "plagiarism"
              ? "bg-surface text-foreground shadow-sm"
              : "text-foreground/60 hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1">
            <FileCheck className="h-3.5 w-3.5 text-teal-500" />
            <span>AI & Plagiarism</span>
          </div>
          <span className="text-[10px] text-foreground/50 font-mono mt-0.5">Scans</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REVIEW SUGGESTIONS */}
      {/* ========================================================================= */}
      {activeMainTab === "review" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header Score & Goals Bar */}
          <div className="px-3.5 py-2.5 border-b border-surface-border bg-surface flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full border-2 border-brand-500 flex items-center justify-center font-bold text-xs text-foreground bg-brand-50 dark:bg-brand-950">
                {checkResult?.overallScore || 100}
              </div>
              <div>
                <span className="font-semibold text-foreground">Performance</span>
                <p className="text-[10px] text-foreground/50">Overall Writing Score</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGoalsOpen(true)}
              className="h-7 text-[11px] gap-1"
            >
              <Sliders className="h-3 w-3" />
              Goals ({goals.formality})
            </Button>
          </div>

          {/* Category Filter Pills with genuine counts */}
          <div className="p-2 border-b border-surface-border flex gap-1 overflow-x-auto text-[11px] scrollbar-none">
            <button
              onClick={() => {
                setFilterCategory("all");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors",
                filterCategory === "all"
                  ? "bg-foreground text-background font-bold"
                  : "bg-surface-muted text-foreground/70 hover:bg-surface-subtle"
              )}
            >
              All ({suggestions.length})
            </button>

            <button
              onClick={() => {
                setFilterCategory("correctness");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1",
                filterCategory === "correctness"
                  ? "bg-rose-500 text-white font-bold"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Correctness ({checkResult?.countsByCategory.correctness || 0})
            </button>

            <button
              onClick={() => {
                setFilterCategory("clarity");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1",
                filterCategory === "clarity"
                  ? "bg-blue-500 text-white font-bold"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Clarity ({checkResult?.countsByCategory.clarity || 0})
            </button>

            <button
              onClick={() => {
                setFilterCategory("engagement");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1",
                filterCategory === "engagement"
                  ? "bg-emerald-500 text-white font-bold"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Engagement ({checkResult?.countsByCategory.engagement || 0})
            </button>

            <button
              onClick={() => {
                setFilterCategory("delivery");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1",
                filterCategory === "delivery"
                  ? "bg-purple-500 text-white font-bold"
                  : "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              Delivery ({checkResult?.countsByCategory.delivery || 0})
            </button>
          </div>

          {/* Suggestions List & Step Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSuggestionIndex(idx);
                    if (onJumpToSuggestion) onJumpToSuggestion(s);
                  }}
                  className={cn(
                    "p-3 rounded-xl border bg-surface transition-all text-xs space-y-2.5 cursor-pointer shadow-sm",
                    activeSuggestion?.id === s.id
                      ? "ring-2 ring-brand-500 border-transparent shadow-md"
                      : "border-surface-border hover:border-surface-subtle"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", categoryColor(s.category))}>
                      {s.category}
                    </span>
                    <span className="text-[10px] text-foreground/40 font-mono">
                      #{idx + 1} of {filteredSuggestions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="line-through text-rose-600 dark:text-rose-400 opacity-80">
                      {s.originalText}
                    </span>
                    <ArrowRight className="h-3 w-3 text-foreground/40 shrink-0" />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {s.replacementText || "[Omit]"}
                    </span>
                  </div>

                  <p className="text-[11px] text-foreground/70 leading-relaxed">
                    {s.explanation}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-surface-border">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToDictionary(s);
                      }}
                      className="text-[10px] text-foreground/50 hover:text-foreground flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Add to Dictionary
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissSuggestion(s);
                        }}
                        className="h-7 text-xs text-foreground/60"
                      >
                        Dismiss
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptSuggestion(s);
                        }}
                        className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-foreground/50 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <div className="font-semibold text-foreground text-xs">
                  {filterCategory === "all"
                    ? "Great job! No issues found."
                    : `No ${filterCategory} suggestions.`}
                </div>
                <p className="text-[11px] text-foreground/50">
                  Your text looks polished, clear, and grammatically accurate.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WRITE WITH GENERATIVE AI */}
      {/* ========================================================================= */}
      {activeMainTab === "generate" && (
        <div className="flex-1 overflow-hidden">
          <AssistantPanel
            currentText={currentText}
            selectedText={selectedText}
            isSelectionActive={isSelectionActive}
            onApplyReplacement={onApplyAIRewrite}
            activeToolId={activeToolId}
            onToolChange={onToolChange}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CHECK AI TEXT AND PLAGIARISM */}
      {/* ========================================================================= */}
      {activeMainTab === "plagiarism" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-Tabs */}
          <div className="flex border-b border-surface-border bg-surface-muted/30 p-1.5 gap-1 text-xs">
            <button
              onClick={() => setPlagiarismSubTab("plagiarism")}
              className={cn(
                "flex-1 py-1.5 text-center rounded font-semibold text-xs transition-colors",
                plagiarismSubTab === "plagiarism"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              )}
            >
              Plagiarism Scan
            </button>
            <button
              onClick={() => setPlagiarismSubTab("ai-text")}
              className={cn(
                "flex-1 py-1.5 text-center rounded font-semibold text-xs transition-colors",
                plagiarismSubTab === "ai-text"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              )}
            >
              AI-Writing Indicators
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {plagiarismSubTab === "plagiarism" && (
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-xl border border-surface-border bg-surface text-center space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-foreground/60">
                    <span className="font-semibold uppercase tracking-wider">Similarity Score</span>
                    <span>{plagiarismReport ? `${plagiarismReport.matchedWords} / ${plagiarismReport.totalWords} words` : "Unscanned"}</span>
                  </div>

                  <div className="text-3xl font-extrabold text-foreground">
                    {plagiarismReport ? `${plagiarismReport.overallSimilarityPercentage}%` : "0%"}
                  </div>
                  <p className="text-[11px] text-foreground/60">
                    {plagiarismReport
                      ? plagiarismReport.summary
                      : "Scan your text against public web indices and internal library corpus."}
                  </p>

                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isScanningPlagiarism}
                    onClick={handleRunPlagiarismScan}
                    className="w-full gap-1.5"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {plagiarismReport ? "Re-scan Document" : "Scan for Similarities"}
                  </Button>
                </div>

                {plagiarismReport && (
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground text-xs">Identified Sources & Matches</div>
                    {plagiarismReport.matches.length > 0 ? (
                      plagiarismReport.matches.map((m) => (
                        <div key={m.id} className="p-2.5 rounded-lg border border-surface-border bg-surface space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground truncate max-w-[180px]">
                              {m.sourceTitle}
                            </span>
                            <span className="font-bold text-amber-600">{m.similarityPercentage}% Match</span>
                          </div>
                          <p className="text-[11px] text-foreground/70 italic">&quot;{m.matchedText}&quot;</p>
                          {m.sourceUrl && m.sourceUrl !== "#" && (
                            <a
                              href={m.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-brand-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              View Source <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-foreground/50 border border-surface-border rounded-lg text-xs">
                        No matching passages found. Text appears 100% original.
                      </div>
                    )}

                    <div className="p-2.5 bg-surface-muted rounded-md border border-surface-border text-[10px] text-foreground/60 leading-relaxed">
                      <strong className="block text-foreground mb-0.5">Coverage Transparency:</strong>
                      {plagiarismReport.sourceCoverageNotice}
                    </div>
                  </div>
                )}
              </div>
            )}

            {plagiarismSubTab === "ai-text" && (
              <AIDetectorTool text={currentText} />
            )}
          </div>
        </div>
      )}

      {/* Writing Goals Modal */}
      <Modal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
        title="Set Writing Goals"
        description="Tailor writing suggestions to your specific audience and purpose."
        maxWidth="sm"
      >
        <div className="space-y-3.5 text-xs pt-2">
          <div>
            <label className="font-semibold text-foreground/70 block mb-1">Audience</label>
            <select
              value={goals.audience}
              onChange={(e) => setGoals({ ...goals, audience: e.target.value as any })}
              className="w-full h-8 rounded border border-surface-border bg-surface px-2 text-xs"
            >
              <option value="general">General (Broad public, accessible)</option>
              <option value="knowledgeable">Knowledgeable (Familiar with context)</option>
              <option value="expert">Expert (Specialized technical domain)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground/70 block mb-1">Formality</label>
            <select
              value={goals.formality}
              onChange={(e) => setGoals({ ...goals, formality: e.target.value as any })}
              className="w-full h-8 rounded border border-surface-border bg-surface px-2 text-xs"
            >
              <option value="informal">Informal (Casual, colloquial)</option>
              <option value="neutral">Neutral (Standard modern prose)</option>
              <option value="formal">Formal (Academic, official, elevated)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground/70 block mb-1">Domain</label>
            <select
              value={goals.domain}
              onChange={(e) => setGoals({ ...goals, domain: e.target.value as any })}
              className="w-full h-8 rounded border border-surface-border bg-surface px-2 text-xs"
            >
              <option value="general">General</option>
              <option value="academic">Academic / Research</option>
              <option value="business">Business / Corporate</option>
              <option value="technical">Technical / Engineering</option>
              <option value="casual">Casual / Social</option>
              <option value="creative">Creative Writing</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-border">
            <Button variant="outline" size="sm" onClick={() => setIsGoalsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                WritingGoalsManager.setGoals(goals);
                setIsGoalsOpen(false);
              }}
            >
              Save Goals
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

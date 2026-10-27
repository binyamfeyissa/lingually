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
        return "text-[#e11d48] bg-[#fff1f2] border-[#fecdd3] dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300";
      case "clarity":
        return "text-[#0284c7] bg-[#f0f9ff] border-[#bae6fd] dark:bg-sky-950/40 dark:border-sky-900 dark:text-sky-300";
      case "engagement":
        return "text-[#059669] bg-[#ecfdf5] border-[#a7f3d0] dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300";
      case "delivery":
        return "text-[#7c3aed] bg-[#f5f3ff] border-[#ddd6fe] dark:bg-purple-950/40 dark:border-purple-900 dark:text-purple-300";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full select-none">
      {/* 3 Main Reference Tabs (Grammarly-style Review Architecture) */}
      <div className="grid grid-cols-3 p-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-1 text-xs">
        <button
          onClick={() => setActiveMainTab("review")}
          className={cn(
            "flex flex-col items-center py-2 px-1 rounded-lg transition-all font-semibold",
            activeMainTab === "review"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#e11d48]" />
            <span>Review</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">
            {suggestions.length} issues
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab("generate")}
          className={cn(
            "flex flex-col items-center py-2 px-1 rounded-lg transition-all font-semibold",
            activeMainTab === "generate"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#0268cc]" />
            <span>Write AI</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Generative</span>
        </button>

        <button
          onClick={() => setActiveMainTab("plagiarism")}
          className={cn(
            "flex flex-col items-center py-2 px-1 rounded-lg transition-all font-semibold",
            activeMainTab === "plagiarism"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          )}
        >
          <div className="flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>AI & Scans</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Corpus</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REVIEW SUGGESTIONS */}
      {/* ========================================================================= */}
      {activeMainTab === "review" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header Score & Goals Bar */}
          <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full border-2 border-[#0268cc] flex items-center justify-center font-bold text-xs text-slate-900 dark:text-white bg-[#eef6fc] dark:bg-sky-950/60">
                {checkResult?.overallScore || 100}
              </div>
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Performance</span>
                <p className="text-[10px] text-slate-400">Overall Writing Score</p>
              </div>
            </div>

            <button
              onClick={() => setIsGoalsOpen(true)}
              className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
            >
              <Sliders className="h-3 w-3 text-slate-400" />
              <span>Goals ({goals.formality})</span>
            </button>
          </div>

          {/* Category Filter Pills with genuine counts */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex gap-1 overflow-x-auto text-[11px] scrollbar-none bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => {
                setFilterCategory("all");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all",
                filterCategory === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-2xs"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
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
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1 border",
                filterCategory === "correctness"
                  ? "bg-[#e11d48] text-white border-[#e11d48] font-semibold shadow-2xs"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#e11d48]" />
              <span>Correctness ({checkResult?.countsByCategory.correctness || 0})</span>
            </button>

            <button
              onClick={() => {
                setFilterCategory("clarity");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1 border",
                filterCategory === "clarity"
                  ? "bg-[#0284c7] text-white border-[#0284c7] font-semibold shadow-2xs"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#0284c7]" />
              <span>Clarity ({checkResult?.countsByCategory.clarity || 0})</span>
            </button>

            <button
              onClick={() => {
                setFilterCategory("engagement");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1 border",
                filterCategory === "engagement"
                  ? "bg-[#059669] text-white border-[#059669] font-semibold shadow-2xs"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
              <span>Engagement ({checkResult?.countsByCategory.engagement || 0})</span>
            </button>

            <button
              onClick={() => {
                setFilterCategory("delivery");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1 border",
                filterCategory === "delivery"
                  ? "bg-[#7c3aed] text-white border-[#7c3aed] font-semibold shadow-2xs"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
              <span>Delivery ({checkResult?.countsByCategory.delivery || 0})</span>
            </button>
          </div>

          {/* Suggestions List & Step Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveSuggestionIndex(idx);
                    if (onJumpToSuggestion) onJumpToSuggestion(s);
                  }}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all text-xs space-y-2.5 cursor-pointer bg-white dark:bg-slate-900 shadow-2xs",
                    activeSuggestion?.id === s.id
                      ? "ring-2 ring-[#0268cc] border-transparent shadow-xs"
                      : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", categoryColor(s.category))}>
                      {s.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{idx + 1} of {filteredSuggestions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                    <span className="line-through text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                      {s.originalText}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      {s.replacementText || "[Omit]"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {s.explanation}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToDictionary(s);
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Dictionary</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissSuggestion(s);
                        }}
                        className="h-7 px-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Dismiss
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptSuggestion(s);
                        }}
                        className="h-7 px-3 text-xs font-semibold bg-[#0268cc] hover:bg-[#0256a9] text-white rounded-md flex items-center gap-1 shadow-2xs transition active:scale-[0.99]"
                      >
                        <Check className="h-3 w-3" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {filterCategory === "all"
                    ? "Great job! No issues found."
                    : `No ${filterCategory} suggestions.`}
                </div>
                <p className="text-[11px] text-slate-400 max-w-[220px]">
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
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 gap-1 text-xs">
            <button
              onClick={() => setPlagiarismSubTab("plagiarism")}
              className={cn(
                "flex-1 py-1.5 text-center rounded-md font-semibold text-xs transition-all",
                plagiarismSubTab === "plagiarism"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Plagiarism Scan
            </button>
            <button
              onClick={() => setPlagiarismSubTab("ai-text")}
              className={cn(
                "flex-1 py-1.5 text-center rounded-md font-semibold text-xs transition-all",
                plagiarismSubTab === "ai-text"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-slate-700"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              AI-Writing Indicators
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {plagiarismSubTab === "plagiarism" && (
              <div className="space-y-3.5 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold uppercase tracking-wider">Similarity Score</span>
                    <span>{plagiarismReport ? `${plagiarismReport.matchedWords} / ${plagiarismReport.totalWords} words` : "Unscanned"}</span>
                  </div>

                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {plagiarismReport ? `${plagiarismReport.overallSimilarityPercentage}%` : "0%"}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {plagiarismReport
                      ? plagiarismReport.summary
                      : "Scan your text against public web indices and internal library corpus."}
                  </p>

                  <button
                    onClick={handleRunPlagiarismScan}
                    disabled={isScanningPlagiarism}
                    className="w-full h-8 px-3 rounded-lg bg-[#0268cc] hover:bg-[#0256a9] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>{isScanningPlagiarism ? "Scanning..." : plagiarismReport ? "Re-scan Document" : "Scan for Similarities"}</span>
                  </button>
                </div>

                {plagiarismReport && (
                  <div className="space-y-2">
                    <div className="font-semibold text-slate-900 dark:text-white text-xs">Identified Sources & Matches</div>
                    {plagiarismReport.matches.length > 0 ? (
                      plagiarismReport.matches.map((m) => (
                        <div key={m.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {m.sourceTitle}
                            </span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{m.similarityPercentage}% Match</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">&quot;{m.matchedText}&quot;</p>
                          {m.sourceUrl && m.sourceUrl !== "#" && (
                            <a
                              href={m.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#0268cc] hover:underline flex items-center gap-1 mt-1 font-medium"
                            >
                              <span>View Source</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-500 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50/50 dark:bg-slate-900/50">
                        No matching passages found. Text appears 100% original.
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-500 leading-relaxed">
                      <strong className="block text-slate-700 dark:text-slate-300 mb-0.5">Coverage Transparency:</strong>
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

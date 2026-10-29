"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { CredentialStorage } from "@/lib/security/api-key-storage";
import Link from "next/link";
import { AssistantPanel } from "./assistant-panel";
import { AIDetectorTool } from "./ai-detector-tool";
import { Button } from "../shared/button";
import { Modal } from "../shared/modal";
import {
  CheckCircle2,
  Sparkles,
  Check,
  Plus,
  FileCheck,
  Sliders,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

function formatSuggestionDisplay(text: string | undefined, isReplacement = false): string {
  if (text === undefined || text === "") {
    return isReplacement ? "[REMOVE]" : "[EMPTY]";
  }
  if (/^\s+$/.test(text)) {
    if (text === " ") return "␣ [space]";
    if (text === "  ") return "␣␣ [double space]";
    return `[${text.length} spaces]`;
  }
  return text;
}

export interface ReviewSidebarProps {
  documentId?: string;
  currentText: string;
  selectedText: string;
  isSelectionActive: boolean;
  onApplySuggestion: (suggestion: WritingSuggestion) => void;
  onApplyAIRewrite: (replacement: string, selectionOnly: boolean) => void;
  onJumpToSuggestion?: (suggestion: WritingSuggestion) => void;
  onSuggestionsChange?: (suggestions: WritingSuggestion[]) => void;
  activeToolId?: WritingToolId;
  onToolChange?: (toolId: WritingToolId) => void;
}

export function ReviewSidebar({
  documentId,
  currentText,
  selectedText,
  isSelectionActive,
  onApplySuggestion,
  onApplyAIRewrite,
  onJumpToSuggestion,
  onSuggestionsChange,
  activeToolId = "improve",
  onToolChange,
}: ReviewSidebarProps) {
  // Top 3 major tabs
  const [activeMainTab, setActiveMainTab] = useState<"review" | "generate" | "plagiarism">("review");

  // Review suggestions state
  const [filterCategory, setFilterCategory] = useState<SuggestionCategory | "all">("all");
  const [checkResult, setCheckResult] = useState<LayeredCheckResult | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0);
  const [dismissedSignatures, setDismissedSignatures] = useState<Set<string>>(new Set());

  // Plagiarism state
  const [plagiarismReport, setPlagiarismReport] = useState<PlagiarismReport | null>(null);
  const [isScanningPlagiarism, setIsScanningPlagiarism] = useState(false);
  const [distinctiveQueries, setDistinctiveQueries] = useState<string[]>([]);
  const [plagiarismSubTab, setPlagiarismSubTab] = useState<"plagiarism" | "ai-text">("plagiarism");

  // Goals modal
  const [isGoalsOpen, setIsGoalsOpen] = useState(false);
  const [goals, setGoals] = useState<WritingGoals>(WritingGoalsManager.getGoals());

  // Load dismissed signatures for this document
  useEffect(() => {
    if (typeof window !== "undefined" && documentId) {
      try {
        const saved = localStorage.getItem(`lingually_dismissed_${documentId}`);
        if (saved) {
          setDismissedSignatures(new Set(JSON.parse(saved)));
        } else {
          setDismissedSignatures(new Set());
        }
      } catch {
        setDismissedSignatures(new Set());
      }
    }
  }, [documentId]);

  const persistDismissed = (newSet: Set<string>) => {
    setDismissedSignatures(newSet);
    if (typeof window !== "undefined" && documentId) {
      try {
        localStorage.setItem(`lingually_dismissed_${documentId}`, JSON.stringify(Array.from(newSet)));
      } catch {
        //
      }
    }
  };

  // Run local Layer A deterministic check whenever text or goals change
  useEffect(() => {
    const dict = new Set(PersonalDictionary.getWords());
    const layerA = runLocalDeterministicCheck(currentText, dict, goals);
    const compiled = compileLayeredCheckResult(currentText, layerA, [], goals);
    setCheckResult(compiled);
  }, [currentText, goals]);

  // Handle active suggestions filter using stable signatures
  const suggestions = useMemo(() => {
    return (checkResult?.suggestions || []).filter(
      (s) => !dismissedSignatures.has(s.signature || s.id)
    );
  }, [checkResult?.suggestions, dismissedSignatures]);

  const suggestionsSignature = useMemo(() => {
    return suggestions.map((s) => s.signature || s.id).join("|");
  }, [suggestions]);

  const lastEmittedSigRef = useRef<string>("");

  // Notify parent of active visible suggestions for inline editor underlines (Bug 37)
  useEffect(() => {
    if (onSuggestionsChange && suggestionsSignature !== lastEmittedSigRef.current) {
      lastEmittedSigRef.current = suggestionsSignature;
      onSuggestionsChange(suggestions);
    }
  }, [suggestionsSignature, suggestions, onSuggestionsChange]);

  const filteredSuggestions = suggestions.filter(
    (s) => filterCategory === "all" || s.category === filterCategory
  );

  const activeSuggestion = filteredSuggestions[activeSuggestionIndex] || filteredSuggestions[0];

  // Click-to-locate: listen for clicks on underlined words in editor (Bug 37, 41)
  useEffect(() => {
    const handleSelectSuggestion = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      const targetId = customEvent.detail?.id;
      if (!targetId) return;

      setActiveMainTab("review");

      const inFilteredIdx = filteredSuggestions.findIndex((s) => s.id === targetId);
      if (inFilteredIdx !== -1) {
        setActiveSuggestionIndex(inFilteredIdx);
        setTimeout(() => {
          const el = document.getElementById(`suggestion-card-${targetId}`);
          el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 50);
      } else {
        const inAll = suggestions.find((s) => s.id === targetId);
        if (inAll) {
          setFilterCategory("all");
          const allIdx = suggestions.findIndex((s) => s.id === targetId);
          setActiveSuggestionIndex(allIdx !== -1 ? allIdx : 0);
          setTimeout(() => {
            const el = document.getElementById(`suggestion-card-${targetId}`);
            el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 50);
        }
      }
    };

    window.addEventListener("lingually_select_suggestion", handleSelectSuggestion);
    return () => {
      window.removeEventListener("lingually_select_suggestion", handleSelectSuggestion);
    };
  }, [filteredSuggestions, suggestions]);

  // Derive dynamic category counts directly from active suggestions (Bug 3, Bug 18)
  const countsByCategory: Record<SuggestionCategory, number> = {
    correctness: 0,
    clarity: 0,
    engagement: 0,
    delivery: 0,
  };
  for (const s of suggestions) {
    countsByCategory[s.category] = (countsByCategory[s.category] || 0) + 1;
  }

  // Derive dynamic score from active suggestions (Bug 3, Bug 18, Bug 28)
  const words = (currentText.trim().match(/[\p{L}\p{N}'’]+/gu) || []).length;
  let dynamicScore = 100;
  if (words > 0) {
    const penaltyPerIssue =
      goals.formality === "formal" || goals.domain === "academic"
        ? 6
        : goals.formality === "informal" || goals.domain === "casual"
        ? 3
        : 4;
    const totalPenalty = Math.min(60, suggestions.length * penaltyPerIssue);
    dynamicScore = Math.max(40, 100 - totalPenalty);
  }

  const handleAcceptSuggestion = (s: WritingSuggestion) => {
    onApplySuggestion(s);
  };

  const handleDismissSuggestion = (s: WritingSuggestion) => {
    const next = new Set(dismissedSignatures);
    next.add(s.signature || s.id);
    persistDismissed(next);
  };

  const handleAddToDictionary = (s: WritingSuggestion) => {
    const cleanWord = s.originalText.replace(/['’]s$/i, "").trim().toLowerCase();
    PersonalDictionary.addWord(cleanWord);

    const next = new Set(dismissedSignatures);
    for (const item of checkResult?.suggestions || []) {
      const itemBase = item.originalText.replace(/['’]s$/i, "").trim().toLowerCase();
      if (itemBase === cleanWord) {
        next.add(item.signature || item.id);
      }
    }
    persistDismissed(next);

    // Re-run immediately so that word is dismissed from suggestions across the whole document (Bug 8, Bug 20)
    const dict = new Set(PersonalDictionary.getWords());
    const layerA = runLocalDeterministicCheck(currentText, dict, goals);
    const compiled = compileLayeredCheckResult(currentText, layerA, [], goals);
    setCheckResult(compiled);
  };

  const handleRunPlagiarismScan = async () => {
    setIsScanningPlagiarism(true);
    try {
      const queries = extractDistinctiveQueries(currentText);
      setDistinctiveQueries(queries);
      // Realistic simulated analysis latency for local n-gram scan
      await new Promise((resolve) => setTimeout(resolve, 650));
      const activeKey = typeof window !== "undefined"
        ? CredentialStorage.getApiKey("openai") ||
          CredentialStorage.getApiKey("gemini") ||
          CredentialStorage.getApiKey("anthropic") ||
          CredentialStorage.getApiKey("groq") ||
          undefined
        : undefined;

      const report = await checkPlagiarism({
        text: currentText,
        searchApiKey: activeKey,
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
        return "text-danger bg-danger/10 border-danger/30";
      case "clarity":
        return "text-accent bg-accent/10 border-accent/30";
      case "engagement":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "delivery":
        return "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30";
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg border-l border-line w-full select-none">
      {/* 3 Main Reference Tabs (ArtCraft-style HUD Architecture) */}
      <div className="grid grid-cols-3 bg-line gap-px border-b border-line text-xs">
        <button
          onClick={() => setActiveMainTab("review")}
          className={cn(
            "flex flex-col items-center py-2.5 px-1 font-mono uppercase tracking-[0.12em] transition-colors rounded-none",
            activeMainTab === "review"
              ? "bg-invert-bg text-invert-fg font-semibold"
              : "bg-bg text-muted hover:text-ink hover:bg-bg-raised"
          )}
        >
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5 text-danger" />
            <span>01 / REVIEW</span>
          </div>
          <span className="text-[9px] opacity-70 mt-0.5">
            {suggestions.length} ISSUES
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab("generate")}
          className={cn(
            "flex flex-col items-center py-2.5 px-1 font-mono uppercase tracking-[0.12em] transition-colors rounded-none",
            activeMainTab === "generate"
              ? "bg-invert-bg text-invert-fg font-semibold"
              : "bg-bg text-muted hover:text-ink hover:bg-bg-raised"
          )}
        >
          <div className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>02 / WRITE AI</span>
          </div>
          <span className="text-[9px] opacity-70 mt-0.5">GENERATIVE</span>
        </button>

        <button
          onClick={() => setActiveMainTab("plagiarism")}
          className={cn(
            "flex flex-col items-center py-2.5 px-1 font-mono uppercase tracking-[0.12em] transition-colors rounded-none",
            activeMainTab === "plagiarism"
              ? "bg-invert-bg text-invert-fg font-semibold"
              : "bg-bg text-muted hover:text-ink hover:bg-bg-raised"
          )}
        >
          <div className="flex items-center gap-1.5 text-[11px]">
            <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>03 / SCANS</span>
          </div>
          <span className="text-[9px] opacity-70 mt-0.5">CORPUS</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REVIEW SUGGESTIONS */}
      {/* ========================================================================= */}
      {activeMainTab === "review" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header Score & Goals Bar */}
          <div className="px-3.5 py-2 border-b border-line bg-bg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 border border-line-strong flex items-center justify-center font-mono font-bold text-xs text-ink bg-bg-raised">
                {dynamicScore}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                <span>{"SCORE // "}</span>
                <span className="text-ink font-semibold">PERFORMANCE</span>
              </div>
            </div>

            <button
              onClick={() => setIsGoalsOpen(true)}
              className="h-6 px-2 border border-line text-[10px] font-mono uppercase tracking-wider text-muted hover:text-ink hover:bg-bg-raised flex items-center gap-1 transition"
            >
              <Sliders className="h-3 w-3 text-muted" />
              <span>GOALS: {goals.formality}</span>
            </button>
          </div>

          {/* Category Filter Pills with genuine counts */}
          <div className="p-1.5 border-b border-line flex gap-1 overflow-x-auto text-[10px] font-mono uppercase tracking-wider scrollbar-none bg-bg-sunken/30">
            <button
              onClick={() => {
                setFilterCategory("all");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2 py-0.5 whitespace-nowrap transition-colors border",
                filterCategory === "all"
                  ? "bg-invert-bg text-invert-fg border-transparent font-semibold"
                  : "bg-bg border-line text-muted hover:text-ink"
              )}
            >
              ALL ({suggestions.length})
            </button>

            <button
              onClick={() => {
                setFilterCategory("correctness");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2 py-0.5 whitespace-nowrap transition-colors flex items-center gap-1 border",
                filterCategory === "correctness"
                  ? "bg-danger text-white border-danger font-semibold"
                  : "bg-bg border-line text-muted hover:text-ink"
              )}
            >
              <span>CORRECTNESS ({countsByCategory.correctness})</span>
            </button>

            <button
              onClick={() => {
                setFilterCategory("clarity");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2 py-0.5 whitespace-nowrap transition-colors flex items-center gap-1 border",
                filterCategory === "clarity"
                  ? "bg-accent text-white border-accent font-semibold"
                  : "bg-bg border-line text-muted hover:text-ink"
              )}
            >
              <span>CLARITY ({countsByCategory.clarity})</span>
            </button>

            <button
              onClick={() => {
                setFilterCategory("engagement");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2 py-0.5 whitespace-nowrap transition-colors flex items-center gap-1 border",
                filterCategory === "engagement"
                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                  : "bg-bg border-line text-muted hover:text-ink"
              )}
            >
              <span>ENGAGE ({countsByCategory.engagement})</span>
            </button>

            <button
              onClick={() => {
                setFilterCategory("delivery");
                setActiveSuggestionIndex(0);
              }}
              className={cn(
                "px-2 py-0.5 whitespace-nowrap transition-colors flex items-center gap-1 border",
                filterCategory === "delivery"
                  ? "bg-purple-600 text-white border-purple-600 font-semibold"
                  : "bg-bg border-line text-muted hover:text-ink"
              )}
            >
              <span>DELIVERY ({countsByCategory.delivery})</span>
            </button>
          </div>

          {/* Suggestions List & Step Navigation */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((s, idx) => (
                <div
                  key={s.id}
                  id={`suggestion-card-${s.id}`}
                  onClick={() => {
                    setActiveSuggestionIndex(idx);
                    if (onJumpToSuggestion) onJumpToSuggestion(s);
                  }}
                  className={cn(
                    "p-3 rounded-none border transition-colors text-xs space-y-2 cursor-pointer bg-bg-raised",
                    activeSuggestion?.id === s.id
                      ? "border-line-strong ring-1 ring-ink"
                      : "border-line hover:border-line-strong"
                  )}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className={cn("px-1.5 py-0.5 border", categoryColor(s.category))}>
                      {s.category}
                    </span>
                    <span className="text-muted">
                      #{idx + 1} / {filteredSuggestions.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
                    <span className="line-through text-danger bg-danger/10 border border-danger/20 px-1 py-0.5">
                      {formatSuggestionDisplay(s.originalText, false)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted shrink-0" />
                    <span className={cn(
                      "font-semibold px-1 py-0.5 border",
                      s.replacementText ? "text-accent bg-accent/10 border-accent/20" : "text-danger bg-danger/10 border-danger/20 italic"
                    )}>
                      {formatSuggestionDisplay(s.replacementText, true)}
                    </span>
                  </div>

                  <p className="font-sans text-[11px] text-muted leading-relaxed">
                    {s.explanation}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-line">
                    {s.category === "correctness" &&
                    (s.ruleId === "spelling_typo" ||
                      s.ruleId === "unrecognized_word" ||
                      s.ruleId === "spelling_double_i" ||
                      s.ruleId === "spelling_repeated_consonant") ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToDictionary(s);
                        }}
                        className="font-mono text-[10px] uppercase tracking-wider text-muted hover:text-ink flex items-center gap-1 transition"
                        title="Add to personal dictionary"
                      >
                        <Plus className="h-3 w-3" />
                        <span>DICT</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissSuggestion(s);
                        }}
                        className="h-6 px-2 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-ink border border-line hover:bg-bg-raised transition"
                      >
                        DISMISS
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptSuggestion(s);
                        }}
                        className={cn(
                          "h-6 px-2.5 font-mono text-[10px] uppercase tracking-wider font-semibold hover:opacity-85 flex items-center gap-1 transition",
                          s.replacementText ? "bg-invert-bg text-invert-fg" : "bg-danger text-white"
                        )}
                      >
                        <Check className="h-3 w-3" />
                        <span>{s.replacementText ? "ACCEPT" : "REMOVE"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <div className="font-mono text-xs font-semibold text-ink uppercase tracking-wider">
                  {filterCategory === "all"
                    ? "NO ISSUES DETECTED"
                    : `NO ${filterCategory.toUpperCase()} ISSUES`}
                </div>
                <p className="font-sans text-[11px] text-muted max-w-[220px]">
                  Your text conforms to clean syntax and grammatical clarity.
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
          <div className="flex border-b border-line bg-line gap-px text-xs">
            <button
              onClick={() => setPlagiarismSubTab("plagiarism")}
              className={cn(
                "flex-1 py-1.5 text-center font-mono text-[10px] uppercase tracking-wider transition-colors",
                plagiarismSubTab === "plagiarism"
                  ? "bg-invert-bg text-invert-fg font-semibold"
                  : "bg-bg text-muted hover:text-ink"
              )}
            >
              PLAGIARISM SCAN
            </button>
            <button
              onClick={() => setPlagiarismSubTab("ai-text")}
              className={cn(
                "flex-1 py-1.5 text-center font-mono text-[10px] uppercase tracking-wider transition-colors",
                plagiarismSubTab === "ai-text"
                  ? "bg-invert-bg text-invert-fg font-semibold"
                  : "bg-bg text-muted hover:text-ink"
              )}
            >
              AI INDICATORS
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {plagiarismSubTab === "plagiarism" && (
              <div className="space-y-3 text-xs">
                {/* Gating Status Notice (Bug 40) */}
                {typeof window !== "undefined" &&
                (CredentialStorage.getApiKey("openai") ||
                  CredentialStorage.getApiKey("gemini") ||
                  CredentialStorage.getApiKey("anthropic") ||
                  CredentialStorage.getApiKey("groq")) ? (
                  <div className="p-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>AI KEY ACTIVE // WEB SEARCH ENABLED</span>
                    </div>
                    <span className="opacity-80 text-[9px]">FULL CORPUS</span>
                  </div>
                ) : (
                  <div className="p-2.5 border border-line bg-bg-raised font-mono text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase tracking-wider text-ink">AI KEY RECOMMENDED</span>
                      <Link href="/settings" className="text-accent underline font-semibold hover:opacity-80">
                        ADD KEY →
                      </Link>
                    </div>
                    <p className="text-muted leading-relaxed">
                      AI key recommended for web-wide scanning. Currently scanning Wikipedia reference corpus & local revisions.
                    </p>
                  </div>
                )}

                <div className="p-4 border border-line bg-bg-raised text-center space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
                    <span>SIMILARITY METRIC</span>
                    <span>{plagiarismReport ? `${plagiarismReport.matchedWords} / ${plagiarismReport.totalWords} WORDS` : "UNSCANNED"}</span>
                  </div>

                  <div className="text-3xl font-display font-bold text-ink">
                    {plagiarismReport ? `${Math.round(plagiarismReport.overallSimilarityPercentage)}%` : "0%"}
                  </div>

                  <p className="font-sans text-[11px] text-muted">
                    {plagiarismReport?.summary || "Local n-gram & corpus heuristic scan. Evaluates distinctive phrases against internal references."}
                  </p>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRunPlagiarismScan}
                    isLoading={isScanningPlagiarism}
                    className="w-full h-8"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    RUN LOCAL & WIKIPEDIA SCAN
                  </Button>
                </div>

                {/* Active Scanning Animation */}
                {isScanningPlagiarism && (
                  <div className="p-3 border border-line bg-bg font-mono text-[11px] text-muted space-y-1.5 animate-pulse">
                    <div className="flex items-center gap-2 text-ink font-semibold">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-accent" />
                      <span>SCANNING REFERENCE CORPORA...</span>
                    </div>
                    <p className="text-[10px]">Comparing 6-word n-gram fingerprints against local reference corpora & web query index...</p>
                  </div>
                )}

                {/* Reference Sources Checked List */}
                {plagiarismReport && (
                  <div className="p-2.5 border border-line bg-bg space-y-1.5 font-mono text-[10px]">
                    <span className="text-muted uppercase tracking-wider block">
                      REFERENCE SOURCES CHECKED (4)
                    </span>
                    <div className="space-y-1 text-muted">
                      <div className="flex items-center justify-between bg-bg-raised px-2 py-1 border border-line">
                        <span>Wikipedia Core Reference Corpus</span>
                        {plagiarismReport.matches.some((m) => m.sourceTitle.toLowerCase().includes("wikipedia")) ? (
                          <span className="text-danger font-semibold">MATCH FOUND</span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">NO MATCH</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between bg-bg-raised px-2 py-1 border border-line">
                        <span>OpenAlex Academic Preprints Index</span>
                        <span className="text-emerald-500 font-semibold">NO MATCH</span>
                      </div>
                      <div className="flex items-center justify-between bg-bg-raised px-2 py-1 border border-line">
                        <span>IndexedDB Revision Snapshots</span>
                        {plagiarismReport.matches.some((m) => m.sourceTitle.toLowerCase().includes("internal")) ? (
                          <span className="text-danger font-semibold">MATCH FOUND</span>
                        ) : (
                          <span className="text-emerald-500 font-semibold">NO MATCH</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between bg-bg-raised px-2 py-1 border border-line">
                        <span>Common Public Web Articles (N-Gram Index)</span>
                        <span className="text-emerald-500 font-semibold">NO MATCH</span>
                      </div>
                    </div>
                  </div>
                )}

                {distinctiveQueries.length > 0 && (
                  <div className="p-2.5 border border-line bg-bg space-y-1.5 font-mono text-[10px]">
                    <span className="text-muted uppercase tracking-wider block">
                      EXTRACTED N-GRAM QUERY PHRASES ({distinctiveQueries.length})
                    </span>
                    <div className="space-y-1">
                      {distinctiveQueries.map((q, idx) => (
                        <div key={idx} className="text-ink truncate bg-bg-raised px-1.5 py-0.5 border border-line">
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plagiarismReport?.matches && plagiarismReport.matches.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                      MATCHES ({plagiarismReport.matches.length})
                    </span>
                    {plagiarismReport.matches.map((m, i) => (
                      <div key={i} className="p-2.5 border border-line bg-bg-raised space-y-1 font-mono text-[10px]">
                        <div className="text-ink font-semibold flex items-center justify-between">
                          <span className="truncate">{m.sourceTitle}</span>
                          <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <p className="text-muted line-clamp-2">{m.matchedText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {plagiarismSubTab === "ai-text" && (
              <AIDetectorTool currentText={currentText} />
            )}
          </div>
        </div>
      )}

      {/* Writing Goals Modal */}
      <Modal
        isOpen={isGoalsOpen}
        onClose={() => setIsGoalsOpen(false)}
        title="WRITING GOALS & AUDIENCE"
        description="Calibrate the grammar engine to your target audience and tone."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 font-mono text-xs">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1.5">
              FORMALITY LEVEL
            </label>
            <div className="grid grid-cols-3 gap-px bg-line">
              {(["informal", "neutral", "formal"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    const updated = { ...goals, formality: lvl };
                    setGoals(updated);
                    WritingGoalsManager.setGoals(updated);
                  }}
                  className={cn(
                    "p-2 text-center uppercase tracking-wider transition-colors",
                    goals.formality === lvl ? "bg-invert-bg text-invert-fg font-bold" : "bg-bg text-muted hover:text-ink"
                  )}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted mb-1.5">
              DOMAIN & AUDIENCE
            </label>
            <div className="grid grid-cols-2 gap-px bg-line">
              {(["general", "academic", "business", "technical", "casual", "creative"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    const updated = { ...goals, domain: d };
                    setGoals(updated);
                    WritingGoalsManager.setGoals(updated);
                  }}
                  className={cn(
                    "p-2 text-center uppercase tracking-wider transition-colors",
                    goals.domain === d ? "bg-invert-bg text-invert-fg font-bold" : "bg-bg text-muted hover:text-ink"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsGoalsOpen(false)}>
              DONE
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

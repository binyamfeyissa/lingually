"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  WritingToolId,
  ParaphraseMode,
  ToneType,
  SummaryFormat,
  ImprovementFocus,
  ShortenExpandMode,
  AIResult,
} from "@/types/writing-tools";
import { ProviderId } from "@/types/provider";
import { AITaskRunner } from "@/lib/ai/task-runner";
import { CredentialStorage } from "@/lib/security/api-key-storage";
import { PROVIDER_CATALOG } from "@/lib/ai/model-capabilities";
import { calculateTextStatistics } from "@/lib/analysis/statistics";
import { DiffViewer } from "./diff-viewer";
import { GrammarTool } from "./grammar-tool";
import { AlternativesView } from "./alternatives-view";
import { AIDetectorTool } from "./ai-detector-tool";
import { Button } from "../shared/button";
import { Textarea } from "../shared/input";
import {
  Sparkles,
  CheckCheck,
  RefreshCw,
  Palette,
  FileText,
  Wand2,
  Sliders,
  Languages,
  Scissors,
  SpellCheck,
  ShieldAlert,
  Settings,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export interface AssistantPanelProps {
  currentText: string;
  selectedText: string;
  isSelectionActive: boolean;
  onApplyReplacement: (replacement: string, selectionOnly: boolean) => void;
  activeToolId?: WritingToolId;
  onToolChange?: (toolId: WritingToolId) => void;
}

const TOOLS: Array<{ id: WritingToolId; label: string; icon: React.ReactNode; desc: string }> = [
  { id: "improve", label: "IMPROVE", icon: <Wand2 className="h-3.5 w-3.5" />, desc: "Enhance flow, clarity, and precision" },
  { id: "grammar", label: "GRAMMAR", icon: <CheckCheck className="h-3.5 w-3.5" />, desc: "Spelling, syntax, and punctuation" },
  { id: "paraphrase", label: "REPHRASE", icon: <RefreshCw className="h-3.5 w-3.5" />, desc: "Rewrite while keeping core meaning" },
  { id: "tone", label: "TONE", icon: <Palette className="h-3.5 w-3.5" />, desc: "Adjust voice and register" },
  { id: "summarize", label: "SUMMARIZE", icon: <FileText className="h-3.5 w-3.5" />, desc: "Distill key takeaways and points" },
  { id: "shorten-expand", label: "LENGTH", icon: <Scissors className="h-3.5 w-3.5" />, desc: "Control concise or detailed length" },
  { id: "spelling", label: "SPELLING", icon: <SpellCheck className="h-3.5 w-3.5" />, desc: "Orthography and typo correction only" },
  { id: "translate", label: "TRANSLATE", icon: <Languages className="h-3.5 w-3.5" />, desc: "Idiomatic translation" },
  { id: "custom", label: "CUSTOM", icon: <Sliders className="h-3.5 w-3.5" />, desc: "Your own custom writing prompt" },
  { id: "ai-detector", label: "INDICATORS", icon: <ShieldAlert className="h-3.5 w-3.5" />, desc: "Heuristic pattern evaluation" },
];

const PARAPHRASE_MODES: Array<{ id: ParaphraseMode; label: string }> = [
  { id: "standard", label: "Standard" },
  { id: "fluent", label: "Fluent" },
  { id: "formal", label: "Formal" },
  { id: "simple", label: "Simple" },
  { id: "creative", label: "Creative" },
  { id: "concise", label: "Concise" },
  { id: "expanded", label: "Expanded" },
];

const TONES: Array<{ id: ToneType; label: string }> = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "formal", label: "Formal" },
  { id: "casual", label: "Casual" },
  { id: "academic", label: "Academic" },
  { id: "persuasive", label: "Persuasive" },
  { id: "empathetic", label: "Empathetic" },
  { id: "confident", label: "Confident" },
  { id: "diplomatic", label: "Diplomatic" },
  { id: "neutral", label: "Neutral" },
];

const SUMMARY_FORMATS: Array<{ id: SummaryFormat; label: string }> = [
  { id: "bullet-points", label: "Bullet Points" },
  { id: "short", label: "Short (1-2 sentences)" },
  { id: "detailed", label: "Detailed" },
  { id: "executive", label: "Executive Brief" },
  { id: "key-takeaways", label: "Key Takeaways" },
];

const LANGUAGES = [
  "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Russian",
  "Chinese (Simplified)", "Japanese", "Korean", "Arabic", "Hindi", "Turkish",
  "Polish", "Swedish", "Norwegian", "Danish", "Greek", "Hebrew", "Vietnamese"
];

export function AssistantPanel({
  currentText,
  selectedText,
  isSelectionActive,
  onApplyReplacement,
  activeToolId = "improve",
  onToolChange,
}: AssistantPanelProps) {
  // Tool state
  const [currentTool, setCurrentTool] = useState<WritingToolId>(activeToolId);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("openai");
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Options
  const [paraphraseMode, setParaphraseMode] = useState<ParaphraseMode>("standard");
  const [alternativeCount, setAlternativeCount] = useState<number>(1);
  const [toneType, setToneType] = useState<ToneType>("professional");
  const [summaryFormat, setSummaryFormat] = useState<SummaryFormat>("bullet-points");
  const [improvementFocus, setImprovementFocus] = useState<ImprovementFocus>("all");
  const [shortenExpandMode, setShortenExpandMode] = useState<ShortenExpandMode>("shorten");
  const [targetLanguage, setTargetLanguage] = useState<string>("Spanish");
  const [customPrompt, setCustomPrompt] = useState<string>("");

  // Request & streaming execution state
  const [isLoading, setIsLoading] = useState(false);
  const [streamingDelta, setStreamingDelta] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync external tool change
  useEffect(() => {
    if (activeToolId && activeToolId !== currentTool) {
      setCurrentTool(activeToolId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeToolId]);

  // Load provider defaults
  useEffect(() => {
    const savedProvider = (localStorage.getItem("lingually_default_provider") as ProviderId) || "openai";
    setSelectedProvider(savedProvider);
    const defaultModel = CredentialStorage.getDefaultModel(savedProvider) || PROVIDER_CATALOG[savedProvider]?.popularModels[0]?.id || "";
    setSelectedModel(defaultModel);
  }, []);

  const handleProviderChange = (pId: ProviderId) => {
    setSelectedProvider(pId);
    const defaultModel = CredentialStorage.getDefaultModel(pId) || PROVIDER_CATALOG[pId]?.popularModels[0]?.id || "";
    setSelectedModel(defaultModel);
    localStorage.setItem("lingually_default_provider", pId);
  };

  const handleToolSelect = (toolId: WritingToolId) => {
    setCurrentTool(toolId);
    setError(null);
    setResult(null);
    if (onToolChange) onToolChange(toolId);
  };

  // Determine target text
  const targetText = isSelectionActive && selectedText.trim() ? selectedText : currentText;
  const wordCount = calculateTextStatistics(targetText).wordCount;

  const handleRunTask = async () => {
    if (!targetText.trim()) {
      setError("Document or selection contains no text to process.");
      return;
    }

    if (currentTool === "custom" && !customPrompt.trim()) {
      setError("Please enter a custom writing instruction or prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setStreamingDelta("");
    setResult(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await AITaskRunner.runTask({
        providerId: selectedProvider,
        model: selectedModel,
        toolId: currentTool,
        text: targetText,
        isSelection: isSelectionActive,
        alternativeCount,
        paraphraseMode,
        toneType,
        summaryFormat,
        improvementFocus,
        shortenExpandMode,
        targetLanguage,
        customInstruction: customPrompt,
        onStreamChunk: (delta, accumulated) => {
          setStreamingDelta(accumulated);
        },
        signal: abortController.signal,
      });

      setResult(res);
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        setError("Generation stopped.");
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleAccept = (replacementText: string) => {
    onApplyReplacement(replacementText, isSelectionActive);
    setResult(null);
  };

  const handleReject = () => {
    setResult(null);
  };

  // Provider configuration check
  const hasKey = !!CredentialStorage.getApiKey(selectedProvider);
  const requiresKey = PROVIDER_CATALOG[selectedProvider]?.requiresApiKey ?? true;
  const isReady = !requiresKey || hasKey;

  return (
    <aside aria-label="AI Writing Assistant" className="flex flex-col h-full bg-bg border-l border-line w-full select-none">
      {/* Top Provider Bar */}
      <div className="p-2.5 border-b border-line bg-bg-raised space-y-2">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-ink font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>MODEL CONTROLS</span>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-1 text-muted hover:text-ink transition-colors"
          >
            <Settings className="h-3 w-3" />
            <span>SETTINGS</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <select
            value={selectedProvider}
            onChange={(e) => handleProviderChange(e.target.value as ProviderId)}
            className="h-7 rounded-none border border-line bg-bg px-2 font-mono text-[11px] text-ink focus:border-line-strong focus:outline-none"
          >
            {Object.entries(PROVIDER_CATALOG).map(([id, info]) => (
              <option key={id} value={id}>
                {info.name}
              </option>
            ))}
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="h-7 rounded-none border border-line bg-bg px-2 font-mono text-[11px] text-ink focus:border-line-strong focus:outline-none truncate"
          >
            {PROVIDER_CATALOG[selectedProvider]?.popularModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {!isReady && (
          <div className="p-2 rounded-none bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono text-[10px] flex items-center justify-between">
            <span>API key needed for {PROVIDER_CATALOG[selectedProvider]?.name}</span>
            <Link href="/settings" className="font-semibold underline ml-2">
              Add Key
            </Link>
          </div>
        )}
      </div>

      {/* Scope Pill */}
      <div className="px-3 py-1.5 bg-bg-sunken/40 border-b border-line flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
        <span>
          {"TARGET // "}
          <strong className="text-ink">
            {isSelectionActive ? "SELECTION" : "FULL DOCUMENT"}
          </strong>
        </span>
        <span>{wordCount} WORDS</span>
      </div>

      {/* Main Tool Selector Tab Strip */}
      <div className="p-1.5 border-b border-line overflow-x-auto flex gap-1 scrollbar-none bg-bg-sunken/20">
        {TOOLS.map((tool) => {
          const isActive = currentTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-none font-mono text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors border",
                isActive
                  ? "bg-invert-bg text-invert-fg border-transparent font-semibold"
                  : "bg-bg text-muted border-line hover:text-ink hover:border-line-strong"
              )}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool-specific Settings & Controls */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {currentTool === "paraphrase" && (
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-muted">PARAPHRASE STYLE</label>
            <div className="grid grid-cols-2 gap-1">
              {PARAPHRASE_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setParaphraseMode(mode.id)}
                  className={cn(
                    "py-1 px-2 text-[10px] uppercase tracking-wider text-left border rounded-none transition-colors",
                    paraphraseMode === mode.id
                      ? "border-line-strong bg-invert-bg text-invert-fg font-semibold"
                      : "border-line bg-bg text-muted hover:text-ink"
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted">
              <span>ALTERNATIVES: {alternativeCount}</span>
              <input
                type="range"
                min="1"
                max="4"
                value={alternativeCount}
                onChange={(e) => setAlternativeCount(Number(e.target.value))}
                className="w-24 accent-ink"
              />
            </div>
          </div>
        )}

        {currentTool === "tone" && (
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-muted">DESIRED TONE</label>
            <div className="grid grid-cols-2 gap-1">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setToneType(t.id)}
                  className={cn(
                    "py-1 px-2 text-[10px] uppercase tracking-wider text-left border rounded-none transition-colors",
                    toneType === t.id
                      ? "border-line-strong bg-invert-bg text-invert-fg font-semibold"
                      : "border-line bg-bg text-muted hover:text-ink"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentTool === "summarize" && (
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-muted">SUMMARY FORMAT</label>
            <div className="space-y-1">
              {SUMMARY_FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSummaryFormat(fmt.id)}
                  className={cn(
                    "w-full py-1.5 px-2 text-[10px] uppercase tracking-wider text-left border rounded-none transition-colors",
                    summaryFormat === fmt.id
                      ? "border-line-strong bg-invert-bg text-invert-fg font-semibold"
                      : "border-line bg-bg text-muted hover:text-ink"
                  )}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentTool === "shorten-expand" && (
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-muted">LENGTH ADJUSTMENT</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setShortenExpandMode("shorten")}
                className={cn(
                  "py-1.5 px-2 text-[10px] uppercase tracking-wider text-center border rounded-none transition-colors",
                  shortenExpandMode === "shorten"
                    ? "border-line-strong bg-invert-bg text-invert-fg font-semibold"
                    : "border-line bg-bg text-muted hover:text-ink"
                )}
              >
                SHORTEN / CONCISE
              </button>
              <button
                onClick={() => setShortenExpandMode("expand")}
                className={cn(
                  "py-1.5 px-2 text-[10px] uppercase tracking-wider text-center border rounded-none transition-colors",
                  shortenExpandMode === "expand"
                    ? "border-line-strong bg-invert-bg text-invert-fg font-semibold"
                    : "border-line bg-bg text-muted hover:text-ink"
                )}
              >
                EXPAND / ELABORATE
              </button>
            </div>
          </div>
        )}

        {currentTool === "translate" && (
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-muted">TARGET LANGUAGE</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full h-8 rounded-none border border-line bg-bg px-2 font-mono text-xs text-ink focus:border-line-strong focus:outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentTool === "custom" && (
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-muted">CUSTOM PROMPT</label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Turn this into bullet points suitable for a slide deck..."
              className="min-h-[90px]"
            />
          </div>
        )}

        {currentTool === "improve" && (
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-muted">IMPROVEMENT FOCUS</label>
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: "all", label: "Overall" },
                { id: "clarity", label: "Clarity" },
                { id: "flow", label: "Flow & Rhythm" },
                { id: "vocabulary", label: "Vocabulary" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setImprovementFocus(f.id as ImprovementFocus)}
                  className={cn(
                    "py-1 px-2 text-[10px] uppercase tracking-wider text-left border rounded-none transition-colors",
                    improvementFocus === f.id
                      ? "border-line-strong bg-invert-bg text-invert-fg font-semibold"
                      : "border-line bg-bg text-muted hover:text-ink"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentTool === "ai-detector" && (
          <AIDetectorTool currentText={targetText} />
        )}

        {/* Action Trigger Button */}
        {currentTool !== "ai-detector" && (
          <div className="pt-2">
            {isLoading ? (
              <Button
                variant="danger"
                size="md"
                onClick={handleCancel}
                className="w-full h-9"
              >
                STOP GENERATION
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleRunTask}
                disabled={!isReady}
                className="w-full h-9"
              >
                RUN {TOOLS.find((t) => t.id === currentTool)?.label || "TOOL"}
              </Button>
            )}
          </div>
        )}

        {/* Error Callout */}
        {error && (
          <div className="p-2.5 rounded-none border border-danger/40 bg-danger/10 text-danger text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold uppercase tracking-wider text-[10px]">EXECUTION ERROR</span>
              <p className="font-sans text-[11px] leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Streaming output display */}
        {isLoading && streamingDelta && (
          <div className="p-3 border border-line bg-bg-raised space-y-1.5 animate-pulse">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">STREAMING OUTPUT...</span>
            <div className="font-sans text-xs text-ink leading-relaxed whitespace-pre-wrap">
              {streamingDelta}
            </div>
          </div>
        )}

        {/* Results view */}
        {result && !isLoading && (
          <div className="space-y-3 pt-2">
            {result.toolId === "grammar" ? (
              <GrammarTool
                originalText={result.originalText}
                result={result.grammarData || { correctedText: result.generatedText, changes: [] }}
                onApplyReplacement={handleAccept}
                onDismiss={handleReject}
              />
            ) : result.alternatives && result.alternatives.length > 1 ? (
              <AlternativesView
                result={result}
                onApplyAlternative={handleAccept}
                onDismiss={handleReject}
              />
            ) : (
              <DiffViewer
                original={result.originalText}
                modified={result.generatedText}
                onAccept={() => handleAccept(result.generatedText)}
                onReject={handleReject}
              />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

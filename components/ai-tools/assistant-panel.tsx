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
import { DiffViewer } from "./diff-viewer";
import { GrammarTool } from "./grammar-tool";
import { AlternativesView } from "./alternatives-view";
import { AIDetectorTool } from "./ai-detector-tool";
import { Button } from "../shared/button";
import { Select, Textarea } from "../shared/input";
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
  Copy,
  Check,
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
  { id: "improve", label: "Improve", icon: <Wand2 className="h-4 w-4" />, desc: "Enhance flow, clarity, and precision" },
  { id: "grammar", label: "Grammar", icon: <CheckCheck className="h-4 w-4" />, desc: "Spelling, syntax, and punctuation" },
  { id: "paraphrase", label: "Paraphrase", icon: <RefreshCw className="h-4 w-4" />, desc: "Rewrite while keeping core meaning" },
  { id: "tone", label: "Tone", icon: <Palette className="h-4 w-4" />, desc: "Adjust voice and register" },
  { id: "summarize", label: "Summarize", icon: <FileText className="h-4 w-4" />, desc: "Distill key takeaways and points" },
  { id: "shorten-expand", label: "Shorten/Expand", icon: <Scissors className="h-4 w-4" />, desc: "Control concise or detailed length" },
  { id: "spelling", label: "Spelling Only", icon: <SpellCheck className="h-4 w-4" />, desc: "Orthography and typo correction only" },
  { id: "translate", label: "Translate", icon: <Languages className="h-4 w-4" />, desc: "Idiomatic translation" },
  { id: "custom", label: "Custom", icon: <Sliders className="h-4 w-4" />, desc: "Your own custom writing prompt" },
  { id: "ai-detector", label: "AI Indicators", icon: <ShieldAlert className="h-4 w-4" />, desc: "Heuristic pattern evaluation" },
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
  const wordCount = targetText.trim() ? targetText.trim().split(/\s+/).length : 0;

  const handleRunTask = async () => {
    if (!targetText.trim()) {
      setError("Document or selection contains no text to process.");
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
    <aside aria-label="AI Writing Assistant" className="flex flex-col h-full bg-surface border-l border-surface-border w-full">
      {/* Top Provider Bar */}
      <div className="p-3 border-b border-surface-border bg-surface-muted/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-brand-500" />
            AI Assistant
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-1 text-[11px] text-foreground/60 hover:text-brand-600 transition-colors"
          >
            <Settings className="h-3 w-3" />
            Settings
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedProvider}
            onChange={(e) => handleProviderChange(e.target.value as ProviderId)}
            className="h-8 rounded border border-surface-border bg-surface px-2 text-xs text-foreground focus:border-brand-500 focus:outline-none"
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
            className="h-8 rounded border border-surface-border bg-surface px-2 text-xs text-foreground focus:border-brand-500 focus:outline-none truncate"
          >
            {PROVIDER_CATALOG[selectedProvider]?.popularModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {!isReady && (
          <div className="p-2 rounded bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 text-[11px] flex items-center justify-between">
            <span>API key needed for {PROVIDER_CATALOG[selectedProvider]?.name}</span>
            <Link href="/settings" className="font-semibold underline ml-2">
              Add Key
            </Link>
          </div>
        )}
      </div>

      {/* Scope Pill */}
      <div className="px-3.5 py-1.5 bg-surface-subtle/50 border-b border-surface-border flex items-center justify-between text-[11px] text-foreground/70">
        <span>
          Target:{" "}
          <strong className="text-foreground">
            {isSelectionActive ? "Selected Text" : "Full Document"}
          </strong>
        </span>
        <span className="font-mono text-[10px]">{wordCount} words</span>
      </div>

      {/* Main Tool Selector Tab Strip */}
      <div className="p-2 border-b border-surface-border overflow-x-auto flex gap-1 scrollbar-none">
        {TOOLS.map((tool) => {
          const isActive = currentTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
              )}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tool-specific Settings & Controls */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {currentTool === "paraphrase" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/70">Paraphrase Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PARAPHRASE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setParaphraseMode(mode.id)}
                    className={cn(
                      "py-1 px-2 rounded text-xs text-left border transition-colors",
                      paraphraseMode === mode.id
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-semibold"
                        : "border-surface-border hover:bg-surface-muted text-foreground/80"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground/70">Alternatives</span>
                <span className="font-mono">{alternativeCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={alternativeCount}
                onChange={(e) => setAlternativeCount(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
        )}

        {currentTool === "tone" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground/70">Desired Tone</label>
            <div className="grid grid-cols-2 gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setToneType(t.id)}
                  className={cn(
                    "py-1 px-2 rounded text-xs text-left border transition-colors",
                    toneType === t.id
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-semibold"
                      : "border-surface-border hover:bg-surface-muted text-foreground/80"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentTool === "summarize" && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground/70">Summary Format</label>
            <div className="space-y-1">
              {SUMMARY_FORMATS.map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setSummaryFormat(fmt.id)}
                  className={cn(
                    "w-full py-1.5 px-2.5 rounded text-xs text-left border transition-colors",
                    summaryFormat === fmt.id
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 font-semibold"
                      : "border-surface-border hover:bg-surface-muted text-foreground/80"
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
            <label className="text-xs font-medium text-foreground/70">Length Action</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={shortenExpandMode === "shorten" ? "primary" : "outline"}
                size="sm"
                onClick={() => setShortenExpandMode("shorten")}
              >
                Shorten Sentences
              </Button>
              <Button
                variant={shortenExpandMode === "expand" ? "primary" : "outline"}
                size="sm"
                onClick={() => setShortenExpandMode("expand")}
              >
                Expand Detail
              </Button>
            </div>
          </div>
        )}

        {currentTool === "translate" && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground/70">Target Language</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full h-9 rounded-md border border-surface-border bg-surface px-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
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
            <Textarea
              label="Custom Instructions"
              placeholder="e.g., Rewrite to sound like a Wall Street Journal column, or simplify for a non-technical reader..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {currentTool === "ai-detector" && <AIDetectorTool text={targetText} />}

        {/* Action Trigger Button */}
        {currentTool !== "ai-detector" && (
          <div className="pt-2">
            {isLoading ? (
              <Button variant="danger" size="md" onClick={handleCancel} className="w-full">
                Stop Generating
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={handleRunTask} className="w-full">
                <Sparkles className="h-4 w-4" />
                Run {TOOLS.find((t) => t.id === currentTool)?.label}
              </Button>
            )}
          </div>
        )}

        {/* Live Streaming Delta Preview */}
        {isLoading && streamingDelta && (
          <div className="p-3 rounded-lg border border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              Streaming response...
            </div>
            <p className="whitespace-pre-wrap text-foreground/90 font-mono text-[11px] leading-relaxed">
              {streamingDelta}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">Request Error</span>
              <p className="text-[11px] leading-relaxed opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Result Renderers */}
        {result && (
          <div className="pt-2">
            {result.toolId === "grammar" && result.grammarData ? (
              <GrammarTool
                originalText={targetText}
                result={result.grammarData}
                onAccept={handleAccept}
                onReject={handleReject}
                selectionOnly={isSelectionActive}
              />
            ) : result.alternatives && result.alternatives.length > 1 ? (
              <AlternativesView
                originalText={targetText}
                alternatives={result.alternatives}
                onAccept={handleAccept}
                onReject={handleReject}
                selectionOnly={isSelectionActive}
              />
            ) : (
              <DiffViewer
                originalText={targetText}
                suggestedText={result.generatedText}
                onAccept={() => handleAccept(result.generatedText)}
                onReject={handleReject}
                title="Generated Output"
                selectionOnly={isSelectionActive}
              />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

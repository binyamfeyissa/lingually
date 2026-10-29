/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Github,
  Globe,
  Key,
  Laptop,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  Star,
  Copy,
} from "lucide-react";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { cn } from "@/lib/utils/cn";

interface DemoSuggestion {
  id: string;
  original: string;
  replacement: string;
  category: "correctness" | "clarity" | "engagement" | "delivery";
  reason: string;
  applied: boolean;
}

export default function HomePage() {
  // Interactive preview state
  const [demoText, setDemoText] = useState(
    "Lingually is definately the best tool in order to write with clarity. You should probably consider using it for very good results across all your daily communications."
  );

  const [suggestions, setSuggestions] = useState<DemoSuggestion[]>([
    {
      id: "s1",
      original: "definately",
      replacement: "definitely",
      category: "correctness",
      reason: "Corrects spelling of 'definitely'.",
      applied: false,
    },
    {
      id: "s2",
      original: "in order to",
      replacement: "to",
      category: "clarity",
      reason: "Concise phrasing improves sentence flow.",
      applied: false,
    },
    {
      id: "s3",
      original: "very good",
      replacement: "exceptional",
      category: "engagement",
      reason: "A more specific adjective strengthens your statement.",
      applied: false,
    },
    {
      id: "s4",
      original: "You should probably consider",
      replacement: "We recommend",
      category: "delivery",
      reason: "Direct phrasing sounds more confident and professional.",
      applied: false,
    },
  ]);

  const [activeSuggestionId, setActiveSuggestionId] = useState<string>("s1");
  const [isCopiedCommand, setIsCopiedCommand] = useState(false);
  const [showChromeInstallHelp, setShowChromeInstallHelp] = useState(false);
  const [showMacInstallHelp, setShowMacInstallHelp] = useState(false);
  const [showWindowsInstallHelp, setShowWindowsInstallHelp] = useState(false);

  const applySuggestion = (id: string) => {
    const s = suggestions.find((item) => item.id === id);
    if (!s || s.applied) return;

    setDemoText((prev) => prev.replace(s.original, s.replacement));
    setSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, applied: true } : item))
    );

    const next = suggestions.find((item) => item.id !== id && !item.applied);
    if (next) {
      setActiveSuggestionId(next.id);
    }
  };

  const resetDemo = () => {
    setDemoText(
      "Lingually is definately the best tool in order to write with clarity. You should probably consider using it for very good results across all your daily communications."
    );
    setSuggestions((prev) => prev.map((s) => ({ ...s, applied: false })));
    setActiveSuggestionId("s1");
  };

  const appliedCount = suggestions.filter((s) => s.applied).length;
  const score = Math.round(74 + (appliedCount / suggestions.length) * 26);
  const activeSuggestion = suggestions.find((s) => s.id === activeSuggestionId);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is Lingually completely free and open source?",
      a: "Yes. Lingually is open-source software under the MIT License. There are no subscriptions, software paywalls, or feature tiers. You can inspect the source code, self-host it, and use the web and desktop applications freely.",
    },
    {
      q: "How does Bring Your Own Key (BYOK) work?",
      a: "Instead of paying an intermediary a monthly markup, you provide your own API credentials directly from OpenAI, Anthropic, Google Gemini, Groq, or Mistral. You pay providers directly for the tokens you actually consume, or run Ollama to use local models with zero API charges.",
    },
    {
      q: "Where are my documents stored?",
      a: "Documents, drafts, and version histories are stored locally on your device using your browser's IndexedDB or your local filesystem. Lingually operates without a central user database and does not store your drafts on our servers.",
    },
    {
      q: "Can I use Lingually offline?",
      a: "Yes. The Layer A deterministic rule checker runs entirely in your browser with zero network requests. For rewriting and semantic analysis, connecting a local Ollama instance lets you run models entirely on your own machine without an internet connection.",
    },
    {
      q: "What platforms are currently supported?",
      a: "Lingually is available as a web workbench, a Chrome extension for inline writing, a macOS universal desktop application (Apple Silicon and Intel), and a Windows 64-bit desktop application.",
    },
  ];

  const handleCopyQuickstart = () => {
    navigator.clipboard.writeText("git clone https://github.com/binyamfeyissa/lingually.git && cd lingually && npm install && npm run dev");
    setIsCopiedCommand(true);
    setTimeout(() => setIsCopiedCommand(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased selection:bg-invert-bg selection:text-invert-fg select-none">
      {/* ========================================================================= */}
      {/* HUD Navigation Bar */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-xs border-b border-line h-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-85 transition py-1 pr-4 border-r border-line"
              title="Lingually Homepage"
            >
              <img
                src="/Images/Lingually icon.png"
                alt="Lingually"
                className="h-5 w-5 object-contain"
              />
              <span className="font-display font-bold text-xs uppercase tracking-tight text-ink">
                Lingually
              </span>
            </Link>

            <nav className="hidden md:flex items-center pl-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted space-x-6">
              <a href="#features" className="hover:text-ink transition-colors">
                FEATURES
              </a>
              <a href="#preview" className="hover:text-ink transition-colors">
                PREVIEW
              </a>
              <a href="#architecture" className="hover:text-ink transition-colors">
                BYOK
              </a>
              <a href="#platforms" className="hover:text-ink transition-colors">
                PLATFORMS
              </a>
              <Link href="/privacy" className="hover:text-ink transition-colors">
                PRIVACY
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {/* Prominent Star Lingually on GitHub Button */}
            <a
              href="https://github.com/binyamfeyissa/lingually"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 text-[10px] uppercase tracking-[0.12em] font-semibold border border-line-strong bg-bg text-ink hover:bg-invert-bg hover:text-invert-fg transition-colors"
              title="Star Lingually on GitHub"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">STAR ON GITHUB</span>
              <span className="sm:hidden">STAR</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 ml-0.5" />
            </a>

            <ThemeToggle />

            <Link
              href="/editor"
              className="inline-flex items-center gap-1.5 h-8 px-3.5 text-[10px] uppercase tracking-[0.14em] font-semibold bg-invert-bg text-invert-fg hover:opacity-85 transition-opacity"
            >
              <span>LAUNCH EDITOR</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* Hero Section */}
      {/* ========================================================================= */}
      <section className="pt-16 pb-14 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="relative p-6 sm:p-10 border border-line bg-bg-raised">
          {/* Architectural Corner Crosshair Ticks */}
          <span className="tick top-[-5px] left-[-5px]" />
          <span className="tick top-[-5px] right-[-5px]" />
          <span className="tick bottom-[-5px] left-[-5px]" />
          <span className="tick bottom-[-5px] right-[-5px]" />

          <div className="flex items-center justify-between mb-6 border-b border-line pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              {"00 // OPEN-SOURCE AI WRITING WORKBENCH"}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-accent border border-accent/30 px-2 py-0.5">
              {"VERSION 2.0 // BYOK"}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-ink leading-[1.08]">
            Write clearly.{" "}
            <span className="font-serif italic font-normal text-muted block sm:inline">
              Rewrite confidently.
            </span>{" "}
            Everywhere.
          </h1>

          <p className="mt-5 text-sm sm:text-base text-muted max-w-2xl leading-relaxed font-sans">
            A private, distraction-free writing studio and cross-platform assistant powered by your own AI keys.
            Zero lock-in, local-first IndexedDB document storage, and multi-model intelligence across web and desktop.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono">
            <Link
              href="/editor"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 text-xs uppercase tracking-[0.14em] font-semibold bg-invert-bg text-invert-fg hover:opacity-85 transition-opacity"
            >
              <span>OPEN WORKBENCH</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Prominent Second Star Button in Hero */}
            <a
              href="https://github.com/binyamfeyissa/lingually"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 text-xs uppercase tracking-[0.14em] font-semibold border border-line-strong bg-bg text-ink hover:bg-invert-bg hover:text-invert-fg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>STAR LINGUALLY ON GITHUB</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </a>
          </div>

          {/* Quickstart Terminal Box */}
          <div className="mt-8 border border-line bg-bg font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-line bg-bg-sunken/40 text-[10px] uppercase tracking-wider text-muted">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3" />
                <span>{"BASH // QUICKSTART INSTALL & RUN"}</span>
              </span>
              <button
                onClick={handleCopyQuickstart}
                className="hover:text-ink transition flex items-center gap-1"
                title="Copy shell command"
              >
                {isCopiedCommand ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>COPY</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 text-[11px] text-ink overflow-x-auto whitespace-nowrap">
              <span className="text-muted mr-2">$</span>
              git clone https://github.com/binyamfeyissa/lingually.git &amp;&amp; cd lingually &amp;&amp; npm install &amp;&amp; npm run dev
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Product Preview Section (The Centerpiece) */}
      {/* ========================================================================= */}
      <section id="preview" className="py-10 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* HUD Section Bar */}
        <div className="flex items-center justify-between border-y border-line px-4 sm:px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-6">
          <span>{"01 // INTERACTIVE WORKBENCH PREVIEW"}</span>
          <span className="text-accent">TRY INLINE EDITING</span>
        </div>

        <div className="relative border border-line bg-bg-raised">
          <span className="tick top-[-5px] left-[-5px]" />
          <span className="tick top-[-5px] right-[-5px]" />
          <span className="tick bottom-[-5px] left-[-5px]" />
          <span className="tick bottom-[-5px] right-[-5px]" />

          {/* Window Titlebar */}
          <div className="border-b border-line px-4 py-2 flex items-center justify-between font-mono text-[11px] bg-bg">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-ink" />
              <span className="uppercase tracking-wider text-ink font-semibold">
                {"SAMPLE // PROPOSAL_DRAFT.MD"}
              </span>
            </div>
            <button
              onClick={resetDemo}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted hover:text-ink transition"
              title="Reset sample text"
            >
              <RefreshCw className="w-3 h-3" />
              <span>RESET SAMPLE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
            {/* Writing Surface */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-line bg-bg">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted block mb-4">
                  DOCUMENT CANVAS
                </span>

                <div className="text-lg sm:text-xl leading-[1.85] text-ink font-sans select-text">
                  Lingually is{" "}
                  {suggestions.find((s) => s.id === "s1")?.applied ? (
                    <span className="text-accent bg-accent/15 px-1 font-semibold">definitely</span>
                  ) : (
                    <button
                      onClick={() => setActiveSuggestionId("s1")}
                      className={cn(
                        "underline decoration-danger decoration-2 cursor-pointer transition px-1",
                        activeSuggestionId === "s1" ? "bg-danger/15 text-danger font-semibold" : "text-ink"
                      )}
                    >
                      definately
                    </button>
                  )}{" "}
                  the best tool{" "}
                  {suggestions.find((s) => s.id === "s2")?.applied ? (
                    <span className="text-accent bg-accent/15 px-1 font-semibold">to</span>
                  ) : (
                    <button
                      onClick={() => setActiveSuggestionId("s2")}
                      className={cn(
                        "underline decoration-accent decoration-2 cursor-pointer transition px-1",
                        activeSuggestionId === "s2" ? "bg-accent/15 text-accent font-semibold" : "text-ink"
                      )}
                    >
                      in order to
                    </button>
                  )}{" "}
                  write with clarity.{" "}
                  {suggestions.find((s) => s.id === "s4")?.applied ? (
                    <span className="text-accent bg-accent/15 px-1 font-semibold">We recommend</span>
                  ) : (
                    <button
                      onClick={() => setActiveSuggestionId("s4")}
                      className={cn(
                        "underline decoration-purple-500 decoration-2 cursor-pointer transition px-1",
                        activeSuggestionId === "s4" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold" : "text-ink"
                      )}
                    >
                      You should probably consider
                    </button>
                  )}{" "}
                  using it for{" "}
                  {suggestions.find((s) => s.id === "s3")?.applied ? (
                    <span className="text-accent bg-accent/15 px-1 font-semibold">exceptional</span>
                  ) : (
                    <button
                      onClick={() => setActiveSuggestionId("s3")}
                      className={cn(
                        "underline decoration-emerald-500 decoration-2 cursor-pointer transition px-1",
                        activeSuggestionId === "s3" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold" : "text-ink"
                      )}
                    >
                      very good
                    </button>
                  )}{" "}
                  results across all your daily communications.
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-4 mt-6 border-t border-line flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
                <div className="flex items-center gap-3">
                  <span>CORRECTNESS</span>
                  <span>/</span>
                  <span>CLARITY</span>
                  <span>/</span>
                  <span>ENGAGEMENT</span>
                  <span>/</span>
                  <span>DELIVERY</span>
                </div>
                <div className="text-ink font-semibold">
                  {suggestions.length - appliedCount} PENDING
                </div>
              </div>
            </div>

            {/* Review Sidebar Panel */}
            <div className="lg:col-span-5 bg-bg-raised p-5 flex flex-col justify-between font-mono text-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted">OVERALL SCORE</span>
                    <div className="font-display text-2xl font-bold text-ink mt-0.5">
                      {score} <span className="text-xs text-muted font-mono">/ 100</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-line-strong text-ink font-semibold">
                    {score >= 90 ? "OPTIMAL" : "NEEDS POLISH"}
                  </span>
                </div>

                {/* Active Suggestion Card */}
                {activeSuggestion && (
                  <div className="border border-line-strong bg-bg p-3.5 mb-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-line text-ink">
                        {activeSuggestion.category}
                      </span>
                      {activeSuggestion.applied && (
                        <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>APPLIED</span>
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-[11px] text-muted">{activeSuggestion.reason}</p>

                    <div className="flex items-center gap-2 text-xs font-mono bg-bg-raised p-2 border border-line">
                      <span className="line-through text-danger">{activeSuggestion.original}</span>
                      <span className="text-muted">→</span>
                      <span className="text-accent font-semibold">{activeSuggestion.replacement}</span>
                    </div>

                    {!activeSuggestion.applied ? (
                      <button
                        onClick={() => applySuggestion(activeSuggestion.id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] font-semibold bg-invert-bg text-invert-fg hover:opacity-85 py-2 transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>ACCEPT CHANGE</span>
                      </button>
                    ) : (
                      <div className="text-center text-[10px] font-mono text-muted py-1 uppercase tracking-wider">
                        MODIFICATION APPLIED TO DOCUMENT
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestions List */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted block mb-1">
                    SUGGESTION QUEUE ({suggestions.length - appliedCount})
                  </span>
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSuggestionId(s.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2 border text-left text-xs transition rounded-none",
                        activeSuggestionId === s.id
                          ? "bg-bg border-line-strong text-ink font-semibold"
                          : "bg-transparent border-line text-muted hover:text-ink",
                        s.applied && "opacity-40"
                      )}
                    >
                      <span className="truncate pr-2">
                        {s.original} → {s.replacement}
                      </span>
                      {s.applied ? (
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="text-accent text-[10px] uppercase shrink-0">VIEW</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Section 01: Crafting Capabilities (Hairline Grid) */}
      {/* ========================================================================= */}
      <section id="features" className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-y border-line px-4 sm:px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-8">
          <span>02 / CRAFTING CAPABILITIES</span>
          <span className="text-accent">MULTI-LAYER WORKBENCH</span>
        </div>

        <div className="hairline-grid grid-cols-1 md:grid-cols-3">
          <div className="p-6 bg-bg space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{"02.1 // HEURISTICS"}</span>
            <h3 className="font-display text-lg font-bold text-ink">Deterministic Syntax Engine</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Layer A executes zero-latency rule checks directly in WebAssembly and browser threads.
              Catches typos, confused homophones, and dangling modifiers without sending words across the network.
            </p>
          </div>

          <div className="p-6 bg-bg space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{"02.2 // REWRITE"}</span>
            <h3 className="font-display text-lg font-bold text-ink">Contextual Paraphraser</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Choose from 7 writing styles: Standard, Fluent, Formal, Simple, Creative, Concise, or Expanded.
              Generates clean visual diffs so you review every replaced token before accepting.
            </p>
          </div>

          <div className="p-6 bg-bg space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{"02.3 // STORAGE"}</span>
            <h3 className="font-display text-lg font-bold text-ink">Local-First Document Vault</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Your drafts and automatic version snapshots live exclusively on your device inside IndexedDB.
              No cloud accounts, no centralized document leaks, and full offline export capabilities.
            </p>
          </div>

          <div className="p-6 bg-bg space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{"02.4 // ECOSYSTEM"}</span>
            <h3 className="font-display text-lg font-bold text-ink">Cross-Platform Assistance</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Consistent writing intelligence wherever you work: full Web Workbench, Chrome Extension for text inputs,
              and native Tauri 2 desktop applications for macOS and Windows.
            </p>
          </div>

          <div className="p-6 bg-bg space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{"02.5 // METRICS"}</span>
            <h3 className="font-display text-lg font-bold text-ink">Readability & Plagiarism</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Instant evaluation of Flesch Reading Ease, Flesch-Kincaid Grade Level, sentence burstiness,
              and distinctive query scans to preserve authentic voice and academic integrity.
            </p>
          </div>

          <div className="p-6 bg-bg space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{"02.6 // BYOK"}</span>
            <h3 className="font-display text-lg font-bold text-ink">Provider Sovereignty</h3>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Freedom to plug in OpenAI, Anthropic Claude, Google Gemini, Groq, or 100% offline local Ollama models.
              Zero application markup, zero token subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Section 02: The Editorial Transformation (Diff View) */}
      {/* ========================================================================= */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-y border-line px-4 sm:px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-8">
          <span>03 / THE EDITORIAL TRANSFORMATION</span>
          <span className="text-accent">INLINE DIFF ARCHITECTURE</span>
        </div>

        <div className="hairline-grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 bg-bg space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-danger">{"BEFORE // UNREFINED DRAFT"}</div>
            <p className="font-sans text-sm text-muted leading-relaxed">
              &quot;Due to the fact that we experienced unexpected server latency issues, we were unable to complete the upload until this morning.&quot;
            </p>
            <div className="font-mono text-[10px] text-muted border-t border-line pt-2">
              WORDS: 20 • READING EASE: 44 (HARD) • PASSIVE CONSTRUCTIONS: 1
            </div>
          </div>

          <div className="p-6 bg-bg space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-accent">{"AFTER // LINGUALLY REFINED"}</div>
            <p className="font-sans text-sm text-ink leading-relaxed">
              &quot;Because server latency caused unexpected delays, we completed the upload this morning.&quot;
            </p>
            <div className="font-mono text-[10px] text-accent border-t border-line pt-2 font-semibold">
              WORDS: 12 (-40%) • READING EASE: 68 (CLEAR) • TONE: PROFESSIONAL
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Section 03: BYOK & Security Architecture */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-y border-line px-4 sm:px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-8">
          <span>04 / BYOK & LOCAL-FIRST SECURITY</span>
          <span className="text-accent">ZERO DATA RETENTION</span>
        </div>

        <div className="hairline-grid grid-cols-1 md:grid-cols-3">
          <div className="p-6 bg-bg space-y-2">
            <Key className="w-5 h-5 text-accent" />
            <h4 className="font-display text-base font-bold text-ink">Direct Provider Billing</h4>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Connect your own API key directly. You pay pennies per 1,000 tokens consumed rather than
              a recurring \$15–\$30/month markup to an AI software reseller.
            </p>
          </div>

          <div className="p-6 bg-bg space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h4 className="font-display text-base font-bold text-ink">Stateless Route Handlers</h4>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Requests pass through a zero-retention Next.js Route Handler to bypass browser CORS.
              No prompts, outputs, or keys are ever logged to persistent disk on the server.
            </p>
          </div>

          <div className="p-6 bg-bg space-y-2">
            <Sliders className="w-5 h-5 text-purple-500" />
            <h4 className="font-display text-base font-bold text-ink">Offline Local Ollama</h4>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Prefer 100% privacy? Run open-weights models like Llama 3.2 or Mistral locally on your machine.
              Zero internet access required.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Section 04: Cross-Platform System */}
      {/* ========================================================================= */}
      <section id="platforms" className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-y border-line px-4 sm:px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-8">
          <span>05 / CROSS-PLATFORM SYSTEM</span>
          <span className="text-accent">MULTI-DEVICE MATRIX</span>
        </div>

        <div className="hairline-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Web */}
          <div className="p-5 bg-bg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-2">
                <Globe className="w-4 h-4 text-accent" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 px-1 py-0.2">
                  LIVE
                </span>
              </div>
              <h4 className="font-display text-sm font-bold text-ink">Web Workbench</h4>
              <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
                Full distraction-free document editor with 3-tab review sidebar, revisions, and export.
              </p>
            </div>
            <Link
              href="/editor"
              className="inline-flex items-center justify-center gap-1.5 h-8 font-mono text-[10px] uppercase tracking-wider font-semibold bg-invert-bg text-invert-fg hover:opacity-85 transition"
            >
              <span>LAUNCH WEB</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Chrome */}
          <div className="p-5 bg-bg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-2">
                <Terminal className="w-4 h-4 text-accent" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 px-1 py-0.2">
                  PACKAGE
                </span>
              </div>
              <h4 className="font-display text-sm font-bold text-ink">Chrome Extension</h4>
              <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
                Inline grammar checks and floating suggestion cards across web inputs, emails, and forms.
              </p>
            </div>
            <div className="space-y-2">
              <a
                href="/downloads/lingually-chrome-extension.zip"
                download
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 font-mono text-[10px] uppercase tracking-wider font-semibold border border-line text-ink hover:bg-bg-raised transition"
              >
                <Download className="w-3 h-3" />
                <span>DOWNLOAD ZIP</span>
              </a>

              <button
                type="button"
                onClick={() => setShowChromeInstallHelp((v) => !v)}
                className="w-full text-center font-mono text-[9px] uppercase tracking-wider text-accent hover:underline flex items-center justify-center gap-1"
              >
                <span>{showChromeInstallHelp ? "Hide Install Steps" : "How to install in Chrome →"}</span>
              </button>

              {showChromeInstallHelp && (
                <div className="p-2.5 bg-bg-raised border border-line text-[11px] font-mono space-y-1 text-muted leading-tight mt-1">
                  <p className="text-ink font-semibold text-[10px] uppercase tracking-wider">Chrome Setup (10s):</p>
                  <p>1. In Chrome, go to <span className="text-ink font-semibold">chrome://extensions</span></p>
                  <p>2. Enable <span className="text-ink font-semibold">Developer mode</span> (top right toggle)</p>
                  <p>3. Click <span className="text-ink font-semibold">Load unpacked</span> and select this unzipped folder</p>
                </div>
              )}
            </div>
          </div>

          {/* macOS */}
          <div className="p-5 bg-bg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-2">
                <Laptop className="w-4 h-4 text-accent" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 px-1 py-0.2">
                  UNIVERSAL .DMG
                </span>
              </div>
              <h4 className="font-display text-sm font-bold text-ink">macOS Desktop 2.0</h4>
              <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
                Full Writing Workbench, AI settings (Gemini, OpenAI, Claude), and system-wide in-app keyboard assist via <span className="text-ink font-semibold font-mono">⌥Space</span>.
              </p>
            </div>
            <div className="space-y-2">
              <a
                href="/downloads/Lingually-macOS-Universal.dmg"
                download="Lingually-macOS-Universal.dmg"
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 font-mono text-[10px] uppercase tracking-wider font-semibold border border-line text-ink hover:bg-bg-raised transition"
              >
                <Download className="w-3 h-3" />
                <span>DOWNLOAD (.DMG)</span>
              </a>

              <button
                type="button"
                onClick={() => setShowMacInstallHelp((v) => !v)}
                className="w-full text-center font-mono text-[9px] uppercase tracking-wider text-accent hover:underline flex items-center justify-center gap-1"
              >
                <span>{showMacInstallHelp ? "Hide Install Steps" : "How to install on Mac →"}</span>
              </button>

              {showMacInstallHelp && (
                <div className="p-2.5 bg-bg-raised border border-line text-[11px] font-mono space-y-1 text-muted leading-tight mt-1">
                  <p className="text-ink font-semibold text-[10px] uppercase tracking-wider">Mac Setup (15s):</p>
                  <p>1. Open <span className="text-ink font-semibold">Lingually-macOS-Universal.dmg</span></p>
                  <p>2. Drag <span className="text-ink font-semibold">Lingually</span> to Applications</p>
                  <p>3. Menu Bar item + <span className="text-ink font-semibold">⌥Space</span> works in Slack, Notes, Word, Chrome</p>
                  <p>4. Also available: <a href="/downloads/Lingually-macOS-Universal.zip" download className="text-accent underline">Direct .ZIP</a></p>
                </div>
              )}

              <Link
                href="/docs/MACOS_BUILD.md"
                className="block text-center font-mono text-[9px] uppercase tracking-wider text-muted hover:text-ink pt-0.5"
              >
                <span>Build Docs & Rust Guide →</span>
              </Link>
            </div>
          </div>

          {/* Windows */}
          <div className="p-5 bg-bg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] text-muted mb-2">
                <Laptop className="w-4 h-4 text-accent" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 px-1 py-0.2">
                  WINDOWS 64-BIT
                </span>
              </div>
              <h4 className="font-display text-sm font-bold text-ink">Windows Desktop 2.0</h4>
              <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
                Full Writing Workbench, AI settings (Gemini, OpenAI, Claude), and Quick-Assist floating overlay with Edge WebView2.
              </p>
            </div>
            <div className="space-y-2">
              <a
                href="/downloads/Lingually-Windows-x64.zip"
                download="Lingually-Windows-x64.zip"
                className="w-full inline-flex items-center justify-center gap-1.5 h-8 font-mono text-[10px] uppercase tracking-wider font-semibold border border-line text-ink hover:bg-bg-raised transition"
              >
                <Download className="w-3 h-3" />
                <span>DOWNLOAD (.ZIP)</span>
              </a>

              <button
                type="button"
                onClick={() => setShowWindowsInstallHelp((v) => !v)}
                className="w-full text-center font-mono text-[9px] uppercase tracking-wider text-accent hover:underline flex items-center justify-center gap-1"
              >
                <span>{showWindowsInstallHelp ? "Hide Run Steps" : "How to run on Windows →"}</span>
              </button>

              {showWindowsInstallHelp && (
                <div className="p-2.5 bg-bg-raised border border-line text-[11px] font-mono space-y-1 text-muted leading-tight mt-1">
                  <p className="text-ink font-semibold text-[10px] uppercase tracking-wider">Windows Setup (10s):</p>
                  <p>1. Extract <span className="text-ink font-semibold">Lingually-Windows-x64.zip</span></p>
                  <p>2. Double-click <span className="text-ink font-semibold">Lingually.vbs</span> for Workbench</p>
                  <p>3. Double-click <span className="text-ink font-semibold">Quick-Assist.vbs</span> for Floating Overlay</p>
                </div>
              )}

              <Link
                href="/docs/WINDOWS_BUILD.md"
                className="block text-center font-mono text-[9px] uppercase tracking-wider text-muted hover:text-ink pt-0.5"
              >
                <span>Build Docs & Rust Guide →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Section 05: Open Source Callout & GitHub Star */}
      {/* ========================================================================= */}
      <section className="py-14 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="relative p-8 sm:p-12 border border-line bg-bg-raised text-center space-y-4">
          <span className="tick top-[-5px] left-[-5px]" />
          <span className="tick top-[-5px] right-[-5px]" />
          <span className="tick bottom-[-5px] left-[-5px]" />
          <span className="tick bottom-[-5px] right-[-5px]" />

          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            {"06 // COMMUNITY & FREEDOM"}
          </span>

          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink max-w-xl mx-auto leading-tight">
            Built for writers, researchers, and engineers who value their privacy.
          </h2>

          <p className="font-sans text-xs sm:text-sm text-muted max-w-lg mx-auto leading-relaxed">
            Lingually is 100% open source under the MIT License. Support the project by starring the repository on GitHub.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono">
            {/* Prominent Callout Star Button */}
            <a
              href="https://github.com/binyamfeyissa/lingually"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 h-11 px-8 text-xs uppercase tracking-[0.14em] font-semibold bg-invert-bg text-invert-fg hover:opacity-85 transition-opacity"
            >
              <Github className="w-4 h-4" />
              <span>STAR LINGUALLY ON GITHUB</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </a>

            <Link
              href="/editor"
              className="inline-flex items-center gap-2 h-11 px-6 text-xs uppercase tracking-[0.14em] font-semibold border border-line-strong bg-bg text-ink hover:bg-invert-bg hover:text-invert-fg transition-colors"
            >
              <span>TRY WEB EDITOR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FAQ Section */}
      {/* ========================================================================= */}
      <section className="py-14 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-y border-line px-4 sm:px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-8">
          <span>{"07 // FREQUENTLY ASKED QUESTIONS"}</span>
          <span className="text-accent">DETAILS & LICENSING</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-line bg-bg transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm text-ink font-semibold uppercase tracking-wider"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted transition-transform",
                    openFaq === idx && "rotate-180 text-ink"
                  )}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 font-sans text-xs text-muted leading-relaxed border-t border-line pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* Footer */}
      {/* ========================================================================= */}
      <footer className="border-t border-line bg-bg-raised py-8 font-mono text-[11px] text-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/Images/Lingually icon.png"
              alt="Lingually"
              className="h-4 w-4 object-contain"
            />
            <span className="font-display font-bold text-xs uppercase text-ink">Lingually</span>
            <span>{"// OPEN-SOURCE AI WRITING WORKBENCH"}</span>
          </div>

          <div className="flex items-center gap-4 uppercase tracking-wider">
            <Link href="/editor" className="hover:text-ink transition">
              EDITOR
            </Link>
            <Link href="/settings" className="hover:text-ink transition">
              SETTINGS
            </Link>
            <Link href="/privacy" className="hover:text-ink transition">
              PRIVACY
            </Link>
            <a
              href="https://github.com/binyamfeyissa/lingually"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink transition flex items-center gap-1 text-ink font-semibold"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>STAR ON GITHUB</span>
            </a>
          </div>

          <div>MIT LICENSE • BYOK ARCHITECTURE</div>
        </div>
      </footer>
    </div>
  );
}

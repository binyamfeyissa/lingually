/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Key,
  Laptop,
  Chrome,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Search,
  Sliders,
  ChevronDown,
  Layers,
  FileText,
  Cpu,
  RefreshCw,
  Github,
  Check,
  X,
  ExternalLink,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DemoSuggestion {
  id: string;
  original: string;
  replacement: string;
  category: "correctness" | "clarity" | "engagement" | "delivery";
  reason: string;
  applied: boolean;
}

export default function MarketingLandingPage() {
  // Interactive demo state
  const [demoText, setDemoText] = useState(
    "Lingually is definately the best tool in order to write with high impact. You should probably consider using it for very good results across all your daily communications."
  );

  const [suggestions, setSuggestions] = useState<DemoSuggestion[]>([
    {
      id: "s1",
      original: "definately",
      replacement: "definitely",
      category: "correctness",
      reason: "Correct spelling mistake for 'definitely'.",
      applied: false,
    },
    {
      id: "s2",
      original: "in order to",
      replacement: "to",
      category: "clarity",
      reason: "Concise phrasing improves readability.",
      applied: false,
    },
    {
      id: "s3",
      original: "very good",
      replacement: "exceptional",
      category: "engagement",
      reason: "Stronger adjective adds engagement.",
      applied: false,
    },
    {
      id: "s4",
      original: "You should probably consider",
      replacement: "We recommend",
      category: "delivery",
      reason: "Assertive tone sounds more confident and direct.",
      applied: false,
    },
  ]);

  const [activeSuggestionId, setActiveSuggestionId] = useState<string>("s1");

  const applySuggestion = (id: string) => {
    const s = suggestions.find((item) => item.id === id);
    if (!s || s.applied) return;

    setDemoText((prev) => prev.replace(s.original, s.replacement));
    setSuggestions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, applied: true } : item))
    );

    // switch to next unapplied suggestion
    const next = suggestions.find((item) => item.id !== id && !item.applied);
    if (next) {
      setActiveSuggestionId(next.id);
    }
  };

  const resetDemo = () => {
    setDemoText(
      "Lingually is definately the best tool in order to write with high impact. You should probably consider using it for very good results across all your daily communications."
    );
    setSuggestions((prev) => prev.map((s) => ({ ...s, applied: false })));
    setActiveSuggestionId("s1");
  };

  const appliedCount = suggestions.filter((s) => s.applied).length;
  const score = Math.round(72 + (appliedCount / suggestions.length) * 28);

  const activeSuggestion = suggestions.find((s) => s.id === activeSuggestionId);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is Lingually completely free and open source?",
      a: "Yes. Lingually is 100% open-source software under the MIT License. There are no software subscription fees, paywalls, or feature tiers. You can inspect the code, host it anywhere, and use it freely.",
    },
    {
      q: "How does Bring Your Own Key (BYOK) work?",
      a: "Instead of paying us $30/month for AI tokens marked up 1000%, you supply your own API key directly from OpenAI, Anthropic, Google Gemini, Groq, or Mistral. You pay the provider directly at raw API prices (typically pennies for thousands of pages), or connect Ollama to run 100% free locally.",
    },
    {
      q: "Where is my document data stored?",
      a: "All documents, drafts, settings, and revision histories are stored strictly locally in your browser's IndexedDB / localStorage or on your local machine. Nothing is ever sent to a Lingually cloud database because we don't have one.",
    },
    {
      q: "What platforms does Lingually 2.0 support?",
      a: "Lingually 2.0 supports the modern Web Workbench, a Chrome Extension (Manifest V3) for writing inside Gmail, Google Docs, Notion, and Jira, a macOS native desktop app (Universal for Apple Silicon M1-M4 & Intel), and a Windows 10/11 desktop app with UI Automation.",
    },
    {
      q: "Can I use Lingually completely offline?",
      a: "Yes! By choosing Ollama (or local models like Llama 3, Mistral, Gemma) or utilizing our built-in local deterministic rule engine (Layer A), you can check spelling, grammar, and style with zero internet connectivity and zero telemetry.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 selection:bg-[#0268cc] selection:text-white font-sans antialiased">
      {/* Top Banner */}
      <div className="bg-[#eef6fc] border-b border-[#0268cc]/15 px-4 py-2.5 text-center text-xs sm:text-sm font-medium text-[#0268cc]">
        🚀 Introducing Lingually 2.0: Cross-platform AI writing assistant for Web, Chrome, macOS, and Windows.
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              {/* Actual Lingually Logo */}
              <img
                src="/Images/Lingually Logo.png"
                alt="Lingually"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </Link>
            <span className="hidden sm:inline-flex text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-[#eef6fc] text-[#0268cc] border border-[#0268cc]/20">
              2.0 Open Source
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-9 text-sm font-semibold text-slate-600">
            <a href="#demo" className="hover:text-[#0268cc] transition-colors">
              Interactive Demo
            </a>
            <a href="#features" className="hover:text-[#0268cc] transition-colors">
              Features
            </a>
            <a href="#platforms" className="hover:text-[#0268cc] transition-colors">
              Platforms
            </a>
            <a href="#comparison" className="hover:text-[#0268cc] transition-colors">
              Why BYOK
            </a>
            <a href="#faq" className="hover:text-[#0268cc] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-3.5">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-2 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition"
            >
              <Github className="w-4 h-4 text-slate-600" />
              <span>GitHub</span>
            </Link>

            <Link
              href="/editor"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-[#0268cc] hover:bg-[#0256a9] active:bg-[#01488f] px-5 py-2.5 rounded-xl shadow-md shadow-[#0268cc]/25 transition-all hover:scale-[1.02]"
            >
              <span>Open Web Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-gradient-to-b from-white via-[#f8fafc] to-[#fbfbfd]">
        {/* Soft, warm ambient glow inspired by Grammarly design */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[680px] h-[360px] bg-[#0268cc]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-24 left-1/3 -translate-x-1/2 w-[420px] h-[260px] bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#eef6fc] border border-[#0268cc]/20 text-xs font-semibold text-[#0268cc] mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#0268cc] animate-pulse" />
            <span>Grammarly Alternative • Zero Subscription • 100% Privacy</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Write clearly.{" "}
            <span className="bg-gradient-to-r from-[#0268cc] via-[#048bf5] to-sky-600 bg-clip-text text-transparent">
              Everywhere.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-11 leading-relaxed font-normal">
            The open-source AI writing workbench with inline grammar correction, real-time rewriting,
            tone adjustment, and plagiarism verification. Bring your own API key or run free local models.
            Zero cloud subscriptions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/editor"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 text-base font-semibold text-white bg-[#0268cc] hover:bg-[#0256a9] active:bg-[#01488f] px-8 py-4 rounded-xl shadow-lg shadow-[#0268cc]/25 transition hover:scale-[1.02]"
            >
              <span>Launch Web Editor</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#platforms"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm hover:border-slate-300 px-8 py-4 rounded-xl transition"
            >
              <Download className="w-5 h-5 text-[#0268cc]" />
              <span>Get Chrome & Desktop Apps</span>
            </a>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200 text-left">
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <Key className="w-5 h-5 text-[#0268cc] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Bring Your Own Key</p>
                <p className="text-xs text-slate-500 mt-0.5">OpenAI, Anthropic, Gemini, Groq, or Ollama</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Local-First Storage</p>
                <p className="text-xs text-slate-500 mt-0.5">Documents remain entirely on your device</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <Sliders className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">4 Category Rules</p>
                <p className="text-xs text-slate-500 mt-0.5">Correctness, Clarity, Engagement, Delivery</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-sm">
              <Search className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">Plagiarism & AI Check</p>
                <p className="text-xs text-slate-500 mt-0.5">Attribution search & perplexity scores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo */}
      <section id="demo" className="py-24 bg-white border-y border-slate-200/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-widest text-[#0268cc] uppercase mb-2">
              Live Interactive Demo
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Experience the 4-color layered correction engine
            </h3>
            <p className="mt-3.5 text-slate-600 text-sm sm:text-base leading-relaxed">
              Click on the highlighted suggestions below to test how Lingually cleans up errors,
              sharpens clarity, and boosts your overall score.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Editor preview card */}
            <div className="lg:col-span-7 bg-[#fbfbfd] rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-9 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-7">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">sample-draft.md</span>
                </div>
                <button
                  onClick={resetDemo}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#0268cc]" />
                  <span>Reset Demo</span>
                </button>
              </div>

              {/* Rendered Text with Highlight spans */}
              <div className="text-xl leading-[1.8] text-slate-800 font-serif min-h-[170px]">
                {suggestions.find((s) => s.id === "s1")?.applied ? (
                  <span>Lingually is <span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">definitely</span> </span>
                ) : (
                  <span>
                    Lingually is{" "}
                    <button
                      onClick={() => setActiveSuggestionId("s1")}
                      className={cn(
                        "underline decoration-rose-500 decoration-wavy decoration-2 font-medium cursor-pointer transition-colors px-1 rounded",
                        activeSuggestionId === "s1" ? "bg-rose-100 text-rose-900" : "text-slate-900 hover:bg-rose-50"
                      )}
                    >
                      definately
                    </button>{" "}
                  </span>
                )}

                <span>the best tool </span>

                {suggestions.find((s) => s.id === "s2")?.applied ? (
                  <span><span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">to</span> </span>
                ) : (
                  <span>
                    <button
                      onClick={() => setActiveSuggestionId("s2")}
                      className={cn(
                        "underline decoration-sky-500 decoration-wavy decoration-2 font-medium cursor-pointer transition-colors px-1 rounded",
                        activeSuggestionId === "s2" ? "bg-sky-100 text-sky-900" : "text-slate-900 hover:bg-sky-50"
                      )}
                    >
                      in order to
                    </button>{" "}
                  </span>
                )}

                <span>write with high impact. </span>

                {suggestions.find((s) => s.id === "s4")?.applied ? (
                  <span><span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">We recommend</span> </span>
                ) : (
                  <span>
                    <button
                      onClick={() => setActiveSuggestionId("s4")}
                      className={cn(
                        "underline decoration-violet-500 decoration-wavy decoration-2 font-medium cursor-pointer transition-colors px-1 rounded",
                        activeSuggestionId === "s4" ? "bg-violet-100 text-violet-900" : "text-slate-900 hover:bg-violet-50"
                      )}
                    >
                      You should probably consider
                    </button>{" "}
                  </span>
                )}

                <span>using it for </span>

                {suggestions.find((s) => s.id === "s3")?.applied ? (
                  <span><span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">exceptional</span> </span>
                ) : (
                  <span>
                    <button
                      onClick={() => setActiveSuggestionId("s3")}
                      className={cn(
                        "underline decoration-emerald-500 decoration-wavy decoration-2 font-medium cursor-pointer transition-colors px-1 rounded",
                        activeSuggestionId === "s3" ? "bg-emerald-100 text-emerald-900" : "text-slate-900 hover:bg-emerald-50"
                      )}
                    >
                      very good
                    </button>{" "}
                  </span>
                )}

                <span>results across all your daily communications.</span>
              </div>

              {/* Status and Score footer */}
              <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Correctness</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>Clarity</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Engagement</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                    <span>Delivery</span>
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">
                    {suggestions.length - appliedCount}
                  </span>{" "}
                  pending issues
                </div>
              </div>
            </div>

            {/* Sidebar Inspector card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-7">
              {/* Score header */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-200">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500">
                    Overall Performance Score
                  </h4>
                  <div className="flex items-baseline space-x-2 mt-1.5">
                    <span className="text-4xl font-extrabold text-slate-900">{score}</span>
                    <span className="text-sm font-semibold text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {score >= 95 ? "Exceptional" : score >= 85 ? "Good" : "Needs Review"}
                  </span>
                </div>
              </div>

              {/* Active Suggestion Box */}
              {activeSuggestion && (
                <div className="bg-[#f8fafc] rounded-xl border border-slate-200 p-5 mb-5 shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider",
                        activeSuggestion.category === "correctness" && "bg-rose-50 text-rose-700 border border-rose-200",
                        activeSuggestion.category === "clarity" && "bg-sky-50 text-sky-700 border border-sky-200",
                        activeSuggestion.category === "engagement" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        activeSuggestion.category === "delivery" && "bg-violet-50 text-violet-700 border border-violet-200"
                      )}
                    >
                      {activeSuggestion.category}
                    </span>
                    {activeSuggestion.applied && (
                      <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        <span>Accepted</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2 mb-4 leading-relaxed font-normal">{activeSuggestion.reason}</p>

                  <div className="flex items-center space-x-3 mb-4 text-sm font-mono bg-white p-3 rounded-lg border border-slate-200 shadow-inner">
                    <span className="line-through text-rose-600 font-medium">{activeSuggestion.original}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-600 font-bold">{activeSuggestion.replacement}</span>
                  </div>

                  {!activeSuggestion.applied ? (
                    <button
                      onClick={() => applySuggestion(activeSuggestion.id)}
                      className="w-full inline-flex items-center justify-center space-x-2 text-xs font-bold text-white bg-[#0268cc] hover:bg-[#0256a9] active:bg-[#01488f] py-3 rounded-xl shadow-sm transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Suggestion</span>
                    </button>
                  ) : (
                    <div className="text-center text-xs font-medium text-slate-400 py-2">
                      Suggestion already applied to document
                    </div>
                  )}
                </div>
              )}

              {/* List of remaining suggestions */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  All Suggestions ({suggestions.length})
                </p>
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSuggestionId(s.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition-all",
                      activeSuggestionId === s.id
                        ? "bg-[#eef6fc] border-[#0268cc]/50 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300",
                      s.applied && "opacity-50"
                    )}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0",
                          s.category === "correctness" && "bg-rose-500",
                          s.category === "clarity" && "bg-sky-500",
                          s.category === "engagement" && "bg-emerald-500",
                          s.category === "delivery" && "bg-violet-500"
                        )}
                      />
                      <span className="font-semibold text-slate-800">
                        {s.original} → {s.replacement}
                      </span>
                    </div>
                    {s.applied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[#0268cc] font-bold">Review</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison: Lingually vs Grammarly/Proprietary */}
      <section id="comparison" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-[#0268cc] uppercase mb-2">
            Transparent Comparison
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Why choose Lingually over proprietary assistants?
          </h3>
          <p className="mt-3.5 text-slate-600 text-sm sm:text-base leading-relaxed">
            Never pay expensive monthly subscription fees to have proprietary servers scan your sensitive
            thoughts. Own your writing stack.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f8fafc] text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="p-4 sm:p-6">Feature</th>
                <th className="p-4 sm:p-6 text-[#0268cc]">Lingually 2.0</th>
                <th className="p-4 sm:p-6 text-slate-600">Grammarly / QuillBot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 sm:p-6 font-semibold text-slate-900">License & Code Access</td>
                <td className="p-4 sm:p-6 text-emerald-700 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Open Source (MIT)</span>
                </td>
                <td className="p-4 sm:p-6 text-slate-500 flex items-center space-x-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span>Closed Source / Proprietary</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 sm:p-6 font-semibold text-slate-900">Cost & Pricing Model</td>
                <td className="p-4 sm:p-6 text-emerald-700 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>$0 Software • BYOK at raw token rates</span>
                </td>
                <td className="p-4 sm:p-6 text-slate-500 flex items-center space-x-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span>$12 – $30 / month recurring</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 sm:p-6 font-semibold text-slate-900">Document Privacy & Storage</td>
                <td className="p-4 sm:p-6 text-emerald-700 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Local-first on device • Zero cloud DB</span>
                </td>
                <td className="p-4 sm:p-6 text-slate-500 flex items-center space-x-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span>Stored on vendor cloud servers</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 sm:p-6 font-semibold text-slate-900">AI Model Choice</td>
                <td className="p-4 sm:p-6 text-emerald-700 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>OpenAI, Anthropic, Gemini, Groq, Ollama</span>
                </td>
                <td className="p-4 sm:p-6 text-slate-500 flex items-center space-x-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span>Locked to vendor proprietary models</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 sm:p-6 font-semibold text-slate-900">100% Offline Local Model Mode</td>
                <td className="p-4 sm:p-6 text-emerald-700 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Yes (Ollama / Local Llama / Gemma)</span>
                </td>
                <td className="p-4 sm:p-6 text-slate-500 flex items-center space-x-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span>No (requires internet & cloud ping)</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 sm:p-6 font-semibold text-slate-900">Chrome Extension & Desktop Apps</td>
                <td className="p-4 sm:p-6 text-emerald-700 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Chrome, macOS (Universal), Windows</span>
                </td>
                <td className="p-4 sm:p-6 text-slate-600 flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Chrome, macOS, Windows</span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="p-4 sm:p-6 font-semibold text-slate-900">Plagiarism & Attribution Search</td>
                <td className="p-4 sm:p-6 text-emerald-700 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Built-in & transparent</span>
                </td>
                <td className="p-4 sm:p-6 text-slate-500 flex items-center space-x-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span>Gated behind expensive tier</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Platforms Showcase: Web, Chrome, macOS, Windows */}
      <section id="platforms" className="py-24 bg-[#f8fafc] border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-[#0268cc] uppercase mb-2">
              Cross-Platform Ecosystem
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Use Lingually wherever you write
            </h3>
            <p className="mt-3.5 text-slate-600 text-sm sm:text-base leading-relaxed">
              One shared system across your favorite browser, web apps, desktop word processors, and terminal tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Platform 1: Web Editor */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0268cc]/40 p-6 flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#eef6fc] border border-[#0268cc]/20 flex items-center justify-center text-[#0268cc] mb-5">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Web Workbench</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Full-featured distraction-free Tiptap editor with 3-tab review sidebar, revision history, and instant export.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Markdown & Rich Text formatting</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Local IndexedDB auto-save</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export to MD, HTML, and TXT</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/editor"
                className="w-full inline-flex items-center justify-center space-x-2 text-xs font-bold text-white bg-[#0268cc] hover:bg-[#0256a9] py-3 rounded-xl transition shadow-sm"
              >
                <span>Launch in Browser</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Platform 2: Chrome Extension */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0268cc]/40 p-6 flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-5">
                  <Chrome className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Chrome Extension</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Inline writing assistant for Google Docs, Gmail, Notion, Jira, and GitHub. Manifest V3 with inline underlines.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inline colored wavy highlights</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Floating suggestion card popup</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Side panel generative tools</span>
                  </li>
                </ul>
              </div>
              <a
                href="/downloads/lingually-chrome-extension.zip"
                download
                className="w-full inline-flex items-center justify-center space-x-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 py-3 rounded-xl transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#0268cc]" />
                <span>Download Extension (.zip)</span>
              </a>
            </div>

            {/* Platform 3: macOS Desktop App */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0268cc]/40 p-6 flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-5">
                  <Laptop className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">macOS Desktop</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Native macOS Tauri 2 app with system menu bar tray, global shortcut (⌘+Shift+L), and Accessibility API hooks.
                </p>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Universal: Apple Silicon & Intel</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Floating HUD Assistant window</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inspect active selected text</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/docs/MACOS_BUILD.md"
                className="w-full inline-flex items-center justify-center space-x-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 py-3 rounded-xl transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0268cc]" />
                <span>macOS Setup Guide</span>
              </Link>
            </div>

            {/* Platform 4: Windows Desktop App */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0268cc]/40 p-6 flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Windows Desktop</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Windows 10/11 desktop application with UI Automation hooks, system tray, and global hotkey (Ctrl+Shift+L).
                </p>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>64-bit Windows installer (.msi / .exe)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>UI Automation TextPattern</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Low memory footprint</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/docs/WINDOWS_BUILD.md"
                className="w-full inline-flex items-center justify-center space-x-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 py-3 rounded-xl transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0268cc]" />
                <span>Windows Setup Guide</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold tracking-widest text-[#0268cc] uppercase mb-2">
            Clear Answers
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 hover:text-[#0268cc] transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200",
                    openFaq === idx && "rotate-180 text-[#0268cc]"
                  )}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to action banner */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-gradient-to-br from-[#0268cc] via-[#035bb0] to-[#01488f] text-center text-white rounded-3xl p-10 sm:p-14 shadow-2xl shadow-[#0268cc]/20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to experience honest, open AI writing?
          </h2>
          <p className="text-base text-blue-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            No registration, no credit card, no cloud lock-in. Open Lingually in your browser right now
            or download the desktop and extension releases.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/editor"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-base font-bold text-[#0268cc] bg-white hover:bg-blue-50 px-8 py-4 rounded-xl shadow-lg transition hover:scale-[1.02]"
            >
              <span>Open Free Web Editor</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/settings"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-base font-semibold text-white bg-transparent hover:bg-white/10 border border-white/30 px-8 py-4 rounded-xl transition"
            >
              <Key className="w-5 h-5 text-blue-200" />
              <span>Configure AI Providers</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img
              src="/Images/Lingually Logo.png"
              alt="Lingually"
              className="h-6 w-auto object-contain"
            />
            <span className="font-bold text-slate-900 text-sm">Lingually 2.0</span>
            <span>— Open-source AI Writing Workbench</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-600 font-semibold">
            <Link href="/editor" className="hover:text-[#0268cc] transition">
              Workbench Editor
            </Link>
            <Link href="/settings" className="hover:text-[#0268cc] transition">
              Provider Settings
            </Link>
            <Link href="/privacy" className="hover:text-[#0268cc] transition">
              Privacy Disclosure
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0268cc] transition"
            >
              GitHub
            </Link>
          </div>

          <div>Released under the MIT License • Built for human writers.</div>
        </div>
      </footer>
    </div>
  );
}

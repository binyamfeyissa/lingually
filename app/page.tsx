/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  Github,
  Globe,
  Key,
  Laptop,
  Layers,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  X,
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

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 selection:bg-[#0268cc] selection:text-white font-sans antialiased">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/Images/Lingually Logo.png"
                alt="Lingually"
                className="h-7 w-auto object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#preview" className="hover:text-slate-900 transition-colors">
                Product Preview
              </a>
              <a href="#platforms" className="hover:text-slate-900 transition-colors">
                Platforms
              </a>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                Privacy
              </Link>
              <a
                href="https://github.com/binyamfeyissa/lingually"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
              >
                Open Source
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="https://github.com/binyamfeyissa/lingually"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </Link>

            <Link
              href="/editor"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-[#0268cc] hover:bg-[#0256a9] px-4 py-2 rounded-lg shadow-sm transition hover:scale-[1.01]"
            >
              <span>Launch Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
          Write better. Wherever you work.
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Grammar, clarity, rewriting, and text analysis in one open-source writing assistant.
          Choose your own AI provider and keep control of your writing.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/editor"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-semibold text-white bg-[#0268cc] hover:bg-[#0256a9] px-6 py-3 rounded-lg shadow-sm transition"
          >
            <span>Open the Editor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/binyamfeyissa/lingually"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-6 py-3 rounded-lg shadow-sm transition"
          >
            <Github className="w-4 h-4 text-slate-600" />
            <span>Explore the Open-Source Project</span>
          </a>
        </div>
      </section>

      {/* Product Preview Section (The Centerpiece) */}
      <section id="preview" className="pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Editor Window Titlebar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500 font-mono ml-2">Product Preview — Interactive Review</span>
            </div>
            <button
              onClick={resetDemo}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
              title="Reset sample text"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
            {/* Writing Surface */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Draft Document
                </h3>
                <div className="text-xl leading-[1.8] text-slate-800 font-serif">
                  {suggestions.find((s) => s.id === "s1")?.applied ? (
                    <span>Lingually is <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-medium">definitely</span> </span>
                  ) : (
                    <span>
                      Lingually is{" "}
                      <button
                        onClick={() => setActiveSuggestionId("s1")}
                        className={cn(
                          "underline decoration-rose-500 decoration-wavy decoration-2 cursor-pointer transition px-0.5 rounded",
                          activeSuggestionId === "s1" ? "bg-rose-50 text-rose-900 font-medium" : "text-slate-900"
                        )}
                      >
                        definately
                      </button>{" "}
                    </span>
                  )}

                  <span>the best tool </span>

                  {suggestions.find((s) => s.id === "s2")?.applied ? (
                    <span><span className="text-emerald-700 bg-emerald-50 px-1 rounded font-medium">to</span> </span>
                  ) : (
                    <span>
                      <button
                        onClick={() => setActiveSuggestionId("s2")}
                        className={cn(
                          "underline decoration-sky-500 decoration-wavy decoration-2 cursor-pointer transition px-0.5 rounded",
                          activeSuggestionId === "s2" ? "bg-sky-50 text-sky-900 font-medium" : "text-slate-900"
                        )}
                      >
                        in order to
                      </button>{" "}
                    </span>
                  )}

                  <span>write with clarity. </span>

                  {suggestions.find((s) => s.id === "s4")?.applied ? (
                    <span><span className="text-emerald-700 bg-emerald-50 px-1 rounded font-medium">We recommend</span> </span>
                  ) : (
                    <span>
                      <button
                        onClick={() => setActiveSuggestionId("s4")}
                        className={cn(
                          "underline decoration-purple-500 decoration-wavy decoration-2 cursor-pointer transition px-0.5 rounded",
                          activeSuggestionId === "s4" ? "bg-purple-50 text-purple-900 font-medium" : "text-slate-900"
                        )}
                      >
                        You should probably consider
                      </button>{" "}
                    </span>
                  )}

                  <span>using it for </span>

                  {suggestions.find((s) => s.id === "s3")?.applied ? (
                    <span><span className="text-emerald-700 bg-emerald-50 px-1 rounded font-medium">exceptional</span> </span>
                  ) : (
                    <span>
                      <button
                        onClick={() => setActiveSuggestionId("s3")}
                        className={cn(
                          "underline decoration-emerald-500 decoration-wavy decoration-2 cursor-pointer transition px-0.5 rounded",
                          activeSuggestionId === "s3" ? "bg-emerald-50 text-emerald-900 font-medium" : "text-slate-900"
                        )}
                      >
                        very good
                      </button>{" "}
                    </span>
                  )}

                  <span>results across all your daily communications.</span>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-6 mt-8 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Correctness</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>Clarity</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Engagement</span>
                  </span>
                  <span className="inline-flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Delivery</span>
                  </span>
                </div>
                <div className="font-medium text-slate-700">
                  {suggestions.length - appliedCount} pending issues
                </div>
              </div>
            </div>

            {/* Review Sidebar Panel */}
            <div className="lg:col-span-5 bg-slate-50/50 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                      Overall Score
                    </h4>
                    <div className="text-2xl font-bold text-slate-900 mt-0.5">
                      {score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {score >= 90 ? "Strong" : "Good"}
                  </span>
                </div>

                {/* Active Suggestion Card */}
                {activeSuggestion && (
                  <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                          activeSuggestion.category === "correctness" && "bg-rose-50 text-rose-700",
                          activeSuggestion.category === "clarity" && "bg-sky-50 text-sky-700",
                          activeSuggestion.category === "engagement" && "bg-emerald-50 text-emerald-700",
                          activeSuggestion.category === "delivery" && "bg-purple-50 text-purple-700"
                        )}
                      >
                        {activeSuggestion.category}
                      </span>
                      {activeSuggestion.applied && (
                        <span className="text-xs text-emerald-600 font-medium inline-flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mb-3">{activeSuggestion.reason}</p>

                    <div className="flex items-center space-x-2 text-xs font-mono bg-slate-50 p-2.5 rounded border border-slate-200 mb-3">
                      <span className="line-through text-rose-600">{activeSuggestion.original}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-700 font-semibold">{activeSuggestion.replacement}</span>
                    </div>

                    {!activeSuggestion.applied ? (
                      <button
                        onClick={() => applySuggestion(activeSuggestion.id)}
                        className="w-full inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-white bg-[#0268cc] hover:bg-[#0256a9] py-2 rounded-md transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Suggestion</span>
                      </button>
                    ) : (
                      <div className="text-center text-xs text-slate-400 py-1">
                        Already applied to text
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestions List */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Suggestions ({suggestions.length})
                  </div>
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSuggestionId(s.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition",
                        activeSuggestionId === s.id
                          ? "bg-white border-[#0268cc] shadow-sm"
                          : "bg-white/60 border-slate-200 hover:bg-white",
                        s.applied && "opacity-50"
                      )}
                    >
                      <span className="font-medium text-slate-800">
                        {s.original} → {s.replacement}
                      </span>
                      {s.applied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="text-[#0268cc] text-[11px] font-semibold">Review</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Presentation (Varied Editorial Layout) */}
      <section id="features" className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0268cc]">
              Core Capabilities
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
              Designed around the act of writing
            </h3>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Every feature in Lingually focuses on helping you produce clear, accurate prose
              without getting between you and your document.
            </p>
          </div>

          <div className="space-y-16">
            {/* Feature 1: Catch mistakes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Correctness & Clarity
                </span>
                <h4 className="text-2xl font-bold text-slate-900 mt-2">
                  Catch mistakes while you write
                </h4>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Layer A uses local deterministic rules to flag grammatical errors, typos, and
                  confused words instantly with zero network delay. Suggestions are underlined
                  subtly without visually cluttering your draft.
                </p>
              </div>
              <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="font-mono text-xs text-slate-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span className="line-through text-slate-400">They could of called us yesterday.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="font-medium text-slate-900">They could have called us yesterday.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Rewrite without losing voice */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 md:order-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0268cc] bg-blue-50 px-2 py-0.5 rounded">
                  Rewriting & Tone
                </span>
                <h4 className="text-2xl font-bold text-slate-900 mt-2">
                  Rewrite without losing your voice
                </h4>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Transform sentences into formal, casual, concise, or expanded variants.
                  Every rewrite shows an exact visual diff, so you verify every word before
                  applying changes to your document.
                </p>
              </div>
              <div className="md:col-span-7 md:order-1 bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="space-y-3 text-xs">
                  <div className="text-slate-500 font-medium uppercase tracking-wider">Before & After Diff</div>
                  <div className="bg-white border border-slate-200 p-3 rounded-lg leading-relaxed text-slate-700">
                    <span className="line-through text-rose-500 bg-rose-50 px-1 rounded">Due to the fact that we experienced delays</span>{" "}
                    <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-medium">Because of unexpected delays</span>, we delivered the proposal this morning.
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Plagiarism & AI-writing indicators */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  Analysis
                </span>
                <h4 className="text-2xl font-bold text-slate-900 mt-2">
                  Review tone, clarity, and text matches
                </h4>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Compute readability scores (Flesch-Kincaid, Gunning Fog), analyze sentence
                  burstiness, extract distinctive attribution queries, and inspect potential
                  duplications against your saved document library.
                </p>
              </div>
              <div className="md:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white border border-slate-200 p-3 rounded-lg">
                    <div className="text-lg font-bold text-slate-900">68</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5">Reading Ease</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-lg">
                    <div className="text-lg font-bold text-slate-900">8.2</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5">Grade Level</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-lg">
                    <div className="text-lg font-bold text-emerald-600">0%</div>
                    <div className="text-[10px] text-slate-500 uppercase mt-0.5">Corpus Match</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open-Source & Privacy Principles */}
      <section className="py-20 border-t border-slate-200 bg-[#fbfbfd]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0268cc]">
              Architecture & Trust
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
              Transparent, local-first by design
            </h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              We do not operate a proprietary backend that reads, indexes, or monetizes your writing.
              You maintain full ownership of your data and API credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <Key className="w-5 h-5 text-[#0268cc] mb-3" />
              <h4 className="text-base font-bold text-slate-900">Bring Your Own Key</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Connect OpenAI, Anthropic, Gemini, Groq, Mistral, or a local Ollama instance.
                Your keys remain on your machine and are sent only to the provider you select.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-3" />
              <h4 className="text-base font-bold text-slate-900">Local-First Storage</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                All documents and version snapshots reside in your browser&apos;s IndexedDB.
                There is no central database, no user account requirement, and no cloud draft storage.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <Sliders className="w-5 h-5 text-purple-600 mb-3" />
              <h4 className="text-base font-bold text-slate-900">User-Controlled Requests</h4>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Spelling and mechanical grammar checks run locally. External AI calls only occur
                when you explicitly initiate a rewrite, summary, or custom prompt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0268cc]">
              Multi-Platform Availability
            </h2>
            <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">
              Use Lingually wherever you write
            </h3>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">
              Clear statuses for every supported platform. No placeholder buttons or missing files.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Web */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Globe className="w-5 h-5 text-[#0268cc]" />
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Available
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Web Workbench</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Full rich-text document editor with 3-tab review sidebar, version history, and file export.
                </p>
              </div>
              <Link
                href="/editor"
                className="mt-6 inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-white bg-[#0268cc] hover:bg-[#0256a9] py-2 rounded-lg transition"
              >
                <span>Launch in Browser</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Chrome */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-5 h-5 rounded-full bg-[#0268cc] flex items-center justify-center text-white text-[10px] font-bold">
                    C
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Download
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Chrome Extension</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Inline writing assistance and floating suggestion cards for textareas and web editors.
                </p>
              </div>
              <a
                href="/downloads/lingually-chrome-extension.zip"
                download
                className="mt-6 inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Extension (.zip)</span>
              </a>
            </div>

            {/* macOS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Laptop className="w-5 h-5 text-purple-600" />
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Source Guide
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">macOS Desktop</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tauri 2 application supporting Apple Silicon (M-series) and Intel architectures.
                </p>
              </div>
              <Link
                href="/docs/MACOS_BUILD.md"
                className="mt-6 inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Setup Guide</span>
              </Link>
            </div>

            {/* Windows */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Terminal className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                    Source Guide
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Windows Desktop</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tauri 2 64-bit application with UI Automation hooks and system tray menu.
                </p>
              </div>
              <Link
                href="/docs/WINDOWS_BUILD.md"
                className="mt-6 inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 py-2 rounded-lg transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Setup Guide</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified, Factual Comparison */}
      <section className="py-20 border-t border-slate-200 bg-[#fbfbfd]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-2xl font-bold text-slate-900">
              Clear differences, simple pricing
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              How Lingually compares to closed proprietary writing assistants.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="p-4">Attribute</th>
                  <th className="p-4 text-[#0268cc]">Lingually</th>
                  <th className="p-4 text-slate-500">Proprietary Assistants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Software License</td>
                  <td className="p-4 text-emerald-700 font-semibold">100% Open Source (MIT)</td>
                  <td className="p-4 text-slate-500">Closed Source / Proprietary</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Software Cost</td>
                  <td className="p-4 text-emerald-700 font-semibold">$0 software fee</td>
                  <td className="p-4 text-slate-500">Subscription required ($12 – $30/mo)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">AI Model Usage</td>
                  <td className="p-4 text-emerald-700 font-semibold">Direct provider billing or free local models</td>
                  <td className="p-4 text-slate-500">Bundled markup included in monthly fee</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Document Storage</td>
                  <td className="p-4 text-emerald-700 font-semibold">Local-first on user device</td>
                  <td className="p-4 text-slate-500">Cloud database storage</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Model Flexibility</td>
                  <td className="p-4 text-emerald-700 font-semibold">OpenAI, Anthropic, Gemini, Groq, Ollama</td>
                  <td className="p-4 text-slate-500">Locked to vendor-selected models</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-semibold text-xs sm:text-sm text-slate-900 hover:text-[#0268cc] transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-slate-400 transition-transform",
                      openFaq === idx && "rotate-180 text-[#0268cc]"
                    )}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src="/Images/Lingually Logo.png"
              alt="Lingually"
              className="h-5 w-auto object-contain"
            />
            <span className="font-semibold text-slate-700">Lingually</span>
            <span>— Open-Source AI Writing Workbench</span>
          </div>

          <div className="flex items-center space-x-5 text-slate-600 font-medium">
            <Link href="/editor" className="hover:text-slate-900 transition">
              Editor
            </Link>
            <Link href="/settings" className="hover:text-slate-900 transition">
              Settings
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 transition">
              Privacy
            </Link>
            <a
              href="https://github.com/binyamfeyissa/lingually"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 transition"
            >
              GitHub
            </a>
          </div>

          <div>MIT License • User-controlled writing tool.</div>
        </div>
      </footer>
    </div>
  );
}

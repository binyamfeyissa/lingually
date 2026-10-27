/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, HardDrive, EyeOff, Server, Terminal, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy & Architecture — Lingually",
  description: "Transparent explanation of Lingually's local-first architecture, BYOK security, and privacy commitments.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <Link
          href="/editor"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Editor</span>
        </Link>
        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
          <Shield className="h-4 w-4 text-[#0268cc]" />
          <span>Privacy & Architecture</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-sm leading-relaxed">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eef6fc] text-[#0268cc] dark:bg-sky-950 dark:text-sky-300 border border-[#bae6fd]/60 dark:border-sky-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Architecture & Trust</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Privacy, Security & BYOK Architecture
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            How Lingually protects your writing, handles your API credentials, and operates without accounts or remote databases.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              <HardDrive className="h-4 w-4 text-[#0268cc]" />
              <span>1. Local-First Storage</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every document you draft, edit, or recover lives in your local browser storage using <strong>IndexedDB (Dexie)</strong>.
              Lingually does not operate a remote document database, user account system, or central store.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              <KeyIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>2. Bring Your Own Key</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You supply your own API keys directly from OpenAI, Google AI Studio, Anthropic, or Groq—or run 100% free offline
              models locally with Ollama. We charge no subscription fees and never markup AI pricing.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              <EyeOff className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>3. Zero Background Telemetry</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Text is never sent to any AI provider automatically or in the background. Lingually requires an explicit user
              click to run any AI transformation. No analytics, tracking pixels, or third-party behavioral beacons are embedded.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              <Server className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>4. Stateless Server Proxy</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              To circumvent browser CORS limitations and protect provider endpoints, requests route through a stateless
              Next.js Route Handler. The proxy forwards the stream immediately and discards all credentials and payloads from memory.
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Where Are My API Keys Stored?</h2>
          <p className="text-slate-700 dark:text-slate-300">
            By default, API keys are stored in your browser&apos;s <code>localStorage</code> so they persist across sessions.
            However, we provide flexible privacy choices in <Link href="/settings" className="text-[#0268cc] font-medium underline">Settings</Link>:
          </p>
          <ul className="space-y-2 text-slate-700 dark:text-slate-300 text-xs pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Persistent Local Storage:</strong> Keys persist until you click &quot;Remove&quot; or clear browser data.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Session-Only Storage:</strong> Keys are kept in <code>sessionStorage</code> and wiped the moment you close the tab.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>In-Memory Only:</strong> Keys exist exclusively in runtime JavaScript variables and are never saved to disk.
              </div>
            </li>
          </ul>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
            <strong>Honest Security Notice:</strong> Browser storage is not an encrypted hardware security module.
            Any malicious browser extension with broad permissions or anyone with administrative access to your unlocked computer
            could potentially inspect browser storage. For maximum confidentiality on shared workstations, use Session-Only or In-Memory mode.
          </div>
        </section>

        {/* Third-Party AI Data Practices */}
        <section className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Third-Party AI Provider Policies</h2>
          <p className="text-slate-700 dark:text-slate-300">
            When you initiate an AI edit, your text is transmitted to the provider you have explicitly configured.
            Major commercial providers have distinct data retention policies:
          </p>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pl-2">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">• OpenAI:</span>
              <span>API data is not used for model training by default under their commercial API terms.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">• Google Gemini:</span>
              <span>Paid API tier data is not trained on; free tier users should review Google AI Studio terms.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">• Anthropic:</span>
              <span>Claude API terms specify that customer inputs are not used for training.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">• Groq:</span>
              <span>Operates low-latency inference on open weights without training retention.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">• Ollama:</span>
              <span>100% local. Your text never leaves your device or local network.</span>
            </li>
          </ul>
        </section>

        {/* Export Safety */}
        <section className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Export & Backup Security</h2>
          <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
            When you export your document library as a JSON backup, <strong>API keys and credentials are strictly excluded</strong>.
            You can freely transfer your document backups across devices without risking credential leakage.
          </p>
        </section>
      </main>
    </div>
  );
}

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, HardDrive, EyeOff, Server, Terminal } from "lucide-react";

export const metadata = {
  title: "Privacy & Architecture — Lingually",
  description: "Transparent explanation of Lingually's local-first architecture, BYOK security, and privacy commitments.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-surface-border bg-surface px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground transition-colors p-1 rounded hover:bg-surface-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Editor</span>
        </Link>
        <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
          <Shield className="h-4 w-4 text-brand-500" />
          <span>Privacy & Architecture</span>
        </div>
        <div className="w-16" />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-sm leading-relaxed">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Privacy, Security & BYOK Architecture
          </h1>
          <p className="text-foreground/60 text-base">
            How Lingually protects your writing, handles your API credentials, and operates without accounts.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-surface-border bg-surface space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <HardDrive className="h-4 w-4 text-brand-500" />
              1. Local-First Document Storage
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Every document you draft, edit, or recover lives in your local browser storage using <strong>IndexedDB (Dexie)</strong>.
              Lingually does not operate a remote document database, user account system, or central document store.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <KeyIcon className="h-4 w-4 text-emerald-500" />
              2. Bring Your Own Key (BYOK)
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">
              You supply your own API keys directly from OpenAI, Google AI Studio, Anthropic, or Groq—or run 100% free offline
              models locally with Ollama. We charge no subscription fees and never markup AI pricing.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <EyeOff className="h-4 w-4 text-purple-500" />
              3. Zero Background Telemetry
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">
              Text is never sent to any AI provider automatically or in the background. Lingually requires an explicit user
              click to run any AI transformation. No analytics, tracking pixels, or third-party behavioral beacons are embedded.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-surface-border bg-surface space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Server className="h-4 w-4 text-amber-500" />
              4. Stateless Server Proxy
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">
              To circumvent browser CORS limitations and protect provider endpoints, requests route through a stateless
              Next.js Route Handler. The proxy forwards the stream immediately and discards all credentials and payloads from memory.
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <section className="space-y-4 pt-4 border-t border-surface-border">
          <h2 className="text-xl font-bold text-foreground">Where Are My API Keys Stored?</h2>
          <p className="text-foreground/80">
            By default, API keys are stored in your browser&apos;s <code>localStorage</code> so they persist across sessions.
            However, we provide flexible privacy choices in <Link href="/settings" className="text-brand-600 underline">Settings</Link>:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-foreground/80 text-xs">
            <li>
              <strong>Persistent Local Storage:</strong> Keys persist until you click &quot;Remove&quot; or clear browser data.
            </li>
            <li>
              <strong>Session-Only Storage:</strong> Keys are kept in <code>sessionStorage</code> and wiped the moment you close the tab.
            </li>
            <li>
              <strong>In-Memory Only:</strong> Keys exist exclusively in runtime JavaScript variables and are never saved to disk.
            </li>
          </ul>

          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
            <strong>Honest Security Notice:</strong> Browser storage is not an encrypted hardware security module.
            Any malicious browser extension with broad permissions or anyone with administrative access to your unlocked computer
            could potentially inspect browser storage. For maximum confidentiality on shared workstations, use Session-Only or In-Memory mode.
          </div>
        </section>

        {/* Third-Party AI Data Practices */}
        <section className="space-y-3 pt-4 border-t border-surface-border">
          <h2 className="text-xl font-bold text-foreground">Third-Party AI Provider Policies</h2>
          <p className="text-foreground/80">
            When you initiate an AI edit, your text is transmitted to the provider you have explicitly configured.
            Major commercial providers have distinct data retention policies:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-foreground/70">
            <li><strong>OpenAI:</strong> API data is not used for model training by default under their commercial API terms.</li>
            <li><strong>Google Gemini:</strong> Paid API tier data is not trained on; free tier users should review Google AI Studio terms.</li>
            <li><strong>Anthropic:</strong> Claude API terms specify that customer inputs are not used for training.</li>
            <li><strong>Groq:</strong> Operates low-latency inference on open weights without training retention.</li>
            <li><strong>Ollama:</strong> 100% local. Your text never leaves your device or local network.</li>
          </ul>
        </section>

        {/* Export Safety */}
        <section className="space-y-3 pt-4 border-t border-surface-border">
          <h2 className="text-xl font-bold text-foreground">Export & Backup Security</h2>
          <p className="text-foreground/80">
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

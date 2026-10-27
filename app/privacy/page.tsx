/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, HardDrive, EyeOff, Server, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";

export const metadata = {
  title: "Privacy & Architecture — Lingually",
  description: "Transparent explanation of Lingually's local-first architecture, BYOK security, and privacy commitments.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans select-none">
      <header className="h-12 border-b border-line bg-bg/95 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink transition border border-line px-2.5 py-1 hover:bg-bg-raised"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>BACK TO EDITOR</span>
          </Link>
          <span className="text-line">•</span>
          <div className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-wider text-ink">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span>PRIVACY & SECURITY MANIFEST</span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-sm leading-relaxed">
        {/* Header Hero */}
        <div className="relative p-6 border border-line bg-bg-raised space-y-2">
          <span className="tick top-[-5px] left-[-5px]" />
          <span className="tick top-[-5px] right-[-5px]" />
          <span className="tick bottom-[-5px] left-[-5px]" />
          <span className="tick bottom-[-5px] right-[-5px]" />

          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-accent font-semibold">
            <Lock className="w-3 h-3" />
            <span>{"00 // PRIVACY & LOCAL ARCHITECTURE"}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
            Privacy, Security & BYOK Architecture
          </h1>
          <p className="font-sans text-xs text-muted leading-relaxed">
            How Lingually protects your writing, handles your API credentials, and operates without accounts, subscriptions, or remote telemetry.
          </p>
        </div>

        {/* Core Principles in Hairline Grid */}
        <div className="hairline-grid grid-cols-1 sm:grid-cols-2">
          <div className="p-5 bg-bg space-y-2">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 text-accent" />
              <span>01 / LOCAL-FIRST STORAGE</span>
            </div>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Every document you draft, edit, or recover lives in your local browser storage using <strong>IndexedDB (Dexie)</strong>.
              Lingually does not operate a remote document database, user account system, or central store.
            </p>
          </div>

          <div className="p-5 bg-bg space-y-2">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>02 / BRING YOUR OWN KEY</span>
            </div>
            <p className="font-sans text-xs text-muted leading-relaxed">
              You supply your own API keys directly from OpenAI, Google AI Studio, Anthropic, or Groq—or run 100% free offline
              models locally with Ollama. We charge no subscription fees and never markup AI pricing.
            </p>
          </div>

          <div className="p-5 bg-bg space-y-2">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <EyeOff className="h-3.5 w-3.5 text-purple-500" />
              <span>03 / ZERO BACKGROUND TELEMETRY</span>
            </div>
            <p className="font-sans text-xs text-muted leading-relaxed">
              Text is never sent to any AI provider automatically or in the background. Lingually requires an explicit user
              click to run any AI transformation. No analytics, tracking pixels, or third-party behavioral beacons are embedded.
            </p>
          </div>

          <div className="p-5 bg-bg space-y-2">
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <Server className="h-3.5 w-3.5 text-amber-500" />
              <span>04 / STATELESS ROUTE PROXY</span>
            </div>
            <p className="font-sans text-xs text-muted leading-relaxed">
              To circumvent browser CORS limitations and protect provider endpoints, requests route through a stateless
              Next.js Route Handler. The proxy forwards the stream immediately and discards all credentials and payloads from memory.
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <section className="space-y-3 pt-4 border-t border-line">
          <div className="font-mono text-xs uppercase tracking-wider text-muted">
            {"SECTION 05 // KEY PERSISTENCE"}
          </div>
          <h2 className="font-display text-lg font-bold text-ink">Where Are My API Keys Stored?</h2>
          <p className="font-sans text-xs text-muted">
            By default, API keys are stored in your browser&apos;s <code>localStorage</code> so they persist across sessions.
            However, we provide flexible privacy choices in <Link href="/settings" className="text-accent underline font-mono">Settings</Link>:
          </p>
          <ul className="space-y-2 font-mono text-xs text-muted pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink">Persistent Local Storage:</strong> Keys persist until you click &quot;Remove&quot; or clear browser data.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink">Session-Only Storage:</strong> Keys are kept in <code>sessionStorage</code> and wiped the moment you close the tab.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink">In-Memory Only:</strong> Keys exist exclusively in runtime JavaScript variables and are never saved to disk.
              </div>
            </li>
          </ul>

          <div className="p-3 border border-line bg-bg-raised font-sans text-xs text-muted leading-relaxed">
            <strong className="text-ink font-mono uppercase tracking-wider">Security Disclosure: </strong>
            Browser storage is not an encrypted hardware security module.
            Any malicious browser extension with broad permissions or anyone with administrative access to your unlocked computer
            could potentially inspect browser storage. For maximum confidentiality on shared workstations, use Session-Only or In-Memory mode.
          </div>
        </section>

        {/* Third-Party AI Data Practices */}
        <section className="space-y-3 pt-4 border-t border-line">
          <div className="font-mono text-xs uppercase tracking-wider text-muted">
            {"SECTION 06 // PROVIDER TERMS"}
          </div>
          <h2 className="font-display text-lg font-bold text-ink">Third-Party AI Provider Policies</h2>
          <p className="font-sans text-xs text-muted">
            When you initiate an AI edit, your text is transmitted to the provider you have explicitly configured.
            Major commercial providers have distinct data retention policies:
          </p>
          <ul className="space-y-1.5 font-mono text-xs text-muted pl-2">
            <li>• <strong className="text-ink">OpenAI:</strong> API data is not used for model training under commercial API terms.</li>
            <li>• <strong className="text-ink">Google Gemini:</strong> Paid API tier data is not trained on.</li>
            <li>• <strong className="text-ink">Anthropic:</strong> Claude commercial API terms specify customer inputs are not retained for training.</li>
            <li>• <strong className="text-ink">Groq:</strong> Ultra low-latency inference on open weights with zero training retention.</li>
            <li>• <strong className="text-ink">Ollama:</strong> 100% local. Your text never leaves your device or local network.</li>
          </ul>
        </section>

        {/* Export Safety */}
        <section className="space-y-2 pt-4 border-t border-line">
          <div className="font-mono text-xs uppercase tracking-wider text-muted">
            {"SECTION 07 // BACKUPS"}
          </div>
          <h2 className="font-display text-lg font-bold text-ink">Export & Backup Security</h2>
          <p className="font-sans text-xs text-muted leading-relaxed">
            When you export your document library as a JSON backup, <strong>API keys and credentials are strictly excluded</strong>.
            You can freely transfer your document backups across devices without risking credential leakage.
          </p>
        </section>
      </main>
    </div>
  );
}

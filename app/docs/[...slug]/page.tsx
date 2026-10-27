/* eslint-disable @next/next/no-img-element */
import React from "react";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Download, Terminal, Laptop } from "lucide-react";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";

interface DocsPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const docsDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(docsDir)) return [];

  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"));
  const params: Array<{ slug: string[] }> = [];

  for (const file of files) {
    // Both with and without .md extension
    params.push({ slug: [file] });
    params.push({ slug: [file.replace(/\.md$/, "")] });
  }

  return params;
}

export default async function DocsPage({ params }: DocsPageProps) {
  const resolvedParams = await params;
  const rawSlug = (resolvedParams.slug || []).join("/");
  if (!rawSlug) notFound();

  const cleanName = rawSlug.replace(/\.md$/, "");
  const fileName = `${cleanName}.md`;
  const filePath = path.join(process.cwd(), "docs", fileName);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const content = fs.readFileSync(filePath, "utf-8");

  // Determine platform specific download banner
  const isMac = cleanName.toLowerCase().includes("macos");
  const isWindows = cleanName.toLowerCase().includes("windows");
  const isChrome = cleanName.toLowerCase().includes("chrome");

  return (
    <div className="min-h-screen bg-bg text-ink font-sans select-none">
      <header className="h-12 border-b border-line bg-bg/95 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink transition border border-line px-2.5 py-1 hover:bg-bg-raised"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>HOMEPAGE</span>
          </Link>
          <span className="text-line">•</span>
          <div className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-wider text-ink">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            <span>DOCUMENTATION // {cleanName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold bg-invert-bg text-invert-fg px-3 py-1 hover:opacity-85 transition"
          >
            OPEN WORKBENCH
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-sm leading-relaxed">
        {/* Platform Direct Download Banner */}
        {isMac && (
          <div className="relative p-6 border border-line bg-bg-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="tick top-[-5px] left-[-5px]" />
            <span className="tick top-[-5px] right-[-5px]" />
            <span className="tick bottom-[-5px] left-[-5px]" />
            <span className="tick bottom-[-5px] right-[-5px]" />
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-accent font-semibold mb-1">
                <Laptop className="w-3.5 h-3.5" />
                <span>OFFICIAL MACOS RELEASE</span>
              </div>
              <h2 className="font-display text-lg font-bold text-ink">Download Lingually for macOS</h2>
              <p className="font-sans text-xs text-muted mt-0.5">
                Universal binary for Apple Silicon (M1-M4) & Intel. Includes desktop shell and offline support.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/downloads/Lingually-macOS-Universal.dmg"
                download="Lingually-macOS-Universal.dmg"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 font-mono text-[11px] uppercase tracking-wider font-bold bg-invert-bg text-invert-fg hover:opacity-85 transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD .DMG</span>
              </a>
              <a
                href="/downloads/Lingually-macOS-Universal.zip"
                download="Lingually-macOS-Universal.zip"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 font-mono text-[10px] uppercase tracking-wider font-semibold border border-line text-ink hover:bg-bg-raised transition"
              >
                <span>.ZIP</span>
              </a>
            </div>
          </div>
        )}

        {isWindows && (
          <div className="relative p-6 border border-line bg-bg-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="tick top-[-5px] left-[-5px]" />
            <span className="tick top-[-5px] right-[-5px]" />
            <span className="tick bottom-[-5px] left-[-5px]" />
            <span className="tick bottom-[-5px] right-[-5px]" />
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-accent font-semibold mb-1">
                <Laptop className="w-3.5 h-3.5" />
                <span>OFFICIAL WINDOWS RELEASE</span>
              </div>
              <h2 className="font-display text-lg font-bold text-ink">Download Lingually for Windows (64-bit)</h2>
              <p className="font-sans text-xs text-muted mt-0.5">
                Standalone package with native Microsoft Edge WebView2 runtime and offline persistence.
              </p>
            </div>
            <a
              href="/downloads/Lingually-Windows-x64.zip"
              download="Lingually-Windows-x64.zip"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 font-mono text-[11px] uppercase tracking-wider font-bold bg-invert-bg text-invert-fg hover:opacity-85 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD .ZIP</span>
            </a>
          </div>
        )}

        {isChrome && (
          <div className="relative p-6 border border-line bg-bg-raised flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="tick top-[-5px] left-[-5px]" />
            <span className="tick top-[-5px] right-[-5px]" />
            <span className="tick bottom-[-5px] left-[-5px]" />
            <span className="tick bottom-[-5px] right-[-5px]" />
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-accent font-semibold mb-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>CHROME EXTENSION BUNDLE</span>
              </div>
              <h2 className="font-display text-lg font-bold text-ink">Download Lingually Chrome Extension</h2>
              <p className="font-sans text-xs text-muted mt-0.5">
                Inline grammar and floating suggestion HUD for any web textarea or input field.
              </p>
            </div>
            <a
              href="/downloads/lingually-chrome-extension.zip"
              download="lingually-chrome-extension.zip"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 font-mono text-[11px] uppercase tracking-wider font-bold bg-invert-bg text-invert-fg hover:opacity-85 transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD EXTENSION</span>
            </a>
          </div>
        )}

        {/* Documentation Content */}
        <div className="border border-line bg-bg p-6 sm:p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none font-sans text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-wrap font-mono">
            {content}
          </div>
        </div>
      </main>
    </div>
  );
}

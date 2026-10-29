/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { DocumentRecord } from "@/types/document";
import { exportAsMarkdown, exportAsDocx, exportAsPlainText, exportAsHTML } from "@/lib/utils/export";
import { Button } from "../shared/button";
import { Modal } from "../shared/modal";
import { ThemeToggle } from "./theme-toggle";
import {
  Menu,
  Sparkles,
  Download,
  Settings,
  ChevronRight,
  FileText,
  Code,
  FileCode,
  Check,
} from "lucide-react";
import Link from "next/link";

export interface NavbarProps {
  document?: DocumentRecord;
  onToggleSidebar: () => void;
  onToggleAssistant: () => void;
  isAssistantOpen: boolean;
}

export function Navbar({
  document,
  onToggleSidebar,
  onToggleAssistant,
  isAssistantOpen,
}: NavbarProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleExport = (format: "markdown" | "txt" | "html" | "docx") => {
    if (!document) return;
    if (format === "markdown") exportAsMarkdown(document);
    if (format === "txt") exportAsPlainText(document);
    if (format === "html") exportAsHTML(document);
    if (format === "docx") exportAsDocx(document);

    setCopiedFormat(format);
    setTimeout(() => {
      setCopiedFormat(null);
      setIsExportOpen(false);
    }, 800);
  };

  return (
    <>
      <header className="h-12 border-b border-line bg-bg/95 backdrop-blur-xs px-3 sm:px-4 flex items-center justify-between select-none z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation sidebar"
            className="md:hidden h-8 w-8 text-muted hover:text-ink"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition py-1 pr-3 border-r border-line"
              title="Lingually Homepage"
            >
              <img
                src="/Images/Lingually icon.png"
                alt="Lingually"
                className="h-5 w-5 object-contain"
              />
              <span className="font-display font-bold text-xs tracking-tight text-ink uppercase">
                Lingually
              </span>
            </Link>

            <div className="flex items-center gap-1.5 pl-3">
              <span className="font-mono text-[10px] text-muted uppercase tracking-wider hidden sm:inline">
                {"DOC //"}
              </span>
              <span
                title={document?.title || "Untitled Document"}
                className="font-mono text-xs text-ink truncate max-w-[180px] sm:max-w-[420px] cursor-default"
              >
                {document?.title || "Untitled Document"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {document && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportOpen(true)}
              className="h-7 px-2.5 text-[10px]"
              title="Export Document"
            >
              <Download className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">EXPORT</span>
            </Button>
          )}

          <Link
            href="/settings"
            className="h-7 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] border border-line text-muted hover:text-ink hover:bg-bg-raised transition-colors flex items-center gap-1"
            title="Configure AI Providers"
          >
            <Settings className="h-3 w-3" />
            <span className="hidden sm:inline">SETTINGS</span>
          </Link>

          <ThemeToggle />

          <button
            onClick={onToggleAssistant}
            className={`h-7 px-3 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold flex items-center gap-1.5 transition-colors border ${
              isAssistantOpen
                ? "bg-invert-bg text-invert-fg border-transparent"
                : "border-line-strong bg-bg text-ink hover:bg-invert-bg hover:text-invert-fg"
            }`}
            title="Toggle Review & Assistant Panel"
          >
            <Sparkles className="h-3 w-3" />
            <span>ASSISTANT</span>
          </button>
        </div>
      </header>

      {/* Export Modal */}
      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="EXPORT DOCUMENT"
        description="Choose an architectural format to download your writing locally."
        maxWidth="md"
      >
        <div className="hairline-grid grid-cols-2 pt-2">
          <button
            onClick={() => handleExport("markdown")}
            className="p-4 bg-bg hover:bg-bg-raised text-left transition-colors flex flex-col gap-1 border-0"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-accent" />
                Markdown (.md)
              </span>
              {copiedFormat === "markdown" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            <p className="font-mono text-[10px] text-muted">Formatted plain text with standard headers and lists.</p>
          </button>

          <button
            onClick={() => handleExport("txt")}
            className="p-4 bg-bg hover:bg-bg-raised text-left transition-colors flex flex-col gap-1 border-0"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-accent" />
                Plain Text (.txt)
              </span>
              {copiedFormat === "txt" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            <p className="font-mono text-[10px] text-muted">Clean, unformatted text for pure draft portability.</p>
          </button>

          <button
            onClick={() => handleExport("html")}
            className="p-4 bg-bg hover:bg-bg-raised text-left transition-colors flex flex-col gap-1 border-0"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-accent" />
                HTML Document (.html)
              </span>
              {copiedFormat === "html" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            <p className="font-mono text-[10px] text-muted">Web-ready markup with semantic typography tags.</p>
          </button>

          <button
            onClick={() => handleExport("docx")}
            className="p-4 bg-bg hover:bg-bg-raised text-left transition-colors flex flex-col gap-1 border-0"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-accent" />
                Word Document (.docx)
              </span>
              {copiedFormat === "docx" && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </div>
            <p className="font-mono text-[10px] text-muted">Office-compatible rich text document format.</p>
          </button>
        </div>
      </Modal>
    </>
  );
}

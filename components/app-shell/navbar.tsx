"use client";

import React, { useState } from "react";
import { DocumentRecord } from "@/types/document";
import { exportAsMarkdown, exportAsDocx, exportAsPlainText, exportAsHTML } from "@/lib/utils/export";
import { Button } from "../shared/button";
import { Modal } from "../shared/modal";
import {
  Menu,
  Sparkles,
  Download,
  Settings,
  Shield,
  PanelRightClose,
  PanelRightOpen,
  FileText,
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

  return (
    <header className="h-12 border-b border-surface-border bg-surface px-3 flex items-center justify-between select-none z-10 shrink-0">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 font-bold text-xs text-brand-600 dark:text-brand-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lingually</span>
          </div>
          <span className="hidden sm:inline text-foreground/30">•</span>
          <span className="text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-[320px]">
            {document?.title || "Untitled Document"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {document && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="h-8 gap-1 text-xs text-foreground/70"
            title="Export Document"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        <Button
          variant={isAssistantOpen ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleAssistant}
          className="h-8 gap-1.5 text-xs font-semibold"
          title="Toggle Assistant Panel"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          <span className="hidden sm:inline">Assistant</span>
          {isAssistantOpen ? (
            <PanelRightClose className="h-3.5 w-3.5 text-foreground/50" />
          ) : (
            <PanelRightOpen className="h-3.5 w-3.5 text-foreground/50" />
          )}
        </Button>
      </div>

      {/* Export Format Dialog */}
      {document && (
        <Modal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          title={`Export "${document.title}"`}
          description="Select file format to download."
          maxWidth="sm"
        >
          <div className="space-y-2 pt-2 text-xs">
            <button
              onClick={() => {
                exportAsMarkdown(document);
                setIsExportOpen(false);
              }}
              className="w-full text-left p-2.5 rounded border border-surface-border hover:bg-surface-muted transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-foreground">Markdown (.md)</strong>
                <p className="text-[10px] text-foreground/50">Clean Markdown formatting</p>
              </div>
              <Download className="h-3.5 w-3.5 text-foreground/40" />
            </button>

            <button
              onClick={() => {
                exportAsDocx(document);
                setIsExportOpen(false);
              }}
              className="w-full text-left p-2.5 rounded border border-surface-border hover:bg-surface-muted transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-foreground">Microsoft Word (.docx)</strong>
                <p className="text-[10px] text-foreground/50">Formatted Word document</p>
              </div>
              <Download className="h-3.5 w-3.5 text-foreground/40" />
            </button>

            <button
              onClick={() => {
                exportAsHTML(document);
                setIsExportOpen(false);
              }}
              className="w-full text-left p-2.5 rounded border border-surface-border hover:bg-surface-muted transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-foreground">HTML (.html)</strong>
                <p className="text-[10px] text-foreground/50">Sanitized standalone web page</p>
              </div>
              <Download className="h-3.5 w-3.5 text-foreground/40" />
            </button>

            <button
              onClick={() => {
                exportAsPlainText(document);
                setIsExportOpen(false);
              }}
              className="w-full text-left p-2.5 rounded border border-surface-border hover:bg-surface-muted transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-foreground">Plain Text (.txt)</strong>
                <p className="text-[10px] text-foreground/50">Raw text content</p>
              </div>
              <Download className="h-3.5 w-3.5 text-foreground/40" />
            </button>
          </div>
        </Modal>
      )}
    </header>
  );
}

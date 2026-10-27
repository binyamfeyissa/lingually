/* eslint-disable @next/next/no-img-element */
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
  PanelRightClose,
  PanelRightOpen,
  ChevronRight,
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
    <header className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 flex items-center justify-between select-none z-10 shrink-0">
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          className="md:hidden h-8 w-8 text-slate-500 hover:text-slate-900"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:opacity-85 transition group"
            title="Lingually Homepage"
          >
            <img
              src="/Images/Lingually Logo.png"
              alt="Lingually"
              className="h-5 w-auto object-contain"
            />
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400 hidden sm:inline" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px] sm:max-w-[300px]">
            {document?.title || "Untitled Document"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {document && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="h-7 sm:h-8 px-2 sm:px-2.5 gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            title="Export Document"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        <Link
          href="/settings"
          className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
          title="Configure AI Providers"
        >
          <Settings className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline">Settings</span>
        </Link>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        <button
          onClick={onToggleAssistant}
          className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            isAssistantOpen
              ? "bg-[#eef6fc] text-[#0268cc] border border-[#bae6fd]/60 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          }`}
          title="Toggle Assistant Panel"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#0268cc]" />
          <span>Assistant</span>
          {isAssistantOpen ? (
            <PanelRightClose className="h-3.5 w-3.5 opacity-60" />
          ) : (
            <PanelRightOpen className="h-3.5 w-3.5 opacity-60" />
          )}
        </button>
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
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition flex items-center justify-between"
            >
              <div>
                <strong className="text-slate-900 dark:text-white font-semibold">Markdown (.md)</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">Clean Markdown formatting</p>
              </div>
              <Download className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                exportAsDocx(document);
                setIsExportOpen(false);
              }}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition flex items-center justify-between"
            >
              <div>
                <strong className="text-slate-900 dark:text-white font-semibold">Microsoft Word (.docx)</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">Formatted Word document</p>
              </div>
              <Download className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                exportAsHTML(document);
                setIsExportOpen(false);
              }}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition flex items-center justify-between"
            >
              <div>
                <strong className="text-slate-900 dark:text-white font-semibold">HTML (.html)</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">Sanitized standalone web page</p>
              </div>
              <Download className="h-4 w-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                exportAsPlainText(document);
                setIsExportOpen(false);
              }}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition flex items-center justify-between"
            >
              <div>
                <strong className="text-slate-900 dark:text-white font-semibold">Plain Text (.txt)</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">Raw text content</p>
              </div>
              <Download className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </Modal>
      )}
    </header>
  );
}

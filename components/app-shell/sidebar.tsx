/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { DocumentRecord } from "@/types/document";
import { DocumentRepository } from "@/lib/documents/repository";
import { exportAsPlainText, exportAsMarkdown, exportAsHTML, exportAsDocx, exportAsBackup } from "@/lib/utils/export";
import { importFile } from "@/lib/utils/import";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../shared/button";
import { Input } from "../shared/input";
import { Modal } from "../shared/modal";
import {
  FileText,
  Plus,
  Search,
  Star,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Shield,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export interface SidebarProps {
  documents: DocumentRecord[];
  activeDocumentId: string;
  onSelectDocument: (id: string) => void;
  onDocumentCreated: (doc: DocumentRecord) => void;
  onDocumentDeleted: (id: string) => void;
  onDocumentsUpdated: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentsUpdated,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "favorites">("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [exportModalDoc, setExportModalDoc] = useState<DocumentRecord | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const filteredDocs = documents
    .filter((doc) => {
      if (filterMode === "favorites" && !doc.favorite) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return doc.title.toLowerCase().includes(q) || doc.plainText.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const handleCreateDocument = async () => {
    try {
      const newDoc = await DocumentRepository.createDocument();
      onDocumentCreated(newDoc);
    } catch {
      //
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    try {
      await DocumentRepository.toggleFavorite(docId);
      onDocumentsUpdated();
    } catch {
      //
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    try {
      const copy = await DocumentRepository.duplicateDocument(docId);
      onDocumentCreated(copy);
    } catch {
      //
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await DocumentRepository.deleteDocument(deleteConfirmId);
      onDocumentDeleted(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch {
      //
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importFile(file);
      if (result.isBackup && result.backupData) {
        for (const doc of result.backupData.documents) {
          await DocumentRepository.createDocument({
            title: doc.title,
            content: doc.content,
            plainText: doc.plainText,
            favorite: doc.favorite,
          });
        }
        onDocumentsUpdated();
      } else if (result.singleDoc) {
        const created = await DocumentRepository.createDocument({
          title: result.singleDoc.title,
          content: result.singleDoc.content,
          plainText: result.singleDoc.plainText,
        });
        onDocumentCreated(created);
      }
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : "Failed to import file.");
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  if (isCollapsed) {
    return (
      <aside aria-label="Documents Sidebar" className="w-14 border-r border-surface-border bg-surface flex flex-col items-center py-3 justify-between">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="p-1 rounded-lg hover:opacity-85 transition" title="Lingually">
            <img src="/Images/Lingually icon.png" alt="Lingually" className="h-7 w-7 object-contain" />
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 text-foreground/60 hover:text-foreground rounded hover:bg-surface-muted"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCreateDocument}
            className="p-2 rounded-md bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
            title="New Document"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <ThemeToggle />
          <Link href="/settings" className="p-2 text-foreground/60 hover:text-foreground" title="Settings">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Documents Sidebar" className="w-64 sm:w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full select-none shrink-0">
      {/* Brand & New Document Header */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/Images/Lingually Logo.png"
              alt="Lingually"
              className="h-6 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateDocument}
          className="w-full h-8 px-3 rounded-lg bg-[#0268cc] hover:bg-[#0256a9] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.99]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Document</span>
        </button>
      </div>

      {/* Search & Favorites Filter */}
      <div className="px-3 pt-3 pb-2.5 space-y-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-[#0268cc] focus:bg-white text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition"
          />
        </div>

        <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "flex-1 py-1 text-xs rounded-md font-medium text-center transition-all",
              filterMode === "all"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            All ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("favorites")}
            className={cn(
              "flex-1 py-1 text-xs rounded-md font-medium text-center transition-all flex items-center justify-center gap-1",
              filterMode === "favorites"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            Favorites
          </button>
        </div>
      </div>

      {/* Document Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredDocs.map((doc) => {
          const isActive = doc.id === activeDocumentId;
          return (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc.id)}
              className={cn(
                "group relative flex items-start justify-between p-2.5 rounded-lg cursor-pointer transition-all text-xs border border-transparent",
                isActive
                  ? "bg-[#eef6fc] text-[#0268cc] dark:bg-sky-950/40 dark:text-sky-300 font-medium border-[#bae6fd]/50 dark:border-sky-800/60 shadow-2xs"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
              )}
            >
              <div className="space-y-0.5 overflow-hidden pr-2">
                <div className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                  <FileText className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-[#0268cc]" : "text-slate-400")} />
                  <span className="truncate">{doc.title || "Untitled Document"}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span>{doc.wordCount} words</span>
                  <span>•</span>
                  <span>{new Date(doc.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                </div>
              </div>

              {/* Action Buttons on Hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, doc.id)}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-amber-500 transition"
                  title={doc.favorite ? "Unfavorite" : "Favorite"}
                >
                  <Star className={cn("h-3 w-3", doc.favorite && "fill-amber-400 text-amber-400")} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDuplicate(e, doc.id)}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  title="Duplicate Document"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExportModalDoc(doc);
                  }}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  title="Export Document"
                >
                  <Download className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(doc.id);
                  }}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Document"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="text-center p-6 text-slate-400 text-xs">
            {searchQuery ? "No matching documents found." : "No documents yet. Create one above!"}
          </div>
        )}
      </div>

      {/* Import / Export & Navigation Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2 text-xs bg-slate-50/50 dark:bg-slate-900/50">
        {importError && (
          <div className="p-2 rounded bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 text-[11px]">
            {importError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center justify-center gap-1.5 h-8 px-2 rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-200 font-medium text-xs transition">
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import</span>
            <input
              type="file"
              accept=".txt,.md,.docx,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAsBackup(documents)}
            className="h-8 gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium border-slate-200 dark:border-slate-700"
            title="Download full JSON backup of all documents"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Backup All</span>
          </Button>
        </div>

        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-slate-500 text-xs">
          <Link
            href="/settings"
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition font-medium"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition font-medium"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy</span>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Document"
        description="Are you sure you want to permanently delete this document and its revision history?"
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete Permanently
          </Button>
        </div>
      </Modal>

      {/* Export Format Modal */}
      {exportModalDoc && (
        <Modal
          isOpen={Boolean(exportModalDoc)}
          onClose={() => setExportModalDoc(null)}
          title={`Export "${exportModalDoc.title}"`}
          description="Choose your preferred file export format."
          maxWidth="sm"
        >
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                exportAsMarkdown(exportModalDoc);
                setExportModalDoc(null);
              }}
              className="w-full text-left p-2.5 rounded border border-surface-border hover:bg-surface-muted transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <strong className="text-foreground">Markdown (.md)</strong>
                <p className="text-[10px] text-foreground/50">Clean formatted markdown for developers and note-taking.</p>
              </div>
              <Download className="h-3.5 w-3.5 text-foreground/40" />
            </button>

            <button
              onClick={() => {
                exportAsDocx(exportModalDoc);
                setExportModalDoc(null);
              }}
              className="w-full text-left p-2.5 rounded border border-surface-border hover:bg-surface-muted transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <strong className="text-foreground">Microsoft Word (.docx)</strong>
                <p className="text-[10px] text-foreground/50">Standard word processing document.</p>
              </div>
              <Download className="h-3.5 w-3.5 text-foreground/40" />
            </button>

            <button
              onClick={() => {
                exportAsHTML(exportModalDoc);
                setExportModalDoc(null);
              }}
              className="w-full text-left p-2.5 rounded border border-surface-border hover:bg-surface-muted transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <strong className="text-foreground">HTML (.html)</strong>
                <p className="text-[10px] text-foreground/50">Sanitized standalone webpage.</p>
              </div>
              <Download className="h-3.5 w-3.5 text-foreground/40" />
            </button>

            <button
              onClick={() => {
                exportAsPlainText(exportModalDoc);
                setExportModalDoc(null);
              }}
              className="w-full text-left p-2.5 rounded border border-surface-border hover:bg-surface-muted transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <strong className="text-foreground">Plain Text (.txt)</strong>
                <p className="text-[10px] text-foreground/50">Unformatted raw text.</p>
              </div>
              <Download className="h-3.5 w-3.5 text-foreground/40" />
            </button>
          </div>
        </Modal>
      )}
    </aside>
  );
}

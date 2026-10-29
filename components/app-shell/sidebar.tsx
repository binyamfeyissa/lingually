/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { DocumentRecord } from "@/types/document";
import { DocumentRepository } from "@/lib/documents/repository";
import { exportAsPlainText, exportAsMarkdown, exportAsHTML, exportAsDocx, exportAsBackup } from "@/lib/utils/export";
import { importFile } from "@/lib/utils/import";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../shared/button";
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
  ChevronLeft,
  ChevronRight,
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
      <aside aria-label="Documents Sidebar" className="w-12 border-r border-line bg-bg flex flex-col items-center py-3 justify-between shrink-0 select-none">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="p-1 hover:opacity-80 transition" title="Lingually">
            <img src="/Images/Lingually icon.png" alt="Lingually" className="h-5 w-5 object-contain" />
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 text-muted hover:text-ink rounded-none hover:bg-bg-raised transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCreateDocument}
            className="p-2 border border-line-strong bg-bg hover:bg-invert-bg hover:text-invert-fg text-ink transition-colors"
            title="New Document"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <ThemeToggle />
          <Link href="/settings" className="p-1.5 text-muted hover:text-ink" title="Settings">
            <Settings className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Documents Sidebar" className="w-64 sm:w-72 border-r border-line bg-bg flex flex-col h-full select-none shrink-0">
      {/* Brand & New Document Header */}
      <div className="p-3 border-b border-line space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            {"00 // WORKSPACE"}
          </span>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 text-muted hover:text-ink rounded-none hover:bg-bg-raised transition"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleCreateDocument}
          className="w-full h-8 px-3 rounded-none bg-invert-bg text-invert-fg hover:opacity-85 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>NEW DOCUMENT</span>
        </button>
      </div>

      {/* Search & Favorites Filter */}
      <div className="px-3 pt-2.5 pb-2 space-y-2 border-b border-line">
        <div className="relative">
          <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER DOCUMENTS..."
            className="w-full h-7 pl-7 pr-2.5 font-mono text-[11px] bg-bg-raised rounded-none border border-line focus:outline-none focus:border-line-strong text-ink placeholder:text-muted/60 transition"
          />
        </div>

        <div className="flex gap-px bg-line p-px">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "flex-1 py-1 font-mono text-[10px] uppercase tracking-wider text-center transition-colors rounded-none",
              filterMode === "all"
                ? "bg-invert-bg text-invert-fg font-semibold"
                : "bg-bg text-muted hover:text-ink"
            )}
          >
            ALL ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("favorites")}
            className={cn(
              "flex-1 py-1 font-mono text-[10px] uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1 rounded-none",
              filterMode === "favorites"
                ? "bg-invert-bg text-invert-fg font-semibold"
                : "bg-bg text-muted hover:text-ink"
            )}
          >
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            FAVORITES
          </button>
        </div>
      </div>

      {/* Document Items List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filteredDocs.map((doc) => {
          const isActive = doc.id === activeDocumentId;
          return (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc.id)}
              className={cn(
                "group relative flex items-start justify-between p-2 cursor-pointer transition-colors border",
                isActive
                  ? "bg-bg-raised text-ink border-line-strong font-medium"
                  : "bg-transparent hover:bg-bg-raised/60 text-muted hover:text-ink border-transparent"
              )}
            >
              <div className="space-y-0.5 overflow-hidden pr-2 min-w-0 flex-1" title={doc.title || "Untitled Document"}>
                <div className="font-sans text-xs font-semibold text-ink truncate flex items-center gap-1.5" title={doc.title || "Untitled Document"}>
                  <FileText className={cn("h-3 w-3 shrink-0", isActive ? "text-accent" : "text-muted")} />
                  <span className="truncate" title={doc.title || "Untitled Document"}>{doc.title || "Untitled Document"}</span>
                </div>
                <div className="font-mono text-[10px] text-muted flex items-center gap-1.5">
                  <span>{doc.wordCount} words</span>
                  <span>/</span>
                  <span>{new Date(doc.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                </div>
              </div>

              {/* Action Buttons on Hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, doc.id)}
                  className="p-1 text-muted hover:text-amber-500 transition"
                  title={doc.favorite ? "Unfavorite" : "Favorite"}
                >
                  <Star className={cn("h-3 w-3", doc.favorite && "fill-amber-400 text-amber-400")} />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDuplicate(e, doc.id)}
                  className="p-1 text-muted hover:text-ink transition"
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
                  className="p-1 text-muted hover:text-ink transition"
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
                  className="p-1 text-muted hover:text-danger transition"
                  title="Delete Document"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="text-center p-6 text-muted font-mono text-[11px]">
            {searchQuery ? "NO MATCHING DOCUMENTS." : "NO DOCUMENTS YET."}
          </div>
        )}
      </div>

      {/* Import / Export & Navigation Footer */}
      <div className="p-2.5 border-t border-line space-y-2 bg-bg-sunken/40">
        {importError && (
          <div className="p-2 border border-danger/40 bg-danger/10 text-danger font-mono text-[10px]">
            {importError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-1.5">
          <label className="flex items-center justify-center gap-1.5 h-7 px-2 border border-line bg-bg hover:bg-bg-raised cursor-pointer text-ink font-mono text-[10px] uppercase tracking-wider transition">
            <Upload className="h-3 w-3 text-muted" />
            <span>IMPORT</span>
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
            className="h-7 text-[10px] font-mono uppercase tracking-wider"
            title="Download full JSON backup of all documents"
          >
            <Download className="h-3 w-3 mr-1 text-muted" />
            <span>BACKUP</span>
          </Button>
        </div>

        <div className="pt-2 border-t border-line flex items-center justify-between text-muted font-mono text-[10px] uppercase tracking-wider">
          <Link
            href="/settings"
            className="flex items-center gap-1 hover:text-ink transition"
          >
            <Settings className="h-3 w-3" />
            <span>SETTINGS</span>
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-1 hover:text-ink transition"
          >
            <Shield className="h-3 w-3" />
            <span>PRIVACY</span>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="DELETE DOCUMENT"
        description="Are you sure you want to permanently delete this document and its revision history?"
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
            CANCEL
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            DELETE
          </Button>
        </div>
      </Modal>

      {/* Single Doc Export Modal */}
      {exportModalDoc && (
        <Modal
          isOpen={Boolean(exportModalDoc)}
          onClose={() => setExportModalDoc(null)}
          title={`EXPORT: ${exportModalDoc.title}`}
          description="Download this document in your preferred format."
          maxWidth="sm"
        >
          <div className="hairline-grid grid-cols-2 pt-2">
            <button
              onClick={() => {
                exportAsMarkdown(exportModalDoc);
                setExportModalDoc(null);
              }}
              className="p-3 bg-bg hover:bg-bg-raised text-left font-mono text-xs uppercase tracking-wider text-ink transition-colors border-0"
            >
              MARKDOWN (.md)
            </button>
            <button
              onClick={() => {
                exportAsPlainText(exportModalDoc);
                setExportModalDoc(null);
              }}
              className="p-3 bg-bg hover:bg-bg-raised text-left font-mono text-xs uppercase tracking-wider text-ink transition-colors border-0"
            >
              PLAIN TEXT (.txt)
            </button>
            <button
              onClick={() => {
                exportAsHTML(exportModalDoc);
                setExportModalDoc(null);
              }}
              className="p-3 bg-bg hover:bg-bg-raised text-left font-mono text-xs uppercase tracking-wider text-ink transition-colors border-0"
            >
              HTML (.html)
            </button>
            <button
              onClick={() => {
                exportAsDocx(exportModalDoc);
                setExportModalDoc(null);
              }}
              className="p-3 bg-bg hover:bg-bg-raised text-left font-mono text-xs uppercase tracking-wider text-ink transition-colors border-0"
            >
              WORD (.docx)
            </button>
          </div>
        </Modal>
      )}
    </aside>
  );
}

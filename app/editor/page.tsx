"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DocumentRecord } from "@/types/document";
import { WritingToolId } from "@/types/writing-tools";
import { WritingSuggestion } from "@/types/suggestions";
import { ProviderId } from "@/types/provider";
import { DocumentRepository } from "@/lib/documents/repository";
import { runDocumentMigrations } from "@/lib/documents/migrations";
import { calculateTextStatistics } from "@/lib/analysis/statistics";
import { CredentialStorage } from "@/lib/security/api-key-storage";
import { PROVIDER_CATALOG } from "@/lib/ai/model-capabilities";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Navbar } from "@/components/app-shell/navbar";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { ReviewSidebar } from "@/components/ai-tools/review-sidebar";
import { AnalysisDrawer } from "@/components/analysis/analysis-drawer";
import { RevisionHistoryModal } from "@/components/history/revision-history-modal";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string>("");
  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(true);

  // Selection states
  const [selectedText, setSelectedText] = useState("");
  const [isSelectionActive, setIsSelectionActive] = useState(false);
  const [activeAITool, setActiveAITool] = useState<WritingToolId>("improve");
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  // Modals
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Replacement to apply to the active editor
  const [replacementPayload, setReplacementPayload] = useState<{
    text: string;
    selectionOnly: boolean;
    timestamp: number;
  } | null>(null);

  // Single suggestion payload from ReviewSidebar
  const [suggestionPayload, setSuggestionPayload] = useState<{
    originalText: string;
    replacementText: string;
    timestamp: number;
  } | null>(null);

  // Revision restoration payload from History modal (Bug 4)
  const [restorePayload, setRestorePayload] = useState<{
    content: string;
    timestamp: number;
  } | null>(null);

  // Active suggestions for inline editor underlines (Bug 37)
  const [editorSuggestions, setEditorSuggestions] = useState<WritingSuggestion[]>([]);

  const activeDocumentIdRef = React.useRef(activeDocumentId);
  activeDocumentIdRef.current = activeDocumentId;

  const handleSuggestionsChange = useCallback((newSuggestions: WritingSuggestion[]) => {
    setEditorSuggestions((prev) => {
      const prevSig = prev.map((s) => s.signature || s.id).join("|");
      const nextSig = newSuggestions.map((s) => s.signature || s.id).join("|");
      if (prevSig === nextSig) return prev;
      return newSuggestions;
    });
  }, []);

  const loadDocuments = useCallback(async (selectDocId?: string) => {
    try {
      await runDocumentMigrations();
      await DocumentRepository.seedInitialDocumentIfEmpty();
      const allDocs = await DocumentRepository.getAllDocuments();
      setDocuments(allDocs);

      if (allDocs.length > 0) {
        const currentActiveId = activeDocumentIdRef.current;
        const targetId = selectDocId || (allDocs.some((d) => d.id === currentActiveId) ? currentActiveId : allDocs[0].id);
        setActiveDocumentId(targetId);
        const doc = allDocs.find((d) => d.id === targetId) || allDocs[0];
        setActiveDocument(doc);
      } else {
        setActiveDocument(null);
        setActiveDocumentId("");
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleSelectDocument = useCallback((id: string) => {
    setActiveDocumentId(id);
    setDocuments((docs) => {
      const doc = docs.find((d) => d.id === id);
      if (doc) setActiveDocument(doc);
      return docs;
    });
    setSelectedText("");
    setIsSelectionActive(false);
  }, []);

  const handleDocumentCreated = useCallback((doc: DocumentRecord) => {
    setDocuments((prev) => [doc, ...prev]);
    setActiveDocumentId(doc.id);
    setActiveDocument(doc);
  }, []);

  const handleDocumentDeleted = useCallback((id: string) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      if (activeDocumentIdRef.current === id) {
        if (filtered.length > 0) {
          setActiveDocumentId(filtered[0].id);
          setActiveDocument(filtered[0]);
        } else {
          setActiveDocumentId("");
          setActiveDocument(null);
        }
      }
      return filtered;
    });
  }, []);

  const handleDocumentChange = useCallback((updated: DocumentRecord) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    setActiveDocument((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const handleLiveTextChange = useCallback((text: string, html: string) => {
    const stats = calculateTextStatistics(text);
    setActiveDocument((prev) => {
      if (!prev) return null;
      if (prev.plainText === text && prev.content === html) return prev;
      return {
        ...prev,
        plainText: text,
        content: html,
        wordCount: stats.wordCount,
        characterCount: stats.characterCount,
      };
    });
    const currentId = activeDocumentIdRef.current;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === currentId
          ? {
              ...d,
              plainText: text,
              content: html,
              wordCount: stats.wordCount,
              characterCount: stats.characterCount,
            }
          : d
      )
    );
  }, []);

  const handleSelectionChange = useCallback((text: string, hasSelection: boolean) => {
    setSelectedText(text);
    setIsSelectionActive(hasSelection);
  }, []);

  const handleTriggerAITool = useCallback((toolId: WritingToolId) => {
    setActiveAITool(toolId);
    setIsAssistantOpen(true);

    const savedProvider = (localStorage.getItem("lingually_default_provider") as ProviderId) || "openai";
    const requiresKey = PROVIDER_CATALOG[savedProvider]?.requiresApiKey ?? true;
    const hasKey = Boolean(CredentialStorage.getApiKey(savedProvider));

    if (requiresKey && !hasKey) {
      setSelectionNotice(`API key needed for ${PROVIDER_CATALOG[savedProvider]?.name || savedProvider}. Configure in Settings.`);
      setTimeout(() => setSelectionNotice(null), 4500);
    }
  }, []);

  const handleApplyAIRewrite = useCallback((replacement: string, selectionOnly: boolean) => {
    setReplacementPayload({
      text: replacement,
      selectionOnly,
      timestamp: Date.now(),
    });
  }, []);

  const handleApplySuggestion = useCallback((suggestion: WritingSuggestion) => {
    setSuggestionPayload({
      originalText: suggestion.originalText,
      replacementText: suggestion.replacementText,
      timestamp: Date.now(),
    });
  }, []);

  const handleRestoreRevision = useCallback((restoredDoc?: DocumentRecord) => {
    if (restoredDoc) {
      setActiveDocument(restoredDoc);
      setActiveDocumentId(restoredDoc.id);
      setDocuments((prev) =>
        prev.map((d) => (d.id === restoredDoc.id ? restoredDoc : d))
      );
      setRestorePayload({
        content: restoredDoc.content,
        timestamp: Date.now(),
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg text-ink gap-2 font-mono text-xs">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        <span className="uppercase tracking-[0.15em]">INITIALIZING LINGUALLY WORKBENCH...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg text-ink">
      {/* Top Application Navbar */}
      <Navbar
        document={activeDocument || undefined}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)}
        isAssistantOpen={isAssistantOpen}
      />

      {/* Main 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          documents={documents}
          activeDocumentId={activeDocumentId}
          onSelectDocument={handleSelectDocument}
          onDocumentCreated={handleDocumentCreated}
          onDocumentDeleted={handleDocumentDeleted}
          onDocumentsUpdated={() => loadDocuments()}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Center Editor */}
        {activeDocument ? (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Key needed notice toast for selection AI action (Bug 5) */}
            {selectionNotice && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-bg border border-accent/40 shadow-xl px-3 py-1.5 flex items-center gap-2 font-mono text-[11px] text-ink animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>{selectionNotice}</span>
                <Link href="/settings" className="underline font-bold text-accent hover:opacity-80">
                  SETTINGS
                </Link>
              </div>
            )}
            <TiptapEditor
              key={activeDocument.id}
              document={activeDocument}
              suggestions={editorSuggestions}
              onDocumentChange={handleDocumentChange}
              onLiveTextChange={handleLiveTextChange}
              onSelectionChange={handleSelectionChange}
              onTriggerAITool={handleTriggerAITool}
              onOpenAnalysis={() => setIsAnalysisOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              replacementPayload={replacementPayload}
              suggestionPayload={suggestionPayload}
              restorePayload={restorePayload}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted font-mono">
            <p className="text-sm font-semibold uppercase tracking-wider text-ink">NO DOCUMENT SELECTED</p>
            <p className="text-xs mt-1">Create a new document from the sidebar to begin writing.</p>
          </div>
        )}

        {/* Right Assistant & Review Panel */}
        {isAssistantOpen && activeDocument && (
          <div className="w-80 sm:w-96 shrink-0 h-full overflow-hidden">
            <ReviewSidebar
              documentId={activeDocument.id}
              currentText={activeDocument.plainText}
              selectedText={selectedText}
              isSelectionActive={isSelectionActive}
              onApplySuggestion={handleApplySuggestion}
              onApplyAIRewrite={handleApplyAIRewrite}
              onSuggestionsChange={handleSuggestionsChange}
              activeToolId={activeAITool}
              onToolChange={(toolId) => setActiveAITool(toolId)}
            />
          </div>
        )}
      </div>

      {/* Writing Analysis Drawer */}
      {activeDocument && (
        <AnalysisDrawer
          isOpen={isAnalysisOpen}
          onClose={() => setIsAnalysisOpen(false)}
          text={activeDocument.plainText}
        />
      )}

      {/* Revision History Modal */}
      {activeDocument && (
        <RevisionHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          documentId={activeDocument.id}
          currentText={activeDocument.plainText}
          onRestore={handleRestoreRevision}
        />
      )}
    </div>
  );
}

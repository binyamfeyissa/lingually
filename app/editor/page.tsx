"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DocumentRecord } from "@/types/document";
import { WritingToolId } from "@/types/writing-tools";
import { WritingSuggestion } from "@/types/suggestions";
import { DocumentRepository } from "@/lib/documents/repository";
import { runDocumentMigrations } from "@/lib/documents/migrations";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Navbar } from "@/components/app-shell/navbar";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { ReviewSidebar } from "@/components/ai-tools/review-sidebar";
import { AnalysisDrawer } from "@/components/analysis/analysis-drawer";
import { RevisionHistoryModal } from "@/components/history/revision-history-modal";
import { Loader2 } from "lucide-react";

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

  const loadDocuments = useCallback(async (selectDocId?: string) => {
    try {
      await runDocumentMigrations();
      await DocumentRepository.seedInitialDocumentIfEmpty();
      const allDocs = await DocumentRepository.getAllDocuments();
      setDocuments(allDocs);

      if (allDocs.length > 0) {
        const targetId = selectDocId || (allDocs.some((d) => d.id === activeDocumentId) ? activeDocumentId : allDocs[0].id);
        setActiveDocumentId(targetId);
        const doc = allDocs.find((d) => d.id === targetId) || allDocs[0];
        setActiveDocument(doc);
      } else {
        setActiveDocument(null);
      }
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  }, [activeDocumentId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleSelectDocument = (id: string) => {
    setActiveDocumentId(id);
    const doc = documents.find((d) => d.id === id);
    if (doc) setActiveDocument(doc);
    setSelectedText("");
    setIsSelectionActive(false);
  };

  const handleDocumentCreated = (doc: DocumentRecord) => {
    setDocuments((prev) => [doc, ...prev]);
    setActiveDocumentId(doc.id);
    setActiveDocument(doc);
  };

  const handleDocumentDeleted = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (activeDocumentId === id) {
      const remaining = documents.filter((d) => d.id !== id);
      if (remaining.length > 0) {
        setActiveDocumentId(remaining[0].id);
        setActiveDocument(remaining[0]);
      } else {
        setActiveDocument(null);
      }
    }
  };

  const handleDocumentChange = (updated: DocumentRecord) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    setActiveDocument(updated);
  };

  const handleSelectionChange = (text: string, hasSelection: boolean) => {
    setSelectedText(text);
    setIsSelectionActive(hasSelection);
  };

  const handleTriggerAITool = (toolId: WritingToolId) => {
    setActiveAITool(toolId);
    setIsAssistantOpen(true);
  };

  const handleApplyAIRewrite = (replacement: string, selectionOnly: boolean) => {
    setReplacementPayload({
      text: replacement,
      selectionOnly,
      timestamp: Date.now(),
    });
  };

  const handleApplySuggestion = (suggestion: WritingSuggestion) => {
    setSuggestionPayload({
      originalText: suggestion.originalText,
      replacementText: suggestion.replacementText,
      timestamp: Date.now(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
        <span className="text-xs font-semibold">Loading Lingually Workbench...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
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
          <TiptapEditor
            key={activeDocument.id}
            document={activeDocument}
            onDocumentChange={handleDocumentChange}
            onSelectionChange={handleSelectionChange}
            onTriggerAITool={handleTriggerAITool}
            onOpenAnalysis={() => setIsAnalysisOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            replacementPayload={replacementPayload}
            suggestionPayload={suggestionPayload}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-foreground/50">
            <p className="text-sm font-semibold">No document selected</p>
            <p className="text-xs mt-1">Create a new document from the sidebar to begin writing.</p>
          </div>
        )}

        {/* Right Assistant & Review Panel */}
        {isAssistantOpen && activeDocument && (
          <div className="w-80 sm:w-96 shrink-0 h-full overflow-hidden shadow-sm">
            <ReviewSidebar
              currentText={activeDocument.plainText}
              selectedText={selectedText}
              isSelectionActive={isSelectionActive}
              onApplySuggestion={handleApplySuggestion}
              onApplyAIRewrite={handleApplyAIRewrite}
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
          onRestore={() => loadDocuments(activeDocument.id)}
        />
      )}
    </div>
  );
}

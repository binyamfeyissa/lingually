"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getEditorExtensions } from "@/lib/editor/extensions";
import { getEditorSnapshot, applyReplacementToEditor } from "@/lib/editor/serialization";
import { EditorToolbar } from "./toolbar";
import { SelectionMenu } from "./selection-menu";
import { WordCountBar } from "./word-count-bar";
import { DocumentRecord } from "@/types/document";
import { DocumentRepository } from "@/lib/documents/repository";
import { WritingToolId } from "@/types/writing-tools";

export interface TiptapEditorProps {
  document: DocumentRecord;
  onDocumentChange?: (doc: DocumentRecord) => void;
  onSelectionChange?: (selectedText: string, hasSelection: boolean) => void;
  onTriggerAITool?: (toolId: WritingToolId) => void;
  onOpenAnalysis: () => void;
  onOpenHistory: () => void;
  replacementPayload?: {
    text: string;
    selectionOnly: boolean;
    timestamp: number;
  } | null;
  suggestionPayload?: {
    originalText: string;
    replacementText: string;
    timestamp: number;
  } | null;
}

export function TiptapEditor({
  document,
  onDocumentChange,
  onSelectionChange,
  onTriggerAITool,
  onOpenAnalysis,
  onOpenHistory,
  replacementPayload,
  suggestionPayload,
}: TiptapEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);

  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedReplacementRef = useRef<number>(0);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: getEditorExtensions(),
    content: document.content,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[480px] p-6 max-w-3xl mx-auto font-serif text-lg leading-relaxed",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setSaveStatus("unsaved");
      triggerDebouncedAutosave();
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      const snapshot = getEditorSnapshot(currentEditor);
      const text = snapshot.selection.text.trim();
      setSelectedText(text);
      setSelectionRange(
        snapshot.selection.isEmpty
          ? null
          : { from: snapshot.selection.from, to: snapshot.selection.to }
      );
      if (onSelectionChange) {
        onSelectionChange(text, !snapshot.selection.isEmpty && text.length > 0);
      }
    },
  });

  // Keep editor content in sync when switching documents
  useEffect(() => {
    if (editor && document) {
      setTitle(document.title);
      const currentHtml = editor.getHTML();
      if (currentHtml !== document.content) {
        editor.commands.setContent(document.content || "<p></p>");
      }
      setSaveStatus("saved");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, editor]);

  // Handle incoming AI replacements
  useEffect(() => {
    if (
      editor &&
      replacementPayload &&
      replacementPayload.timestamp !== lastProcessedReplacementRef.current
    ) {
      lastProcessedReplacementRef.current = replacementPayload.timestamp;

      // 1. Snapshot revision before applying AI rewrite
      DocumentRepository.createRevision(
        document.id,
        "before-ai-apply",
        `Before applying AI rewrite (${replacementPayload.selectionOnly ? "selection" : "document"})`
      ).catch(() => {});

      // 2. Apply replacement
      applyReplacementToEditor(editor, {
        replacementText: replacementPayload.text,
        selectionOnly: replacementPayload.selectionOnly,
        range: selectionRange || undefined,
      });

      // 3. Immediately trigger save
      saveDocumentNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replacementPayload, editor]);

  // Handle incoming single suggestion replacements (from Review sidebar)
  useEffect(() => {
    if (editor && suggestionPayload && suggestionPayload.timestamp !== lastProcessedReplacementRef.current) {
      lastProcessedReplacementRef.current = suggestionPayload.timestamp;

      const currentHtml = editor.getHTML();
      if (currentHtml.includes(suggestionPayload.originalText)) {
        // Create revision snapshot
        DocumentRepository.createRevision(
          document.id,
          "before-ai-apply",
          `Accepted suggestion for "${suggestionPayload.originalText}"`
        ).catch(() => {});

        // Replace first occurrence in content
        const updatedHtml = currentHtml.replace(suggestionPayload.originalText, suggestionPayload.replacementText);
        editor.commands.setContent(updatedHtml);
        saveDocumentNow();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestionPayload, editor]);

  const saveDocumentNow = useCallback(async () => {
    if (!editor) return;
    setSaveStatus("saving");

    try {
      const snapshot = getEditorSnapshot(editor);
      const updated = await DocumentRepository.updateDocument(document.id, {
        title: title.trim() || "Untitled Document",
        content: snapshot.html,
        plainText: snapshot.plainText,
      });

      setSaveStatus("saved");
      if (onDocumentChange) {
        onDocumentChange(updated);
      }
    } catch {
      setSaveStatus("unsaved");
    }
  }, [editor, document?.id, title, onDocumentChange]);

  const triggerDebouncedAutosave = useCallback(() => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      saveDocumentNow();
    }, 800);
  }, [saveDocumentNow]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSaveStatus("unsaved");
    triggerDebouncedAutosave();
  };

  const plainText = editor ? editor.getText() : document.plainText;

  return (
    <main aria-label="Document editor" className="flex flex-col h-full bg-background relative overflow-hidden flex-1">
      {/* Formatting Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Floating Selection Action Menu */}
      {selectedText && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30">
          <SelectionMenu
            isVisible={Boolean(selectedText)}
            selectedText={selectedText}
            onActionSelect={(toolId) => {
              if (onTriggerAITool) onTriggerAITool(toolId);
            }}
          />
        </div>
      )}

      {/* Document Workspace Body */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-surface rounded-xl border border-surface-border shadow-sm min-h-[600px] flex flex-col">
          {/* Document Title Header */}
          <div className="px-6 pt-6 pb-2">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Document..."
              className="w-full text-2xl sm:text-3xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-foreground/30 font-sans tracking-tight"
            />
          </div>

          {/* Tiptap Rich-Text Prose Editor */}
          <div className="flex-1">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Bottom Status & Word Count Bar */}
      <WordCountBar
        plainText={plainText}
        saveStatus={saveStatus}
        onOpenAnalysis={onOpenAnalysis}
        onOpenHistory={onOpenHistory}
      />
    </main>
  );
}

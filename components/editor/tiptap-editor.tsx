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
import { WritingSuggestion } from "@/types/suggestions";
import { issueDecorationsKey } from "@/lib/editor/issue-decorations";

export interface TiptapEditorProps {
  document: DocumentRecord;
  suggestions?: WritingSuggestion[];
  onDocumentChange?: (doc: DocumentRecord) => void;
  onLiveTextChange?: (plainText: string, html: string) => void;
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
  suggestions = [],
  onDocumentChange,
  onLiveTextChange,
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
  const lastDocIdRef = useRef(document?.id);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: getEditorExtensions("", suggestions),
    content: document.content,
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[520px] px-8 sm:px-12 py-6 max-w-3xl mx-auto font-sans text-[16px] sm:text-[17px] leading-[1.85] text-ink whitespace-pre-wrap",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setSaveStatus("unsaved");
      triggerDebouncedAutosave();
      if (onLiveTextChange) {
        onLiveTextChange(currentEditor.getText(), currentEditor.getHTML());
      }
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

  // Keep editor content in sync when switching documents or restoring snapshots (Bug 3, Bug 4)
  useEffect(() => {
    if (editor && document) {
      setTitle(document.title);
      const isDocSwitch = lastDocIdRef.current !== document.id;
      lastDocIdRef.current = document.id;

      const currentText = editor.getText();
      const incomingText = document.plainText || "";

      // Only setContent when switching documents, or when external content changed (e.g. revision restore)
      if (isDocSwitch || (currentText !== incomingText && incomingText.length > 0)) {
        editor.commands.setContent(document.content || "<p></p>");
      }
      setSaveStatus("saved");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, document?.plainText, document?.content, editor]);

  // Keep issue decorations updated when suggestions change (Bug 37)
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const tr = editor.state.tr.setMeta(issueDecorationsKey, { suggestions });
      editor.view.dispatch(tr);
    }
  }, [editor, suggestions]);

  // Handle incoming AI replacements
  useEffect(() => {
    if (
      editor &&
      replacementPayload &&
      replacementPayload.timestamp !== lastProcessedReplacementRef.current
    ) {
      lastProcessedReplacementRef.current = replacementPayload.timestamp;

      // 1. Snapshot revision before applying AI rewrite
      const preRewriteHtml = editor.getHTML();
      const preRewritePlain = editor.getText();
      DocumentRepository.createRevision(
        document.id,
        "before-ai-apply",
        `Before applying AI rewrite (${replacementPayload.selectionOnly ? "selection" : "document"})`,
        {
          title: title.trim() || document.title,
          content: preRewriteHtml,
          plainText: preRewritePlain,
        }
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
      const currentPlain = editor.getText();
      if (currentHtml.includes(suggestionPayload.originalText) || currentPlain.includes(suggestionPayload.originalText)) {
        // Create revision snapshot with TRUE pre-replacement text
        DocumentRepository.createRevision(
          document.id,
          "before-ai-apply",
          `Accepted suggestion for "${suggestionPayload.originalText}"`,
          {
            title: title.trim() || document.title,
            content: currentHtml,
            plainText: currentPlain,
          }
        ).catch(() => {});

        // Use ranged replacement where possible to preserve undo stack (Bug 3)
        let replacedWithRange = false;
        editor.state.doc.descendants((node, pos) => {
          if (replacedWithRange) return false;
          if (node.isText && node.text) {
            const idx = node.text.indexOf(suggestionPayload.originalText);
            if (idx !== -1) {
              const from = pos + idx;
              const to = from + suggestionPayload.originalText.length;
              editor
                .chain()
                .focus()
                .setTextSelection({ from, to })
                .insertContent(suggestionPayload.replacementText)
                .run();
              replacedWithRange = true;
              return false;
            }
          }
        });

        // Fallback to HTML replace if cross-node
        if (!replacedWithRange) {
          const updatedHtml = currentHtml.replace(suggestionPayload.originalText, suggestionPayload.replacementText);
          editor.commands.setContent(updatedHtml);
        }
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

  const editorRef = useRef(editor);
  editorRef.current = editor;
  const saveStatusRef = useRef(saveStatus);
  saveStatusRef.current = saveStatus;
  const documentRef = useRef(document);
  documentRef.current = document;
  const titleRef = useRef(title);
  titleRef.current = title;

  // Flush unsaved changes on beforeunload or warn on SPA navigation (Bug 24)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editorRef.current && saveStatusRef.current === "unsaved" && documentRef.current) {
        const snapshot = getEditorSnapshot(editorRef.current);
        DocumentRepository.updateDocument(documentRef.current.id, {
          title: titleRef.current.trim() || "Untitled Document",
          content: snapshot.html,
          plainText: snapshot.plainText,
        }).catch(() => {});
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Leave this page?";
        return "You have unsaved changes. Leave this page?";
      }
    };

    const handlePopState = () => {
      if (saveStatusRef.current === "unsaved") {
        const leave = window.confirm("You have unsaved changes. Leave this page?");
        if (!leave) {
          window.history.pushState(null, "", window.location.href);
        } else if (editorRef.current && documentRef.current) {
          const snapshot = getEditorSnapshot(editorRef.current);
          DocumentRepository.updateDocument(documentRef.current.id, {
            title: titleRef.current.trim() || "Untitled Document",
            content: snapshot.html,
            plainText: snapshot.plainText,
          }).catch(() => {});
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSaveStatus("unsaved");
    triggerDebouncedAutosave();
  };

  const plainText = editor ? editor.getText() : document.plainText;

  return (
    <main aria-label="Document editor" className="flex flex-col h-full bg-bg relative overflow-hidden flex-1 select-text">
      {/* Formatting Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Floating Selection Action Menu (Offset below toolbar with clearance over title - Bug 12, 19) */}
      {selectedText && (
        <div className="absolute top-11 right-4 z-30 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
          <SelectionMenu
            isVisible={Boolean(selectedText)}
            selectedText={selectedText}
            onActionSelect={(toolId) => {
              if (onTriggerAITool) onTriggerAITool(toolId);
            }}
            onClose={() => {
              setSelectedText("");
              if (onSelectionChange) onSelectionChange("", false);
            }}
          />
        </div>
      )}

      {/* Document Workspace Body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="relative max-w-3xl mx-auto bg-bg-raised border border-line rounded-none min-h-[640px] flex flex-col shadow-xs">
          {/* Architectural Corner Ticks */}
          <span className="tick top-[-5px] left-[-5px]" />
          <span className="tick top-[-5px] right-[-5px]" />
          <span className="tick bottom-[-5px] left-[-5px]" />
          <span className="tick bottom-[-5px] right-[-5px]" />

          {/* Document Title Header */}
          <div className="px-8 sm:px-12 pt-8 pb-3 border-b border-line flex flex-col gap-1">
            <span className="font-mono text-[10px] text-muted uppercase tracking-[0.15em]">
              {"TITLE //"}
            </span>
            <input
              type="text"
              value={title}
              title={title || "Untitled Document"}
              onChange={handleTitleChange}
              placeholder="Untitled Document..."
              className="w-full font-display text-2xl sm:text-3xl font-bold text-ink bg-transparent border-none outline-none placeholder:text-muted/40 tracking-tight"
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

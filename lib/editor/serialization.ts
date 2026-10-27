import { Editor } from "@tiptap/react";
import { sanitizeContent } from "../security/sanitization";

export interface EditorSnapshot {
  html: string;
  plainText: string;
  selection: {
    from: number;
    to: number;
    text: string;
    isEmpty: boolean;
  };
}

/**
 * Extracts a consistent snapshot of the editor's text, HTML, and current selection.
 */
export function getEditorSnapshot(editor: Editor): EditorSnapshot {
  const { from, to, empty } = editor.state.selection;
  const selectedText = empty ? "" : editor.state.doc.textBetween(from, to, " ");
  const html = sanitizeContent(editor.getHTML());
  const plainText = editor.getText();

  return {
    html,
    plainText,
    selection: {
      from,
      to,
      text: selectedText,
      isEmpty: empty,
    },
  };
}

/**
 * Replaces the selected text range or inserts content safely.
 */
export function applyReplacementToEditor(
  editor: Editor,
  options: {
    replacementText: string;
    selectionOnly: boolean;
    range?: { from: number; to: number };
  }
): boolean {
  const { replacementText, selectionOnly, range } = options;

  if (!selectionOnly || !range) {
    // Whole document replacement
    editor.commands.setContent(replacementText);
    return true;
  }

  const { from, to } = range;
  const docSize = editor.state.doc.content.size;

  // Validate bounds
  if (from < 0 || to > docSize || from > to) {
    // If the selection bounds are no longer valid, insert at current selection
    editor.chain().focus().insertContent(replacementText).run();
    return true;
  }

  return editor
    .chain()
    .focus()
    .setTextSelection({ from, to })
    .insertContent(replacementText)
    .run();
}

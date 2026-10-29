import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { IssueDecorations } from "./issue-decorations";
import { WritingSuggestion } from "@/types/suggestions";

export function getEditorExtensions(
  placeholder = "Write clearly. Rewrite confidently. Highlight text to trigger AI actions...",
  suggestions: WritingSuggestion[] = []
) {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      codeBlock: {
        HTMLAttributes: {
          class: "rounded-md bg-surface-subtle p-3 font-mono text-sm border border-surface-border",
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: "border-l-4 border-brand-500 pl-4 italic text-foreground/80 my-2",
        },
      },
      bulletList: {
        HTMLAttributes: {
          class: "list-disc pl-5 my-2 space-y-1",
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: "list-decimal pl-5 my-2 space-y-1",
        },
      },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-brand-600 underline underline-offset-2 hover:text-brand-700",
        rel: "noopener noreferrer nofollow",
      },
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: "is-editor-empty before:text-foreground/30 before:content-[attr(data-placeholder)] before:float-left before:pointer-events-none before:h-0",
    }),
    CharacterCount,
    IssueDecorations.configure({ suggestions }),
  ];
}

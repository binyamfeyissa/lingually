"use client";

import React from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btnClass = (isActive: boolean) =>
    cn(
      "h-7 w-7 flex items-center justify-center rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:pointer-events-none",
      isActive && "bg-[#eef6fc] text-[#0268cc] dark:bg-sky-950 dark:text-sky-300 font-semibold shadow-2xs"
    );

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sticky top-0 z-20"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive("underline"))}
        title="Underline (Ctrl+U)"
        aria-label="Underline"
      >
        <Underline className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive("strike"))}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1.5" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive("heading", { level: 1 }))}
        title="Heading 1"
        aria-label="Heading 1"
      >
        <Heading1 className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
        aria-label="Heading 2"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
        aria-label="Heading 3"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1.5" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
        title="Bullet List"
        aria-label="Bullet List"
      >
        <List className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
        title="Numbered List"
        aria-label="Numbered List"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
        title="Blockquote"
        aria-label="Blockquote"
      >
        <Quote className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btnClass(editor.isActive("codeBlock"))}
        title="Code Block"
        aria-label="Code Block"
      >
        <Code className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={setLink}
        className={btnClass(editor.isActive("link"))}
        title="Insert Link"
        aria-label="Insert Link"
      >
        <LinkIcon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className={btnClass(false)}
        title="Clear Formatting"
        aria-label="Clear Formatting"
      >
        <RemoveFormatting className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1.5 ml-auto" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={btnClass(false)}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        <Undo className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={btnClass(false)}
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
      >
        <Redo className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

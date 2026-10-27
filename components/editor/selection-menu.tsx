"use client";

import React from "react";
import { WritingToolId } from "@/types/writing-tools";
import {
  Sparkles,
  CheckCheck,
  RefreshCw,
  Palette,
  Scissors,
  FileText,
  Languages,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectionMenuProps {
  isVisible: boolean;
  onActionSelect: (toolId: WritingToolId) => void;
  selectedText: string;
}

export function SelectionMenu({ isVisible, onActionSelect, selectedText }: SelectionMenuProps) {
  if (!isVisible || !selectedText.trim()) return null;

  const actions: Array<{ id: WritingToolId; label: string; icon: React.ReactNode }> = [
    { id: "improve", label: "Improve", icon: <Wand2 className="h-3.5 w-3.5 text-[#0268cc]" /> },
    { id: "grammar", label: "Grammar", icon: <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> },
    { id: "paraphrase", label: "Paraphrase", icon: <RefreshCw className="h-3.5 w-3.5 text-sky-600" /> },
    { id: "tone", label: "Tone", icon: <Palette className="h-3.5 w-3.5 text-purple-600" /> },
    { id: "shorten-expand", label: "Shorten/Expand", icon: <Scissors className="h-3.5 w-3.5 text-amber-600" /> },
    { id: "summarize", label: "Summarize", icon: <FileText className="h-3.5 w-3.5 text-teal-600" /> },
    { id: "translate", label: "Translate", icon: <Languages className="h-3.5 w-3.5 text-indigo-600" /> },
  ];

  return (
    <div
      role="menu"
      aria-label="Selection AI Actions"
      className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 animate-in fade-in zoom-in-95 duration-100 flex-wrap"
    >
      <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 border-r border-slate-200 dark:border-slate-800 flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-[#0268cc]" />
        <span>Quick AI</span>
      </div>

      {actions.map((act) => (
        <button
          key={act.id}
          type="button"
          onClick={() => onActionSelect(act.id)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
}

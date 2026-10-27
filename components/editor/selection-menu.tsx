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

export interface SelectionMenuProps {
  isVisible: boolean;
  onActionSelect: (toolId: WritingToolId) => void;
  selectedText: string;
}

export function SelectionMenu({ isVisible, onActionSelect, selectedText }: SelectionMenuProps) {
  if (!isVisible || !selectedText.trim()) return null;

  const actions: Array<{ id: WritingToolId; label: string; icon: React.ReactNode }> = [
    { id: "improve", label: "IMPROVE", icon: <Wand2 className="h-3 w-3 text-accent" /> },
    { id: "grammar", label: "GRAMMAR", icon: <CheckCheck className="h-3 w-3 text-emerald-500" /> },
    { id: "paraphrase", label: "REPHRASE", icon: <RefreshCw className="h-3 w-3 text-accent" /> },
    { id: "tone", label: "TONE", icon: <Palette className="h-3 w-3 text-purple-500" /> },
    { id: "shorten-expand", label: "LENGTH", icon: <Scissors className="h-3 w-3 text-amber-500" /> },
    { id: "summarize", label: "SUMMARIZE", icon: <FileText className="h-3 w-3 text-teal-500" /> },
    { id: "translate", label: "TRANSLATE", icon: <Languages className="h-3 w-3 text-indigo-500" /> },
  ];

  return (
    <div
      role="menu"
      aria-label="Selection AI Actions"
      className="flex items-center gap-0.5 p-1 bg-bg border border-line-strong rounded-none shadow-xl z-30 animate-in fade-in duration-100 flex-wrap"
    >
      <div className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted border-r border-line flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-accent" />
        <span>ACTION</span>
      </div>

      {actions.map((act) => (
        <button
          key={act.id}
          type="button"
          onClick={() => onActionSelect(act.id)}
          className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-ink hover:bg-bg-raised transition-colors rounded-none"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
}

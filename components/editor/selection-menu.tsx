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
    { id: "improve", label: "Improve", icon: <Wand2 className="h-3.5 w-3.5 text-brand-500" /> },
    { id: "grammar", label: "Grammar", icon: <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> },
    { id: "paraphrase", label: "Paraphrase", icon: <RefreshCw className="h-3.5 w-3.5 text-blue-500" /> },
    { id: "tone", label: "Tone", icon: <Palette className="h-3.5 w-3.5 text-purple-500" /> },
    { id: "shorten-expand", label: "Shorten/Expand", icon: <Scissors className="h-3.5 w-3.5 text-amber-500" /> },
    { id: "summarize", label: "Summarize", icon: <FileText className="h-3.5 w-3.5 text-teal-500" /> },
    { id: "translate", label: "Translate", icon: <Languages className="h-3.5 w-3.5 text-indigo-500" /> },
  ];

  return (
    <div
      role="menu"
      aria-label="Selection AI Actions"
      className="flex items-center gap-1 p-1 bg-surface border border-surface-border rounded-lg shadow-lg z-30 animate-in fade-in zoom-in-95 duration-100 flex-wrap"
    >
      <div className="px-2 py-1 text-[11px] font-semibold text-foreground/50 border-r border-surface-border flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-brand-500" />
        AI Edit:
      </div>

      {actions.map((act) => (
        <button
          key={act.id}
          type="button"
          onClick={() => onActionSelect(act.id)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded hover:bg-surface-muted text-foreground/80 hover:text-foreground transition-colors"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
}

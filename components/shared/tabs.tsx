import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function Tabs<T extends string = string>({ tabs, activeTab, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-px bg-line p-px border border-line", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors rounded-none",
              isActive
                ? "bg-invert-bg text-invert-fg font-semibold"
                : "bg-bg text-muted hover:text-ink hover:bg-bg-raised"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.2 font-mono text-[9px] border",
                  isActive ? "border-invert-fg/40 text-invert-fg" : "border-line text-muted"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

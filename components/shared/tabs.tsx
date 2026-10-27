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
    <div className={cn("flex flex-wrap gap-1 p-1 bg-surface-muted rounded-lg border border-surface-border", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              isActive
                ? "bg-surface text-foreground shadow-sm font-semibold"
                : "text-foreground/60 hover:text-foreground hover:bg-surface/50"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "ml-1 px-1.5 py-0.2 rounded-full text-[10px]",
                  isActive ? "bg-brand-50 text-brand-600 dark:bg-brand-900/60" : "bg-surface-subtle text-foreground/50"
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

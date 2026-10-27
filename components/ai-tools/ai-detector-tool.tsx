"use client";

import React from "react";
import { analyzeAIWritingIndicators } from "@/lib/analysis/heuristics";
import { AlertTriangle, Info, CheckCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AIDetectorToolProps {
  text: string;
}

export function AIDetectorTool({ text }: AIDetectorToolProps) {
  const analysis = analyzeAIWritingIndicators(text);

  const getScoreColor = (score: number) => {
    if (score >= 65) return "text-amber-600 dark:text-amber-400";
    if (score >= 35) return "text-blue-600 dark:text-blue-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 65) return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
    if (score >= 35) return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
  };

  return (
    <div className="space-y-3.5 text-xs">
      {/* Metric Gauge Card */}
      <div className="p-4 rounded-lg border border-surface-border bg-surface text-center space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-[11px] text-foreground/60 mb-1">
          <span className="font-semibold uppercase tracking-wider">Indicator Score</span>
          <span className={cn("px-2 py-0.5 rounded-full font-medium text-[10px]", getScoreBadge(analysis.overallIndicatorScore))}>
            {analysis.overallAssessment}
          </span>
        </div>

        <div className="flex items-baseline justify-center gap-1">
          <span className={cn("text-3xl font-extrabold tracking-tight", getScoreColor(analysis.overallIndicatorScore))}>
            {analysis.overallIndicatorScore}
          </span>
          <span className="text-foreground/40 text-sm font-semibold">/ 100</span>
        </div>

        <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              analysis.overallIndicatorScore >= 65
                ? "bg-amber-500"
                : analysis.overallIndicatorScore >= 35
                ? "bg-blue-500"
                : "bg-emerald-500"
            )}
            style={{ width: `${analysis.overallIndicatorScore}%` }}
          />
        </div>
      </div>

      {/* Heuristic Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2.5 rounded-md border border-surface-border bg-surface">
          <div className="text-foreground/60 font-medium">Uniformity (Low Variance)</div>
          <div className="text-sm font-bold text-foreground mt-0.5">{analysis.burstinessScore}%</div>
          <p className="text-[10px] text-foreground/50 mt-0.5">Measures uniformity in sentence length.</p>
        </div>

        <div className="p-2.5 rounded-md border border-surface-border bg-surface">
          <div className="text-foreground/60 font-medium">Stock Phrasing Density</div>
          <div className="text-sm font-bold text-foreground mt-0.5">{analysis.formalClichéDensity}%</div>
          <p className="text-[10px] text-foreground/50 mt-0.5">Frequent formulaic transitions & phrases.</p>
        </div>

        <div className="p-2.5 rounded-md border border-surface-border bg-surface">
          <div className="text-foreground/60 font-medium">Transition Opener Ratio</div>
          <div className="text-sm font-bold text-foreground mt-0.5">{analysis.transitionWordDensity}%</div>
          <p className="text-[10px] text-foreground/50 mt-0.5">Frequency of &quot;Furthermore&quot;, &quot;Moreover&quot;, etc.</p>
        </div>

        <div className="p-2.5 rounded-md border border-surface-border bg-surface">
          <div className="text-foreground/60 font-medium">Structural Repetition</div>
          <div className="text-sm font-bold text-foreground mt-0.5">{analysis.repetitiveStructureScore}%</div>
          <p className="text-[10px] text-foreground/50 mt-0.5">Identical sentence start sequences.</p>
        </div>
      </div>

      {/* Observed Patterns */}
      <div className="p-3 rounded-md border border-surface-border bg-surface space-y-1.5">
        <div className="font-semibold text-foreground flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-brand-500" />
          Observed Stylistic Patterns
        </div>
        <ul className="space-y-1 text-foreground/75 text-[11px] list-disc pl-4">
          {analysis.detectedPatterns.map((pattern, idx) => (
            <li key={idx}>{pattern}</li>
          ))}
        </ul>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="p-3 rounded-md bg-amber-50/70 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200/90 space-y-1">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          Notice on AI Detection Limitations
        </div>
        <p className="leading-relaxed opacity-90">{analysis.disclaimer}</p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { analyzeAIWritingIndicators } from "@/lib/analysis/heuristics";
import { Info, ShieldAlert } from "lucide-react";

export interface AIDetectorToolProps {
  text?: string;
  currentText?: string;
}

export function AIDetectorTool({ text, currentText }: AIDetectorToolProps) {
  const content = text || currentText || "";
  const analysis = analyzeAIWritingIndicators(content);

  return (
    <div className="space-y-3 text-xs font-mono">
      {/* Metric Gauge Card */}
      <div className="p-3.5 border border-line bg-bg-raised text-center space-y-2">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted mb-1">
          <span>AI HEURISTIC INDEX</span>
          <span className="border border-line px-1.5 py-0.5 text-ink">
            {analysis.overallAssessment}
          </span>
        </div>

        <div className="flex items-baseline justify-center gap-1 font-display">
          <span className="text-3xl font-bold tracking-tight text-ink">
            {analysis.overallIndicatorScore}
          </span>
          <span className="text-muted text-xs font-mono">/ 100</span>
        </div>

        <div className="w-full bg-line h-1 overflow-hidden">
          <div
            className="h-full bg-ink transition-all duration-300"
            style={{ width: `${analysis.overallIndicatorScore}%` }}
          />
        </div>

        <div className="text-[10px] text-muted font-sans pt-1 border-t border-line/50">
          Weighted index: 35% Uniformity + 35% Stock phrasing + 20% Transition openers + 10% Repetition structure.
        </div>
      </div>

      {/* Heuristic Breakdown Grid */}
      <div className="hairline-grid grid-cols-2 text-[10px]">
        <div className="p-2.5 bg-bg">
          <div className="text-muted uppercase tracking-wider">UNIFORMITY</div>
          <div className="text-sm font-bold text-ink mt-0.5">{analysis.burstinessScore}%</div>
          <p className="font-sans text-[10px] text-muted mt-0.5">Low sentence length variance.</p>
        </div>

        <div className="p-2.5 bg-bg">
          <div className="text-muted uppercase tracking-wider">STOCK PHRASING</div>
          <div className="text-sm font-bold text-ink mt-0.5">{analysis.formalClichéDensity}%</div>
          <p className="font-sans text-[10px] text-muted mt-0.5">Formulaic transition density.</p>
        </div>

        <div className="p-2.5 bg-bg">
          <div className="text-muted uppercase tracking-wider">TRANSITION OPENERS</div>
          <div className="text-sm font-bold text-ink mt-0.5">{analysis.transitionWordDensity}%</div>
          <p className="font-sans text-[10px] text-muted mt-0.5">Frequency of transition openers.</p>
        </div>

        <div className="p-2.5 bg-bg">
          <div className="text-muted uppercase tracking-wider">REPETITION</div>
          <div className="text-sm font-bold text-ink mt-0.5">{analysis.repetitiveStructureScore}%</div>
          <p className="font-sans text-[10px] text-muted mt-0.5">Repeated clause starts.</p>
        </div>
      </div>

      {/* Observed Patterns */}
      <div className="p-3 border border-line bg-bg space-y-1.5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink flex items-center gap-1.5">
          <Info className="h-3 w-3 text-accent" />
          <span>OBSERVED STYLISTIC PATTERNS</span>
        </div>
        <ul className="space-y-1 text-muted text-[11px] font-sans list-disc pl-4">
          {analysis.detectedPatterns.map((pattern, idx) => (
            <li key={idx}>{pattern}</li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="p-2.5 border border-line bg-bg-sunken/40 text-muted font-sans text-[10px] leading-relaxed">
        <ShieldAlert className="h-3 w-3 text-muted inline mr-1" />
        Heuristic indicators evaluate statistical uniformity and cliches. They do not constitute definitive proof of machine generation.
      </div>
    </div>
  );
}

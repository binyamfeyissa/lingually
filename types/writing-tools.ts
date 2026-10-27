export type WritingToolId =
  | "grammar"
  | "paraphrase"
  | "tone"
  | "summarize"
  | "improve"
  | "custom"
  | "spelling"
  | "shorten-expand"
  | "translate"
  | "ai-detector"
  | "statistics";

export type ParaphraseMode =
  | "standard"
  | "fluent"
  | "formal"
  | "simple"
  | "creative"
  | "concise"
  | "expanded";

export type ToneType =
  | "professional"
  | "friendly"
  | "formal"
  | "casual"
  | "academic"
  | "persuasive"
  | "empathetic"
  | "confident"
  | "diplomatic"
  | "neutral";

export type SummaryFormat =
  | "short"
  | "detailed"
  | "bullet-points"
  | "executive"
  | "key-takeaways";

export type ImprovementFocus =
  | "all"
  | "clarity"
  | "conciseness"
  | "flow"
  | "word-choice"
  | "transitions"
  | "redundancy";

export type ShortenExpandMode = "shorten" | "expand";

export interface GrammarChange {
  original: string;
  replacement: string;
  explanation: string;
  category: "grammar" | "spelling" | "punctuation" | "agreement" | "structure" | "word-choice";
  offset?: number;
}

export interface GrammarResult {
  correctedText: string;
  changes: GrammarChange[];
  summary?: string;
}

export interface RewriteAlternative {
  id: string;
  text: string;
  label?: string;
  explanation?: string;
}

export interface AIResult {
  toolId: WritingToolId;
  originalText: string;
  generatedText: string;
  alternatives?: RewriteAlternative[];
  grammarData?: GrammarResult;
  modelUsed?: string;
  timestamp: number;
  selectionOnly: boolean;
}

export type SuggestionCategory = "correctness" | "clarity" | "engagement" | "delivery";

export interface WritingSuggestion {
  id: string;
  category: SuggestionCategory;
  originalText: string;
  replacementText: string;
  explanation: string;
  offset: number;
  length: number;
  ruleId: string;
  severity: "error" | "warning" | "info";
  ignored?: boolean;
}

export type AudienceLevel = "general" | "knowledgeable" | "expert";
export type FormalityLevel = "informal" | "neutral" | "formal";
export type WritingDomain = "general" | "academic" | "business" | "technical" | "casual" | "creative";
export type WritingIntent = "inform" | "describe" | "convince" | "story";

export interface WritingGoals {
  audience: AudienceLevel;
  formality: FormalityLevel;
  domain: WritingDomain;
  intent: WritingIntent;
}

export interface PlagiarismMatch {
  id: string;
  matchedText: string;
  similarityPercentage: number;
  sourceTitle: string;
  sourceUrl: string;
  matchContext: string;
  offset: number;
  length: number;
}

export interface PlagiarismReport {
  overallSimilarityPercentage: number;
  totalWords: number;
  matchedWords: number;
  matches: PlagiarismMatch[];
  checkedAt: number;
  isSearchApiConfigured: boolean;
  sourceCoverageNotice: string;
  summary: string;
}

export interface LayeredCheckResult {
  suggestions: WritingSuggestion[];
  countsByCategory: Record<SuggestionCategory, number>;
  totalIssues: number;
  overallScore: number; // 0 - 100 calculated score
  layerACount: number; // Local deterministic
  layerBCount: number; // AI-assisted
  checkedAt: number;
}

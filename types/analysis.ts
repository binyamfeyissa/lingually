export interface TextStatistics {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  averageWordsPerSentence: number;
  averageCharactersPerWord: number;
  readingTimeMinutes: number; // calculated at ~200 wpm
  speakingTimeMinutes: number; // calculated at ~130 wpm
  uniqueWordCount: number;
  lexicalDiversity: number; // Type-Token Ratio (0 - 1)
  frequentWords: Array<{ word: string; count: number }>;
}

export interface ReadabilityMetrics {
  fleschReadingEase: number; // 0 - 100
  fleschKincaidGradeLevel: number;
  colemanLiauIndex: number;
  gunningFogIndex: number;
  readingEaseLabel: "Very Easy" | "Easy" | "Fairly Easy" | "Standard" | "Fairly Difficult" | "Difficult" | "Very Confusing";
  gradeLevelLabel: string;
  isReliableForLanguage: boolean;
  languageNote: string;
}

export interface AIWritingIndicators {
  burstinessScore: number; // Variance in sentence length (0 - 100). AI often has very uniform sentence lengths.
  lexicalUniformityScore: number; // 0 - 100
  formalClichéDensity: number; // occurrences of phrases like "delve into", "it is important to note", etc.
  transitionWordDensity: number; // percentage of sentences starting with transition adverbs
  repetitiveStructureScore: number;
  overallIndicatorScore: number; // 0 - 100
  overallAssessment: "Low AI writing indicators" | "Moderate AI writing indicators" | "Elevated AI writing indicators";
  detectedPatterns: string[];
  disclaimer: string;
}

export interface ComprehensiveAnalysis {
  statistics: TextStatistics;
  readability: ReadabilityMetrics;
  aiIndicators: AIWritingIndicators;
}

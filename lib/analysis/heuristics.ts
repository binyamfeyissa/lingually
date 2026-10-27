import { AIWritingIndicators } from "@/types/analysis";

const LLM_CLICHE_PHRASES = [
  "delve into",
  "delving into",
  "a testament to",
  "tapestry of",
  "rich tapestry",
  "it is important to note",
  "it's worth noting",
  "in conclusion",
  "in summary",
  "beacon of",
  "crucial role",
  "plays a vital role",
  "foster a sense",
  "fosters a sense",
  "navigating the complexities",
  "multifaceted nature",
  "underscores the importance",
  "pivotal role",
  "in today's fast-paced world",
  "in the digital age",
  "not only",
  "at its core",
  "furthermore",
  "moreover",
  "subsequently",
  "consequently",
  "holistic approach",
  "ever-evolving landscape",
];

const TRANSITION_OPENERS = [
  "furthermore",
  "moreover",
  "additionally",
  "in addition",
  "consequently",
  "therefore",
  "thus",
  "in conclusion",
  "overall",
  "specifically",
  "notably",
  "importantly",
  "significantly",
];

/**
 * Calculates local, transparent heuristic indicators commonly associated with
 * formulaic or generated text (such as low burstiness and common tropes).
 *
 * NOTE: This is NEVER a definitive AI detector. Human and AI styles overlap heavily.
 */
export function analyzeAIWritingIndicators(text: string): AIWritingIndicators {
  const disclaimer =
    "EXPERIMENTAL HEURISTIC ONLY: Statistical text indicators (such as sentence variance, transition density, and common tropes) are not definitive proof of AI generation or human authorship. Professional human writing and machine outputs overlap extensively. Do not use this analysis for academic, grading, disciplinary, or commercial determinations.";

  const trimmed = text.trim();
  if (!trimmed || trimmed.split(/\s+/).length < 20) {
    return {
      burstinessScore: 50,
      lexicalUniformityScore: 50,
      formalClichéDensity: 0,
      transitionWordDensity: 0,
      repetitiveStructureScore: 0,
      overallIndicatorScore: 0,
      overallAssessment: "Low AI writing indicators",
      detectedPatterns: ["Text is too brief for statistical pattern heuristics (minimum 20 words required)."],
      disclaimer,
    };
  }

  const detectedPatterns: string[] = [];

  // 1. Sentences & Burstiness (Variance in sentence length)
  const sentences = trimmed
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sentenceLengths = sentences.map((s) => (s.match(/\b\w+\b/g) || []).length);
  const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / Math.max(1, sentenceLengths.length);

  // Standard deviation of sentence lengths
  const variance =
    sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgLen, 2), 0) /
    Math.max(1, sentenceLengths.length);
  const stdDev = Math.sqrt(variance);

  // Human writing typically has high burstiness (stdDev > 7). Uniform sentence lengths yield low stdDev.
  // We map lower stdDev (less variation) to higher AI indicator score.
  let burstinessIndicator = Math.max(0, Math.min(100, Math.round(100 - (stdDev / 10) * 100)));
  if (stdDev < 4 && sentences.length >= 4) {
    detectedPatterns.push("Low sentence length variation (uniform pacing across sentences)");
  }

  // 2. Cliché and stock phrases detection
  const lowerText = trimmed.toLowerCase();
  let clicheCount = 0;
  const foundCliches: string[] = [];

  for (const phrase of LLM_CLICHE_PHRASES) {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) {
      clicheCount += matches.length;
      if (foundCliches.length < 5) {
        foundCliches.push(`"${phrase}"`);
      }
    }
  }

  const wordCount = (trimmed.match(/\b\w+\b/g) || []).length;
  const clichePer100Words = (clicheCount / Math.max(1, wordCount)) * 100;
  const formalClichéDensity = Math.min(100, Math.round(clichePer100Words * 25));

  if (foundCliches.length > 0) {
    detectedPatterns.push(`Frequently observed formulaic phrases: ${foundCliches.join(", ")}`);
  }

  // 3. Transition word openers
  let transitionOpenerCount = 0;
  for (const s of sentences) {
    const firstWord = (s.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "");
    if (TRANSITION_OPENERS.includes(firstWord)) {
      transitionOpenerCount++;
    }
  }

  const transitionPercentage = (transitionOpenerCount / Math.max(1, sentences.length)) * 100;
  const transitionWordDensity = Math.min(100, Math.round(transitionPercentage * 2.5));

  if (transitionPercentage > 30 && sentences.length >= 3) {
    detectedPatterns.push("High density of formal transitional opening adverbs (Moreover, Furthermore, etc.)");
  }

  // 4. Repetitive sentence starts
  let consecutiveSameStarts = 0;
  for (let i = 1; i < sentences.length; i++) {
    const prevStart = (sentences[i - 1].split(/\s+/)[0] || "").toLowerCase();
    const currStart = (sentences[i].split(/\s+/)[0] || "").toLowerCase();
    if (prevStart === currStart && prevStart.length > 2) {
      consecutiveSameStarts++;
    }
  }
  const repetitiveStructureScore = Math.min(100, Math.round((consecutiveSameStarts / Math.max(1, sentences.length)) * 100));

  // 5. Lexical Uniformity
  const words = lowerText.match(/[a-z]+/g) || [];
  const uniqueWords = new Set(words);
  const ttr = uniqueWords.size / Math.max(1, words.length); // Type-token ratio
  const lexicalUniformityScore = Math.min(100, Math.max(0, Math.round((1 - ttr) * 100)));

  // Combined score (weighted)
  const overallIndicatorScore = Math.min(
    100,
    Math.round(
      burstinessIndicator * 0.35 +
      formalClichéDensity * 0.35 +
      transitionWordDensity * 0.2 +
      repetitiveStructureScore * 0.1
    )
  );

  let overallAssessment: AIWritingIndicators["overallAssessment"] = "Low AI writing indicators";
  if (overallIndicatorScore >= 65) {
    overallAssessment = "Elevated AI writing indicators";
  } else if (overallIndicatorScore >= 35) {
    overallAssessment = "Moderate AI writing indicators";
  }

  if (detectedPatterns.length === 0) {
    detectedPatterns.push("Natural sentence pacing and varied conversational structure detected.");
  }

  return {
    burstinessScore: burstinessIndicator,
    lexicalUniformityScore,
    formalClichéDensity,
    transitionWordDensity,
    repetitiveStructureScore,
    overallIndicatorScore,
    overallAssessment,
    detectedPatterns,
    disclaimer,
  };
}

import { ReadabilityMetrics } from "@/types/analysis";

/**
 * Counts syllables in an English word using phonetic heuristics.
 */
export function countSyllablesInWord(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  // Remove common endings that don't add syllables
  let processed = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, "")
    .replace(/^y/, "");

  // Match vowel sequences
  const vowelMatches = processed.match(/[aeiouy]{1,2}/g);
  return vowelMatches ? Math.max(1, vowelMatches.length) : 1;
}

/**
 * Checks if the text appears to be primarily English or Latin script.
 * Flesch and Kincaid metrics are calibrated strictly on English text.
 */
export function isLikelyEnglishText(text: string): boolean {
  if (!text || text.trim().length === 0) return true;

  // Check for non-Latin scripts (CJK, Arabic, Cyrillic, Devanagari, etc.)
  const nonLatinMatch = text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Arabic}\p{Script=Cyrillic}\p{Script=Devanagari}]/u);
  if (nonLatinMatch) {
    return false;
  }

  // Check proportion of standard ASCII/Latin characters
  const latinChars = text.match(/[a-zA-Z]/g) || [];
  const totalLetters = text.match(/\p{L}/gu) || [];
  if (totalLetters.length > 0 && latinChars.length / totalLetters.length < 0.75) {
    return false;
  }

  return true;
}

/**
 * Computes deterministic readability metrics.
 */
export function calculateReadability(text: string): ReadabilityMetrics {
  const isEnglish = isLikelyEnglishText(text);

  if (!isEnglish) {
    return {
      fleschReadingEase: 0,
      fleschKincaidGradeLevel: 0,
      colemanLiauIndex: 0,
      gunningFogIndex: 0,
      readingEaseLabel: "Standard",
      gradeLevelLabel: "N/A",
      isReliableForLanguage: false,
      languageNote: "Readability formulas (Flesch-Kincaid, Gunning Fog) are calibrated exclusively for English. Metrics are unavailable for this language script.",
    };
  }

  const words = text.toLowerCase().match(/[a-z'’]+/g) || [];
  const wordCount = words.length;

  if (wordCount < 5) {
    return {
      fleschReadingEase: 100,
      fleschKincaidGradeLevel: 1,
      colemanLiauIndex: 1,
      gunningFogIndex: 1,
      readingEaseLabel: "Very Easy",
      gradeLevelLabel: "Grade 1 or below (too short to reliably score)",
      isReliableForLanguage: true,
      languageNote: "Text is too short for accurate statistical readability scoring.",
    };
  }

  const sentences = text.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  let totalSyllables = 0;
  let complexWordCount = 0; // 3 or more syllables

  for (const word of words) {
    const syllables = countSyllablesInWord(word);
    totalSyllables += syllables;
    if (syllables >= 3) {
      complexWordCount++;
    }
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = totalSyllables / wordCount;

  // 1. Flesch Reading Ease Formula: 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  let flesch = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  flesch = Math.max(0, Math.min(100, Number(flesch.toFixed(1))));

  // 2. Flesch-Kincaid Grade Level: 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  let fkGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  fkGrade = Math.max(0, Number(fkGrade.toFixed(1)));

  // 3. Coleman-Liau: 0.0588 * L - 0.296 * S - 15.8
  const letterCount = words.join("").length;
  const L = (letterCount / wordCount) * 100;
  const S = (sentenceCount / wordCount) * 100;
  let coleman = 0.0588 * L - 0.296 * S - 15.8;
  coleman = Math.max(0, Number(coleman.toFixed(1)));

  // 4. Gunning Fog: 0.4 * ((words / sentences) + 100 * (complex_words / words))
  const percentageComplexWords = (complexWordCount / wordCount) * 100;
  let fog = 0.4 * (wordsPerSentence + percentageComplexWords);
  fog = Math.max(0, Number(fog.toFixed(1)));

  // Reading Ease interpretation
  let readingEaseLabel: ReadabilityMetrics["readingEaseLabel"] = "Standard";
  if (flesch >= 90) readingEaseLabel = "Very Easy";
  else if (flesch >= 80) readingEaseLabel = "Easy";
  else if (flesch >= 70) readingEaseLabel = "Fairly Easy";
  else if (flesch >= 60) readingEaseLabel = "Standard";
  else if (flesch >= 50) readingEaseLabel = "Fairly Difficult";
  else if (flesch >= 30) readingEaseLabel = "Difficult";
  else readingEaseLabel = "Very Confusing";

  // Grade level interpretation
  let gradeLevelLabel = `Grade ${Math.round(fkGrade)}`;
  if (fkGrade <= 5) gradeLevelLabel = `Grade ${Math.round(fkGrade)} (Elementary School)`;
  else if (fkGrade <= 8) gradeLevelLabel = `Grade ${Math.round(fkGrade)} (Middle School)`;
  else if (fkGrade <= 12) gradeLevelLabel = `Grade ${Math.round(fkGrade)} (High School)`;
  else if (fkGrade <= 16) gradeLevelLabel = `Grade ${Math.round(fkGrade)} (College / Undergraduate)`;
  else gradeLevelLabel = `Grade ${Math.round(fkGrade)} (Post-Graduate / Professional)`;

  return {
    fleschReadingEase: flesch,
    fleschKincaidGradeLevel: fkGrade,
    colemanLiauIndex: coleman,
    gunningFogIndex: fog,
    readingEaseLabel,
    gradeLevelLabel,
    isReliableForLanguage: true,
    languageNote: "Calibrated for English prose. Scoring reflects readability formulas based on sentence length and syllable distribution.",
  };
}

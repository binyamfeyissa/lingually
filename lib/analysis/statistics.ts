import { TextStatistics } from "@/types/analysis";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "because", "as", "what",
  "which", "this", "that", "these", "those", "then", "just", "so", "than",
  "such", "both", "through", "about", "for", "is", "of", "while", "during",
  "to", "from", "in", "out", "on", "off", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "any",
  "both", "each", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can",
  "will", "don't", "should", "now", "i", "you", "he", "she", "it", "we",
  "they", "me", "him", "her", "us", "them", "my", "your", "his", "their",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "at",
  "by", "with", "into", "through", "above", "below", "up", "down", "are", "was", "were"
]);

/**
 * Calculates deterministic text statistics locally without any network or AI dependencies.
 */
export function calculateTextStatistics(text: string): TextStatistics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      characterCount: 0,
      characterCountNoSpaces: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      averageWordsPerSentence: 0,
      averageCharactersPerWord: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      uniqueWordCount: 0,
      lexicalDiversity: 0,
      frequentWords: [],
    };
  }

  const characterCount = text.length;
  const characterCountNoSpaces = text.replace(/\s/g, "").length;

  // Split into words (Unicode-aware word matching)
  const words = trimmed
    .toLowerCase()
    .match(/[\p{L}\p{N}'’]+/gu) || [];
  
  const wordCount = words.length;

  // Sentences: match punctuation followed by whitespace or end of string.
  // Handles common abbreviations heuristically while correctly counting segments
  // even if the subsequent word begins in lowercase (Bug 26).
  const normalized = trimmed.replace(/\b(mr|mrs|ms|dr|prof|sr|jr|vs|etc|e\.g|i\.e)\./gi, "$1_DOT_");
  // Expand missing spaces after period between words (e.g. "red.because"), excluding known web domains and file extensions (Bug 26)
  const normalizedWithSpaces = normalized.replace(
    /(?<=[a-zA-Z]{2,})\.(?=[a-zA-Z]{2,})/g,
    (match, offset, str) => {
      const rest = str.slice(offset + 1);
      if (/^(com|org|net|edu|gov|io|ai|co|uk|app|dev|html|json|png|jpg|pdf)\b/i.test(rest)) {
        return ".";
      }
      return ". ";
    }
  );
  const rawSentences = normalizedWithSpaces
    .split(/(?<=[.?!])\s+/)
    .filter((s) => s.trim().length > 0);
  
  const sentenceCount = Math.max(1, rawSentences.length);

  // Paragraphs: split by two or more newlines or non-empty block breaks
  const paragraphs = trimmed
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);
  
  const paragraphCount = Math.max(1, paragraphs.length);

  const averageWordsPerSentence = wordCount > 0
    ? Number((wordCount / sentenceCount).toFixed(1))
    : 0;

  const totalWordChars = words.reduce((acc, w) => acc + w.length, 0);
  const averageCharactersPerWord = wordCount > 0
    ? Number((totalWordChars / wordCount).toFixed(1))
    : 0;

  // Reading time: standard average 200 words per minute
  const readingTimeMinutes = Number((wordCount / 200).toFixed(1));
  // Speaking time: standard average 130 words per minute
  const speakingTimeMinutes = Number((wordCount / 130).toFixed(1));

  // Word frequency map & unique words
  const frequencyMap = new Map<string, number>();
  for (const word of words) {
    const cleanWord = word.replace(/^['’]+|['’]+$/g, "");
    if (cleanWord.length > 1) {
      frequencyMap.set(cleanWord, (frequencyMap.get(cleanWord) || 0) + 1);
    }
  }

  const uniqueWordCount = frequencyMap.size;
  const lexicalDiversity = wordCount > 0
    ? Number((uniqueWordCount / wordCount).toFixed(2))
    : 0;

  // Frequent non-stop words
  const frequentWords = Array.from(frequencyMap.entries())
    .filter(([word]) => !STOP_WORDS.has(word) && word.length > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  return {
    wordCount,
    characterCount,
    characterCountNoSpaces,
    sentenceCount,
    paragraphCount,
    averageWordsPerSentence,
    averageCharactersPerWord,
    readingTimeMinutes,
    speakingTimeMinutes,
    uniqueWordCount,
    lexicalDiversity,
    frequentWords,
  };
}

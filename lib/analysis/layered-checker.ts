import {
  SuggestionCategory,
  WritingSuggestion,
  LayeredCheckResult,
} from "@/types/suggestions";

// Layer A: Common deterministic spelling / typographical corrections
const DETERMINISTIC_TYPOS: Record<string, { replacement: string; explanation: string }> = {
  teh: { replacement: "the", explanation: "Corrects typographical inversion." },
  recieve: { replacement: "receive", explanation: "Remember 'i' before 'e' except after 'c'." },
  seperate: { replacement: "separate", explanation: "Correct spelling contains 'para'." },
  definately: { replacement: "definitely", explanation: "Derived from 'finite'." },
  occured: { replacement: "occurred", explanation: "Double 'r' in occurred." },
  untill: { replacement: "until", explanation: "Until has a single 'l'." },
  truely: { replacement: "truly", explanation: "Drop the 'e' in truly." },
  wierd: { replacement: "weird", explanation: "Exception to the 'i before e' rule." },
  acheive: { replacement: "achieve", explanation: "'i' before 'e' in achieve." },
  goverment: { replacement: "government", explanation: "Includes 'n' from govern." },
  tommorrow: { replacement: "tomorrow", explanation: "One 'm', double 'r'." },
  alot: { replacement: "a lot", explanation: "'A lot' is two separate words." },
  noone: { replacement: "no one", explanation: "'No one' is written as two separate words." },
  beleive: { replacement: "believe", explanation: "'i' before 'e' in believe." },
  calender: { replacement: "calendar", explanation: "Spelled with 'ar' at the end." },
  accomodate: { replacement: "accommodate", explanation: "Double 'c' and double 'm'." },
  neccessary: { replacement: "necessary", explanation: "One 'c', double 's'." },
  embarass: { replacement: "embarrass", explanation: "Double 'r' and double 's'." },
};

// Layer A: Common grammatical confusions
const DETERMINISTIC_CONFUSIONS: Array<{
  pattern: RegExp;
  replacement: string;
  explanation: string;
}> = [
  { pattern: /\bcould of\b/gi, replacement: "could have", explanation: "Use 'could have' instead of 'could of'." },
  { pattern: /\bshould of\b/gi, replacement: "should have", explanation: "Use 'should have' instead of 'should of'." },
  { pattern: /\bwould of\b/gi, replacement: "would have", explanation: "Use 'would have' instead of 'would of'." },
  { pattern: /\bsuppose to\b/gi, replacement: "supposed to", explanation: "The past participle 'supposed to' is required." },
  { pattern: /\buse to\b/gi, replacement: "used to", explanation: "The idiom is 'used to'." },
  { pattern: /\beach others\b/gi, replacement: "each other's", explanation: "Add an apostrophe for possessive 'each other's'." },
];

// Layer A: Clarity & Conciseness patterns
const DETERMINISTIC_CLARITY: Array<{
  pattern: RegExp;
  replacement: string;
  explanation: string;
}> = [
  { pattern: /\bin order to\b/gi, replacement: "to", explanation: "Simplify 'in order to' to simply 'to'." },
  { pattern: /\bat this point in time\b/gi, replacement: "now", explanation: "Concise alternative: 'now' or 'currently'." },
  { pattern: /\bdue to the fact that\b/gi, replacement: "because", explanation: "Simplify wordy phrase to 'because'." },
  { pattern: /\bhas the ability to\b/gi, replacement: "can", explanation: "Direct verb 'can' improves conciseness." },
  { pattern: /\bfor the purpose of\b/gi, replacement: "for", explanation: "Streamline 'for the purpose of' to 'for'." },
  { pattern: /\bin the event that\b/gi, replacement: "if", explanation: "Use 'if' for immediate clarity." },
  { pattern: /\ba large number of\b/gi, replacement: "many", explanation: "More direct and concise: 'many'." },
  { pattern: /\butilize\b/gi, replacement: "use", explanation: "'Use' is more direct than 'utilize'." },
  { pattern: /\butilizes\b/gi, replacement: "uses", explanation: "'Uses' is clearer than 'utilizes'." },
];

// Layer A: Engagement & Vocabulary variety
const DETERMINISTIC_ENGAGEMENT: Array<{
  pattern: RegExp;
  replacement: string;
  explanation: string;
}> = [
  { pattern: /\bvery good\b/gi, replacement: "exceptional", explanation: "Vivid alternative: 'exceptional' or 'superb'." },
  { pattern: /\bvery bad\b/gi, replacement: "terrible", explanation: "Expressive alternative: 'terrible' or 'dreadful'." },
  { pattern: /\bvery big\b/gi, replacement: "massive", explanation: "More vivid adjective: 'massive' or 'vast'." },
  { pattern: /\bvery small\b/gi, replacement: "tiny", explanation: "Dynamic alternative: 'tiny' or 'minuscule'." },
  { pattern: /\bvery important\b/gi, replacement: "crucial", explanation: "Stronger emphasis: 'crucial' or 'essential'." },
  { pattern: /\bvery hard\b/gi, replacement: "challenging", explanation: "Refined adjective: 'demanding' or 'challenging'." },
];

// Layer A: Delivery & Tone
const DETERMINISTIC_DELIVERY: Array<{
  pattern: RegExp;
  replacement: string;
  explanation: string;
}> = [
  { pattern: /\bI think that maybe\b/gi, replacement: "Perhaps", explanation: "Removes weak hedging for a more confident tone." },
  { pattern: /\bneedless to say\b/gi, replacement: "", explanation: "If it is needless to say, omit the phrase entirely." },
  { pattern: /\bjust wanted to\b/gi, replacement: "wanted to", explanation: "'Just' can sound overly apologetic in professional delivery." },
];

/**
 * Runs Layer A (instant local deterministic checks).
 */
export function runLocalDeterministicCheck(
  text: string,
  personalDictionary: Set<string> = new Set()
): WritingSuggestion[] {
  if (!text || text.trim().length === 0) return [];

  const suggestions: WritingSuggestion[] = [];
  let idCounter = 1;

  // 1. Repeated words check (e.g. "the the")
  const repeatedRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
  let match: RegExpExecArray | null;
  while ((match = repeatedRegex.exec(text)) !== null) {
    const word = match[1];
    if (!personalDictionary.has(word.toLowerCase())) {
      suggestions.push({
        id: `det_rep_${idCounter++}`,
        category: "correctness",
        originalText: match[0],
        replacementText: word,
        explanation: `Repeated word: remove the duplicate "${word}".`,
        offset: match.index,
        length: match[0].length,
        ruleId: "repeated_word",
        severity: "error",
      });
    }
  }

  // 2. Common Typos check
  const wordRegex = /\b[a-zA-Z]+\b/g;
  while ((match = wordRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const lower = rawWord.toLowerCase();

    if (personalDictionary.has(lower)) continue;

    if (DETERMINISTIC_TYPOS[lower]) {
      const entry = DETERMINISTIC_TYPOS[lower];
      // Preserve uppercase start if original was capitalized
      const isCapitalized = rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase();
      const replacement = isCapitalized
        ? entry.replacement.charAt(0).toUpperCase() + entry.replacement.slice(1)
        : entry.replacement;

      suggestions.push({
        id: `det_typo_${idCounter++}`,
        category: "correctness",
        originalText: rawWord,
        replacementText: replacement,
        explanation: entry.explanation,
        offset: match.index,
        length: rawWord.length,
        ruleId: "spelling_typo",
        severity: "error",
      });
    }
  }

  // 3. Grammar Confusions
  for (const item of DETERMINISTIC_CONFUSIONS) {
    while ((match = item.pattern.exec(text)) !== null) {
      suggestions.push({
        id: `det_conf_${idCounter++}`,
        category: "correctness",
        originalText: match[0],
        replacementText: item.replacement,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
        ruleId: "grammar_confusion",
        severity: "error",
      });
    }
  }

  // 4. Clarity & Conciseness
  for (const item of DETERMINISTIC_CLARITY) {
    while ((match = item.pattern.exec(text)) !== null) {
      suggestions.push({
        id: `det_clarity_${idCounter++}`,
        category: "clarity",
        originalText: match[0],
        replacementText: item.replacement,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
        ruleId: "clarity_conciseness",
        severity: "warning",
      });
    }
  }

  // 5. Engagement
  for (const item of DETERMINISTIC_ENGAGEMENT) {
    while ((match = item.pattern.exec(text)) !== null) {
      suggestions.push({
        id: `det_eng_${idCounter++}`,
        category: "engagement",
        originalText: match[0],
        replacementText: item.replacement,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
        ruleId: "engagement_variety",
        severity: "info",
      });
    }
  }

  // 6. Delivery
  for (const item of DETERMINISTIC_DELIVERY) {
    while ((match = item.pattern.exec(text)) !== null) {
      suggestions.push({
        id: `det_del_${idCounter++}`,
        category: "delivery",
        originalText: match[0],
        replacementText: item.replacement,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
        ruleId: "delivery_tone",
        severity: "info",
      });
    }
  }

  // Deduplicate and sort by offset ascending
  const seenOffsets = new Set<number>();
  return suggestions
    .filter((s) => {
      if (seenOffsets.has(s.offset)) return false;
      seenOffsets.add(s.offset);
      return true;
    })
    .sort((a, b) => a.offset - b.offset);
}

/**
 * Combines Layer A and Layer B suggestions, computes category breakdowns,
 * and derives an honest writing score.
 */
export function compileLayeredCheckResult(
  text: string,
  layerASuggestions: WritingSuggestion[],
  layerBSuggestions: WritingSuggestion[] = []
): LayeredCheckResult {
  const merged = [...layerASuggestions];
  const occupiedRanges: Array<{ start: number; end: number }> = layerASuggestions.map((s) => ({
    start: s.offset,
    end: s.offset + s.length,
  }));

  // Add Layer B suggestions that do not overlap existing Layer A suggestions
  for (const b of layerBSuggestions) {
    const bStart = b.offset;
    const bEnd = b.offset + b.length;
    const overlaps = occupiedRanges.some(
      (r) => (bStart >= r.start && bStart < r.end) || (bEnd > r.start && bEnd <= r.end)
    );
    if (!overlaps) {
      merged.push(b);
      occupiedRanges.push({ start: bStart, end: bEnd });
    }
  }

  merged.sort((a, b) => a.offset - b.offset);

  const countsByCategory: Record<SuggestionCategory, number> = {
    correctness: 0,
    clarity: 0,
    engagement: 0,
    delivery: 0,
  };

  for (const s of merged) {
    if (!s.ignored) {
      countsByCategory[s.category] = (countsByCategory[s.category] || 0) + 1;
    }
  }

  const totalIssues =
    countsByCategory.correctness +
    countsByCategory.clarity +
    countsByCategory.engagement +
    countsByCategory.delivery;

  // Calculate overall writing score based on issue density per 100 words
  const words = (text.trim().match(/\b\w+\b/g) || []).length;
  let overallScore = 100;
  if (words > 0) {
    const penaltyPerIssue = 4;
    const totalPenalty = Math.min(60, totalIssues * penaltyPerIssue);
    overallScore = Math.max(40, 100 - totalPenalty);
  }

  return {
    suggestions: merged,
    countsByCategory,
    totalIssues,
    overallScore,
    layerACount: layerASuggestions.length,
    layerBCount: layerBSuggestions.length,
    checkedAt: Date.now(),
  };
}

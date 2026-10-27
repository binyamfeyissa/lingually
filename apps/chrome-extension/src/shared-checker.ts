/**
 * Shared Deterministic Checking Engine for Chrome Extension
 * Runs instantly without network requests.
 */

export type SuggestionCategory = "correctness" | "clarity" | "engagement" | "delivery";

export interface ExtensionSuggestion {
  id: string;
  category: SuggestionCategory;
  originalText: string;
  replacementText: string;
  explanation: string;
  offset: number;
  length: number;
}

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
  { pattern: /\bvery happy\b/gi, replacement: "ecstatic", explanation: "Evocative alternative: 'ecstatic' or 'thrilled'." },
  { pattern: /\bvery sad\b/gi, replacement: "devastated", explanation: "Expressive alternative: 'devastated' or 'heartbroken'." },
];

const DETERMINISTIC_DELIVERY: Array<{
  pattern: RegExp;
  replacement: string;
  explanation: string;
}> = [
  { pattern: /\bi think that\b/gi, replacement: "", explanation: "Stating facts directly sounds more confident." },
  { pattern: /\bjust wondering if\b/gi, replacement: "could you", explanation: "Direct phrasing sounds more professional." },
  { pattern: /\bsorry to bother you,?\b/gi, replacement: "", explanation: "Polite but unnecessary hedging." },
  { pattern: /\byou should probably consider\b/gi, replacement: "we recommend", explanation: "Decisive phrasing sounds authoritative." },
];

export function runExtensionCheck(
  text: string,
  personalDictionary: Set<string> = new Set()
): ExtensionSuggestion[] {
  const suggestions: ExtensionSuggestion[] = [];
  let idCounter = 1;

  if (!text || text.trim().length === 0) return suggestions;

  // 1. Repeated word check
  const repeatedRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
  let match: RegExpExecArray | null;
  while ((match = repeatedRegex.exec(text)) !== null) {
    const rawWord = match[1];
    suggestions.push({
      id: `ext_rep_${idCounter++}`,
      category: "correctness",
      originalText: match[0],
      replacementText: rawWord,
      explanation: `Repeated word '${rawWord}'. Remove the duplicate.`,
      offset: match.index,
      length: match[0].length,
    });
  }

  // 2. Typos check
  const wordRegex = /\b[a-zA-Z]+\b/g;
  while ((match = wordRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const lower = rawWord.toLowerCase();
    if (personalDictionary.has(lower)) continue;

    if (DETERMINISTIC_TYPOS[lower]) {
      const entry = DETERMINISTIC_TYPOS[lower];
      const isCapitalized = rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase();
      const replacement = isCapitalized
        ? entry.replacement.charAt(0).toUpperCase() + entry.replacement.slice(1)
        : entry.replacement;

      suggestions.push({
        id: `ext_typo_${idCounter++}`,
        category: "correctness",
        originalText: rawWord,
        replacementText: replacement,
        explanation: entry.explanation,
        offset: match.index,
        length: rawWord.length,
      });
    }
  }

  // 3. Grammar Confusions
  for (const item of DETERMINISTIC_CONFUSIONS) {
    while ((match = item.pattern.exec(text)) !== null) {
      suggestions.push({
        id: `ext_conf_${idCounter++}`,
        category: "correctness",
        originalText: match[0],
        replacementText: item.replacement,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
      });
    }
  }

  // 4. Clarity
  for (const item of DETERMINISTIC_CLARITY) {
    while ((match = item.pattern.exec(text)) !== null) {
      suggestions.push({
        id: `ext_clarity_${idCounter++}`,
        category: "clarity",
        originalText: match[0],
        replacementText: item.replacement,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
      });
    }
  }

  // 5. Engagement
  for (const item of DETERMINISTIC_ENGAGEMENT) {
    while ((match = item.pattern.exec(text)) !== null) {
      suggestions.push({
        id: `ext_eng_${idCounter++}`,
        category: "engagement",
        originalText: match[0],
        replacementText: item.replacement,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
      });
    }
  }

  // 6. Delivery
  for (const item of DETERMINISTIC_DELIVERY) {
    while ((match = item.pattern.exec(text)) !== null) {
      suggestions.push({
        id: `ext_del_${idCounter++}`,
        category: "delivery",
        originalText: match[0],
        replacementText: item.replacement,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
      });
    }
  }

  // Sort by offset
  return suggestions.sort((a, b) => a.offset - b.offset);
}

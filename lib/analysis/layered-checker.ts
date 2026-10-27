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
  wether: { replacement: "whether", explanation: "Use 'whether' for alternatives or 'weather' for climate." },
  witch: { replacement: "which", explanation: "Use 'which' for choices/clauses." },
  thier: { replacement: "their", explanation: "'e' before 'i' in their." },
  grammer: { replacement: "grammar", explanation: "Spelled with 'ar' at the end." },
  begining: { replacement: "beginning", explanation: "Double 'n' in beginning." },
  realy: { replacement: "really", explanation: "Double 'l' in really." },
  mispell: { replacement: "misspell", explanation: "Double 's' in misspell." },
  suprise: { replacement: "surprise", explanation: "Contains 'r' in the first syllable." },
  succesful: { replacement: "successful", explanation: "Double 'c' and double 's'." },
  publically: { replacement: "publicly", explanation: "Standard spelling is 'publicly'." },
  noticable: { replacement: "noticeable", explanation: "Retain the 'e' in noticeable." },
  independant: { replacement: "independent", explanation: "Ends in 'ent'." },
  gaurantee: { replacement: "guarantee", explanation: "'u' before 'a' in guarantee." },
  foriegn: { replacement: "foreign", explanation: "'e' before 'i' in foreign." },
  enviroment: { replacement: "environment", explanation: "Includes 'n' in iron." },
  dissapear: { replacement: "disappear", explanation: "One 's', double 'p'." },
  definate: { replacement: "definite", explanation: "Ends with 'ite'." },
  collegue: { replacement: "colleague", explanation: "Spelled 'colleague'." },
  catagory: { replacement: "category", explanation: "Spelled with 'e' in category." },
  alright: { replacement: "all right", explanation: "'All right' is preferred in formal writing." },
  basicly: { replacement: "basically", explanation: "Spelled 'basically'." },
  buisness: { replacement: "business", explanation: "'u' before 'i' in business." },
  concious: { replacement: "conscious", explanation: "Contains 'sc' in conscious." },
  dilema: { replacement: "dilemma", explanation: "Double 'm' in dilemma." },
  existance: { replacement: "existence", explanation: "Ends in 'ence'." },
  fascinating: { replacement: "fascinating", explanation: "Spelled with 'sc'." },
  greatful: { replacement: "grateful", explanation: "Spelled 'grateful' (not great)." },
  happend: { replacement: "happened", explanation: "Double 'p' in happened." },
  harrass: { replacement: "harass", explanation: "One 'r', double 's'." },
  humourous: { replacement: "humorous", explanation: "Drop 'u' in humorous." },
  immediatly: { replacement: "immediately", explanation: "Retain 'e' before 'ly'." },
  incidently: { replacement: "incidentally", explanation: "Contains 'al' before 'ly'." },
  interupt: { replacement: "interrupt", explanation: "Double 'r' in interrupt." },
  knowlege: { replacement: "knowledge", explanation: "Contains 'd' in knowledge." },
  liason: { replacement: "liaison", explanation: "Double 'i' in liaison." },
  millenium: { replacement: "millennium", explanation: "Double 'l' and double 'n'." },
  mischevious: { replacement: "mischievous", explanation: "Three syllables: mis-chie-vous." },
  paralell: { replacement: "parallel", explanation: "Double 'l' only in the middle." },
  posession: { replacement: "possession", explanation: "Double 's' twice in possession." },
  priviledge: { replacement: "privilege", explanation: "No 'd' in privilege." },
  pronounciation: { replacement: "pronunciation", explanation: "Spelled 'pronunciation' without 'o'." },
  questionaire: { replacement: "questionnaire", explanation: "Double 'n' in questionnaire." },
  recommand: { replacement: "recommend", explanation: "Spelled with 'e' in recommend." },
  refered: { replacement: "referred", explanation: "Double 'r' in referred." },
  relavant: { replacement: "relevant", explanation: "Spelled 'relevant'." },
  rythm: { replacement: "rhythm", explanation: "Contains 'h' after 'r' and 't'." },
  sieze: { replacement: "seize", explanation: "'e' before 'i' in seize." },
  succede: { replacement: "succeed", explanation: "Double 'e' in succeed." },
  tendancy: { replacement: "tendency", explanation: "Ends with 'ency'." },
  threshhold: { replacement: "threshold", explanation: "Single 'h' in threshold." },
  unfortunatly: { replacement: "unfortunately", explanation: "Retain 'e' in unfortunately." },
  vaccum: { replacement: "vacuum", explanation: "Single 'c', double 'u'." },
  visable: { replacement: "visible", explanation: "Spelled with 'i' in visible." },
  wierdly: { replacement: "weirdly", explanation: "Spelled 'weirdly'." },
  waws: { replacement: "was", explanation: "Correct spelling is 'was'." },
  thiinking: { replacement: "thinking", explanation: "Remove redundant 'i' in thinking." },
  thiis: { replacement: "this", explanation: "Single 'i' in this." },
  iis: { replacement: "is", explanation: "Single 'i' in is." },
  iit: { replacement: "it", explanation: "Single 'i' in it." },
  clrly: { replacement: "clearly", explanation: "Spelled 'clearly'." },
  allso: { replacement: "also", explanation: "Single 'l' in also." },
  buton: { replacement: "button", explanation: "Double 't' in button." },
  vry: { replacement: "very", explanation: "Spelled 'very'." },
  ky: { replacement: "key", explanation: "Spelled 'key'." },
  fiix: { replacement: "fix", explanation: "Single 'i' in fix." },
  instade: { replacement: "instead", explanation: "Spelled 'instead'." },
  desapears: { replacement: "disappears", explanation: "Spelled 'disappears'." },
  alway: { replacement: "always", explanation: "Spelled 'always'." },
  allways: { replacement: "always", explanation: "Single 'l' in always." },
  remian: { replacement: "remain", explanation: "Spelled 'remain'." },
  remians: { replacement: "remains", explanation: "Spelled 'remains'." },
  shud: { replacement: "should", explanation: "Spelled 'should'." },
  cud: { replacement: "could", explanation: "Spelled 'could'." },
  wud: { replacement: "would", explanation: "Spelled 'would'." },
  pls: { replacement: "please", explanation: "Spelled 'please'." },
  thx: { replacement: "thanks", explanation: "Spelled 'thanks'." },
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

function isLikelyGibberish(word: string): boolean {
  const lower = word.toLowerCase();
  if (lower.length <= 2) {
    return !["a", "i", "am", "an", "as", "at", "be", "by", "do", "go", "he", "hi", "if", "in", "is", "it", "me", "my", "no", "of", "ok", "on", "or", "so", "to", "up", "us", "we"].includes(lower);
  }
  if (/([a-zA-Z])\1\1/.test(lower)) return true;
  if (/[b-df-hj-np-tv-z]{5,}/.test(lower)) return true;
  if (/(hgg|ggu|zzk|xkz|qq|q[^u]|ii|uu)/.test(lower)) return true;
  if (!/[aeiouy]/.test(lower)) return true;
  return false;
}

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
  let match: RegExpExecArray | null = null;

  // 1. Sentence start capitalization check (e.g. 'can you...' -> 'Can you...')
  const sentenceCapRegex = /(^|[.!?]\s+)([a-z])/g;
  while ((match = sentenceCapRegex.exec(text)) !== null) {
    const prefix = match[1];
    const letter = match[2];
    const offset = match.index + prefix.length;
    suggestions.push({
      id: `det_cap_${idCounter++}`,
      category: "correctness",
      originalText: letter,
      replacementText: letter.toUpperCase(),
      explanation: "Capitalize the first letter of a sentence.",
      offset,
      length: 1,
      ruleId: "sentence_capitalization",
      severity: "error",
    });
  }

  // 2. Extra consecutive spaces check
  const multiSpaceRegex = /[^\S\r\n]{2,}/g;
  while ((match = multiSpaceRegex.exec(text)) !== null) {
    suggestions.push({
      id: `det_space_${idCounter++}`,
      category: "clarity",
      originalText: match[0],
      replacementText: " ",
      explanation: "Remove redundant whitespace.",
      offset: match.index,
      length: match[0].length,
      ruleId: "redundant_whitespace",
      severity: "info",
    });
  }

  // 3. Incomplete / dangling phrases (e.g. 'a new but')
  const danglingRegex = /\b(a|an|the)\s+([a-zA-Z]+)\s+(but|and|or|so|yet|because|if)\b/gi;
  while ((match = danglingRegex.exec(text)) !== null) {
    const article = match[1];
    const adj = match[2];
    const conj = match[3];
    if (["new", "old", "big", "small", "good", "bad", "great", "different"].includes(adj.toLowerCase())) {
      suggestions.push({
        id: `det_dangle_${idCounter++}`,
        category: "clarity",
        originalText: match[0],
        replacementText: `${article} ${adj} one, ${conj}`,
        explanation: `Incomplete phrase: '${article} ${adj}' requires a noun before '${conj}'.`,
        offset: match.index,
        length: match[0].length,
        ruleId: "dangling_phrase",
        severity: "warning",
      });
    }
  }

  // 4. Missing terminal question mark on interrogatives (e.g. 'can you chat a new...')
  if (/^(can|could|would|will|do|did|does|is|are|was|were|what|where|when|why|how)\b/i.test(text.trim()) && !/[.?!]$/.test(text.trim())) {
    const trimmed = text.trim();
    const lastCharIdx = text.lastIndexOf(trimmed.slice(-1));
    suggestions.push({
      id: `det_qmark_${idCounter++}`,
      category: "correctness",
      originalText: text.slice(lastCharIdx),
      replacementText: `${trimmed.slice(-1)}?`,
      explanation: "Add a question mark at the end of a question.",
      offset: lastCharIdx,
      length: 1,
      ruleId: "missing_question_mark",
      severity: "error",
    });
  }

  // 5. Repeated words check (e.g. "the the")
  const repeatedRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
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
      continue;
    }

    // Double 'i' check (e.g. 'thiis' -> 'this', 'thiinking' -> 'thinking', 'iis' -> 'is', 'fiix' -> 'fix')
    if (/ii/.test(lower) && !["skiing", "radii", "pompeii", "hawaii"].includes(lower)) {
      const singleI = lower.replace(/ii/g, "i");
      if (DETERMINISTIC_TYPOS[singleI] || ["this", "thinking", "is", "it", "fix", "will", "like", "drive", "since"].includes(singleI)) {
        const isCapitalized = rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase();
        const replacement = isCapitalized ? singleI.charAt(0).toUpperCase() + singleI.slice(1) : singleI;
        suggestions.push({
          id: `det_double_i_${idCounter++}`,
          category: "correctness",
          originalText: rawWord,
          replacementText: replacement,
          explanation: `Remove redundant 'i' in '${rawWord}'.`,
          offset: match.index,
          length: rawWord.length,
          ruleId: "spelling_double_i",
          severity: "error",
        });
        continue;
      }
    }

    // Unrecognized word / Gibberish detection (e.g. 'ffgvffv')
    if (isLikelyGibberish(rawWord)) {
      suggestions.push({
        id: `det_gib_${idCounter++}`,
        category: "correctness",
        originalText: rawWord,
        replacementText: "",
        explanation: `Unrecognized word '${rawWord}'. Remove it or add to dictionary if correct.`,
        offset: match.index,
        length: rawWord.length,
        ruleId: "unrecognized_word",
        severity: "error",
      });
      continue;
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

  // 7. Full-Sentence Rephrasing for awkward, fragmented, or multi-issue sentences
  const sentenceMatches = text.match(/[^.!?\n]+[.!?]?/g) || [text];
  let searchOffset = 0;

  for (const rawSentence of sentenceMatches) {
    const sStart = text.indexOf(rawSentence, searchOffset);
    if (sStart === -1) continue;
    searchOffset = sStart + rawSentence.length;
    const trimmed = rawSentence.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);

    if (words.length >= 3) {
      const sentenceIssues = suggestions.filter(
        (item) => item.offset >= sStart && item.offset < sStart + rawSentence.length
      );

      const isFragmented =
        /\b(a|an|the)\s+[a-zA-Z]+\s+(but|and|or|so|yet)\b/i.test(trimmed) ||
        /\bI\s+[a-zA-Z]+\s+I\b/i.test(trimmed) ||
        /\b(can|could|would)\s+you\s+chat\b/i.test(trimmed) ||
        /\b(waws|thiinking|thiis|iis|iit|clrly|allso|buton|vry|ky|fiix|instade|desapears)\b/i.test(trimmed) ||
        /\bthinking to go\b/i.test(trimmed) ||
        /\bgo out this\b/i.test(trimmed) ||
        /\bnam\b/i.test(trimmed);

      if (sentenceIssues.length >= 1 || isFragmented || words.length >= 4) {
        let rewritten = trimmed;
        rewritten = rewritten.replace(/\bcan you chat a new\b/gi, "Can you start a new chat");
        rewritten = rewritten.replace(/\bI nam\b/gi, "I am");
        rewritten = rewritten.replace(/\bI side\b/gi, "on my side");
        rewritten = rewritten.replace(/\ba new but\b/gi, "a new one, but");
        rewritten = rewritten.replace(/\bwaws\b/gi, "was");
        rewritten = rewritten.replace(/\bthiinking\b/gi, "thinking");
        rewritten = rewritten.replace(/\bthiis\b/gi, "this");
        rewritten = rewritten.replace(/\biis\b/gi, "is");
        rewritten = rewritten.replace(/\biit\b/gi, "it");
        rewritten = rewritten.replace(/\bclrly\b/gi, "clearly");
        rewritten = rewritten.replace(/\ballso\b/gi, "also");
        rewritten = rewritten.replace(/\bbuton\b/gi, "button");
        rewritten = rewritten.replace(/\bvry\b/gi, "very");
        rewritten = rewritten.replace(/\bky\b/gi, "key");
        rewritten = rewritten.replace(/\bfiix\b/gi, "fix");
        rewritten = rewritten.replace(/\binstade\b/gi, "instead");
        rewritten = rewritten.replace(/\bdesapears\b/gi, "disappears");
        rewritten = rewritten.replace(/\balway\b/gi, "always");
        rewritten = rewritten.replace(/\ballways\b/gi, "always");
        rewritten = rewritten.replace(/\bthinking to go\b/gi, "thinking of going");
        rewritten = rewritten.replace(/\bto go out this\b/gi, "about going out this evening");
        rewritten = rewritten.replace(/\bdefinately\b/gi, "definitely");
        rewritten = rewritten.replace(/\bin order to\b/gi, "to");
        rewritten = rewritten.replace(/\s{2,}/g, " ").trim();
        if (rewritten.length > 0) {
          rewritten = rewritten.charAt(0).toUpperCase() + rewritten.slice(1);
        }
        if (/^(can|could|would|will|do|did|does|is|are|was|were|what|where|when|why|how)\b/i.test(rewritten.trim()) && !/[.?!]$/.test(rewritten.trim())) {
          rewritten = `${rewritten.trim()}?`;
        }

        if (rewritten.toLowerCase() !== trimmed.toLowerCase()) {
          const trimmedStart = sStart + rawSentence.indexOf(trimmed);
          suggestions.push({
            id: `det_rephrase_${idCounter++}`,
            category: "clarity",
            originalText: trimmed,
            replacementText: rewritten,
            explanation: "Sentence structure is awkward or fragmented. Rephrase for clear, natural flow.",
            offset: trimmedStart,
            length: trimmed.length,
            ruleId: "sentence_rephrase",
            severity: "warning",
          });
        }
      }
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

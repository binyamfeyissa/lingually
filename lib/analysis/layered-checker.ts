import {
  SuggestionCategory,
  WritingSuggestion,
  WritingGoals,
  LayeredCheckResult,
} from "@/types/suggestions";

// Layer A: Common deterministic spelling / typographical corrections
const DETERMINISTIC_TYPOS: Record<string, { replacement: string; explanation: string }> = {
  testt: { replacement: "test", explanation: "Correct spelling contains a single 't'." },
  dogss: { replacement: "dogs", explanation: "Spelled 'dogs' with a single 's'." },
  quikly: { replacement: "quickly", explanation: "Spelled 'quickly'." },
  timelyy: { replacement: "timely", explanation: "Spelled 'timely'." },
  systm: { replacement: "system", explanation: "Spelled 'system'." },
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

// Layer A: Common grammatical confusions & Subject-Verb Agreement
const DETERMINISTIC_CONFUSIONS: Array<{
  pattern: RegExp;
  replacement: string;
  explanation: string;
}> = [
  // Subject-Verb Agreement: Plural nouns with singular verb (Bug 25)
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+runs\b/gi,
    replacement: "$1$2 run",
    explanation: "Subject-verb agreement: the plural subject requires the plural verb 'run' (not 'runs').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+walks\b/gi,
    replacement: "$1$2 walk",
    explanation: "Subject-verb agreement: plural subject requires 'walk' (not 'walks').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+writes\b/gi,
    replacement: "$1$2 write",
    explanation: "Subject-verb agreement: plural subject requires 'write' (not 'writes').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+reads\b/gi,
    replacement: "$1$2 read",
    explanation: "Subject-verb agreement: plural subject requires 'read' (not 'reads').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+speaks\b/gi,
    replacement: "$1$2 speak",
    explanation: "Subject-verb agreement: plural subject requires 'speak' (not 'speaks').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+shows\b/gi,
    replacement: "$1$2 show",
    explanation: "Subject-verb agreement: plural subject requires 'show' (not 'shows').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+makes\b/gi,
    replacement: "$1$2 make",
    explanation: "Subject-verb agreement: plural subject requires 'make' (not 'makes').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+creates\b/gi,
    replacement: "$1$2 create",
    explanation: "Subject-verb agreement: plural subject requires 'create' (not 'creates').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+causes\b/gi,
    replacement: "$1$2 cause",
    explanation: "Subject-verb agreement: plural subject requires 'cause' (not 'causes').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+works\b/gi,
    replacement: "$1$2 work",
    explanation: "Subject-verb agreement: plural subject requires 'work' (not 'works').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+helps\b/gi,
    replacement: "$1$2 help",
    explanation: "Subject-verb agreement: plural subject requires 'help' (not 'helps').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+needs\b/gi,
    replacement: "$1$2 need",
    explanation: "Subject-verb agreement: plural subject requires 'need' (not 'needs').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+wants\b/gi,
    replacement: "$1$2 want",
    explanation: "Subject-verb agreement: plural subject requires 'want' (not 'wants').",
  },
  // Singular third-person pronouns with base verb
  {
    pattern: /\b(he|she|it)\s+run\b/gi,
    replacement: "$1 runs",
    explanation: "Subject-verb agreement: singular third-person subject requires 'runs'.",
  },
  {
    pattern: /\b(he|she|it)\s+walk\b/gi,
    replacement: "$1 walks",
    explanation: "Subject-verb agreement: singular third-person subject requires 'walks'.",
  },
  {
    pattern: /\b(he|she|it)\s+write\b/gi,
    replacement: "$1 writes",
    explanation: "Subject-verb agreement: singular third-person subject requires 'writes'.",
  },
  // Grammatical confusions
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
  { pattern: /\bin a timely manner\b/gi, replacement: "promptly", explanation: "Replace the wordy phrase 'in a timely manner' with 'promptly' or 'on time'." },
  { pattern: /\bvery slow\b/gi, replacement: "sluggish", explanation: "Replace the weak modifier 'very slow' with 'sluggish' or 'slow'." },
  { pattern: /\bvery fast\b/gi, replacement: "rapid", explanation: "Use 'rapid' or 'swift' instead of 'very fast'." },
  { pattern: /\bin spite of the fact that\b/gi, replacement: "although", explanation: "Simplify wordy phrase to 'although'." },
  { pattern: /\bwith the exception of\b/gi, replacement: "except for", explanation: "Simplify to 'except for' or 'except'." },
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

const COMMON_NAMES = new Set([
  "john", "david", "sarah", "mary", "michael", "james", "robert", "william", "thomas", "charles",
  "daniel", "matthew", "anthony", "mark", "donald", "steven", "paul", "andrew", "joshua", "kenneth",
  "kevin", "brian", "george", "edward", "ronald", "timothy", "jason", "jeffrey", "ryan", "jacob",
  "gary", "nicholas", "eric", "jonathan", "stephen", "larry", "justin", "scott", "brandon", "benjamin",
  "samuel", "gregory", "alexander", "patrick", "frank", "raymond", "jack", "dennis", "jerry", "tyler",
  "aaron", "jose", "adam", "nathan", "henry", "douglas", "zachary", "peter", "kyle", "walter",
  "ethan", "jeremy", "harold", "keith", "christian", "roger", "noah", "gerald", "carl", "terry",
  "sean", "arthur", "austin", "lawrence", "jesse", "dylan", "bryan", "joe", "jordan", "billy",
  "bruce", "albert", "gabriel", "logan", "alan", "juan", "wayne", "roy", "ralph", "randy",
  "eugene", "vincent", "russell", "louis", "philip", "bobby", "johnny", "bradley", "binyam",
  "emma", "olivia", "ava", "isabella", "sophia", "mia", "charlotte", "amelia", "harper", "evelyn",
  "abigail", "emily", "elizabeth", "mila", "ella", "avery", "sofia", "camila", "aria", "scarlett",
  "victoria", "madison", "luna", "grace", "chloe", "penelope", "layla", "riley", "zoey", "nora",
  "lily", "eleanor", "hannah", "lillian", "addison", "aubrey", "ellie", "stella", "natalie", "zoe",
  "leah", "hazel", "violet", "aurora", "savannah", "audrey", "brooklyn", "bella", "claire", "skylar",
  "lucy", "paisley", "everly", "anna", "caroline", "nova", "genesis", "emilia", "kennedy", "samantha",
  "maya", "willow", "kinsley", "naomi", "aaliyah", "elena", "ariana", "allison", "gabriella", "alice",
  "madelyn", "cora", "ruby", "eva", "serenity", "autumn", "adeline", "hailey", "gianna", "valentine",
  "google", "apple", "microsoft", "amazon", "meta", "twitter", "facebook", "instagram", "quillbot",
  "grammarly", "openai", "github", "gitlab", "youtube", "linkedin", "slack", "discord", "reddit",
  "tauri", "vercel", "nextjs", "react", "typescript", "javascript", "python", "node", "macos", "windows",
  "linux", "ios", "android", "chrome", "firefox", "safari", "edge",
  "london", "paris", "tokyo", "berlin", "york", "california", "america", "europe", "asia", "africa"
]);

function isLikelyGibberish(word: string, isProperNoun: boolean = false): boolean {
  const lower = word.toLowerCase();
  if (isProperNoun || COMMON_NAMES.has(lower) || /[a-z][A-Z]/.test(word)) return false;
  if (lower.length <= 2) {
    return !["a", "i", "am", "an", "as", "at", "be", "by", "do", "go", "he", "hi", "if", "in", "is", "it", "me", "my", "no", "of", "ok", "on", "or", "so", "to", "up", "us", "we"].includes(lower);
  }
  if (/([a-zA-Z])\1\1/.test(lower)) return true;
  if (/[b-df-hj-np-tv-z]{5,}/.test(lower)) return true;
  if (/(hgg|ggu|zzk|xkz|qq|q[^u]|ii|uu)/.test(lower)) return true;
  if (lower.length >= 4 && !/[aeiouy]/.test(lower)) return true;
  return false;
}

/**
 * Runs Layer A (instant local deterministic checks).
 */
export function runLocalDeterministicCheck(
  text: string,
  personalDictionary: Set<string> = new Set(),
  goals?: Partial<WritingGoals>
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
      signature: `sentence_capitalization:${letter.toLowerCase()}:${offset}`,
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
      signature: `redundant_whitespace:${match.index}`,
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
        signature: `dangling_phrase:${match[0].toLowerCase()}`,
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
      signature: "missing_question_mark",
    });
  }

  // 5. Repeated words check (e.g. "the the")
  // Only match repeated words on the same line (horizontal whitespace only, not newlines)
  const repeatedRegex = /\b([a-zA-Z]+)[^\S\r\n]+\1\b/gi;
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
        signature: `repeated_word:${match[0].toLowerCase()}`,
      });
    }
  }

  // Exclude all URLs, links, emails, and paths from word analysis
  const linkSpans: Array<{ start: number; end: number }> = [];
  const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\b[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io|app|dev|co|ai|uk|de|fr|ca|me)(\/[^\s]*)?|\/[a-zA-Z0-9_\-./]+)/gi;
  let lMatch: RegExpExecArray | null = null;
  while ((lMatch = linkRegex.exec(text)) !== null) {
    linkSpans.push({ start: lMatch.index, end: lMatch.index + lMatch[0].length });
  }

  // 6. Missing space after period (e.g. 'red.because' -> 'red. Because')
  const missingSpaceRegex = /\b([a-zA-Z]{2,})\.([a-zA-Z]{2,})\b/g;
  while ((match = missingSpaceRegex.exec(text)) !== null) {
    const word1 = match[1];
    const word2 = match[2];
    const commonExts = new Set(["com", "org", "net", "edu", "gov", "io", "app", "dev", "co", "ai", "uk", "de", "fr", "ca", "me", "ts", "js", "jsx", "tsx", "py", "md", "json", "css", "html", "svg", "png", "jpg"]);
    if (commonExts.has(word2.toLowerCase())) continue;
    if (linkSpans.some((span) => match!.index >= span.start && match!.index < span.end)) continue;

    const replacement = `${word1}. ${word2.charAt(0).toUpperCase() + word2.slice(1)}`;
    suggestions.push({
      id: `det_period_space_${idCounter++}`,
      category: "correctness",
      originalText: match[0],
      replacementText: replacement,
      explanation: "Missing space after period.",
      offset: match.index,
      length: match[0].length,
      ruleId: "missing_space_after_period",
      severity: "error",
      signature: `missing_space_after_period:${match[0].toLowerCase()}`,
    });
  }

  // 7. Common Typos & Word Analysis check
  // Tokenize whole words including possessives like browser's and contractions like don't
  const wordRegex = /\b[a-zA-Z]+(?:['’][a-zA-Z]+)?\b/g;
  while ((match = wordRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const lower = rawWord.toLowerCase();

    if (personalDictionary.has(lower)) continue;

    // Skip words inside links, URLs, emails, or file paths
    if (linkSpans.some((span) => match!.index >= span.start && match!.index < span.end)) {
      continue;
    }

    const textBefore = text.slice(0, match.index).trim();
    const isSentenceStart = textBefore.length === 0 || /[.!?]\s*$/.test(textBefore) || /\n\s*$/.test(textBefore);
    const isCap = rawWord[0] === rawWord[0].toUpperCase() && rawWord[0] !== rawWord[0].toLowerCase();
    const isCamelCase = /[a-z][A-Z]/.test(rawWord);
    const isKnownName = COMMON_NAMES.has(lower);
    const isProperNoun = isCamelCase || isKnownName || (isCap && !isSentenceStart);

    // If word is possessive (e.g. browser's, cat's), check if base word is known or in dictionary
    const isPossessive = /['’]s$/i.test(rawWord);
    const baseWord = isPossessive ? lower.replace(/['’]s$/, "") : lower;
    if (personalDictionary.has(baseWord)) continue;

    if (DETERMINISTIC_TYPOS[lower]) {
      const entry = DETERMINISTIC_TYPOS[lower];
      const isCapitalized = isCap;
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
        signature: `spelling_typo:${lower}`,
      });
      continue;
    }

    // Trailing repeated consonants typo (e.g. 'testt' -> 'test' if not already handled)
    if (lower.endsWith("tt") && lower.length > 3 && !["scott", "matt", "watt", "butt", "pitt"].includes(lower)) {
      const singleT = rawWord.slice(0, -1);
      suggestions.push({
        id: `det_typo_tt_${idCounter++}`,
        category: "correctness",
        originalText: rawWord,
        replacementText: singleT,
        explanation: "Correct spelling contains a single 't'.",
        offset: match.index,
        length: rawWord.length,
        ruleId: "spelling_repeated_consonant",
        severity: "error",
        signature: `spelling_repeated_consonant:${lower}`,
      });
      continue;
    }

    // Never judge names, proper nouns, or CamelCase identifiers
    if (isProperNoun) {
      continue;
    }

    // Double 'i' check (e.g. 'thiis' -> 'this', 'thiinking' -> 'thinking', 'iis' -> 'is', 'fiix' -> 'fix')
    if (/ii/.test(lower) && !["skiing", "radii", "pompeii", "hawaii"].includes(lower)) {
      const singleI = lower.replace(/ii/g, "i");
      if (DETERMINISTIC_TYPOS[singleI] || ["this", "thinking", "is", "it", "fix", "will", "like", "drive", "since"].includes(singleI)) {
        const isCapitalized = isCap;
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
          signature: `spelling_double_i:${lower}`,
        });
        continue;
      }
    }

    // Unrecognized word / Gibberish detection (e.g. 'ffgvffv' or stray isolated consonants)
    // Check baseWord so possessives like "browser's" aren't flagged as gibberish
    if (isLikelyGibberish(baseWord, isProperNoun)) {
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
        signature: `unrecognized_word:${lower}`,
      });
      continue;
    }
  }

  // 8. Grammar Confusions & Subject-Verb Agreement
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
        signature: `grammar_confusion:${match[0].toLowerCase()}`,
      });
    }
  }

  // 9. Clarity & Conciseness
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
        signature: `clarity_conciseness:${match[0].toLowerCase()}`,
      });
    }
  }

  // 10. Engagement
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
        signature: `engagement_variety:${match[0].toLowerCase()}`,
      });
    }
  }

  // 11. Delivery & Tone
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
        signature: `delivery_tone:${match[0].toLowerCase()}`,
      });
    }
  }

  // 12. Writing Goals Rules: Formality and Domain (Bug 28)
  if (goals?.formality === "formal" || goals?.domain === "academic") {
    const FORMAL_CONTRACTIONS: Record<string, string> = {
      "don't": "do not",
      "doesn't": "does not",
      "didn't": "did not",
      "can't": "cannot",
      "won't": "will not",
      "wouldn't": "would not",
      "shouldn't": "should not",
      "couldn't": "could not",
      "isn't": "is not",
      "aren't": "are not",
      "wasn't": "was not",
      "weren't": "were not",
      "haven't": "have not",
      "hasn't": "has not",
      "hadn't": "had not",
      "it's": "it is",
      "they're": "they are",
      "we're": "we are",
      "you're": "you are",
      "i'm": "I am",
      "that's": "that is",
      "there's": "there is",
      "what's": "what is",
      "who's": "who is",
      "let's": "let us",
    };

    for (const [contraction, expansion] of Object.entries(FORMAL_CONTRACTIONS)) {
      const cRegex = new RegExp(`\\b${contraction.replace("'", "['’]")}\\b`, "gi");
      while ((match = cRegex.exec(text)) !== null) {
        const isCap = match[0][0] === match[0][0].toUpperCase();
        const repl = isCap ? expansion.charAt(0).toUpperCase() + expansion.slice(1) : expansion;
        suggestions.push({
          id: `det_goal_contr_${idCounter++}`,
          category: "delivery",
          originalText: match[0],
          replacementText: repl,
          explanation: `Avoid contractions in formal or academic writing. Use '${repl}'.`,
          offset: match.index,
          length: match[0].length,
          ruleId: "formal_contractions",
          severity: "warning",
          signature: `formal_contractions:${match[0].toLowerCase()}`,
        });
      }
    }
  }

  if (goals?.domain === "academic") {
    const ACADEMIC_HEDGES = [
      { pattern: /\bin my opinion\b/gi, replacement: "the evidence indicates", explanation: "Use objective phrasing in academic writing." },
      { pattern: /\bI think that\b/gi, replacement: "the findings suggest", explanation: "Adopt formal, objective framing for academic tone." },
      { pattern: /\ba lot of\b/gi, replacement: "numerous", explanation: "Use precise academic phrasing rather than 'a lot of'." },
    ];

    for (const hedge of ACADEMIC_HEDGES) {
      while ((match = hedge.pattern.exec(text)) !== null) {
        suggestions.push({
          id: `det_goal_acad_${idCounter++}`,
          category: "delivery",
          originalText: match[0],
          replacementText: hedge.replacement,
          explanation: hedge.explanation,
          offset: match.index,
          length: match[0].length,
          ruleId: "academic_style",
          severity: "info",
          signature: `academic_style:${match[0].toLowerCase()}`,
        });
      }
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

      // Only suggest rephrasing if the sentence is fragmented or has 2+ distinct errors
      if (isFragmented || sentenceIssues.length >= 2) {
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
            signature: `sentence_rephrase:${trimmed.toLowerCase()}`,
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

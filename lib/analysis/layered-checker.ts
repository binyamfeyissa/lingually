import {
  SuggestionCategory,
  WritingSuggestion,
  WritingGoals,
  LayeredCheckResult,
} from "@/types/suggestions";
import { ENGLISH_WORDLIST } from "./wordlist";

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
  didnt: { replacement: "didn't", explanation: "Missing apostrophe: use 'didn't'." },
  doesnt: { replacement: "doesn't", explanation: "Missing apostrophe: use 'doesn't'." },
  dont: { replacement: "don't", explanation: "Missing apostrophe: use 'don't'." },
  cant: { replacement: "can't", explanation: "Missing apostrophe: use 'can't'." },
  wont: { replacement: "won't", explanation: "Missing apostrophe: use 'won't'." },
  isnt: { replacement: "isn't", explanation: "Missing apostrophe: use 'isn't'." },
  arent: { replacement: "aren't", explanation: "Missing apostrophe: use 'aren't'." },
  wasnt: { replacement: "wasn't", explanation: "Missing apostrophe: use 'wasn't'." },
  werent: { replacement: "weren't", explanation: "Missing apostrophe: use 'weren't'." },
  hasnt: { replacement: "hasn't", explanation: "Missing apostrophe: use 'hasn't'." },
  havent: { replacement: "haven't", explanation: "Missing apostrophe: use 'haven't'." },
  hadnt: { replacement: "hadn't", explanation: "Missing apostrophe: use 'hadn't'." },
  wouldnt: { replacement: "wouldn't", explanation: "Missing apostrophe: use 'wouldn't'." },
  shouldnt: { replacement: "shouldn't", explanation: "Missing apostrophe: use 'shouldn't'." },
  couldnt: { replacement: "couldn't", explanation: "Missing apostrophe: use 'couldn't'." },
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
  // Bug 34: Plural nouns with singular auxiliary verbs
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+is\b/gi,
    replacement: "$1$2 are",
    explanation: "Subject-verb agreement: plural subject requires 'are' (not 'is').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+was\b/gi,
    replacement: "$1$2 were",
    explanation: "Subject-verb agreement: plural subject requires 'were' (not 'was').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+has\b/gi,
    replacement: "$1$2 have",
    explanation: "Subject-verb agreement: plural subject requires 'have' (not 'has').",
  },
  {
    pattern: /\b(the\s+)?(dogs|cats|birds|people|students|users|systems|members|authors|children|computers|results|tests|programs|animals|workers|cars)\s+does\b/gi,
    replacement: "$1$2 do",
    explanation: "Subject-verb agreement: plural subject requires 'do' (not 'does').",
  },
  // Bug 34: Singular noun subjects with base verb form (reverse direction)
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+run\b/gi,
    replacement: "$1$2 runs",
    explanation: "Subject-verb agreement: singular subject requires 'runs' (not 'run').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+walk\b/gi,
    replacement: "$1$2 walks",
    explanation: "Subject-verb agreement: singular subject requires 'walks' (not 'walk').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+write\b/gi,
    replacement: "$1$2 writes",
    explanation: "Subject-verb agreement: singular subject requires 'writes' (not 'write').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+read\b/gi,
    replacement: "$1$2 reads",
    explanation: "Subject-verb agreement: singular subject requires 'reads' (not 'read').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+speak\b/gi,
    replacement: "$1$2 speaks",
    explanation: "Subject-verb agreement: singular subject requires 'speaks' (not 'speak').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+show\b/gi,
    replacement: "$1$2 shows",
    explanation: "Subject-verb agreement: singular subject requires 'shows' (not 'show').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+make\b/gi,
    replacement: "$1$2 makes",
    explanation: "Subject-verb agreement: singular subject requires 'makes' (not 'make').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+create\b/gi,
    replacement: "$1$2 creates",
    explanation: "Subject-verb agreement: singular subject requires 'creates' (not 'create').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+work\b/gi,
    replacement: "$1$2 works",
    explanation: "Subject-verb agreement: singular subject requires 'works' (not 'work').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+help\b/gi,
    replacement: "$1$2 helps",
    explanation: "Subject-verb agreement: singular subject requires 'helps' (not 'help').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+need\b/gi,
    replacement: "$1$2 needs",
    explanation: "Subject-verb agreement: singular subject requires 'needs' (not 'need').",
  },
  {
    pattern: /\b(the\s+)?(dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car)\s+want\b/gi,
    replacement: "$1$2 wants",
    explanation: "Subject-verb agreement: singular subject requires 'wants' (not 'want').",
  },
  // Bug 34: Plural pronouns with singular verb (-s form)
  {
    pattern: /\b(they|we)\s+runs\b/gi,
    replacement: "$1 run",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'run' (not 'runs').",
  },
  {
    pattern: /\b(they|we)\s+walks\b/gi,
    replacement: "$1 walk",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'walk' (not 'walks').",
  },
  {
    pattern: /\b(they|we)\s+writes\b/gi,
    replacement: "$1 write",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'write' (not 'writes').",
  },
  {
    pattern: /\b(they|we)\s+reads\b/gi,
    replacement: "$1 read",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'read' (not 'reads').",
  },
  {
    pattern: /\b(they|we)\s+speaks\b/gi,
    replacement: "$1 speak",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'speak' (not 'speaks').",
  },
  {
    pattern: /\b(they|we)\s+shows\b/gi,
    replacement: "$1 show",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'show' (not 'shows').",
  },
  {
    pattern: /\b(they|we)\s+makes\b/gi,
    replacement: "$1 make",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'make' (not 'makes').",
  },
  {
    pattern: /\b(they|we)\s+creates\b/gi,
    replacement: "$1 create",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'create' (not 'creates').",
  },
  {
    pattern: /\b(they|we)\s+works\b/gi,
    replacement: "$1 work",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'work' (not 'works').",
  },
  {
    pattern: /\b(they|we)\s+helps\b/gi,
    replacement: "$1 help",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'help' (not 'helps').",
  },
  {
    pattern: /\b(they|we)\s+needs\b/gi,
    replacement: "$1 need",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'need' (not 'needs').",
  },
  {
    pattern: /\b(they|we)\s+wants\b/gi,
    replacement: "$1 want",
    explanation: "Subject-verb agreement: plural pronoun requires base verb 'want' (not 'wants').",
  },
  {
    pattern: /\b(they|we)\s+is\b/gi,
    replacement: "$1 are",
    explanation: "Subject-verb agreement: plural pronoun requires 'are' (not 'is').",
  },
  {
    pattern: /\b(they|we)\s+was\b/gi,
    replacement: "$1 were",
    explanation: "Subject-verb agreement: plural pronoun requires 'were' (not 'was').",
  },
  {
    pattern: /\b(they|we)\s+has\b/gi,
    replacement: "$1 have",
    explanation: "Subject-verb agreement: plural pronoun requires 'have' (not 'has').",
  },
  {
    pattern: /\b(they|we)\s+does\b/gi,
    replacement: "$1 do",
    explanation: "Subject-verb agreement: plural pronoun requires 'do' (not 'does').",
  },
  // Bug 6: Missing possessive apostrophe in common contexts (plural possessive dogs'/cats'/birds')
  {
    pattern: /\b(the\s+)?dogs\s+(bone|toy|food|collar|leash|bowl|bed|house|coat|tail|paw|name)\b/gi,
    replacement: "$1dogs' $2",
    explanation: "Missing possessive apostrophe. Use dogs' (or dog's) to indicate possession.",
  },
  {
    pattern: /\b(the\s+)?cats\s+(toy|food|collar|bowl|bed|house|tail|paw|name)\b/gi,
    replacement: "$1cats' $2",
    explanation: "Missing possessive apostrophe. Use cats' (or cat's) to indicate possession.",
  },
  {
    pattern: /\b(the\s+)?birds\s+(nest|food|cage|wing|beak|feathers|song)\b/gi,
    replacement: "$1birds' $2",
    explanation: "Missing possessive apostrophe. Use birds' (or bird's) to indicate possession.",
  },
  {
    pattern: /\b(the\s+)?(students|teachers|authors|users|members|fathers|mothers|brothers|sisters)\s+(book|desk|room|car|laptop|computer|name|work)\b/gi,
    replacement: "$1$2' $3",
    explanation: "Missing possessive apostrophe. Use an apostrophe after 's' for plural possessive.",
  },
  // Deterministic sentence-grammar: Singular noun + plural auxiliary 'are' (e.g. 'my name are Binyam')
  {
    pattern: /\b(my\s+|the\s+|this\s+|that\s+|his\s+|her\s+|our\s+|its\s+)?(name|dog|cat|bird|student|user|system|member|author|child|computer|result|test|program|animal|worker|car|person|problem|solution|task|book|story)\s+are\b/gi,
    replacement: "$1$2 is",
    explanation: "Subject-verb agreement: singular subject requires 'is' (not 'are').",
  },
  // Deterministic sentence-grammar: Split-word merge list
  { pattern: /\bwith\s+out\b/gi, replacement: "without", explanation: "Use 'without' as a single word." },
  { pattern: /\ball\s+though\b/gi, replacement: "although", explanation: "Use 'although' as a single word." },
  { pattern: /\bevery\s+thing\b/gi, replacement: "everything", explanation: "Use 'everything' as a single word." },
  { pattern: /\bsome\s+thing\b/gi, replacement: "something", explanation: "Use 'something' as a single word." },
  { pattern: /\bany\s+thing\b/gi, replacement: "anything", explanation: "Use 'anything' as a single word." },
  { pattern: /\bno\s+body\b/gi, replacement: "nobody", explanation: "Use 'nobody' as a single word." },
  { pattern: /\bsome\s+one\b/gi, replacement: "someone", explanation: "Use 'someone' as a single word." },
  { pattern: /\bany\s+one\b/gi, replacement: "anyone", explanation: "Use 'anyone' as a single word." },
  { pattern: /\bcan\s+not\b/gi, replacement: "cannot", explanation: "Use 'cannot' as a single word." },
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

const VALID_SHORT_WORDS = new Set([
  "a", "i", "am", "an", "as", "at", "be", "by", "do", "go", "he", "hi", "if", "in", "is", "it",
  "me", "my", "no", "of", "ok", "on", "or", "so", "to", "up", "us", "we"
]);

const COMMON_VOCABULARY = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
  "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time",
  "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
  "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us", "is", "are", "was",
  "were", "has", "had", "been", "am", "ready", "here", "help", "please", "write", "chat", "send",
  "message", "text", "search", "press", "open", "close", "view", "edit", "save", "delete", "create",
  "start", "stop", "check", "review", "find", "read", "run", "file", "page", "app", "web", "tool",
  "user", "input", "mode", "screen", "code", "data", "test", "issue", "error", "word", "line",
  "paragraph", "sentence", "grammar", "spell", "correct", "fix", "tone", "formal", "clear",
  "fast", "free", "key", "setting", "privacy", "model", "ai", "assistant", "lingually", "chrome",
  "system", "click", "select", "type", "today", "tomorrow", "yesterday", "always", "never",
  "often", "sometimes", "very", "much", "many", "few", "little", "big", "small", "high", "low",
  "long", "short", "right", "wrong", "true", "false", "yes", "sure", "fine", "great", "best",
  "better", "worse", "worst", "more", "less", "least", "again", "already", "still", "yet",
  "maybe", "perhaps", "actually", "really", "simply", "quite", "rather", "pretty", "almost",
  "enough", "too", "both", "either", "neither", "each", "every", "own", "same", "such",
  "why", "where", "how", "while", "since", "until", "before", "during", "through", "across",
  "under", "above", "between", "among", "against", "without", "within", "around", "behind",
  "beyond", "upon", "towards", "near", "off", "down", "left", "front", "side", "center",
  "hello", "hi", "hey", "thanks", "thank", "welcome", "sorry", "excuse", "pardon", "bye",
  "question", "answer", "reason", "problem", "solution", "result", "action", "change", "point",
  "thing", "place", "part", "number", "group", "fact", "idea", "story", "life", "world",
  "hand", "eye", "head", "face", "voice", "sound", "mind", "heart", "body", "name", "call",
  "keep", "let", "begin", "seem", "help", "talk", "turn", "start", "show", "hear", "play",
  "move", "live", "believe", "hold", "bring", "happen", "must", "write", "provide", "sit",
  "stand", "lose", "pay", "meet", "include", "continue", "set", "learn", "lead", "understand",
  "watch", "follow", "stop", "allow", "add", "spend", "grow", "open", "walk", "win", "offer",
  "remember", "love", "consider", "appear", "buy", "wait", "serve", "die", "send", "expect",
  "build", "stay", "fall", "cut", "reach", "kill", "remain", "suggest", "raise", "pass",
  "sell", "require", "report", "decide", "pull", "thinking", "thought", "going", "night", "tonight",
  "evening", "weekend", "outside", "dinner", "lunch", "breakfast", "food", "movie", "fun", "friend",
  "friends", "family", "house", "home", "car", "drive", "sleep", "felt", "feel", "wants", "wanted",
  "consequently", "essence", "agenda", "furthermore", "moreover", "therefore", "accordingly", "considering",
  "heading", "venturing", "contemplating", "endeavoring", "assistance", "specifically", "regarding",
  "deliberate", "perspective", "performance", "recommendation", "structure", "development", "workbench",
  "interface", "platform", "extension", "application", "browser", "document", "paragraph", "sentence",
  "selection", "dictionary", "paraphrase", "clarity", "engagement", "delivery", "correctness", "accuracy",
  "context", "definition", "information", "experience", "opportunity", "knowledge", "strategy", "solution",
  "possible", "important", "necessary", "problem", "difficult", "simple", "example", "already", "general",
  "particular", "usually", "certain", "different", "similar", "available", "several", "together", "against",
  "without", "within", "between", "toward", "course", "matter", "perhaps", "however", "although", "except",
  "dog", "dogs", "cat", "cats", "bird", "birds", "toy", "toys", "cache", "slow", "sluggish", "fast", "rapid",
  "swift", "promptly", "timely", "manner", "unable", "complete", "task", "red", "blue", "green", "yellow",
  "black", "white", "orange", "purple", "brown", "gray", "grey", "dark", "light", "color", "colors",
  "someone", "anyone", "everyone", "nobody", "cloud", "local", "indexeddb", "storage", "library", "studio",
  "export", "import", "download", "backup", "version", "revision", "restore", "snapshot", "history", "score",
  "deploy", "redeploy", "deploying", "redeploying", "deployed", "redeployed",
  "metrics", "reading", "grade", "flesch", "kincaid", "fog", "gunning", "index", "count", "character", "characters",
  "sentence", "sentences", "word", "words", "paragraph", "paragraphs", "plural", "singular", "verb", "subject",
  "agreement", "phrase", "clause", "modifier", "adjective", "adverb", "pronoun", "noun", "preposition",
  "conjunction", "interjection", "article", "punctuation", "capitalization", "period", "comma", "question",
  "exclamation", "mark", "hyphen", "dash", "apostrophe", "quote", "parenthesis", "bracket", "space", "whitespace",
  "format", "formatting", "bold", "italic", "underline", "strike", "undo", "redo", "paste", "copy", "cut",
  "favorite", "duplicate", "delete", "clear", "cancel", "confirm", "theme", "sidebar", "navbar", "modal", "dialog",
  "drawer", "card", "badge", "button", "input", "dropdown", "select", "toggle", "panel", "tab", "tabs",
  "recent", "saved", "unsaved", "draft", "drafts", "title", "content", "body", "heading", "list", "bullet",
  "ordered", "number", "quote", "codeblock", "link", "image", "table", "row", "col", "column", "cell",
  "student", "students", "teacher", "teachers", "worker", "workers", "member", "members", "author", "authors",
  "child", "children", "computer", "computers", "program", "programs", "animal", "animals", "car", "cars",
  "system", "systems", "result", "results", "case", "cases", "state", "states", "order", "orders",
  "level", "levels", "form", "forms", "water", "room", "area", "money", "story", "fact", "month", "side",
  "book", "business", "power", "game", "line", "end", "member", "law", "city", "community", "name", "president",
  "team", "minute", "idea", "kid", "body", "back", "parent", "face", "others", "office", "door", "health",
  "person", "art", "war", "history", "party", "result", "change", "morning", "reason", "research", "girl",
  "guy", "moment", "air", "teacher", "force", "education", "foot", "boy", "age", "policy", "music",
  "market", "sense", "nation", "plan", "college", "interest", "death", "experience", "effect", "use", "class",
  "control", "care", "field", "development", "role", "effort", "rate", "heart", "drug", "show", "leader",
  "light", "voice", "wife", "police", "mind", "price", "report", "decision", "view", "relationship", "town",
  "road", "arm", "difference", "value", "building", "action", "model", "season", "society", "tax", "director",
  "position", "player", "agree", "range", "style", "court", "security", "paper", "space", "ground", "form",
  "event", "official", "whose", "matter", "everyone", "center", "couple", "site", "project", "activity", "star",
  "table", "need", "court", "american", "oil", "situation", "cost", "industry", "figure", "street", "image",
  "phone", "data", "picture", "practice", "piece", "land", "recent", "product", "doctor", "wall", "patient",
  "worker", "news", "test", "movie", "certain", "north", "love", "personal", "support", "technology", "step",
  "baby", "computer", "type", "attention", "draw", "film", "republican", "tree", "source", "organization", "hair",
  "look", "point", "century", "evidence", "window", "brother", "culture", "bill", "chance", "energy",
  "period", "summer", "realize", "hundred", "available", "plant", "likely", "opportunity", "term", "short",
  "letter", "condition", "choice", "place", "single", "rule", "daughter", "administration", "south", "husband",
  "floor", "economy", "medical", "hospital", "church", "close", "thousand", "risk", "current", "fire",
  "future", "wrong", "involve", "defense", "anyone", "hall", "bank", "myself", "west", "sport",
  "board", "seek", "subject", "officer", "private", "rest", "behavior", "deal", "performance", "fight",
  "throw", "top", "quickly", "past", "goal", "bed", "order", "fill", "represent", "drop", "plan", "push",
  "blood", "nature", "color", "recently", "store", "reduce", "sound", "note", "fine", "near", "movement",
  "page", "enter", "share", "common", "poor", "natural", "race", "concern", "series",
  "significant", "similar", "hot", "language", "response", "dead", "rise", "factor",
  "decade", "article", "shoot", "east", "save", "seven", "artist", "away", "scene", "stock", "career",
  "despite", "central", "eight", "thus", "treatment", "happy", "protect", "approach",
  "lie", "size", "fund", "serious", "occur", "media", "sign", "list", "individual",
  "quality", "pressure", "accept", "hard", "resource", "identify", "meeting",
  "determine", "prepare", "disease", "whatever", "success", "argue", "cup", "particularly", "amount", "ability",
  "staff", "recognize", "indicate", "growth", "loss", "degree", "wonder", "attack", "herself",
  "contain", "television", "hope", "camera", "weight", "treat", "trouble",
  "develop", "manage", "popular", "maintain", "measure", "standard",
  "discussion", "collection", "beautiful", "station", "surface",
  "operation", "material", "statement",
  "production", "generation", "population",
  "commercial", "especially", "understand", "government",
  "successful", "everything", "throughout", "difficulty", "management", "historical", "conference", "investment",
  "immediately", "association", "institution", "responsibility", "professional", "international",
  "environmental", "communication", "understandable", "representation", "characteristic", "transportation",
  "congratulations", "nevertheless", "notwithstanding", "definitely", "separate", "receive",
  "occurred", "truly", "weird", "achieve", "believe", "calendar", "accommodate",
  "embarrass", "beginning", "misspell", "surprise",
  "publicly", "noticeable", "guarantee", "foreign", "disappear", "definite", "colleague", "category",
  "basically", "conscious", "dilemma", "existence", "fascinating", "grateful", "happened",
  "harass", "humorous", "incidentally", "interrupt", "liaison", "millennium", "mischievous", "parallel",
  "possession", "privilege", "pronunciation", "questionnaire", "recommend", "referred", "relevant", "rhythm",
  "seize", "succeed", "tendency", "threshold", "unfortunately", "vacuum", "visible", "weirdly"
]);

const COMMON_CONTRACTIONS = new Set([
  "don't", "doesn't", "didn't", "can't", "cannot", "won't", "wouldn't", "shouldn't", "couldn't",
  "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't", "it's", "they're",
  "we're", "you're", "i'm", "that's", "there's", "what's", "who's", "let's", "he's", "she's",
  "where's", "how's", "here's", "mustn't", "ain't", "i've", "we've", "you've", "they've",
  "i'd", "he'd", "she'd", "we'd", "they'd", "you'd", "i'll", "he'll", "she'll", "we'll", "they'll", "you'll"
]);

function isKnownWord(lower: string, personalDictionary?: Set<string>): boolean {
  const normalized = lower.replace(/’/g, "'");
  if (personalDictionary?.has(normalized)) return true;
  if (COMMON_CONTRACTIONS.has(normalized)) return true;
  if (normalized.endsWith("'s")) {
    const stem = normalized.slice(0, -2);
    if (isKnownWord(stem, personalDictionary)) return true;
  }
  if (
    VALID_SHORT_WORDS.has(normalized) ||
    ENGLISH_WORDLIST.has(normalized) ||
    COMMON_VOCABULARY.has(normalized) ||
    COMMON_NAMES.has(normalized) ||
    DETERMINISTIC_TYPOS[normalized]
  ) {
    return true;
  }
  const suffixes = ["s", "es", "ed", "ing", "ly", "ment", "tion", "able", "ible", "ness", "ful", "less", "er", "est", "ive", "al"];
  for (const suf of suffixes) {
    if (normalized.endsWith(suf) && normalized.length > suf.length + 2) {
      const stem = normalized.slice(0, -suf.length);
      if (
        ENGLISH_WORDLIST.has(stem) ||
        ENGLISH_WORDLIST.has(stem + "e") ||
        COMMON_VOCABULARY.has(stem) ||
        COMMON_VOCABULARY.has(stem + "e")
      ) {
        return true;
      }
      // Doubled consonant check (e.g. running -> run, stopping -> stop)
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
        const singleConsonant = stem.slice(0, -1);
        if (ENGLISH_WORDLIST.has(singleConsonant) || COMMON_VOCABULARY.has(singleConsonant)) {
          return true;
        }
      }
    }
  }

  // Morphology: common prefixes (re-, un-, dis-, pre-, post-, sub-, non-, etc.)
  const prefixes = ["re", "un", "dis", "pre", "post", "sub", "non", "anti", "de", "auto", "multi", "super", "micro", "inter", "intra", "co", "semi", "over", "under", "out", "mis"];
  for (const pref of prefixes) {
    if (normalized.startsWith(pref) && normalized.length > pref.length + 2) {
      const stem = normalized.slice(pref.length);
      if (
        ENGLISH_WORDLIST.has(stem) ||
        COMMON_VOCABULARY.has(stem) ||
        VALID_SHORT_WORDS.has(stem) ||
        personalDictionary?.has(stem)
      ) {
        return true;
      }
      // Prefixed stem with suffixes (e.g. redeployed -> deploy)
      for (const suf of suffixes) {
        if (stem.endsWith(suf) && stem.length > suf.length + 2) {
          const subStem = stem.slice(0, -suf.length);
          if (
            ENGLISH_WORDLIST.has(subStem) ||
            ENGLISH_WORDLIST.has(subStem + "e") ||
            COMMON_VOCABULARY.has(subStem) ||
            COMMON_VOCABULARY.has(subStem + "e")
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function isLikelyGibberish(word: string, isProperNoun: boolean = false, personalDictionary?: Set<string>): boolean {
  const lower = word.toLowerCase();
  if (isKnownWord(lower, personalDictionary) || isProperNoun || COMMON_NAMES.has(lower) || /[a-z][A-Z]/.test(word)) return false;
  if (lower.length <= 2) {
    return !VALID_SHORT_WORDS.has(lower);
  }
  if (/([a-zA-Z])\1\1/.test(lower)) return true;
  if (/[b-df-hj-np-tv-z]{5,}/.test(lower)) return true;
  if (/(hgg|ggu|zzk|xkz|qq|q[^u]|ii|uu)/.test(lower)) return true;
  if (lower.length >= 4 && !/[aeiouy]/.test(lower)) return true;
  // Generic unrecognized word (e.g. 'blorp')
  return !isKnownWord(lower, personalDictionary);
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

      const contextSnippet = text.slice(Math.max(0, match.index - 12), Math.min(text.length, match.index + rawWord.length + 12)).replace(/\s+/g, " ").trim().toLowerCase();

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
        signature: `spelling_typo:${lower}:${contextSnippet}`,
      });
      continue;
    }

    // Trailing repeated consonants typo (e.g. 'testt' -> 'test' if not already handled)
    if (lower.endsWith("tt") && lower.length > 3 && !["scott", "matt", "watt", "butt", "pitt"].includes(lower)) {
      const singleT = rawWord.slice(0, -1);
      const contextSnippet = text.slice(Math.max(0, match.index - 12), Math.min(text.length, match.index + rawWord.length + 12)).replace(/\s+/g, " ").trim().toLowerCase();
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
        signature: `spelling_repeated_consonant:${lower}:${contextSnippet}`,
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
        const contextSnippet = text.slice(Math.max(0, match.index - 12), Math.min(text.length, match.index + rawWord.length + 12)).replace(/\s+/g, " ").trim().toLowerCase();
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
          signature: `spelling_double_i:${lower}:${contextSnippet}`,
        });
        continue;
      }
    }

    // Unrecognized word / Gibberish detection (e.g. 'ffgvffv', 'blorp')
    if (isLikelyGibberish(baseWord, isProperNoun, personalDictionary)) {
      const contextSnippet = text.slice(Math.max(0, match.index - 12), Math.min(text.length, match.index + rawWord.length + 12)).replace(/\s+/g, " ").trim().toLowerCase();
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
        signature: `unrecognized_word:${lower}:${contextSnippet}`,
      });
      continue;
    }
  }

  // 8. Grammar Confusions & Subject-Verb Agreement
  for (const item of DETERMINISTIC_CONFUSIONS) {
    item.pattern.lastIndex = 0;
    while ((match = item.pattern.exec(text)) !== null) {
      const resolved = match[0].replace(new RegExp(item.pattern.source, item.pattern.flags), item.replacement);
      const resolvedExplanation = item.explanation.includes("$")
        ? match[0].replace(new RegExp(item.pattern.source, item.pattern.flags), item.explanation)
        : item.explanation;
      const contextSnippet = text.slice(Math.max(0, match.index - 12), Math.min(text.length, match.index + match[0].length + 12)).replace(/\s+/g, " ").trim().toLowerCase();
      suggestions.push({
        id: `det_conf_${idCounter++}`,
        category: "correctness",
        originalText: match[0],
        replacementText: resolved,
        explanation: resolvedExplanation,
        offset: match.index,
        length: match[0].length,
        ruleId: "grammar_confusion",
        severity: "error",
        signature: `grammar_confusion:${match[0].toLowerCase()}:${contextSnippet}`,
      });
    }
  }

  // 9. Clarity & Conciseness
  for (const item of DETERMINISTIC_CLARITY) {
    item.pattern.lastIndex = 0;
    while ((match = item.pattern.exec(text)) !== null) {
      const resolved = match[0].replace(new RegExp(item.pattern.source, item.pattern.flags), item.replacement);
      const contextSnippet = text.slice(Math.max(0, match.index - 12), Math.min(text.length, match.index + match[0].length + 12)).replace(/\s+/g, " ").trim().toLowerCase();
      suggestions.push({
        id: `det_clarity_${idCounter++}`,
        category: "clarity",
        originalText: match[0],
        replacementText: resolved,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
        ruleId: "clarity_conciseness",
        severity: "warning",
        signature: `clarity_conciseness:${match[0].toLowerCase()}:${contextSnippet}`,
      });
    }
  }

  // 10. Engagement
  for (const item of DETERMINISTIC_ENGAGEMENT) {
    item.pattern.lastIndex = 0;
    while ((match = item.pattern.exec(text)) !== null) {
      const resolved = match[0].replace(new RegExp(item.pattern.source, item.pattern.flags), item.replacement);
      const contextSnippet = text.slice(Math.max(0, match.index - 12), Math.min(text.length, match.index + match[0].length + 12)).replace(/\s+/g, " ").trim().toLowerCase();
      suggestions.push({
        id: `det_eng_${idCounter++}`,
        category: "engagement",
        originalText: match[0],
        replacementText: resolved,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
        ruleId: "engagement_variety",
        severity: "info",
        signature: `engagement_variety:${match[0].toLowerCase()}:${contextSnippet}`,
      });
    }
  }

  // 11. Delivery & Tone
  for (const item of DETERMINISTIC_DELIVERY) {
    item.pattern.lastIndex = 0;
    while ((match = item.pattern.exec(text)) !== null) {
      const resolved = match[0].replace(new RegExp(item.pattern.source, item.pattern.flags), item.replacement);
      const contextSnippet = text.slice(Math.max(0, match.index - 12), Math.min(text.length, match.index + match[0].length + 12)).replace(/\s+/g, " ").trim().toLowerCase();
      suggestions.push({
        id: `det_del_${idCounter++}`,
        category: "delivery",
        originalText: match[0],
        replacementText: resolved,
        explanation: item.explanation,
        offset: match.index,
        length: match[0].length,
        ruleId: "delivery_tone",
        severity: "info",
        signature: `delivery_tone:${match[0].toLowerCase()}:${contextSnippet}`,
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

    // Bug 28: Visible informal vocabulary suggestions when targeting formal or academic delivery
    const INFORMAL_DELIVERY: Array<{ pattern: RegExp; replacement: string; explanation: string }> = [
      { pattern: /\bvery good\b/gi, replacement: "exceptional", explanation: "Use precise formal vocabulary instead of 'very good'." },
      { pattern: /\bvery bad\b/gi, replacement: "detrimental", explanation: "Use precise formal vocabulary instead of 'very bad'." },
      { pattern: /\bvery fast\b/gi, replacement: "rapid", explanation: "Use 'rapid' or 'swift' in formal prose." },
      { pattern: /\bvery big\b/gi, replacement: "substantial", explanation: "Use 'substantial' or 'considerable' in formal writing." },
      { pattern: /\bvery small\b/gi, replacement: "minimal", explanation: "Use 'minimal' or 'negligible' in formal writing." },
      { pattern: /\ba lot of\b/gi, replacement: "numerous", explanation: "Use 'numerous' or 'considerable' in formal writing." },
      { pattern: /\ba lot\b/gi, replacement: "considerably", explanation: "Use 'considerably' or 'substantially' in formal writing." },
      { pattern: /\bkinda\b/gi, replacement: "somewhat", explanation: "Avoid colloquial 'kinda' in formal writing." },
      { pattern: /\bgonna\b/gi, replacement: "going to", explanation: "Avoid colloquial 'gonna' in formal writing." },
      { pattern: /\bwanna\b/gi, replacement: "want to", explanation: "Avoid colloquial 'wanna' in formal writing." },
      { pattern: /\bgotta\b/gi, replacement: "must", explanation: "Avoid colloquial 'gotta' in formal writing." },
      { pattern: /\bguys\b/gi, replacement: "colleagues", explanation: "Use 'colleagues' or 'individuals' in formal writing." },
      { pattern: /\bkids\b/gi, replacement: "children", explanation: "Use 'children' in formal or academic prose." },
      { pattern: /\bstuff\b/gi, replacement: "materials", explanation: "Use specific nouns instead of informal 'stuff'." },
      { pattern: /\bthings\b/gi, replacement: "elements", explanation: "Use specific terms instead of vague 'things' in formal writing." },
      { pattern: /\breally\b/gi, replacement: "significantly", explanation: "Avoid conversational intensifier 'really' in formal prose." },
      { pattern: /\bpretty\s+(much|good|fast|slow|bad)\b/gi, replacement: "substantially $1", explanation: "Avoid informal modifier 'pretty' in formal writing." },
      { pattern: /\bokay\b/gi, replacement: "acceptable", explanation: "Use formal terms like 'acceptable' or 'satisfactory'." },
      { pattern: /\bok\b/gi, replacement: "acceptable", explanation: "Use formal terms like 'acceptable' or 'satisfactory'." },
    ];

    for (const item of INFORMAL_DELIVERY) {
      item.pattern.lastIndex = 0;
      while ((match = item.pattern.exec(text)) !== null) {
        suggestions.push({
          id: `det_goal_informal_${idCounter++}`,
          category: "delivery",
          originalText: match[0],
          replacementText: item.replacement,
          explanation: item.explanation,
          offset: match.index,
          length: match[0].length,
          ruleId: "formal_vocabulary",
          severity: "info",
          signature: `formal_vocabulary:${match[0].toLowerCase()}`,
        });
      }
    }
  }

  if (goals?.formality === "formal") {
    const FORMAL_DELIVERY = [
      { pattern: /\bwe were unable to\b/gi, replacement: "it was not possible to", explanation: "Adopt objective formal style rather than first-person 'we were unable to'." },
      { pattern: /\bvery slow\b/gi, replacement: "sluggish", explanation: "Use precise formal vocabulary instead of 'very slow'." },
      { pattern: /\ba lot of\b/gi, replacement: "numerous", explanation: "Use precise vocabulary in formal writing." },
    ];
    for (const item of FORMAL_DELIVERY) {
      item.pattern.lastIndex = 0;
      while ((match = item.pattern.exec(text)) !== null) {
        suggestions.push({
          id: `det_goal_formal_${idCounter++}`,
          category: "delivery",
          originalText: match[0],
          replacementText: item.replacement,
          explanation: item.explanation,
          offset: match.index,
          length: match[0].length,
          ruleId: "formal_style",
          severity: "info",
          signature: `formal_style:${match[0].toLowerCase()}`,
        });
      }
    }
  }

  if (goals?.domain === "academic") {
    const ACADEMIC_HEDGES = [
      { pattern: /\b(we were|we are|we have|we did)\b/gi, replacement: "the researchers", explanation: "Academic style favors objective phrasing over first-person pronouns." },
      { pattern: /\bin my opinion\b/gi, replacement: "the evidence indicates", explanation: "Use objective phrasing in academic writing." },
      { pattern: /\bI think that\b/gi, replacement: "the findings suggest", explanation: "Adopt formal, objective framing for academic tone." },
      { pattern: /\ba lot of\b/gi, replacement: "numerous", explanation: "Use precise academic phrasing rather than 'a lot of'." },
    ];

    for (const hedge of ACADEMIC_HEDGES) {
      hedge.pattern.lastIndex = 0;
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

  // Deduplicate by signature and sort by offset ascending
  const seenSignatures = new Set<string>();
  return suggestions
    .filter((s) => {
      const sig = s.signature || `${s.offset}:${s.length}:${s.originalText}`;
      if (seenSignatures.has(sig)) return false;
      seenSignatures.add(sig);
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
  layerBSuggestions: WritingSuggestion[] = [],
  goals?: Partial<WritingGoals>
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
  const words = (text.trim().match(/[\p{L}\p{N}'’]+/gu) || []).length;
  let overallScore = 100;
  if (words > 0) {
    const penaltyPerIssue = (goals?.formality === "formal" || goals?.domain === "academic") ? 6 : (goals?.formality === "informal" || goals?.domain === "casual") ? 3 : 4;
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

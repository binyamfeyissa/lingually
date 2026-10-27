import { WritingGoals } from "@/types/suggestions";

const DICTIONARY_STORAGE_KEY = "lingually_personal_dict";
const GOALS_STORAGE_KEY = "lingually_writing_goals";

export const DEFAULT_GOALS: WritingGoals = {
  audience: "general",
  formality: "neutral",
  domain: "general",
  intent: "inform",
};

export const PersonalDictionary = {
  getWords(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(DICTIONARY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addWord(word: string): void {
    if (typeof window === "undefined") return;
    const clean = word.trim().toLowerCase();
    if (!clean) return;

    const current = this.getWords();
    if (!current.includes(clean)) {
      current.push(clean);
      localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(current.sort()));
    }
  },

  removeWord(word: string): void {
    if (typeof window === "undefined") return;
    const clean = word.trim().toLowerCase();
    const updated = this.getWords().filter((w) => w !== clean);
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(updated));
  },

  hasWord(word: string): boolean {
    const clean = word.trim().toLowerCase();
    return this.getWords().includes(clean);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(DICTIONARY_STORAGE_KEY);
  },
};

export const WritingGoalsManager = {
  getGoals(): WritingGoals {
    if (typeof window === "undefined") return DEFAULT_GOALS;
    try {
      const raw = localStorage.getItem(GOALS_STORAGE_KEY);
      return raw ? { ...DEFAULT_GOALS, ...JSON.parse(raw) } : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  },

  setGoals(goals: Partial<WritingGoals>): WritingGoals {
    if (typeof window === "undefined") return DEFAULT_GOALS;
    const updated = { ...this.getGoals(), ...goals };
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};

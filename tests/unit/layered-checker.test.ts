import { describe, it, expect } from "vitest";
import { runLocalDeterministicCheck, compileLayeredCheckResult } from "@/lib/analysis/layered-checker";
import { sanitizeErrorMessage } from "@/lib/security/sanitization";

describe("Layered Deterministic Checker & Security", () => {
  it("flags 'testt' as a spelling typo (Bug 6b, Bug 25)", () => {
    const text = "This is a testt.";
    const suggestions = runLocalDeterministicCheck(text);
    const testtSugg = suggestions.find((s) => s.originalText.toLowerCase() === "testt");
    expect(testtSugg).toBeDefined();
    expect(testtSugg?.replacementText.toLowerCase()).toBe("test");
    expect(testtSugg?.category).toBe("correctness");
    expect(testtSugg?.signature).toBeDefined();
  });

  it("does not flag possessives like 'browser\\'s' as unrecognized word (Bug 6a, Bug 25)", () => {
    const text = "Checking the browser's cache and someone else's cloud.";
    const suggestions = runLocalDeterministicCheck(text);
    const sFragment = suggestions.find((s) => s.originalText === "s" || s.originalText === "'s");
    expect(sFragment).toBeUndefined();
  });

  it("does not flag repeated word across heading and body paragraph boundaries (Bug 6a)", () => {
    const text = "Lingually\n\nLingually is a local-first workbench.";
    const suggestions = runLocalDeterministicCheck(text);
    const repSugg = suggestions.find((s) => s.ruleId === "repeated_word");
    expect(repSugg).toBeUndefined();
  });

  it("flags repeated words on the same line (Bug 6, Bug 25)", () => {
    const text = "This is of the the browser cache.";
    const suggestions = runLocalDeterministicCheck(text);
    const repSugg = suggestions.find((s) => s.ruleId === "repeated_word");
    expect(repSugg).toBeDefined();
    expect(repSugg?.originalText.toLowerCase()).toBe("the the");
    expect(repSugg?.replacementText.toLowerCase()).toBe("the");
  });

  it("flags subject-verb agreement error 'The dogs runs' without literal regex placeholders (Bug 25, Bug 29)", () => {
    const text = "The dogs runs quickly.";
    const suggestions = runLocalDeterministicCheck(text);
    const agrSugg = suggestions.find((s) => s.ruleId === "grammar_confusion" && s.originalText.includes("runs"));
    expect(agrSugg).toBeDefined();
    expect(agrSugg?.replacementText).toBe("The dogs run");
    expect(agrSugg?.replacementText).not.toContain("$1");
  });

  it("flags capitalized misspellings like 'Definately' and preserves capitalization (Bug 30)", () => {
    const text = "Definately we will succeed.";
    const suggestions = runLocalDeterministicCheck(text);
    const typo = suggestions.find((s) => s.ruleId === "spelling_typo");
    expect(typo).toBeDefined();
    expect(typo?.originalText).toBe("Definately");
    expect(typo?.replacementText).toBe("Definitely");
  });

  it("flags generic unrecognized words like 'blorp' (Bug 31)", () => {
    const text = "The blorp is here. A blorp is there.";
    const suggestions = runLocalDeterministicCheck(text);
    const unrecognized = suggestions.filter((s) => s.ruleId === "unrecognized_word");
    expect(unrecognized.length).toBeGreaterThan(0);
    expect(unrecognized.some((s) => s.originalText.toLowerCase() === "blorp")).toBe(true);
  });

  it("flags wordiness like 'in a timely manner' and 'very slow' (Bug 25)", () => {
    const text = "The system is very slow and we must act in a timely manner.";
    const suggestions = runLocalDeterministicCheck(text);
    const timelySugg = suggestions.find((s) => s.originalText.includes("in a timely manner"));
    const slowSugg = suggestions.find((s) => s.originalText.includes("very slow"));
    expect(timelySugg).toBeDefined();
    expect(timelySugg?.replacementText).toBe("promptly");
    expect(slowSugg).toBeDefined();
    expect(slowSugg?.replacementText).toBe("sluggish");
  });

  it("flags missing space after period like 'red.because' (Bug 25)", () => {
    const text = "The light turned red.because the signal failed.";
    const suggestions = runLocalDeterministicCheck(text);
    const spaceSugg = suggestions.find((s) => s.ruleId === "missing_space_after_period");
    expect(spaceSugg).toBeDefined();
    expect(spaceSugg?.replacementText).toBe("red. Because");
  });

  it("enforces writing goals formality by flagging contractions in formal mode (Bug 28)", () => {
    const text = "We don't think it's ready yet.";
    const neutralSuggestions = runLocalDeterministicCheck(text, new Set(), { formality: "neutral", domain: "general" });
    const formalSuggestions = runLocalDeterministicCheck(text, new Set(), { formality: "formal", domain: "academic" });

    const neutralContr = neutralSuggestions.filter((s) => s.ruleId === "formal_contractions");
    const formalContr = formalSuggestions.filter((s) => s.ruleId === "formal_contractions");

    expect(neutralContr.length).toBe(0);
    expect(formalContr.length).toBeGreaterThan(0);
    expect(formalContr.some((s) => s.replacementText.toLowerCase() === "do not")).toBe(true);
    expect(formalContr.some((s) => s.replacementText.toLowerCase() === "it is")).toBe(true);
  });

  it("attaches stable deterministic signatures to suggestions (Bug 16)", () => {
    const text = "This is a testt definately the the dog.";
    const suggestions = runLocalDeterministicCheck(text);
    for (const s of suggestions) {
      expect(s.signature).toBeDefined();
      expect(typeof s.signature).toBe("string");
      expect(s.signature?.length).toBeGreaterThan(0);
    }
  });

  it("sanitizes error messages by redacting submitted API keys (Bug 2)", () => {
    const fakeKey = "test-secret-key-12345";
    const rawError = `Incorrect API key provided: ${fakeKey}. You can find your API key at https://platform.openai.com`;
    const sanitized = sanitizeErrorMessage(rawError, fakeKey);

    expect(sanitized).not.toContain(fakeKey);
    expect(sanitized).toContain("[REDACTED]");
  });

  it("does not flag common English words as unrecognized (Bug 33)", () => {
    const text = "We should give the dog a bone when it jumps. Two pairs of shoes require deep intelligence and rewriting precision.";
    const suggestions = runLocalDeterministicCheck(text);
    const unrec = suggestions.filter((s) => s.ruleId === "unrecognized_word");
    expect(unrec.length).toBe(0);
  });

  it("produces zero unrecognized-word issues on the untouched Welcome document (Bug 33)", () => {
    const welcomeText = `Lingually is a complete, private, and open-source AI writing workbench. It pairs deep editing intelligence with the rewriting precision of modern language models—without requiring an expensive subscription or locking your private thoughts in someone else's cloud.

How to use this editor:
- Select text: Highlight any sentence or paragraph to trigger the contextual AI action menu.
- Refine your writing: Fix grammar, rephrase in distinct styles, modulate tone, or condense complex paragraphs using the assistant panel on the right.
- Bring Your Own Key (BYOK): Click Settings to configure OpenAI, Gemini, Claude, Groq, Ollama (local), or any OpenAI-compatible API endpoint.
- Local-First Storage: All your documents stay stored in your browser's IndexedDB. Nothing is sent anywhere unless you trigger an AI action.

Try highlighting this sentence right now and clicking Improve Writing or Paraphrase to see the side-by-side diff comparison in action!`;
    const suggestions = runLocalDeterministicCheck(welcomeText);
    const unrec = suggestions.filter((s) => s.ruleId === "unrecognized_word");
    expect(unrec).toEqual([]);
  });

  it("flags singular subject with plural verb: 'The dog run' (Bug 34)", () => {
    const text = "The dog run fast.";
    const suggestions = runLocalDeterministicCheck(text);
    const sv = suggestions.find((s) => s.ruleId === "grammar_confusion" && s.originalText.includes("dog run"));
    expect(sv).toBeDefined();
    expect(sv?.replacementText).toBe("The dog runs");
  });

  it("flags plural pronoun with singular verb: 'They runs' (Bug 34)", () => {
    const text = "They runs fast.";
    const suggestions = runLocalDeterministicCheck(text);
    const sv = suggestions.find((s) => s.ruleId === "grammar_confusion" && s.originalText.includes("They runs"));
    expect(sv).toBeDefined();
    expect(sv?.replacementText).toBe("They run");
  });

  it("flags plural noun with singular 'is': 'The dogs is happy' (Bug 34)", () => {
    const text = "The dogs is happy.";
    const suggestions = runLocalDeterministicCheck(text);
    const sv = suggestions.find((s) => s.ruleId === "grammar_confusion" && s.originalText.includes("dogs is"));
    expect(sv).toBeDefined();
    expect(sv?.replacementText).toBe("The dogs are");
  });

  it("flags missing possessive apostrophe in 'dogs bone' (Bug 6)", () => {
    const text = "The dogs bone is small.";
    const suggestions = runLocalDeterministicCheck(text);
    const poss = suggestions.find((s) => s.originalText.includes("dogs bone"));
    expect(poss).toBeDefined();
    expect(poss?.replacementText).toContain("dog's bone");
  });

  it("visibly expands issue list when switching GOALS to formal/academic (Bug 28)", () => {
    const text = "This is a lot of stuff and really very good.";
    const neutralSuggestions = runLocalDeterministicCheck(text, new Set(), { formality: "neutral", domain: "general" });
    const formalSuggestions = runLocalDeterministicCheck(text, new Set(), { formality: "formal", domain: "academic" });

    // Formal goals flags informal delivery patterns
    const formalDelivery = formalSuggestions.filter((s) => s.ruleId === "formal_vocabulary");
    expect(formalDelivery.length).toBeGreaterThan(0);
    expect(formalSuggestions.length).toBeGreaterThan(neutralSuggestions.length);
  });
});

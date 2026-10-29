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

  it("flags subject-verb agreement error 'The dogs runs' (Bug 25)", () => {
    const text = "The dogs runs quickly.";
    const suggestions = runLocalDeterministicCheck(text);
    const agrSugg = suggestions.find((s) => s.ruleId === "grammar_confusion" && s.originalText.includes("runs"));
    expect(agrSugg).toBeDefined();
    expect(agrSugg?.replacementText).toContain("run");
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
});

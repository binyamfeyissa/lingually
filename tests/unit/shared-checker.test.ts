import { describe, it, expect } from "vitest";
import { runExtensionCheck, paraphraseText } from "../../apps/chrome-extension/src/shared-checker";

describe("Extension Checker & Paraphraser Engine", () => {
  it("flags gibberish/unrecognized words with empty replacementText (to remove) instead of 'check spelling'", () => {
    const text = "So I was thinking of going out this ffgvffv";
    const suggestions = runExtensionCheck(text);

    const gibberishSugg = suggestions.find((s) => s.originalText === "ffgvffv");
    expect(gibberishSugg).toBeDefined();
    expect(gibberishSugg?.replacementText).toBe("");
    expect(gibberishSugg?.explanation).toContain("Remove it or add to dictionary");
    expect(gibberishSugg?.replacementText).not.toBe("check spelling");
  });

  it("generates distinct, styled rephrases for all 5 paraphrase modes", () => {
    const input = "So I was thinking of going out this check spelling";
    const standard = paraphraseText(input, "standard");
    const fluency = paraphraseText(input, "fluency");
    const formal = paraphraseText(input, "formal");
    const shorten = paraphraseText(input, "shorten");
    const expand = paraphraseText(input, "expand");

    expect(standard).not.toBe(input);
    expect(fluency).not.toBe(input);
    expect(formal).not.toBe(input);
    expect(shorten).not.toBe(input);
    expect(expand).not.toBe(input);

    // Verify distinct styles
    expect(formal).toContain("Consequently");
    expect(shorten.length).toBeLessThan(expand.length);
    expect(expand).toContain("actively considering");
  });

  it("does not flag valid English words like Consequently, essence, or agenda as unrecognized", () => {
    const text = "Consequently, in essence, our agenda is ready.";
    const suggestions = runExtensionCheck(text);

    const consequentSugg = suggestions.find((s) => /consequently/i.test(s.originalText));
    const essenceSugg = suggestions.find((s) => /essence/i.test(s.originalText));
    const agendaSugg = suggestions.find((s) => /agenda/i.test(s.originalText));

    expect(consequentSugg).toBeUndefined();
    expect(essenceSugg).toBeUndefined();
    expect(agendaSugg).toBeUndefined();
  });

  it("does not judge proper names or links/URLs", () => {
    const text = "I met with John and Binyam to test QuillBot at https://getartcraft.com/apps/photocraft";
    const suggestions = runExtensionCheck(text);

    // None of the names or link segments should be flagged as errors or gibberish
    const flaggedWords = suggestions.map((s) => s.originalText);
    expect(flaggedWords).not.toContain("John");
    expect(flaggedWords).not.toContain("Binyam");
    expect(flaggedWords).not.toContain("QuillBot");
    expect(flaggedWords).not.toContain("getartcraft");
    expect(flaggedWords).not.toContain("photocraft");
  });

  it("does not infinitely suggest rephrasing on already-clean sentences", () => {
    const cleanSentence = "In essence, I was considering heading out this evening.";
    const suggestions = runExtensionCheck(cleanSentence);

    const rephraseSugg = suggestions.find((s) => s.explanation.toLowerCase().includes("rephrase"));
    expect(rephraseSugg).toBeUndefined();
  });

  it("never duplicates starters like 'In essence, in essence' in paraphrasing", () => {
    const text = "In essence, I was considering heading out this evening.";
    const result = paraphraseText(text, "standard", false);

    expect(result).not.toContain("In essence, in essence");
    expect(result).not.toContain("In essence, In essence");
  });
});

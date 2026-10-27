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
});

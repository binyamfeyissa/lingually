import { describe, it, expect } from "vitest";
import { calculateTextStatistics } from "@/lib/analysis/statistics";

describe("calculateTextStatistics", () => {
  it("handles empty or whitespace strings correctly", () => {
    const res = calculateTextStatistics("   ");
    expect(res.wordCount).toBe(0);
    expect(res.characterCount).toBe(0);
    expect(res.sentenceCount).toBe(0);
    expect(res.paragraphCount).toBe(0);
    expect(res.readingTimeMinutes).toBe(0);
  });

  it("calculates accurate word and character counts", () => {
    const text = "The quick brown fox jumps over the lazy dog.";
    const res = calculateTextStatistics(text);

    expect(res.wordCount).toBe(9);
    expect(res.characterCount).toBe(44);
    expect(res.characterCountNoSpaces).toBe(36);
    expect(res.sentenceCount).toBe(1);
    expect(res.paragraphCount).toBe(1);
    expect(res.averageWordsPerSentence).toBe(9);
  });

  it("calculates paragraphs and reading time", () => {
    const multiParagraph = "Paragraph one with some text.\n\nParagraph two with more sentences. And another sentence.";
    const res = calculateTextStatistics(multiParagraph);

    expect(res.paragraphCount).toBe(2);
    expect(res.sentenceCount).toBe(3);
    expect(res.readingTimeMinutes).toBeGreaterThan(0);
  });

  it("computes lexical diversity and frequent terms while filtering stop words", () => {
    const text = "Writing clearly helps writers write with clarity and purpose. Writing requires revision.";
    const res = calculateTextStatistics(text);

    expect(res.lexicalDiversity).toBeGreaterThan(0);
    expect(res.lexicalDiversity).toBeLessThanOrEqual(1);
    // Common words like "and", "with" are filtered from frequentWords
    const words = res.frequentWords.map((f) => f.word);
    expect(words).not.toContain("and");
    expect(words).not.toContain("with");
  });
});

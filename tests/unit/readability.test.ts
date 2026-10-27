import { describe, it, expect } from "vitest";
import { calculateReadability, isLikelyEnglishText, countSyllablesInWord } from "@/lib/analysis/readability";

describe("readability metrics", () => {
  it("accurately counts syllables for English words", () => {
    expect(countSyllablesInWord("cat")).toBe(1);
    expect(countSyllablesInWord("paper")).toBe(2);
    expect(countSyllablesInWord("writing")).toBe(2);
    expect(countSyllablesInWord("comprehensive")).toBe(4);
  });

  it("identifies English vs non-English scripts", () => {
    expect(isLikelyEnglishText("The quick brown fox jumps over the lazy dog.")).toBe(true);
    expect(isLikelyEnglishText("这是一个中文测试")).toBe(false);
    expect(isLikelyEnglishText("هذا اختبار باللغة العربية")).toBe(false);
  });

  it("returns unavailable notice for non-English text", () => {
    const res = calculateReadability("これは日本語の文章です。読解力の測定は英語専用です。");
    expect(res.isReliableForLanguage).toBe(false);
    expect(res.languageNote).toContain("exclusively for English");
  });

  it("calculates Flesch Reading Ease and Grade Level on standard English prose", () => {
    const text =
      "This is a straightforward paragraph designed to test readability scoring. " +
      "Simple sentences are easy to read and understand. Children and adults can process them rapidly.";

    const res = calculateReadability(text);
    expect(res.isReliableForLanguage).toBe(true);
    expect(res.fleschReadingEase).toBeGreaterThan(0);
    expect(res.fleschReadingEase).toBeLessThanOrEqual(100);
    expect(res.fleschKincaidGradeLevel).toBeGreaterThan(0);
    expect(res.readingEaseLabel).toBeDefined();
  });
});

import { describe, it, expect } from "vitest";
import { analyzeAIWritingIndicators } from "@/lib/analysis/heuristics";

describe("AI Writing Indicators (Experimental Heuristic)", () => {
  it("includes prominent mandatory disclaimer", () => {
    const res = analyzeAIWritingIndicators("Some sample writing text for analysis.");
    expect(res.disclaimer).toContain("EXPERIMENTAL HEURISTIC ONLY");
    expect(res.disclaimer).toContain("not definitive proof");
  });

  it("handles short text gracefully with minimum threshold notice", () => {
    const res = analyzeAIWritingIndicators("Too short.");
    expect(res.overallAssessment).toBe("Low AI writing indicators");
    expect(res.detectedPatterns[0]).toContain("minimum 20 words required");
  });

  it("detects formulaic transition tropes and phrases", () => {
    const formulaicText =
      "It is important to note that navigating the complexities of modern software is a testament to human ingenuity. " +
      "Furthermore, delving into this rich tapestry underscores the importance of a holistic approach. " +
      "Moreover, plays a vital role in our digital age. In conclusion, it fosters a sense of wonder.";

    const res = analyzeAIWritingIndicators(formulaicText);
    expect(res.formalClichéDensity).toBeGreaterThan(0);
    expect(res.transitionWordDensity).toBeGreaterThan(0);
    expect(res.detectedPatterns.some((p) => p.includes("formulaic phrases") || p.includes("transitional opening"))).toBe(true);
  });
});

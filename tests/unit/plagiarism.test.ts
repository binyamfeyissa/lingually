import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  extractDistinctiveQueries,
  computeTextSimilarity,
  checkPlagiarism,
} from "@/lib/analysis/plagiarism";

describe("Plagiarism Engine & N-Gram Analyzer", () => {
  it("extracts distinctive queries from sentences with sufficient words", () => {
    const text =
      "Photosynthesis is a biological process used by many organisms to convert light energy into chemical energy. This chemical energy is stored in carbohydrate molecules such as sugars and starches.";
    const queries = extractDistinctiveQueries(text, 3);
    expect(queries.length).toBeGreaterThan(0);
    expect(queries[0]).toMatch(/^"[^"]+"$/);
  });

  it("computes word-level Jaccard similarity between texts", () => {
    const textA = "Photosynthesis is a biological process used by many organisms.";
    const textB = "Photosynthesis is a biological process utilized by different organisms.";
    const sim = computeTextSimilarity(textA, textB);
    expect(sim).toBeGreaterThan(0.4);

    const unrelated = "Quantum mechanics describes the physical properties of nature.";
    const simUnrelated = computeTextSimilarity(textA, unrelated);
    expect(simUnrelated).toBeLessThan(0.15);
  });

  it("handles documents under 20 words gracefully with minimum threshold notice", async () => {
    const shortText = "This is a brief text under 20 words.";
    const report = await checkPlagiarism({ text: shortText });
    expect(report.overallSimilarityPercentage).toBe(0);
    expect(report.sourceCoverageNotice).toContain("minimum 20 words required");
  });

  it("matches body paragraphs against full Wikipedia article text (Bug 40)", async () => {
    // Mock fetch for Wikipedia search and full article extract (without exintro)
    const mockOverviewText =
      "Photosynthetic organisms are photoautotrophs, which means that they are able to synthesize food directly from carbon dioxide and water using energy from light. However, not all organisms use carbon dioxide as a source of carbon atoms to carry out photosynthesis; photoheterotrophs use organic compounds, rather than carbon dioxide, as a source of carbon.";

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("action=query&list=search")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              query: {
                search: [
                  {
                    title: "Photosynthesis",
                    snippet: "<span>Photosynthetic</span> organisms are photoautotrophs...",
                  },
                ],
              },
            }),
        });
      }
      if (url.includes("action=query&prop=extracts")) {
        // Must NOT require exintro=1 so body text is returned
        expect(url).not.toContain("exintro=1");
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              query: {
                pages: {
                  "123": {
                    title: "Photosynthesis",
                    extract: mockOverviewText,
                  },
                },
              },
            }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    try {
      const report = await checkPlagiarism({ text: mockOverviewText });
      expect(report.overallSimilarityPercentage).toBeGreaterThanOrEqual(80);
      expect(report.matches.length).toBeGreaterThan(0);
      expect(report.matches[0].sourceTitle).toContain("Wikipedia: Photosynthesis");
    } finally {
      global.fetch = originalFetch;
    }
  });
});

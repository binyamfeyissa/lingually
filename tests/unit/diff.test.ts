import { describe, it, expect } from "vitest";
import { computeWordDiff, computeCharDiff } from "@/lib/utils/diff";

describe("Diff Utilities", () => {
  it("computes word-level diff correctly", () => {
    const original = "The red car drove fast.";
    const suggested = "The blue car drove very fast.";

    const diff = computeWordDiff(original, suggested);
    expect(diff.hasChanges).toBe(true);
    expect(diff.additionsCount).toBeGreaterThan(0);
    expect(diff.deletionsCount).toBeGreaterThan(0);

    const addedParts = diff.parts.filter((p) => p.added).map((p) => p.value);
    const removedParts = diff.parts.filter((p) => p.removed).map((p) => p.value);

    expect(addedParts.some((p) => p.includes("blue"))).toBe(true);
    expect(removedParts.some((p) => p.includes("red"))).toBe(true);
  });

  it("handles identical texts with zero additions or deletions", () => {
    const text = "Identical text content.";
    const diff = computeWordDiff(text, text);

    expect(diff.hasChanges).toBe(false);
    expect(diff.additionsCount).toBe(0);
    expect(diff.deletionsCount).toBe(0);
  });

  it("computes character-level diff", () => {
    const diff = computeCharDiff("speling", "spelling");
    expect(diff.hasChanges).toBe(true);
    expect(diff.additionsCount).toBe(1); // added 'l'
  });
});

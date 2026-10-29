import { describe, it, expect } from "vitest";
import { mapPlainTextOffsetToDocPos } from "@/lib/editor/issue-decorations";
import { Schema } from "@tiptap/pm/model";

describe("Issue Decorations Position Mapping (Bug 42)", () => {
  const schema = new Schema({
    nodes: {
      doc: { content: "block+" },
      paragraph: { group: "block", content: "text*" },
      text: { inline: true },
    },
  });

  it("accurately maps standalone letter offset instead of matching inside words", () => {
    // "I love editing models. d"
    const textNode = schema.text("I love editing models. d");
    const p = schema.nodes.paragraph.create({}, textNode);
    const doc = schema.nodes.doc.create({}, p);

    // Standalone "d" is at offset 23, length 1
    const mapped = mapPlainTextOffsetToDocPos(doc, 23, 1);
    expect(mapped).not.toBeNull();
    if (mapped) {
      // In doc, paragraph open is pos 0, so content starts at pos 1. 1 + 23 = 24
      expect(mapped.from).toBe(24);
      expect(mapped.to).toBe(25);
      expect(doc.textBetween(mapped.from, mapped.to)).toBe("d");
    }
  });

  it("accurately maps positions across multiple paragraphs", () => {
    const text1 = "First paragraph.";
    const text2 = "Lingually is fun. i";
    const p1 = schema.nodes.paragraph.create({}, schema.text(text1));
    const p2 = schema.nodes.paragraph.create({}, schema.text(text2));
    const doc = schema.nodes.doc.create({}, [p1, p2]);

    const plainText = `${text1}\n\n${text2}`;
    const targetOffset = plainText.lastIndexOf("i");

    const mapped = mapPlainTextOffsetToDocPos(doc, targetOffset, 1);
    expect(mapped).not.toBeNull();
    if (mapped) {
      expect(doc.textBetween(mapped.from, mapped.to)).toBe("i");
    }
  });
});

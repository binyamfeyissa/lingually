import { describe, it, expect } from "vitest";
import { htmlToMarkdown } from "@/lib/utils/export";
import { markdownToHtml } from "@/lib/utils/import";
import { sanitizeContent } from "@/lib/security/sanitization";

describe("Import and Export format conversion & sanitization", () => {
  it("converts HTML headings and bold/italics to Markdown", () => {
    const html = "<h1>Title</h1><p>This is <strong>bold</strong> and <em>italic</em>.</p>";
    const md = htmlToMarkdown(html);

    expect(md).toContain("# Title");
    expect(md).toContain("**bold**");
    expect(md).toContain("*italic*");
  });

  it("converts basic Markdown to HTML", () => {
    const md = "# Heading 1\n\nParagraph with **bold text**.";
    const html = markdownToHtml(md);

    expect(html).toContain("<h1>Heading 1</h1>");
    expect(html).toContain("<strong>bold text</strong>");
  });

  it("sanitizes dangerous script and inline event handlers from HTML", () => {
    const malicious = '<p>Normal text</p><script>alert("hack")</script><img src="x" onerror="alert(1)"><a href="javascript:alert(2)">Link</a>';
    const clean = sanitizeContent(malicious);

    expect(clean).toContain("<p>Normal text</p>");
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("alert");
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("javascript:");
  });
});

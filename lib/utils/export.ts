import { DocumentRecord, DocumentBackup, DocumentRevision, FolderRecord } from "@/types/document";
import { Document, Paragraph, TextRun, Packer, HeadingLevel } from "docx";
import { sanitizeContent } from "../security/sanitization";

/**
 * Triggers a client-side file download in the browser.
 */
export function triggerDownload(content: Blob | string, filename: string, mimeType: string) {
  if (typeof window === "undefined") return;

  const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(title: string): string {
  return title
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase() || "untitled";
}

/**
 * Exports document as plain text (.txt).
 */
export function exportAsPlainText(doc: DocumentRecord): void {
  const filename = `${sanitizeFilename(doc.title)}.txt`;
  triggerDownload(doc.plainText, filename, "text/plain;charset=utf-8");
}

/**
 * Converts simple HTML to clean Markdown.
 */
export function htmlToMarkdown(html: string): string {
  let md = html
    .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<h4>(.*?)<\/h4>/gi, "#### $1\n\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<code>(.*?)<\/code>/gi, "`$1`")
    .replace(/<blockquote>(.*?)<\/blockquote>/gi, "> $1\n\n")
    .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<ul>/gi, "")
    .replace(/<\/ul>/gi, "\n")
    .replace(/<ol>/gi, "")
    .replace(/<\/ol>/gi, "\n")
    .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, ""); // Strip any remaining tags

  // Unescape common HTML entities
  md = md
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  return md.trim();
}

/**
 * Exports document as Markdown (.md).
 */
export function exportAsMarkdown(doc: DocumentRecord): void {
  const filename = `${sanitizeFilename(doc.title)}.md`;
  const markdown = htmlToMarkdown(doc.content);
  triggerDownload(markdown, filename, "text/markdown;charset=utf-8");
}

/**
 * Exports document as clean, sanitized HTML (.html).
 */
export function exportAsHTML(doc: DocumentRecord): void {
  const filename = `${sanitizeFilename(doc.title)}.html`;
  const cleanBody = sanitizeContent(doc.content);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeXml(doc.title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 760px; margin: 40px auto; padding: 0 20px; color: #1f2937; }
    h1, h2, h3 { color: #111827; }
    blockquote { border-left: 4px solid #e5e7eb; margin: 1.5em 0; padding-left: 1em; color: #4b5563; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${escapeXml(doc.title)}</h1>
  ${cleanBody}
</body>
</html>`;

  triggerDownload(fullHtml, filename, "text/html;charset=utf-8");
}

/**
 * Exports document as Microsoft Word (.docx).
 */
export async function exportAsDocx(doc: DocumentRecord): Promise<void> {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: doc.title,
      heading: HeadingLevel.TITLE,
    }),
  ];

  // Split plain text paragraphs into Word document paragraphs
  const rawParagraphs = doc.plainText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  for (const text of rawParagraphs) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun(text.trim())],
        spacing: { after: 200 },
      })
    );
  }

  const docxDocument = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(docxDocument);
  const filename = `${sanitizeFilename(doc.title)}.docx`;
  triggerDownload(blob, filename, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}

/**
 * Exports single document or complete library backup as JSON.
 * STRICT SECURITY: NEVER includes credentials, API keys, or settings.
 */
export function exportAsBackup(documents: DocumentRecord[], revisions?: DocumentRevision[], folders?: FolderRecord[]): void {
  const backup: DocumentBackup = {
    version: 1,
    exportedAt: Date.now(),
    app: "lingually",
    documents,
    revisions,
    folders,
  };

  const filename = `lingually_backup_${new Date().toISOString().split("T")[0]}.json`;
  const jsonStr = JSON.stringify(backup, null, 2);
  triggerDownload(jsonStr, filename, "application/json;charset=utf-8");
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

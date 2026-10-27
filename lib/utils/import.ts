import mammoth from "mammoth";
import { z } from "zod";
import { DocumentBackup } from "@/types/document";
import { sanitizeContent, escapeHtml } from "../security/sanitization";

export interface ImportedDocumentData {
  title: string;
  content: string;
  plainText: string;
}

const BackupSchema = z.object({
  version: z.number(),
  exportedAt: z.number(),
  app: z.literal("lingually"),
  documents: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      plainText: z.string(),
      createdAt: z.number(),
      updatedAt: z.number(),
      favorite: z.boolean(),
      folderId: z.string().optional(),
      tags: z.array(z.string()).optional(),
      wordCount: z.number(),
      characterCount: z.number(),
      schemaVersion: z.number(),
    })
  ),
  revisions: z.array(z.any()).optional(),
  folders: z.array(z.any()).optional(),
});

/**
 * Parses and validates an uploaded file.
 */
export async function importFile(file: File): Promise<{
  isBackup: boolean;
  singleDoc?: ImportedDocumentData;
  backupData?: DocumentBackup;
}> {
  // Validate file size limit (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File exceeds maximum allowable upload size of 10 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  const baseTitle = file.name.replace(/\.[^/.]+$/, "");

  if (extension === "txt") {
    const text = await file.text();
    const html = text
      .split(/\n\s*\n/)
      .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
      .join("");
    return {
      isBackup: false,
      singleDoc: {
        title: baseTitle,
        content: html,
        plainText: text,
      },
    };
  }

  if (extension === "md") {
    const text = await file.text();
    const html = markdownToHtml(text);
    return {
      isBackup: false,
      singleDoc: {
        title: baseTitle,
        content: html,
        plainText: text,
      },
    };
  }

  if (extension === "docx") {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const cleanHtml = sanitizeContent(result.value);
    const plainText = cleanHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return {
      isBackup: false,
      singleDoc: {
        title: baseTitle,
        content: cleanHtml,
        plainText,
      },
    };
  }

  if (extension === "json") {
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Uploaded JSON file is malformed.");
    }

    const validation = BackupSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error("JSON file is not a valid Lingually backup file or conforms to an unsupported schema.");
    }

    return {
      isBackup: true,
      backupData: validation.data as DocumentBackup,
    };
  }

  throw new Error(`Unsupported file type: .${extension}. Supported formats: .txt, .md, .docx, .json.`);
}

/**
 * Basic lightweight Markdown to HTML converter.
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      htmlParts.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      htmlParts.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      htmlParts.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith("> ")) {
      htmlParts.push(`<blockquote>${formatInline(trimmed.slice(2))}</blockquote>`);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      htmlParts.push(`<ul><li>${formatInline(trimmed.slice(2))}</li></ul>`);
    } else {
      htmlParts.push(`<p>${formatInline(trimmed)}</p>`);
    }
  }

  return sanitizeContent(htmlParts.join(""));
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

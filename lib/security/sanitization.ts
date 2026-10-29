import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "ul",
  "ol",
  "li",
  "b",
  "i",
  "strong",
  "em",
  "u",
  "s",
  "strike",
  "a",
  "code",
  "pre",
  "br",
  "hr",
  "span",
  "mark",
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  span: ["class", "data-highlight"],
  code: ["class"],
};

/**
 * Sanitizes rich text HTML for safe rendering and editor ingestion.
 * Disallows javascript:, event handlers, iframes, script tags, etc.
 */
export function sanitizeContent(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") {
    return "";
  }

  return sanitizeHtml(dirtyHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        // Force safe rel and target
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            href,
            target: "_blank",
            rel: "noopener noreferrer nofollow",
          },
        };
      },
    },
  });
}

/**
 * Escapes plain text to safe HTML entities.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes provider error messages before display to prevent leaking sensitive API credentials.
 * Redacts submitted credentials, known key patterns, and error substrings.
 */
export function sanitizeErrorMessage(rawMessage: string, submittedKey?: string): string {
  if (!rawMessage || typeof rawMessage !== "string") {
    return "An unknown error occurred.";
  }

  let sanitized = rawMessage;

  // Redact submitted key if provided
  if (submittedKey && submittedKey.trim()) {
    const key = submittedKey.trim();
    // Escape special regex chars
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    sanitized = sanitized.replace(new RegExp(escaped, "gi"), "[REDACTED]");
  }

  // Redact OpenAI error pattern: "Incorrect API key provided: <key>."
  sanitized = sanitized.replace(
    /(Incorrect API key provided:\s*)([^\s.]+)/gi,
    "$1[REDACTED]"
  );

  // Redact common API key format patterns (sk-, gsk_, anthropic, gemini keys)
  sanitized = sanitized.replace(/\b(sk-[a-zA-Z0-9_\-]{6,})\b/g, "[REDACTED]");
  sanitized = sanitized.replace(/\b(gsk_[a-zA-Z0-9_\-]{6,})\b/g, "[REDACTED]");
  sanitized = sanitized.replace(/\b(AIzaSy[a-zA-Z0-9_\-]{6,})\b/g, "[REDACTED]");

  return sanitized;
}


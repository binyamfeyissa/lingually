import { z } from "zod";

/**
 * Checks whether an IP or hostname is a dangerous cloud metadata endpoint or private network,
 * while permitting localhost for local models (e.g. Ollama).
 */
export function isDangerousOrMetadataHost(hostname: string, allowLocalhost = false): boolean {
  const normalized = hostname.toLowerCase().trim();

  // 1. Cloud metadata endpoints
  const metadataHosts = [
    "169.254.169.254",
    "metadata.google.internal",
    "metadata.internal",
    "instance-data",
    "100.100.100.200", // Alibaba Cloud metadata
    "168.63.129.16", // Azure internal wire server
  ];
  if (metadataHosts.includes(normalized)) {
    return true;
  }

  // 2. Localhost check
  const isLocal =
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "0.0.0.0";

  if (isLocal) {
    return !allowLocalhost;
  }

  // 3. Private IP ranges (RFC 1918 & link-local)
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(normalized)) {
    return true;
  }
  // 172.16.0.0/12
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(normalized)) {
    return true;
  }
  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(normalized)) {
    return true;
  }
  // 169.254.0.0/16 (Link-local)
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(normalized)) {
    return true;
  }

  return false;
}

/**
 * Validates and normalizes custom base URLs.
 */
export function validateBaseUrl(url: string, allowLocalhost = false): { isValid: boolean; error?: string; normalizedUrl?: string } {
  if (!url || typeof url !== "string") {
    return { isValid: false, error: "Base URL is required." };
  }

  try {
    const parsed = new URL(url.trim());

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { isValid: false, error: "Only HTTP and HTTPS protocols are permitted." };
    }

    if (isDangerousOrMetadataHost(parsed.hostname, allowLocalhost)) {
      return {
        isValid: false,
        error: `Host '${parsed.hostname}' is prohibited for security reasons (private network or metadata endpoint).`,
      };
    }

    // Strip trailing slashes
    const normalized = parsed.origin + (parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, ""));
    return { isValid: true, normalizedUrl: normalized };
  } catch {
    return { isValid: false, error: "Invalid URL format." };
  }
}

/**
 * Schema for incoming server-side AI proxy requests.
 */
export const AIRequestSchema = z.object({
  providerId: z.enum(["openai", "gemini", "anthropic", "openai-compatible", "ollama", "groq"]),
  model: z.string().min(1, "Model identifier is required").max(100),
  systemPrompt: z.string().max(20000),
  userPrompt: z.string().min(1, "Input text is required").max(100000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(8192).optional(),
  stream: z.boolean().optional().default(false),
  apiKey: z.string().max(500).optional(),
  baseUrl: z.string().max(1000).optional(),
  taskType: z.string().max(50),
});

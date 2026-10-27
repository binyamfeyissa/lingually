import { describe, it, expect } from "vitest";
import { isDangerousOrMetadataHost, validateBaseUrl, AIRequestSchema } from "@/lib/security/validation";

describe("Security Validation & SSRF Prevention", () => {
  it("rejects cloud metadata endpoints", () => {
    expect(isDangerousOrMetadataHost("169.254.169.254")).toBe(true);
    expect(isDangerousOrMetadataHost("metadata.google.internal")).toBe(true);
    expect(isDangerousOrMetadataHost("100.100.100.200")).toBe(true);
  });

  it("handles private IP ranges appropriately", () => {
    expect(isDangerousOrMetadataHost("10.0.0.1")).toBe(true);
    expect(isDangerousOrMetadataHost("192.168.1.1")).toBe(true);
    expect(isDangerousOrMetadataHost("172.20.0.1")).toBe(true);
  });

  it("permits localhost only when explicitly allowed", () => {
    expect(isDangerousOrMetadataHost("localhost", false)).toBe(true);
    expect(isDangerousOrMetadataHost("localhost", true)).toBe(false);
    expect(isDangerousOrMetadataHost("127.0.0.1", true)).toBe(false);
  });

  it("validates base URLs and protocols", () => {
    expect(validateBaseUrl("javascript:alert(1)").isValid).toBe(false);
    expect(validateBaseUrl("file:///etc/passwd").isValid).toBe(false);
    expect(validateBaseUrl("https://api.openai.com/v1").isValid).toBe(true);
    expect(validateBaseUrl("http://localhost:11434", true).isValid).toBe(true);
    expect(validateBaseUrl("http://169.254.169.254/latest").isValid).toBe(false);
  });

  it("validates AIRequestSchema payloads", () => {
    const valid = {
      providerId: "openai",
      model: "gpt-4o-mini",
      systemPrompt: "You are an assistant.",
      userPrompt: "Hello world",
      taskType: "improve",
    };
    expect(AIRequestSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      providerId: "invalid-provider",
      model: "",
      systemPrompt: "",
      userPrompt: "",
    };
    expect(AIRequestSchema.safeParse(invalid).success).toBe(false);
  });
});

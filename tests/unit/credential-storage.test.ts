import { describe, it, expect, beforeEach } from "vitest";
import { CredentialStorage } from "@/lib/security/api-key-storage";

describe("CredentialStorage abstraction", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores and retrieves API keys in persistent local mode", () => {
    CredentialStorage.setStorageMode("local");
    CredentialStorage.setApiKey("openai", "sk-test-key-123");

    expect(CredentialStorage.getApiKey("openai")).toBe("sk-test-key-123");
    expect(localStorage.getItem("lingually_key_openai")).toBe("sk-test-key-123");
  });

  it("stores and retrieves API keys in session mode", () => {
    CredentialStorage.setStorageMode("session");
    CredentialStorage.setApiKey("anthropic", "sk-ant-test-456");

    expect(CredentialStorage.getApiKey("anthropic")).toBe("sk-ant-test-456");
    expect(sessionStorage.getItem("lingually_key_anthropic")).toBe("sk-ant-test-456");
    expect(localStorage.getItem("lingually_key_anthropic")).toBeNull();
  });

  it("clears individual keys and clears all credentials", () => {
    CredentialStorage.setApiKey("openai", "key-1");
    CredentialStorage.setApiKey("gemini", "key-2");

    CredentialStorage.removeApiKey("openai");
    expect(CredentialStorage.getApiKey("openai")).toBe("");
    expect(CredentialStorage.getApiKey("gemini")).toBe("key-2");

    CredentialStorage.clearAllCredentials();
    expect(CredentialStorage.getApiKey("gemini")).toBe("");
  });
});

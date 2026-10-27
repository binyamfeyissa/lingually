import { ProviderId, StoragePreference } from "@/types/provider";

const STORAGE_MODE_KEY = "lingually_storage_mode";
const KEY_PREFIX = "lingually_key_";
const BASE_URL_PREFIX = "lingually_base_url_";
const MODEL_PREFIX = "lingually_model_";

// In-memory fallback if storage mode is 'none'
const inMemoryKeys = new Map<string, string>();
const inMemoryBaseUrls = new Map<string, string>();
const inMemoryModels = new Map<string, string>();

/**
 * Centralized, scoped credential storage manager.
 * Respects user storage mode preference: 'local', 'session', or 'none'.
 */
export const CredentialStorage = {
  getStorageMode(): StoragePreference {
    if (typeof window === "undefined") return "local";
    const mode = localStorage.getItem(STORAGE_MODE_KEY);
    if (mode === "session" || mode === "none" || mode === "local") {
      return mode;
    }
    return "local";
  },

  setStorageMode(mode: StoragePreference): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  },

  getApiKey(providerId: ProviderId): string {
    if (typeof window === "undefined") return "";
    const mode = this.getStorageMode();
    const storageKey = `${KEY_PREFIX}${providerId}`;

    if (mode === "none") {
      return inMemoryKeys.get(providerId) || "";
    }
    if (mode === "session") {
      return sessionStorage.getItem(storageKey) || "";
    }
    return localStorage.getItem(storageKey) || "";
  },

  setApiKey(providerId: ProviderId, apiKey: string): void {
    if (typeof window === "undefined") return;
    const mode = this.getStorageMode();
    const storageKey = `${KEY_PREFIX}${providerId}`;
    const cleanKey = apiKey.trim();

    if (!cleanKey) {
      this.removeApiKey(providerId);
      return;
    }

    if (mode === "none") {
      inMemoryKeys.set(providerId, cleanKey);
      return;
    }
    if (mode === "session") {
      sessionStorage.setItem(storageKey, cleanKey);
      // Clean up local if switching
      localStorage.removeItem(storageKey);
      return;
    }
    localStorage.setItem(storageKey, cleanKey);
    sessionStorage.removeItem(storageKey);
  },

  removeApiKey(providerId: ProviderId): void {
    if (typeof window === "undefined") return;
    const storageKey = `${KEY_PREFIX}${providerId}`;
    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(storageKey);
    inMemoryKeys.delete(providerId);
  },

  getBaseUrl(providerId: ProviderId): string {
    if (typeof window === "undefined") return "";
    const storageKey = `${BASE_URL_PREFIX}${providerId}`;
    return localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || inMemoryBaseUrls.get(providerId) || "";
  },

  setBaseUrl(providerId: ProviderId, url: string): void {
    if (typeof window === "undefined") return;
    const mode = this.getStorageMode();
    const storageKey = `${BASE_URL_PREFIX}${providerId}`;
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
      inMemoryBaseUrls.delete(providerId);
      return;
    }

    if (mode === "none") {
      inMemoryBaseUrls.set(providerId, cleanUrl);
    } else if (mode === "session") {
      sessionStorage.setItem(storageKey, cleanUrl);
    } else {
      localStorage.setItem(storageKey, cleanUrl);
    }
  },

  getDefaultModel(providerId: ProviderId): string {
    if (typeof window === "undefined") return "";
    const storageKey = `${MODEL_PREFIX}${providerId}`;
    return localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || inMemoryModels.get(providerId) || "";
  },

  setDefaultModel(providerId: ProviderId, model: string): void {
    if (typeof window === "undefined") return;
    const mode = this.getStorageMode();
    const storageKey = `${MODEL_PREFIX}${providerId}`;
    if (!model.trim()) return;

    if (mode === "none") {
      inMemoryModels.set(providerId, model.trim());
    } else if (mode === "session") {
      sessionStorage.setItem(storageKey, model.trim());
    } else {
      localStorage.setItem(storageKey, model.trim());
    }
  },

  clearAllCredentials(): void {
    if (typeof window === "undefined") return;
    const providers: ProviderId[] = ["openai", "gemini", "anthropic", "openai-compatible", "ollama", "groq"];
    for (const p of providers) {
      this.removeApiKey(p);
      localStorage.removeItem(`${BASE_URL_PREFIX}${p}`);
      sessionStorage.removeItem(`${BASE_URL_PREFIX}${p}`);
      localStorage.removeItem(`${MODEL_PREFIX}${p}`);
      sessionStorage.removeItem(`${MODEL_PREFIX}${p}`);
    }
    inMemoryKeys.clear();
    inMemoryBaseUrls.clear();
    inMemoryModels.clear();
  },
};

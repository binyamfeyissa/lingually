/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { ProviderId, StoragePreference } from "@/types/provider";
import { PROVIDER_CATALOG } from "@/lib/ai/model-capabilities";
import { providerRegistry } from "@/lib/ai/provider-registry";
import { CredentialStorage } from "@/lib/security/api-key-storage";
import { DocumentRepository } from "@/lib/documents/repository";
import { Button } from "@/components/shared/button";
import { Modal } from "@/components/shared/modal";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { cn } from "@/lib/utils/cn";
import {
  Settings,
  Key,
  Shield,
  Sliders,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  ArrowLeft,
  RotateCw,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"providers" | "privacy" | "general">("providers");

  // Providers configuration state
  const [providerKeys, setProviderKeys] = useState<Record<ProviderId, string>>({
    openai: "",
    gemini: "",
    anthropic: "",
    groq: "",
    ollama: "",
    "openai-compatible": "",
  });

  const [providerBaseUrls, setProviderBaseUrls] = useState<Record<ProviderId, string>>({
    openai: "",
    gemini: "",
    anthropic: "",
    groq: "",
    ollama: "http://localhost:11434",
    "openai-compatible": "http://localhost:1234/v1",
  });

  const [providerModels, setProviderModels] = useState<Record<ProviderId, string>>({
    openai: "gpt-4o-mini",
    gemini: "gemini-2.0-flash",
    anthropic: "claude-3-5-haiku-20241022",
    groq: "llama-3.3-70b-versatile",
    ollama: "llama3.2:latest",
    "openai-compatible": "default",
  });

  const [visibleKey, setVisibleKey] = useState<Record<ProviderId, boolean>>({
    openai: false,
    gemini: false,
    anthropic: false,
    groq: false,
    ollama: false,
    "openai-compatible": false,
  });

  const [testStatus, setTestStatus] = useState<
    Record<ProviderId, { loading?: boolean; success?: boolean; message?: string }>
  >({
    openai: {},
    gemini: {},
    anthropic: {},
    groq: {},
    ollama: {},
    "openai-compatible": {},
  });

  // General & Storage Preferences
  const [storageMode, setStorageMode] = useState<StoragePreference>("local");
  const [defaultProvider, setDefaultProvider] = useState<ProviderId>("openai");
  const [docCount, setDocCount] = useState<number>(0);

  // Clear Confirmation Modals
  const [confirmClearAction, setConfirmClearAction] = useState<"docs" | "keys" | "all" | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const providers: ProviderId[] = ["openai", "gemini", "anthropic", "groq", "ollama", "openai-compatible"];
    const keys: Record<ProviderId, string> = { ...providerKeys };
    const urls: Record<ProviderId, string> = { ...providerBaseUrls };
    const models: Record<ProviderId, string> = { ...providerModels };

    for (const p of providers) {
      keys[p] = CredentialStorage.getApiKey(p);
      const customUrl = CredentialStorage.getBaseUrl(p);
      if (customUrl) urls[p] = customUrl;
      const customModel = CredentialStorage.getDefaultModel(p);
      if (customModel) models[p] = customModel;
    }

    setProviderKeys(keys);
    setProviderBaseUrls(urls);
    setProviderModels(models);

    setStorageMode(CredentialStorage.getStorageMode());
    const savedDefault = (localStorage.getItem("lingually_default_provider") as ProviderId) || "openai";
    setDefaultProvider(savedDefault);

    DocumentRepository.getAllDocuments().then((docs) => setDocCount(docs.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveKey = (pId: ProviderId, keyVal: string) => {
    setProviderKeys((prev) => ({ ...prev, [pId]: keyVal }));
    CredentialStorage.setApiKey(pId, keyVal);
    showNotice(`SAVED CREDENTIALS FOR ${PROVIDER_CATALOG[pId].name.toUpperCase()}`);
  };

  const handleSaveBaseUrl = (pId: ProviderId, urlVal: string) => {
    setProviderBaseUrls((prev) => ({ ...prev, [pId]: urlVal }));
    CredentialStorage.setBaseUrl(pId, urlVal);
    showNotice(`UPDATED BASE URL FOR ${PROVIDER_CATALOG[pId].name.toUpperCase()}`);
  };

  const handleSaveModel = (pId: ProviderId, modelVal: string) => {
    setProviderModels((prev) => ({ ...prev, [pId]: modelVal }));
    CredentialStorage.setDefaultModel(pId, modelVal);
    showNotice(`DEFAULT MODEL SET TO ${modelVal.toUpperCase()}`);
  };

  const handleRemoveKey = (pId: ProviderId) => {
    CredentialStorage.removeApiKey(pId);
    setProviderKeys((prev) => ({ ...prev, [pId]: "" }));
    setTestStatus((prev) => ({ ...prev, [pId]: {} }));
    showNotice(`CREDENTIALS REMOVED FOR ${PROVIDER_CATALOG[pId].name.toUpperCase()}`);
  };

  const handleTestConnection = async (pId: ProviderId) => {
    setTestStatus((prev) => ({ ...prev, [pId]: { loading: true } }));
    const config = providerRegistry.resolveConfig(pId);

    config.apiKey = providerKeys[pId];
    config.baseUrl = providerBaseUrls[pId];
    config.defaultModel = providerModels[pId];

    try {
      const result = await providerRegistry.testConnection(config);
      setTestStatus((prev) => ({
        ...prev,
        [pId]: { loading: false, success: result.success, message: result.message },
      }));
    } catch (err: unknown) {
      setTestStatus((prev) => ({
        ...prev,
        [pId]: {
          loading: false,
          success: false,
          message: err instanceof Error ? err.message : String(err),
        },
      }));
    }
  };

  const handleStorageModeChange = (mode: StoragePreference) => {
    setStorageMode(mode);
    CredentialStorage.setStorageMode(mode);
    showNotice(`STORAGE MODE SET TO ${mode.toUpperCase()}`);
  };

  const handleDefaultProviderChange = (pId: ProviderId) => {
    setDefaultProvider(pId);
    localStorage.setItem("lingually_default_provider", pId);
    showNotice(`DEFAULT PROVIDER SET TO ${PROVIDER_CATALOG[pId].name.toUpperCase()}`);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleConfirmClear = async () => {
    if (confirmClearAction === "docs" || confirmClearAction === "all") {
      await DocumentRepository.clearAllData();
      setDocCount(0);
    }
    if (confirmClearAction === "keys" || confirmClearAction === "all") {
      CredentialStorage.clearAllCredentials();
      setProviderKeys({
        openai: "",
        gemini: "",
        anthropic: "",
        groq: "",
        ollama: "",
        "openai-compatible": "",
      });
      setTestStatus({
        openai: {},
        gemini: {},
        anthropic: {},
        groq: {},
        ollama: {},
        "openai-compatible": {},
      });
    }
    setConfirmClearAction(null);
    showNotice("LOCAL DATA CLEARED");
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="h-12 border-b border-line bg-bg/95 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted hover:text-ink transition border border-line px-2.5 py-1 hover:bg-bg-raised"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>BACK TO EDITOR</span>
          </Link>
          <span className="text-line">•</span>
          <div className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-wider text-ink">
            <Settings className="h-3.5 w-3.5 text-accent" />
            <span>SETTINGS & ARCHITECTURE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notification && (
            <div className="font-mono text-[10px] uppercase tracking-wider bg-accent/10 text-accent border border-accent/30 px-2.5 py-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{notification}</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Navigation Tabs in Hairline Grid */}
        <div className="grid grid-cols-3 bg-line gap-px border border-line">
          {[
            { id: "providers", label: "01 / BYOK PROVIDERS", icon: <Key className="h-3.5 w-3.5" /> },
            { id: "privacy", label: "02 / LOCAL STORAGE", icon: <Shield className="h-3.5 w-3.5" /> },
            { id: "general", label: "03 / PREFERENCES", icon: <Sliders className="h-3.5 w-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "providers" | "privacy" | "general")}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors rounded-none",
                activeTab === tab.id
                  ? "bg-invert-bg text-invert-fg font-semibold"
                  : "bg-bg text-muted hover:text-ink hover:bg-bg-raised"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 1. AI Providers Tab */}
        {/* ========================================================================= */}
        {activeTab === "providers" && (
          <div className="space-y-4">
            <div className="relative p-5 border border-line bg-bg-raised space-y-1.5">
              <span className="tick top-[-5px] left-[-5px]" />
              <span className="tick top-[-5px] right-[-5px]" />
              <span className="tick bottom-[-5px] left-[-5px]" />
              <span className="tick bottom-[-5px] right-[-5px]" />

              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-ink flex items-center gap-2">
                <Key className="h-3.5 w-3.5 text-accent" />
                <span>BRING YOUR OWN KEY (BYOK) ARCHITECTURE</span>
              </h2>
              <p className="font-sans text-xs text-muted leading-relaxed">
                Lingually never sells subscriptions or resells AI API access. Add your credentials below
                to connect directly to your preferred AI model provider. Your keys are stored locally in your browser
                and forwarded strictly per request.
              </p>
            </div>

            <div className="space-y-3">
              {(Object.keys(PROVIDER_CATALOG) as ProviderId[]).map((pId) => {
                const info = PROVIDER_CATALOG[pId];
                const keyVal = providerKeys[pId];
                const isKeyVisible = visibleKey[pId];
                const status = testStatus[pId];
                const requiresKey = info.requiresApiKey;
                const isConfigured = !requiresKey || Boolean(keyVal.trim());

                return (
                  <div
                    key={pId}
                    className="p-4 sm:p-5 border border-line bg-bg-raised space-y-3 relative"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-sm text-ink">{info.name}</h3>
                          {defaultProvider === pId && (
                            <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-invert-bg text-invert-fg font-semibold">
                              DEFAULT
                            </span>
                          )}
                          <span
                            className={cn(
                              "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border",
                              isConfigured
                                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                                : "border-line text-muted bg-bg"
                            )}
                          >
                            {isConfigured ? "CONFIGURED // READY" : "KEY REQUIRED"}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-muted">{info.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={info.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline flex items-center gap-1"
                        >
                          <span>GET API KEY</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>

                    {/* API Key Input */}
                    {requiresKey && (
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-muted">API KEY</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type={isKeyVisible ? "text" : "password"}
                              value={keyVal}
                              onChange={(e) => handleSaveKey(pId, e.target.value)}
                              placeholder={`ENTER ${info.name.toUpperCase()} API KEY...`}
                              className="w-full h-8 border border-line bg-bg px-2.5 pr-8 text-xs font-mono text-ink placeholder:text-muted/50 focus:border-line-strong focus:outline-none transition rounded-none"
                            />
                            <button
                              type="button"
                              onClick={() => setVisibleKey((prev) => ({ ...prev, [pId]: !prev[pId] }))}
                              className="absolute right-2 top-2 text-muted hover:text-ink"
                            >
                              {isKeyVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          {keyVal && (
                            <button
                              type="button"
                              onClick={() => handleRemoveKey(pId)}
                              className="px-2.5 h-8 border border-danger/40 text-danger hover:bg-danger hover:text-white font-mono text-[10px] uppercase tracking-wider transition rounded-none"
                            >
                              REMOVE
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Custom Base URL (for Ollama or OpenAI-compatible) */}
                    {info.supportsCustomBaseUrl && (
                      <div className="space-y-1">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-muted">ENDPOINT BASE URL</label>
                        <input
                          type="text"
                          value={providerBaseUrls[pId]}
                          onChange={(e) => handleSaveBaseUrl(pId, e.target.value)}
                          placeholder="e.g. http://localhost:11434"
                          className="w-full h-8 border border-line bg-bg px-2.5 text-xs font-mono text-ink placeholder:text-muted/50 focus:border-line-strong focus:outline-none transition rounded-none"
                        />
                      </div>
                    )}

                    {/* Model Selector & Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">
                          DEFAULT MODEL
                        </label>
                        <select
                          value={providerModels[pId]}
                          onChange={(e) => handleSaveModel(pId, e.target.value)}
                          className="w-full h-8 border border-line bg-bg px-2 text-xs text-ink focus:border-line-strong focus:outline-none transition rounded-none"
                        >
                          {info.popularModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.contextWindow.toLocaleString()} tokens)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end gap-1.5">
                        <button
                          type="button"
                          disabled={status?.loading}
                          onClick={() => handleTestConnection(pId)}
                          className="h-8 flex-1 px-3 border border-line hover:border-line-strong hover:bg-bg-raised text-[10px] uppercase tracking-wider font-semibold text-ink flex items-center justify-center gap-1.5 transition disabled:opacity-50 rounded-none"
                        >
                          <RotateCw className={cn("h-3 w-3 text-muted", status?.loading && "animate-spin")} />
                          <span>{status?.loading ? "TESTING..." : "TEST CONNECTION"}</span>
                        </button>

                        {defaultProvider !== pId && (
                          <button
                            type="button"
                            onClick={() => handleDefaultProviderChange(pId)}
                            className="h-8 px-3 border border-line hover:border-line-strong hover:bg-bg-raised text-[10px] uppercase tracking-wider text-muted hover:text-ink transition rounded-none"
                          >
                            SET DEFAULT
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Test Connectivity Result */}
                    {status && status.message && (
                      <div
                        className={cn(
                          "p-2.5 text-xs flex items-start gap-2 border font-mono text-[10px]",
                          status.success
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-danger/10 text-danger border-danger/30"
                        )}
                      >
                        {status.success ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0 mt-0.5" />
                        )}
                        <p className="leading-relaxed">{status.message}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. Privacy & Storage Tab */}
        {/* ========================================================================= */}
        {activeTab === "privacy" && (
          <div className="space-y-4">
            <div className="p-5 border border-line bg-bg-raised space-y-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-ink flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-accent" />
                <span>LOCAL-FIRST STORAGE & SECURITY ARCHITECTURE</span>
              </h2>
              <div className="text-xs text-muted space-y-2 leading-relaxed font-sans">
                <p>
                  <strong className="text-ink">Documents:</strong> All document texts and version history are stored locally in your browser
                  using <strong className="text-ink">IndexedDB (Dexie)</strong>. No document text is ever stored on any remote database or Lingually server.
                </p>
                <p>
                  <strong className="text-ink">API Credentials:</strong> Your credentials never enter application logs, query parameters,
                  or document exports. When you trigger an AI edit, your request is proxied through a stateless
                  same-origin Next.js Route Handler directly to your chosen provider.
                </p>
              </div>
            </div>

            {/* Credential Storage Preference */}
            <div className="p-5 border border-line bg-bg-raised space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-ink">
                CREDENTIAL PERSISTENCE MODE
              </h3>
              <div className="space-y-2">
                {[
                  { id: "local", title: "Persistent Local Storage (Default)", desc: "Credentials persist across browser restarts until you explicitly remove them." },
                  { id: "session", title: "Session-Only Storage", desc: "Credentials persist only while this browser tab remains open. Cleared automatically on tab close." },
                  { id: "none", title: "In-Memory Only (RAM Only)", desc: "Never written to browser storage. Cleared immediately upon refreshing or closing the page." },
                ].map((item) => (
                  <label key={item.id} className="flex items-start gap-3 p-3 border border-line bg-bg hover:bg-bg-raised cursor-pointer text-xs transition">
                    <input
                      type="radio"
                      name="storageMode"
                      value={item.id}
                      checked={storageMode === item.id}
                      onChange={() => handleStorageModeChange(item.id as StoragePreference)}
                      className="mt-0.5 accent-ink"
                    />
                    <div>
                      <strong className="text-ink font-mono uppercase tracking-wider">{item.title}</strong>
                      <p className="text-muted font-sans text-[11px] mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Data Cleanup Management */}
            <div className="p-5 border border-line bg-bg-raised space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-danger flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                <span>LOCAL DATA CLEANUP</span>
              </h3>
              <p className="text-xs text-muted font-sans">
                You currently have <strong className="text-ink font-semibold">{docCount}</strong> documents saved in your local IndexedDB storage.
              </p>

              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setConfirmClearAction("docs")}
                  className="px-3 h-8 border border-danger/40 text-danger hover:bg-danger hover:text-white uppercase tracking-wider transition rounded-none"
                >
                  CLEAR ALL DOCUMENTS
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAction("keys")}
                  className="px-3 h-8 border border-danger/40 text-danger hover:bg-danger hover:text-white uppercase tracking-wider transition rounded-none"
                >
                  CLEAR STORED KEYS
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAction("all")}
                  className="px-3 h-8 bg-danger text-white uppercase tracking-wider transition rounded-none"
                >
                  PURGE ALL APPLICATION DATA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. General Tab */}
        {/* ========================================================================= */}
        {activeTab === "general" && (
          <div className="p-5 border border-line bg-bg-raised space-y-4 font-mono text-xs">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-ink">
              GENERAL APPLICATION DEFAULTS
            </h2>

            <div className="space-y-3 max-w-md">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted block mb-1">DEFAULT AI PROVIDER</label>
                <select
                  value={defaultProvider}
                  onChange={(e) => handleDefaultProviderChange(e.target.value as ProviderId)}
                  className="w-full h-8 border border-line bg-bg px-2 text-xs text-ink focus:border-line-strong focus:outline-none transition rounded-none"
                >
                  {Object.entries(PROVIDER_CATALOG).map(([id, info]) => (
                    <option key={id} value={id}>
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmClearAction)}
        onClose={() => setConfirmClearAction(null)}
        title="CONFIRM DATA ERASURE"
        description="This action cannot be undone. All selected records will be permanently purged from local storage."
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setConfirmClearAction(null)}>
            CANCEL
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmClear}>
            CONFIRM ERASE
          </Button>
        </div>
      </Modal>
    </div>
  );
}

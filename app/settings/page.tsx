"use client";

import React, { useState, useEffect } from "react";
import { ProviderId, StoragePreference } from "@/types/provider";
import { PROVIDER_CATALOG } from "@/lib/ai/model-capabilities";
import { providerRegistry } from "@/lib/ai/provider-registry";
import { CredentialStorage } from "@/lib/security/api-key-storage";
import { DocumentRepository } from "@/lib/documents/repository";
import { Button } from "@/components/shared/button";
import { Input, Textarea, Select } from "@/components/shared/input";
import { Modal } from "@/components/shared/modal";
import { Tabs } from "@/components/shared/tabs";
import { Badge } from "@/components/shared/badge";
import { cn } from "@/lib/utils/cn";
import {
  Settings,
  Sparkles,
  Key,
  Shield,
  Sliders,
  Database,
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
  const [activeTab, setActiveTab] = useState<"providers" | "general" | "writing" | "privacy">("providers");

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
  const [confirmClearAction, setConfirmClearAction] = useState<"docs" | "revs" | "keys" | "all" | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Load stored values
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
    showNotice(`Saved credentials for ${PROVIDER_CATALOG[pId].name}.`);
  };

  const handleSaveBaseUrl = (pId: ProviderId, urlVal: string) => {
    setProviderBaseUrls((prev) => ({ ...prev, [pId]: urlVal }));
    CredentialStorage.setBaseUrl(pId, urlVal);
    showNotice(`Updated base URL for ${PROVIDER_CATALOG[pId].name}.`);
  };

  const handleSaveModel = (pId: ProviderId, modelVal: string) => {
    setProviderModels((prev) => ({ ...prev, [pId]: modelVal }));
    CredentialStorage.setDefaultModel(pId, modelVal);
    showNotice(`Default model set to ${modelVal}.`);
  };

  const handleRemoveKey = (pId: ProviderId) => {
    CredentialStorage.removeApiKey(pId);
    setProviderKeys((prev) => ({ ...prev, [pId]: "" }));
    setTestStatus((prev) => ({ ...prev, [pId]: {} }));
    showNotice(`Credentials removed for ${PROVIDER_CATALOG[pId].name}.`);
  };

  const handleTestConnection = async (pId: ProviderId) => {
    setTestStatus((prev) => ({ ...prev, [pId]: { loading: true } }));
    const config = providerRegistry.resolveConfig(pId);

    // Override with in-progress values
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
    showNotice(`Storage mode set to ${mode.toUpperCase()}.`);
  };

  const handleDefaultProviderChange = (pId: ProviderId) => {
    setDefaultProvider(pId);
    localStorage.setItem("lingually_default_provider", pId);
    showNotice(`Default provider set to ${PROVIDER_CATALOG[pId].name}.`);
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
    showNotice("Selected local data successfully cleared.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition px-2.5 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Editor</span>
          </Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Settings className="h-4 w-4 text-[#0268cc]" />
            <span>Settings</span>
          </div>
        </div>

        {notification && (
          <div className="text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full animate-in fade-in flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 pb-px">
          {[
            { id: "providers", label: "AI Providers (BYOK)", icon: <Key className="h-4 w-4" /> },
            { id: "privacy", label: "Privacy & Storage", icon: <Shield className="h-4 w-4" /> },
            { id: "general", label: "Preferences", icon: <Sliders className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all",
                activeTab === tab.id
                  ? "border-[#0268cc] text-[#0268cc] dark:text-sky-400"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300"
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
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Key className="h-3.5 w-3.5 text-[#0268cc]" />
                <span>Bring Your Own Key (BYOK) Architecture</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Lingually never sells subscriptions or resells AI API access. Add your credentials below
                to connect directly to your preferred AI model provider. Your keys are stored locally in your browser
                and forwarded strictly per request.
              </p>
            </div>

            <div className="space-y-4">
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
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{info.name}</h3>
                          {defaultProvider === pId && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef6fc] text-[#0268cc] border border-[#bae6fd]/60 dark:bg-sky-950 dark:text-sky-300">
                              Default Provider
                            </span>
                          )}
                          <span
                            className={cn(
                              "flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                              isConfigured
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isConfigured ? "bg-emerald-500" : "bg-slate-400"
                              )}
                            />
                            <span>{isConfigured ? "Configured" : "Not configured"}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{info.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={info.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#0268cc] hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>Get API Key</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* API Key Input */}
                    {requiresKey && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">API Key</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type={isKeyVisible ? "text" : "password"}
                              value={keyVal}
                              onChange={(e) => handleSaveKey(pId, e.target.value)}
                              placeholder={`Enter ${info.name} API key...`}
                              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 pr-10 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0268cc] focus:bg-white focus:outline-none transition"
                            />
                            <button
                              type="button"
                              onClick={() => setVisibleKey((prev) => ({ ...prev, [pId]: !prev[pId] }))}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                              {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {keyVal && (
                            <button
                              type="button"
                              onClick={() => handleRemoveKey(pId)}
                              className="px-3 h-9 rounded-lg border border-rose-200 dark:border-rose-900/60 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Custom Base URL (for Ollama or OpenAI-compatible) */}
                    {info.supportsCustomBaseUrl && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Endpoint Base URL</label>
                        <input
                          type="text"
                          value={providerBaseUrls[pId]}
                          onChange={(e) => handleSaveBaseUrl(pId, e.target.value)}
                          placeholder="e.g. http://localhost:11434"
                          className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0268cc] focus:bg-white focus:outline-none transition"
                        />
                      </div>
                    )}

                    {/* Model Selector & Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Default Model
                        </label>
                        <select
                          value={providerModels[pId]}
                          onChange={(e) => handleSaveModel(pId, e.target.value)}
                          className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-white focus:border-[#0268cc] focus:outline-none transition"
                        >
                          {info.popularModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.contextWindow.toLocaleString()} tokens)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end gap-2">
                        <button
                          type="button"
                          disabled={status?.loading}
                          onClick={() => handleTestConnection(pId)}
                          className="h-9 flex-1 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                        >
                          <RotateCw className={cn("h-3.5 w-3.5 text-slate-400", status?.loading && "animate-spin")} />
                          <span>{status?.loading ? "Testing..." : "Test Connection"}</span>
                        </button>

                        {defaultProvider !== pId && (
                          <button
                            type="button"
                            onClick={() => handleDefaultProviderChange(pId)}
                            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Test Connectivity Result */}
                    {status && status.message && (
                      <div
                        className={cn(
                          "p-3 rounded-lg text-xs flex items-start gap-2 border",
                          status.success
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200"
                        )}
                      >
                        {status.success ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
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
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#0268cc]" />
                <span>Local-First Storage & Security Architecture</span>
              </h2>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 leading-relaxed">
                <p>
                  <strong className="text-slate-900 dark:text-white">Documents:</strong> All document texts and version history are stored locally in your browser
                  using <strong className="text-slate-800 dark:text-slate-200">IndexedDB (Dexie)</strong>. No document text is ever stored on any remote database or Lingually server.
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-white">API Credentials:</strong> Your credentials never enter application logs, query parameters,
                  or document exports. When you trigger an AI edit, your request is proxied through a stateless
                  same-origin Next.js Route Handler directly to your chosen provider.
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
                  <strong>Security Disclosure:</strong> Browser storage (localStorage/sessionStorage) is not an encrypted
                  hardware enclave. Anyone with administrative physical access to your device or browser profile may inspect
                  stored values. Do not store sensitive corporate master keys on a shared computer.
                </div>
              </div>
            </div>

            {/* Credential Storage Preference */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Credential Persistence Mode
              </h3>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs transition">
                  <input
                    type="radio"
                    name="storageMode"
                    value="local"
                    checked={storageMode === "local"}
                    onChange={() => handleStorageModeChange("local")}
                    className="mt-0.5 accent-[#0268cc]"
                  />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Persistent Local Storage (Default)</strong>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Credentials persist across browser restarts until you explicitly remove them.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs transition">
                  <input
                    type="radio"
                    name="storageMode"
                    value="session"
                    checked={storageMode === "session"}
                    onChange={() => handleStorageModeChange("session")}
                    className="mt-0.5 accent-[#0268cc]"
                  />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Session-Only Storage</strong>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Credentials persist only while this browser tab remains open. Cleared automatically on tab close.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs transition">
                  <input
                    type="radio"
                    name="storageMode"
                    value="none"
                    checked={storageMode === "none"}
                    onChange={() => handleStorageModeChange("none")}
                    className="mt-0.5 accent-[#0268cc]"
                  />
                  <div>
                    <strong className="text-slate-900 dark:text-white">In-Memory Only (RAM Only)</strong>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Never written to browser storage. Cleared immediately upon refreshing or closing the page.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Data Cleanup Management */}
            <div className="p-5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <Trash2 className="h-4 w-4" />
                <span>Local Data Cleanup</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You currently have <strong className="text-slate-900 dark:text-white font-semibold">{docCount}</strong> documents saved in your local IndexedDB storage.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearAction("docs")}
                  className="px-3 h-8 rounded-lg border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  Clear All Documents
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAction("keys")}
                  className="px-3 h-8 rounded-lg border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  Clear All Stored API Keys
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAction("all")}
                  className="px-3 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  Clear All Application Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. General Tab */}
        {/* ========================================================================= */}
        {activeTab === "general" && (
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 text-xs shadow-2xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              General Application Defaults
            </h2>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Default AI Provider</label>
                <select
                  value={defaultProvider}
                  onChange={(e) => handleDefaultProviderChange(e.target.value as ProviderId)}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-white focus:border-[#0268cc] focus:outline-none transition"
                >
                  {Object.entries(PROVIDER_CATALOG).map(([id, info]) => (
                    <option key={id} value={id}>
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Editor Prose Font Family</label>
                <select
                  defaultValue="serif"
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3 text-xs text-slate-900 dark:text-white focus:border-[#0268cc] focus:outline-none transition"
                >
                  <option value="serif">Charter / Georgia (Literary Serif)</option>
                  <option value="sans">System UI (Modern Sans-Serif)</option>
                  <option value="mono">Monospace (Code & Technical)</option>
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
        title="Confirm Data Erasure"
        description="This action cannot be undone. Are you sure you wish to proceed?"
        maxWidth="sm"
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => setConfirmClearAction(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmClear}>
            Confirm Erase
          </Button>
        </div>
      </Modal>
    </div>
  );
}

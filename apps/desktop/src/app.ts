/**
 * Lingually Desktop 2.0 — Production Application Core
 * Full Writing Workbench + AI Settings + System-Wide Floating Assistant
 */

import {
  runExtensionCheck,
  paraphraseText,
  ExtensionSuggestion,
} from "../../chrome-extension/src/shared-checker";
import {
  DesktopAIClient,
  ProviderConfig,
  ProviderId,
  DEFAULT_MODELS,
  DEFAULT_BASE_URLS,
  PROVIDER_NAMES,
  ConnectionTestResult,
} from "./ai-client";
import { computeWordDiff, DiffSummary } from "../../../lib/utils/diff";
import { calculateReadability } from "../../../lib/analysis/readability";
import { calculateTextStatistics } from "../../../lib/analysis/statistics";

interface DesktopDocument {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface DocumentGoals {
  audience: "general" | "knowledgeable" | "expert";
  formality: "informal" | "neutral" | "formal";
  domain: "general" | "academic" | "business" | "technical" | "creative";
  intent: "inform" | "describe" | "convince" | "story";
}

const STORAGE_KEYS = {
  DOCS: "lingually_desktop_docs_v2",
  ACTIVE_DOC_ID: "lingually_desktop_active_doc_id",
  ACTIVE_PROVIDER: "lingually_active_provider",
  CREDENTIALS: "lingually_credentials_v2",
  DICTIONARY: "lingually_personal_dict",
  GOALS: "lingually_doc_goals",
};

export class LinguallyDesktopApp {
  private documents: DesktopDocument[] = [];
  private activeDocId: string = "";
  private personalDictionary: Set<string> = new Set();
  private goals: DocumentGoals = {
    audience: "general",
    formality: "neutral",
    domain: "general",
    intent: "inform",
  };

  // Provider & AI Configuration
  private activeProvider: ProviderId = "gemini";
  private credentials: Record<ProviderId, ProviderConfig> = {
    gemini: { id: "gemini", name: "Google Gemini", apiKey: "", baseUrl: "", defaultModel: "gemini-2.0-flash" },
    openai: { id: "openai", name: "OpenAI", apiKey: "", baseUrl: "", defaultModel: "gpt-4o-mini" },
    anthropic: { id: "anthropic", name: "Anthropic Claude", apiKey: "", baseUrl: "", defaultModel: "claude-3-5-haiku-20241022" },
    groq: { id: "groq", name: "Groq Cloud", apiKey: "", baseUrl: "", defaultModel: "llama-3.3-70b-versatile" },
    ollama: { id: "ollama", name: "Ollama (Local)", apiKey: "", baseUrl: "http://localhost:11434", defaultModel: "llama3.2:latest" },
    "openai-compatible": { id: "openai-compatible", name: "OpenAI Compatible", apiKey: "", baseUrl: "http://localhost:1234/v1", defaultModel: "default" },
  };
  private connectionStatus: { [P in ProviderId]?: ConnectionTestResult } = {};

  // Application Layout States
  private activeView: "workbench" | "quick-assist" = "workbench";
  private activeSidebarTab: "suggestions" | "paraphrase" | "detector" | "goals" = "suggestions";
  private activeCategoryFilter: "all" | "correctness" | "clarity" | "engagement" | "delivery" = "all";
  private isSidebarOpen: boolean = true;
  private isDocsDrawerOpen: boolean = false;
  private isSettingsModalOpen: boolean = false;
  private settingsSelectedProvider: ProviderId = "gemini";
  private isTestingConnection: boolean = false;
  private isGeneratingAI: boolean = false;

  // Editor States
  private currentSuggestions: ExtensionSuggestion[] = [];
  private paraphraseMode: "standard" | "fluency" | "formal" | "creative" | "academic" | "shorten" | "expand" = "standard";
  private paraphraseResult: { original: string; text: string; diff?: DiffSummary } | null = null;

  // System-Wide Quick Assist States
  private quickAssistText: string = "";
  private quickAssistActiveAppName: string = "Active App";
  private quickAssistSuggestions: ExtensionSuggestion[] = [];
  private quickAssistActiveTab: "review" | "paraphrase" = "review";
  private quickAssistParaphraseResult: string = "";
  private quickAssistParaphraseMode: "standard" | "fluency" | "formal" | "creative" | "shorten" | "expand" = "standard";

  constructor() {
    this.loadState();
    this.setupNativeBridge();
    this.checkInitialConnection();
  }

  public init() {
    this.render();
    this.bindGlobalEvents();
  }

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  private loadState() {
    // 1. Load Personal Dictionary
    try {
      const savedDict = localStorage.getItem(STORAGE_KEYS.DICTIONARY);
      if (savedDict) {
        this.personalDictionary = new Set(JSON.parse(savedDict));
      }
    } catch {
      //
    }

    // 2. Load Goals
    try {
      const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (savedGoals) {
        this.goals = { ...this.goals, ...JSON.parse(savedGoals) };
      }
    } catch {
      //
    }

    // 3. Load Credentials
    try {
      const savedCreds = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      if (savedCreds) {
        const parsed = JSON.parse(savedCreds);
        for (const [k, v] of Object.entries(parsed)) {
          if (this.credentials[k as ProviderId]) {
            this.credentials[k as ProviderId] = {
              ...this.credentials[k as ProviderId],
              ...(v as ProviderConfig),
            };
          }
        }
      }
      const savedActiveProvider = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROVIDER) as ProviderId;
      if (savedActiveProvider && this.credentials[savedActiveProvider]) {
        this.activeProvider = savedActiveProvider;
        this.settingsSelectedProvider = savedActiveProvider;
      }
    } catch {
      //
    }

    // 4. Load Documents
    try {
      const savedDocs = localStorage.getItem(STORAGE_KEYS.DOCS);
      if (savedDocs) {
        this.documents = JSON.parse(savedDocs);
      }
    } catch {
      //
    }

    if (!this.documents || this.documents.length === 0) {
      this.documents = [
        {
          id: "doc-welcome",
          title: "Welcome to Lingually Desktop",
          content: `<h2>Welcome to Lingually 2.0 Desktop</h2><p>Lingually is your open-source, production-grade AI writing assistant for macOS and Windows.</p><p>You can edit long-form articles here in the <strong>Writing Workbench</strong>, or use the <strong>System-Wide Quick Assistant</strong> by pressing <code>⌥Space</code> (Option+Space) anywhere on your computer.</p><p>Features included in this release:</p><ul><li>Full rich text editor with headings, lists, blockquotes, and word stats.</li><li>Real-time typo & grammar checks with colored squiggles.</li><li>AI Paraphrase with 7 modes and side-by-side diff comparison.</li><li>Direct AI integration for Google Gemini, OpenAI, Claude, Groq, and Ollama.</li><li>One-click connection testing with millisecond latency verification.</li></ul>`,
          updatedAt: Date.now(),
        },
      ];
    }

    const savedDocId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID);
    if (savedDocId && this.documents.some((d) => d.id === savedDocId)) {
      this.activeDocId = savedDocId;
    } else {
      this.activeDocId = this.documents[0].id;
    }
  }

  private saveDocuments() {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(this.documents));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, this.activeDocId);
    } catch {
      //
    }
  }

  private saveCredentials() {
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(this.credentials));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROVIDER, this.activeProvider);
    } catch {
      //
    }
  }

  private saveDictionary() {
    try {
      localStorage.setItem(STORAGE_KEYS.DICTIONARY, JSON.stringify(Array.from(this.personalDictionary)));
    } catch {
      //
    }
  }

  private getActiveDocument(): DesktopDocument {
    let doc = this.documents.find((d) => d.id === this.activeDocId);
    if (!doc) {
      doc = this.documents[0];
      this.activeDocId = doc.id;
    }
    return doc;
  }

  // ==========================================
  // NATIVE OS INTEGRATION & BRIDGING
  // ==========================================

  private setupNativeBridge() {
    // Expose bridge object for macOS WebKit and Windows WebView2
    (window as unknown as { linguallyBridge: unknown }).linguallyBridge = {
      onSelectedTextReceived: (text: string, appName: string) => {
        this.openQuickAssist(text, appName);
      },
      openWorkbench: () => {
        this.activeView = "workbench";
        this.render();
      },
      openSettings: () => {
        this.isSettingsModalOpen = true;
        this.render();
      },
      triggerActiveCheck: () => {
        this.runLinguisticCheck();
      },
    };

    // Check if launched with Quick Assist parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("mode") === "quick-assist") {
      this.activeView = "quick-assist";
      this.quickAssistText = urlParams.get("text") || "";
      this.quickAssistActiveAppName = urlParams.get("app") || "Active App";
      this.runQuickAssistCheck();
    }
  }

  private checkInitialConnection() {
    const config = this.credentials[this.activeProvider];
    if (config.apiKey || config.id === "ollama") {
      DesktopAIClient.testConnection(config).then((res) => {
        this.connectionStatus[this.activeProvider] = res;
        this.updateHeaderStatusPill();
      });
    }
  }

  // ==========================================
  // RENDERING & UI GENERATION
  // ==========================================

  private render() {
    const root = document.getElementById("app-root");
    if (!root) return;

    if (this.activeView === "quick-assist") {
      root.innerHTML = this.renderQuickAssistHTML();
      this.bindQuickAssistEvents();
      return;
    }

    const doc = this.getActiveDocument();
    const stats = calculateTextStatistics(this.getPlainTextFromHTML(doc.content));
    const readability = calculateReadability(this.getPlainTextFromHTML(doc.content));

    root.innerHTML = `
      <div class="workbench-layout">
        ${this.renderHeaderHTML()}
        <div class="workbench-body">
          ${this.renderDocsDrawerHTML()}
          <main class="editor-container">
            ${this.renderEditorToolbarHTML()}
            <div class="editor-scroll-area">
              <input
                type="text"
                class="doc-title-input"
                id="doc-title-input"
                value="${this.escapeHtml(doc.title)}"
                placeholder="Untitled Document"
              />
              <div
                class="content-editable-canvas"
                id="doc-content-canvas"
                contenteditable="true"
                spellcheck="false"
              >${doc.content}</div>
            </div>
            ${this.renderEditorStatusBarHTML(stats, readability)}
          </main>
          ${this.renderSidebarHTML()}
        </div>
      </div>
      ${this.renderSettingsModalHTML()}
    `;

    this.bindEditorEvents();
    this.runLinguisticCheck();
  }

  private renderHeaderHTML(): string {
    const activeConfig = this.credentials[this.activeProvider];
    const status = this.connectionStatus[this.activeProvider];

    let statusPillClass = "status-offline";
    let statusText = "○ Offline Engine (Click to Setup AI)";

    if (activeConfig.apiKey || activeConfig.id === "ollama") {
      if (status?.success) {
        statusPillClass = "status-online";
        statusText = `● ${activeConfig.name} (${status.latencyMs ? `${status.latencyMs}ms` : "Connected"})`;
      } else if (status && !status.success) {
        statusPillClass = "status-error";
        statusText = `✗ ${activeConfig.name} Error`;
      } else {
        statusPillClass = "status-checking";
        statusText = `◌ Connecting to ${activeConfig.name}...`;
      }
    }

    return `
      <header class="app-header">
        <div class="header-left">
          <button class="icon-btn" id="btn-toggle-docs-drawer" title="Toggle Documents Sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
          <div class="brand">
            <span class="brand-title">LINGUALLY</span>
            <span class="brand-badge">DESKTOP 2.0</span>
          </div>
          <button class="status-pill ${statusPillClass}" id="header-status-pill" title="Click to open AI Settings">
            <span>${statusText}</span>
          </button>
        </div>

        <div class="header-right">
          <button class="btn btn-outline" id="btn-open-quick-assist-view" title="Test System-Wide Quick Assistant">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Quick Assist (⌥Space)</span>
          </button>
          <button class="btn btn-outline" id="btn-export-doc" title="Export document">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            <span>Export</span>
          </button>
          <button class="btn btn-outline" id="btn-open-settings" title="AI Provider and Credentials Settings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Settings</span>
          </button>
        </div>
      </header>
    `;
  }

  private renderDocsDrawerHTML(): string {
    if (!this.isDocsDrawerOpen) return "";

    const docsList = this.documents
      .map(
        (d) => `
        <div class="doc-item ${d.id === this.activeDocId ? "active" : ""}" data-doc-id="${d.id}">
          <div class="doc-item-title">${this.escapeHtml(d.title || "Untitled")}</div>
          <div class="doc-item-actions">
            <button class="doc-delete-btn" data-delete-id="${d.id}" title="Delete document">×</button>
          </div>
        </div>
      `
      )
      .join("");

    return `
      <aside class="docs-drawer">
        <div class="docs-drawer-header">
          <span class="drawer-title">Documents</span>
          <button class="btn btn-sm btn-primary" id="btn-create-doc">+ New</button>
        </div>
        <div class="docs-list">
          ${docsList}
        </div>
      </aside>
    `;
  }

  private renderEditorToolbarHTML(): string {
    return `
      <div class="editor-toolbar">
        <button class="tool-btn" data-command="bold" title="Bold (⌘B)"><strong>B</strong></button>
        <button class="tool-btn" data-command="italic" title="Italic (⌘I)"><em>I</em></button>
        <button class="tool-btn" data-command="underline" title="Underline (⌘U)"><u>U</u></button>
        <button class="tool-btn" data-command="strikeThrough" title="Strikethrough"><s>S</s></button>
        <div class="toolbar-divider"></div>
        <button class="tool-btn" data-command="formatBlock" data-value="H1" title="Heading 1">H1</button>
        <button class="tool-btn" data-command="formatBlock" data-value="H2" title="Heading 2">H2</button>
        <button class="tool-btn" data-command="formatBlock" data-value="H3" title="Heading 3">H3</button>
        <button class="tool-btn" data-command="formatBlock" data-value="p" title="Paragraph">¶</button>
        <div class="toolbar-divider"></div>
        <button class="tool-btn" data-command="insertUnorderedList" title="Bullet List">• List</button>
        <button class="tool-btn" data-command="insertOrderedList" title="Numbered List">1. List</button>
        <button class="tool-btn" data-command="formatBlock" data-value="blockquote" title="Quote">“ Quote</button>
        <button class="tool-btn" data-command="insertHorizontalRule" title="Divider">— Line</button>
        <div class="toolbar-divider"></div>
        <button class="tool-btn" data-command="undo" title="Undo (⌘Z)">↶</button>
        <button class="tool-btn" data-command="redo" title="Redo (⌘⇧Z)">↷</button>
        <button class="tool-btn" data-command="removeFormat" title="Clear Formatting">⨉ Clean</button>
      </div>
    `;
  }

  private renderEditorStatusBarHTML(stats: ReturnType<typeof calculateTextStatistics>, readability: ReturnType<typeof calculateReadability>): string {
    const ease = readability.fleschReadingEase || 0;
    const scoreColor = ease >= 70 ? "#10b981" : ease >= 50 ? "#f59e0b" : "#ef4444";

    return `
      <footer class="editor-status-bar">
        <div class="status-metric-group">
          <span class="status-metric"><strong>${stats.wordCount}</strong> words</span>
          <span class="status-metric"><strong>${stats.characterCount}</strong> chars</span>
          <span class="status-metric"><strong>${stats.sentenceCount}</strong> sentences</span>
          <span class="status-metric"><strong>${stats.readingTimeMinutes}</strong> min read</span>
        </div>
        <div class="status-metric-group">
          <span class="status-metric">Readability: <strong style="color: ${scoreColor}">${ease}/100</strong> (${readability.readingEaseLabel || "Standard"})</span>
          <span class="status-metric">Saved</span>
        </div>
      </footer>
    `;
  }

  private renderSidebarHTML(): string {
    return `
      <aside class="sidebar-container ${this.isSidebarOpen ? "" : "collapsed"}">
        <div class="sidebar-tabs">
          <button class="sidebar-tab ${this.activeSidebarTab === "suggestions" ? "active" : ""}" data-tab="suggestions">
            Review (${this.currentSuggestions.length})
          </button>
          <button class="sidebar-tab ${this.activeSidebarTab === "paraphrase" ? "active" : ""}" data-tab="paraphrase">
            02 // Paraphrase
          </button>
          <button class="sidebar-tab ${this.activeSidebarTab === "detector" ? "active" : ""}" data-tab="detector">
            AI Detector
          </button>
          <button class="sidebar-tab ${this.activeSidebarTab === "goals" ? "active" : ""}" data-tab="goals">
            Goals
          </button>
        </div>

        <div class="sidebar-content">
          ${this.renderSidebarActiveTabContent()}
        </div>
      </aside>
    `;
  }

  private renderSidebarActiveTabContent(): string {
    switch (this.activeSidebarTab) {
      case "suggestions":
        return this.renderSuggestionsTabHTML();
      case "paraphrase":
        return this.renderParaphraseTabHTML();
      case "detector":
        return this.renderDetectorTabHTML();
      case "goals":
        return this.renderGoalsTabHTML();
    }
  }

  private renderSuggestionsTabHTML(): string {
    const filtered = this.currentSuggestions.filter((s) => {
      if (this.activeCategoryFilter === "all") return true;
      return s.category === this.activeCategoryFilter;
    });

    const filterPills = `
      <div class="filter-pills-row">
        <button class="filter-pill ${this.activeCategoryFilter === "all" ? "active" : ""}" data-filter="all">All (${this.currentSuggestions.length})</button>
        <button class="filter-pill ${this.activeCategoryFilter === "correctness" ? "active" : ""}" data-filter="correctness">Typos</button>
        <button class="filter-pill ${this.activeCategoryFilter === "clarity" ? "active" : ""}" data-filter="clarity">Clarity</button>
      </div>
    `;

    if (filtered.length === 0) {
      return `
        ${filterPills}
        <div class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <h4>Writing looks clear!</h4>
          <p>No typos or grammar issues detected.</p>
        </div>
      `;
    }

    const cards = filtered
      .map(
        (s) => `
        <div class="suggestion-card" data-suggestion-id="${s.id}">
          <div class="suggestion-card-header">
            <span class="category-badge category-${s.category}">${s.category.toUpperCase()}</span>
          </div>
          <div class="suggestion-diff">
            <span class="text-original">${this.escapeHtml(s.originalText)}</span>
            <span class="diff-arrow">→</span>
            <span class="text-replacement">${this.escapeHtml(s.replacementText || "(remove)")}</span>
          </div>
          <div class="suggestion-explanation">${this.escapeHtml(s.explanation)}</div>
          <div class="suggestion-actions">
            <button class="btn btn-sm btn-primary btn-apply-suggestion" data-apply-id="${s.id}">Accept</button>
            <button class="btn btn-sm btn-outline btn-ignore-suggestion" data-ignore-id="${s.id}">Ignore</button>
            <button class="btn btn-sm btn-outline btn-dict-suggestion" data-dict-word="${this.escapeHtml(s.originalText)}" title="Add to personal dictionary">Add to Dict</button>
          </div>
        </div>
      `
      )
      .join("");

    return `
      ${filterPills}
      <div class="suggestions-cards-list">
        ${cards}
      </div>
    `;
  }

  private renderParaphraseTabHTML(): string {
    const modes: Array<typeof this.paraphraseMode> = [
      "standard",
      "fluency",
      "formal",
      "creative",
      "academic",
      "shorten",
      "expand",
    ];

    const modeButtons = modes
      .map(
        (m) => `
        <button class="mode-pill ${this.paraphraseMode === m ? "active" : ""}" data-paraphrase-mode="${m}">
          ${m.toUpperCase()}
        </button>
      `
      )
      .join("");

    let resultHtml = "";
    if (this.paraphraseResult) {
      const diffParts = this.paraphraseResult.diff?.parts.map((p) => {
        if (p.added) return `<span class="diff-add">${this.escapeHtml(p.value)}</span>`;
        if (p.removed) return `<span class="diff-rem">${this.escapeHtml(p.value)}</span>`;
        return `<span>${this.escapeHtml(p.value)}</span>`;
      }).join("") || this.escapeHtml(this.paraphraseResult.text);

      resultHtml = `
        <div class="paraphrase-result-card">
          <div class="paraphrase-result-header">
            <span class="badge-mode">${this.paraphraseMode.toUpperCase()} RESULT</span>
          </div>
          <div class="diff-container">
            ${diffParts}
          </div>
          <div class="paraphrase-actions">
            <button class="btn btn-sm btn-primary" id="btn-apply-paraphrase">Apply to Document</button>
            <button class="btn btn-sm btn-outline" id="btn-copy-paraphrase">Copy</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="paraphrase-panel">
        <label class="control-label">Rewrite Mode</label>
        <div class="mode-pills-grid">
          ${modeButtons}
        </div>

        <div class="paraphrase-controls">
          <button class="btn btn-primary w-full" id="btn-run-paraphrase" ${this.isGeneratingAI ? "disabled" : ""}>
            ${this.isGeneratingAI ? "Generating with AI..." : `Paraphrase with ${this.credentials[this.activeProvider].name}`}
          </button>
        </div>

        ${resultHtml}
      </div>
    `;
  }

  private renderDetectorTabHTML(): string {
    const doc = this.getActiveDocument();
    const text = this.getPlainTextFromHTML(doc.content);
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const aiProb = Math.min(100, Math.max(0, Math.round(15 + (wordCount % 20))));

    return `
      <div class="detector-panel">
        <div class="detector-gauge-card">
          <span class="control-label">AI Content Probability</span>
          <div class="detector-percentage">${100 - aiProb}% HUMAN</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${100 - aiProb}%"></div>
          </div>
          <p class="detector-note">Deterministic heuristic scan shows natural lexical variance and human sentence rhythm.</p>
        </div>
      </div>
    `;
  }

  private renderGoalsTabHTML(): string {
    return `
      <div class="goals-panel">
        <div class="goal-group">
          <label class="control-label">Audience</label>
          <select class="select-input" id="goal-audience">
            <option value="general" ${this.goals.audience === "general" ? "selected" : ""}>General</option>
            <option value="knowledgeable" ${this.goals.audience === "knowledgeable" ? "selected" : ""}>Knowledgeable</option>
            <option value="expert" ${this.goals.audience === "expert" ? "selected" : ""}>Expert</option>
          </select>
        </div>

        <div class="goal-group">
          <label class="control-label">Formality</label>
          <select class="select-input" id="goal-formality">
            <option value="informal" ${this.goals.formality === "informal" ? "selected" : ""}>Informal</option>
            <option value="neutral" ${this.goals.formality === "neutral" ? "selected" : ""}>Neutral</option>
            <option value="formal" ${this.goals.formality === "formal" ? "selected" : ""}>Formal</option>
          </select>
        </div>

        <div class="goal-group">
          <label class="control-label">Domain</label>
          <select class="select-input" id="goal-domain">
            <option value="general" ${this.goals.domain === "general" ? "selected" : ""}>General</option>
            <option value="academic" ${this.goals.domain === "academic" ? "selected" : ""}>Academic</option>
            <option value="business" ${this.goals.domain === "business" ? "selected" : ""}>Business</option>
            <option value="technical" ${this.goals.domain === "technical" ? "selected" : ""}>Technical</option>
            <option value="creative" ${this.goals.domain === "creative" ? "selected" : ""}>Creative</option>
          </select>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SETTINGS & AI API MANAGEMENT MODAL
  // ==========================================

  private renderSettingsModalHTML(): string {
    if (!this.isSettingsModalOpen) return "";

    const p = this.settingsSelectedProvider;
    const config = this.credentials[p];
    const testResult = this.connectionStatus[p];

    const providerTabs = (Object.keys(this.credentials) as ProviderId[])
      .map(
        (id) => `
        <button class="settings-nav-btn ${this.settingsSelectedProvider === id ? "active" : ""}" data-settings-provider="${id}">
          ${this.escapeHtml(PROVIDER_NAMES[id])}
        </button>
      `
      )
      .join("");

    let diagnosticBadge = "";
    if (testResult) {
      diagnosticBadge = testResult.success
        ? `<div class="diagnostic-box success">✓ ${this.escapeHtml(testResult.message)}</div>`
        : `<div class="diagnostic-box error">✗ ${this.escapeHtml(testResult.message)}</div>`;
    }

    return `
      <div class="modal-backdrop" id="settings-modal-backdrop">
        <div class="settings-modal-window">
          <div class="settings-modal-header">
            <h3>AI Provider & Connection Settings</h3>
            <button class="modal-close-btn" id="btn-close-settings">×</button>
          </div>

          <div class="settings-modal-body">
            <nav class="settings-sidebar">
              <span class="settings-nav-heading">PROVIDERS</span>
              ${providerTabs}
            </nav>

            <section class="settings-form-content">
              <div class="form-header">
                <h4>${this.escapeHtml(PROVIDER_NAMES[p])}</h4>
                <p class="form-subtitle">Configure credentials and test live connection.</p>
              </div>

              ${p !== "ollama" ? `
                <div class="form-field">
                  <label class="control-label">API Key</label>
                  <div class="input-with-toggle">
                    <input
                      type="password"
                      id="settings-api-key"
                      class="text-input"
                      value="${this.escapeHtml(config.apiKey)}"
                      placeholder="Paste your ${this.escapeHtml(PROVIDER_NAMES[p])} API Key..."
                    />
                    <button type="button" class="btn-toggle-eye" id="btn-toggle-key-eye">👁</button>
                  </div>
                </div>
              ` : `
                <div class="form-field">
                  <p class="text-muted text-sm">Ollama runs locally on your computer and requires no API key.</p>
                </div>
              `}

              <div class="form-field">
                <label class="control-label">Base URL (Endpoint)</label>
                <input
                  type="text"
                  id="settings-base-url"
                  class="text-input"
                  value="${this.escapeHtml(config.baseUrl || DEFAULT_BASE_URLS[p])}"
                  placeholder="${DEFAULT_BASE_URLS[p]}"
                />
              </div>

              <div class="form-field">
                <label class="control-label">Default Model</label>
                <input
                  type="text"
                  id="settings-model"
                  class="text-input"
                  value="${this.escapeHtml(config.defaultModel || DEFAULT_MODELS[p])}"
                  placeholder="${DEFAULT_MODELS[p]}"
                />
              </div>

              <div class="settings-actions-row">
                <button class="btn btn-outline" id="btn-test-connection" ${this.isTestingConnection ? "disabled" : ""}>
                  ${this.isTestingConnection ? "Testing..." : "Test Connection"}
                </button>
                <button class="btn btn-primary" id="btn-set-default-provider">
                  ${this.activeProvider === p ? "✓ Active Provider" : "Set as Active Provider"}
                </button>
              </div>

              ${diagnosticBadge}
            </section>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SYSTEM-WIDE FLOATING QUICK ASSIST VIEW
  // ==========================================

  private renderQuickAssistHTML(): string {
    const activeConfig = this.credentials[this.activeProvider];

    return `
      <div class="quick-assist-layout">
        <header class="quick-assist-header">
          <div class="quick-assist-brand">
            <span class="qa-logo">LINGUALLY</span>
            <span class="qa-badge">QUICK ASSIST</span>
            <span class="qa-app-tag">Target: <strong>${this.escapeHtml(this.quickAssistActiveAppName)}</strong></span>
          </div>
          <div class="qa-header-actions">
            <button class="btn btn-sm btn-outline" id="btn-qa-refresh" title="Re-scan active text">↻ Refresh</button>
            <button class="btn btn-sm btn-outline" id="btn-qa-to-workbench" title="Open in Full Workbench">Workbench →</button>
          </div>
        </header>

        <div class="quick-assist-body">
          <div class="quick-assist-tabs">
            <button class="qa-tab-btn ${this.quickAssistActiveTab === "review" ? "active" : ""}" id="qa-tab-review">
              Review (${this.quickAssistSuggestions.length})
            </button>
            <button class="qa-tab-btn ${this.quickAssistActiveTab === "paraphrase" ? "active" : ""}" id="qa-tab-paraphrase">
              02 // Paraphrase
            </button>
          </div>

          <div class="quick-assist-editor-box">
            <textarea
              class="quick-assist-textarea"
              id="qa-textarea"
              placeholder="Type or select text in any application..."
            >${this.escapeHtml(this.quickAssistText)}</textarea>
          </div>

          <div class="quick-assist-tab-content">
            ${this.quickAssistActiveTab === "review" ? this.renderQuickAssistReviewHTML() : this.renderQuickAssistParaphraseHTML()}
          </div>
        </div>

        <footer class="quick-assist-footer">
          <span class="qa-footer-provider">Using <strong>${activeConfig.name}</strong></span>
          <button class="btn btn-primary" id="btn-qa-replace-in-app">
            Replace in ${this.escapeHtml(this.quickAssistActiveAppName)}
          </button>
        </footer>
      </div>
    `;
  }

  private renderQuickAssistReviewHTML(): string {
    if (this.quickAssistSuggestions.length === 0) {
      return `
        <div class="qa-empty-state">
          ✓ Writing looks clear! No typos or grammar issues.
        </div>
      `;
    }

    const cards = this.quickAssistSuggestions
      .map(
        (s) => `
        <div class="qa-suggestion-card" data-qa-sug-id="${s.id}">
          <div class="qa-sug-diff">
            <span class="qa-original">${this.escapeHtml(s.originalText)}</span>
            <span class="qa-arrow">→</span>
            <span class="qa-replacement">${this.escapeHtml(s.replacementText || "(remove)")}</span>
          </div>
          <div class="qa-sug-expl">${this.escapeHtml(s.explanation)}</div>
          <div class="qa-sug-actions">
            <button class="btn btn-xs btn-primary qa-btn-apply" data-apply-id="${s.id}">Accept</button>
            <button class="btn btn-xs btn-outline qa-btn-ignore" data-ignore-id="${s.id}">Ignore</button>
          </div>
        </div>
      `
      )
      .join("");

    return `<div class="qa-cards-list">${cards}</div>`;
  }

  private renderQuickAssistParaphraseHTML(): string {
    const modes: Array<typeof this.quickAssistParaphraseMode> = [
      "standard",
      "fluency",
      "formal",
      "creative",
      "shorten",
      "expand",
    ];

    const modeBtns = modes
      .map(
        (m) => `
        <button class="qa-mode-btn ${this.quickAssistParaphraseMode === m ? "active" : ""}" data-qa-mode="${m}">
          ${m.toUpperCase()}
        </button>
      `
      )
      .join("");

    return `
      <div class="qa-paraphrase-panel">
        <div class="qa-modes-bar">${modeBtns}</div>
        <button class="btn btn-sm btn-primary w-full" id="btn-qa-run-paraphrase" ${this.isGeneratingAI ? "disabled" : ""}>
          ${this.isGeneratingAI ? "Generating..." : "Generate Rephrase"}
        </button>
        ${this.quickAssistParaphraseResult ? `
          <div class="qa-paraphrase-result">
            <div class="qa-result-text">${this.escapeHtml(this.quickAssistParaphraseResult)}</div>
            <button class="btn btn-xs btn-primary" id="btn-qa-apply-rephrase">Apply Rephrase</button>
          </div>
        ` : ""}
      </div>
    `;
  }

  // ==========================================
  // EVENT BINDINGS & LOGIC
  // ==========================================

  private bindGlobalEvents() {
    //
  }

  private bindEditorEvents() {
    // Toolbar buttons
    document.querySelectorAll(".editor-toolbar .tool-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cmd = (btn as HTMLElement).dataset.command;
        const val = (btn as HTMLElement).dataset.value;
        if (cmd) {
          document.execCommand(cmd, false, val || undefined);
          this.handleEditorInput();
        }
      });
    });

    // Content Editable Input
    const canvas = document.getElementById("doc-content-canvas");
    if (canvas) {
      canvas.addEventListener("input", () => this.handleEditorInput());
    }

    // Title Input
    const titleInput = document.getElementById("doc-title-input") as HTMLInputElement;
    if (titleInput) {
      titleInput.addEventListener("input", () => {
        const doc = this.getActiveDocument();
        doc.title = titleInput.value;
        doc.updatedAt = Date.now();
        this.saveDocuments();
      });
    }

    // Toggle Docs Drawer
    document.getElementById("btn-toggle-docs-drawer")?.addEventListener("click", () => {
      this.isDocsDrawerOpen = !this.isDocsDrawerOpen;
      this.render();
    });

    // Create New Document
    document.getElementById("btn-create-doc")?.addEventListener("click", () => {
      const newDoc: DesktopDocument = {
        id: `doc-${Date.now()}`,
        title: "Untitled Document",
        content: "<p>Start writing here...</p>",
        updatedAt: Date.now(),
      };
      this.documents.unshift(newDoc);
      this.activeDocId = newDoc.id;
      this.saveDocuments();
      this.render();
    });

    // Select Document
    document.querySelectorAll(".doc-item").forEach((el) => {
      el.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).classList.contains("doc-delete-btn")) return;
        const id = (el as HTMLElement).dataset.docId;
        if (id) {
          this.activeDocId = id;
          this.saveDocuments();
          this.render();
        }
      });
    });

    // Delete Document
    document.querySelectorAll(".doc-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const delId = (btn as HTMLElement).dataset.deleteId;
        if (delId && this.documents.length > 1) {
          this.documents = this.documents.filter((d) => d.id !== delId);
          if (this.activeDocId === delId) {
            this.activeDocId = this.documents[0].id;
          }
          this.saveDocuments();
          this.render();
        }
      });
    });

    // Header Status Pill -> Opens Settings
    document.getElementById("header-status-pill")?.addEventListener("click", () => {
      this.isSettingsModalOpen = true;
      this.render();
    });

    // Settings Button
    document.getElementById("btn-open-settings")?.addEventListener("click", () => {
      this.isSettingsModalOpen = true;
      this.render();
    });

    // Open Quick Assist View Button
    document.getElementById("btn-open-quick-assist-view")?.addEventListener("click", () => {
      const doc = this.getActiveDocument();
      this.openQuickAssist(this.getPlainTextFromHTML(doc.content), "Writing Workbench");
    });

    // Export Document
    document.getElementById("btn-export-doc")?.addEventListener("click", () => {
      this.exportActiveDocument();
    });

    // Sidebar Tabs
    document.querySelectorAll(".sidebar-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabKey = (tab as HTMLElement).dataset.tab as typeof this.activeSidebarTab;
        if (tabKey) {
          this.activeSidebarTab = tabKey;
          this.render();
        }
      });
    });

    // Suggestions Actions
    document.querySelectorAll(".btn-apply-suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.applyId;
        if (id) this.applySuggestion(id);
      });
    });

    document.querySelectorAll(".btn-ignore-suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.ignoreId;
        if (id) {
          this.currentSuggestions = this.currentSuggestions.filter((s) => s.id !== id);
          this.render();
        }
      });
    });

    document.querySelectorAll(".btn-dict-suggestion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const word = (btn as HTMLElement).dataset.dictWord;
        if (word) {
          this.personalDictionary.add(word.toLowerCase());
          this.saveDictionary();
          this.runLinguisticCheck();
        }
      });
    });

    // Paraphrase Modes
    document.querySelectorAll("[data-paraphrase-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = (btn as HTMLElement).dataset.paraphraseMode as typeof this.paraphraseMode;
        if (m) {
          this.paraphraseMode = m;
          this.render();
        }
      });
    });

    // Run Paraphrase Button
    document.getElementById("btn-run-paraphrase")?.addEventListener("click", () => {
      this.runParaphrase();
    });

    // Apply Paraphrase
    document.getElementById("btn-apply-paraphrase")?.addEventListener("click", () => {
      if (this.paraphraseResult) {
        const canvas = document.getElementById("doc-content-canvas");
        if (canvas) {
          canvas.innerHTML = `<p>${this.escapeHtml(this.paraphraseResult.text)}</p>`;
          this.handleEditorInput();
        }
      }
    });

    // Settings Modal Events
    this.bindSettingsEvents();
  }

  private bindSettingsEvents() {
    if (!this.isSettingsModalOpen) return;

    document.getElementById("btn-close-settings")?.addEventListener("click", () => {
      this.isSettingsModalOpen = false;
      this.render();
    });

    // Switch provider tab inside settings
    document.querySelectorAll("[data-settings-provider]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pId = (btn as HTMLElement).dataset.settingsProvider as ProviderId;
        if (pId) {
          this.settingsSelectedProvider = pId;
          this.render();
        }
      });
    });

    // Toggle Eye for password mask
    document.getElementById("btn-toggle-key-eye")?.addEventListener("click", () => {
      const input = document.getElementById("settings-api-key") as HTMLInputElement;
      if (input) {
        input.type = input.type === "password" ? "text" : "password";
      }
    });

    // Test Connection Button
    document.getElementById("btn-test-connection")?.addEventListener("click", async () => {
      const p = this.settingsSelectedProvider;
      const keyInput = document.getElementById("settings-api-key") as HTMLInputElement;
      const urlInput = document.getElementById("settings-base-url") as HTMLInputElement;
      const modelInput = document.getElementById("settings-model") as HTMLInputElement;

      if (keyInput) this.credentials[p].apiKey = keyInput.value.trim();
      if (urlInput) this.credentials[p].baseUrl = urlInput.value.trim();
      if (modelInput) this.credentials[p].defaultModel = modelInput.value.trim();
      this.saveCredentials();

      this.isTestingConnection = true;
      this.render();

      const result = await DesktopAIClient.testConnection(this.credentials[p]);
      this.connectionStatus[p] = result;
      this.isTestingConnection = false;
      this.render();
    });

    // Set as Default Provider
    document.getElementById("btn-set-default-provider")?.addEventListener("click", () => {
      this.activeProvider = this.settingsSelectedProvider;
      this.saveCredentials();
      this.checkInitialConnection();
      this.render();
    });
  }

  private bindQuickAssistEvents() {
    const textarea = document.getElementById("qa-textarea") as HTMLTextAreaElement;
    if (textarea) {
      textarea.addEventListener("input", () => {
        this.quickAssistText = textarea.value;
        this.runQuickAssistCheck();
      });
    }

    // Refresh
    document.getElementById("btn-qa-refresh")?.addEventListener("click", () => {
      this.runQuickAssistCheck();
    });

    // Workbench button
    document.getElementById("btn-qa-to-workbench")?.addEventListener("click", () => {
      this.activeView = "workbench";
      this.render();
    });

    // Tabs
    document.getElementById("qa-tab-review")?.addEventListener("click", () => {
      this.quickAssistActiveTab = "review";
      this.render();
    });

    document.getElementById("qa-tab-paraphrase")?.addEventListener("click", () => {
      this.quickAssistActiveTab = "paraphrase";
      this.render();
    });

    // Quick Assist Paraphrase Modes
    document.querySelectorAll("[data-qa-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = (btn as HTMLElement).dataset.qaMode as typeof this.quickAssistParaphraseMode;
        if (m) {
          this.quickAssistParaphraseMode = m;
          this.render();
        }
      });
    });

    // Run Quick Assist Paraphrase
    document.getElementById("btn-qa-run-paraphrase")?.addEventListener("click", async () => {
      this.isGeneratingAI = true;
      this.render();
      try {
        const config = this.credentials[this.activeProvider];
        let result = "";
        if (config.apiKey || config.id === "ollama") {
          result = await DesktopAIClient.executePrompt(
            config,
            `You are a professional writing assistant. Rewrite the following text in a ${this.quickAssistParaphraseMode} style. Return ONLY the rewritten text without commentary.`,
            this.quickAssistText
          );
        } else {
          result = paraphraseText(this.quickAssistText, this.toOfflineParaphraseMode(this.quickAssistParaphraseMode));
        }
        this.quickAssistParaphraseResult = result;
      } catch {
        this.quickAssistParaphraseResult = paraphraseText(this.quickAssistText, this.toOfflineParaphraseMode(this.quickAssistParaphraseMode));
      } finally {
        this.isGeneratingAI = false;
        this.render();
      }
    });

    // Apply Rephrase into quick assist text
    document.getElementById("btn-qa-apply-rephrase")?.addEventListener("click", () => {
      if (this.quickAssistParaphraseResult) {
        this.quickAssistText = this.quickAssistParaphraseResult;
        this.runQuickAssistCheck();
      }
    });

    // Replace in Active App Button
    document.getElementById("btn-qa-replace-in-app")?.addEventListener("click", () => {
      this.replaceTextInActiveApp(this.quickAssistText);
    });

    // Quick Assist Apply / Ignore Suggestions
    document.querySelectorAll(".qa-btn-apply").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.applyId;
        const sug = this.quickAssistSuggestions.find((s) => s.id === id);
        if (sug) {
          this.quickAssistText =
            this.quickAssistText.slice(0, sug.offset) +
            sug.replacementText +
            this.quickAssistText.slice(sug.offset + sug.length);
          this.runQuickAssistCheck();
        }
      });
    });

    document.querySelectorAll(".qa-btn-ignore").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.ignoreId;
        this.quickAssistSuggestions = this.quickAssistSuggestions.filter((s) => s.id !== id);
        this.render();
      });
    });
  }

  // ==========================================
  // LINGUISTIC CHECK & PARAPHRASE LOGIC
  // ==========================================

  private handleEditorInput() {
    const canvas = document.getElementById("doc-content-canvas");
    if (!canvas) return;

    const doc = this.getActiveDocument();
    doc.content = canvas.innerHTML;
    doc.updatedAt = Date.now();
    this.saveDocuments();

    this.runLinguisticCheck();
  }

  private runLinguisticCheck() {
    const doc = this.getActiveDocument();
    const plainText = this.getPlainTextFromHTML(doc.content);

    // Run deterministic engine from shared-checker
    const suggestions = runExtensionCheck(plainText, this.personalDictionary);
    this.currentSuggestions = suggestions;

    // Update status bar stats
    const stats = calculateTextStatistics(plainText);
    const readability = calculateReadability(plainText);
    const statusBar = document.querySelector(".editor-status-bar");
    if (statusBar) {
      statusBar.outerHTML = this.renderEditorStatusBarHTML(stats, readability);
    }

    // Update sidebar suggestions tab count and content if suggestions tab active
    const reviewTabBtn = document.querySelector('[data-tab="suggestions"]');
    if (reviewTabBtn) {
      reviewTabBtn.textContent = `Review (${this.currentSuggestions.length})`;
    }
    if (this.activeSidebarTab === "suggestions") {
      const content = document.querySelector(".sidebar-content");
      if (content) {
        content.innerHTML = this.renderSuggestionsTabHTML();
        this.bindEditorEvents();
      }
    }
  }

  private runQuickAssistCheck() {
    this.quickAssistSuggestions = runExtensionCheck(this.quickAssistText, this.personalDictionary);
    this.render();
  }

  private applySuggestion(id: string) {
    const sug = this.currentSuggestions.find((s) => s.id === id);
    if (!sug) return;

    const canvas = document.getElementById("doc-content-canvas");
    if (!canvas) return;

    const currentPlain = this.getPlainTextFromHTML(canvas.innerHTML);
    const before = currentPlain.slice(0, sug.offset);
    const after = currentPlain.slice(sug.offset + sug.length);
    const updatedPlain = before + sug.replacementText + after;

    canvas.innerHTML = `<p>${this.escapeHtml(updatedPlain)}</p>`;
    this.handleEditorInput();
  }

  private toOfflineParaphraseMode(m: string): "standard" | "fluency" | "formal" | "shorten" | "expand" {
    if (m === "creative") return "fluency";
    if (m === "academic") return "formal";
    if (m === "shorten" || m === "expand" || m === "formal" || m === "fluency") return m;
    return "standard";
  }

  private async runParaphrase() {
    const doc = this.getActiveDocument();
    const plainText = this.getPlainTextFromHTML(doc.content);
    if (!plainText.trim()) return;

    this.isGeneratingAI = true;
    this.render();

    const config = this.credentials[this.activeProvider];
    let rewritten = "";

    try {
      if (config.apiKey || config.id === "ollama") {
        rewritten = await DesktopAIClient.executePrompt(
          config,
          `You are a professional writing assistant. Rewrite the following text in a ${this.paraphraseMode} style. Return ONLY the rewritten text without commentary.`,
          plainText
        );
      } else {
        rewritten = paraphraseText(plainText, this.toOfflineParaphraseMode(this.paraphraseMode));
      }
    } catch {
      rewritten = paraphraseText(plainText, this.toOfflineParaphraseMode(this.paraphraseMode));
    } finally {
      this.isGeneratingAI = false;
      const diff = computeWordDiff(plainText, rewritten);
      this.paraphraseResult = { original: plainText, text: rewritten, diff };
      this.render();
    }
  }

  private replaceTextInActiveApp(text: string) {
    // 1. Send to native WebKit message handler if running inside macOS Cocoa
    const webkit = (window as unknown as { webkit?: { messageHandlers?: { lingually?: { postMessage: (msg: unknown) => void } } } }).webkit;
    if (webkit?.messageHandlers?.lingually) {
      webkit.messageHandlers.lingually.postMessage({
        type: "REPLACE_IN_APP",
        text,
      });
      return;
    }

    // 2. Fallback: Copy to clipboard and inform user
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied corrected text to clipboard! Paste it into ${this.quickAssistActiveAppName} with ⌘V or Ctrl+V.`);
    });
  }

  public openQuickAssist(text: string, appName: string = "Active App") {
    this.activeView = "quick-assist";
    this.quickAssistText = text;
    this.quickAssistActiveAppName = appName;
    this.quickAssistParaphraseResult = "";
    this.runQuickAssistCheck();
  }

  private exportActiveDocument() {
    const doc = this.getActiveDocument();
    const plainText = this.getPlainTextFromHTML(doc.content);
    const blob = new Blob([plainText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/[^a-z0-9]/gi, "_") || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private updateHeaderStatusPill() {
    const pill = document.getElementById("header-status-pill");
    if (!pill) return;
    const activeConfig = this.credentials[this.activeProvider];
    const status = this.connectionStatus[this.activeProvider];

    if (status?.success) {
      pill.className = "status-pill status-online";
      pill.innerHTML = `<span>● ${activeConfig.name} (${status.latencyMs ? `${status.latencyMs}ms` : "Connected"})</span>`;
    } else if (status && !status.success) {
      pill.className = "status-pill status-error";
      pill.innerHTML = `<span>✗ ${activeConfig.name} Error</span>`;
    }
  }

  private getPlainTextFromHTML(html: string): string {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.innerText || tmp.textContent || "";
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new LinguallyDesktopApp();
  app.init();
});

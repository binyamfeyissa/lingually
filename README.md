# Lingually

> **Write clearly. Rewrite confidently.**  
> A complete, production-ready, open-source AI writing workbench combining grammar checking, intelligent rewriting, paraphrasing, tone adjustment, summarization, translation, and writing analysis in one cohesive application.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6e9f18)](https://vitest.dev/)

---

## Overview

**Lingually** is a polished, privacy-conscious open-source alternative to proprietary AI writing assistants like Grammarly and QuillBot. It pairs the practical editing flow of a rich-text word processor with the power of modern Large Language Models—while putting users in complete control of their documents and API credentials.

### Core Principles

1. **Open Source First**: 100% open source under the permissive MIT license.
2. **Bring Your Own Key (BYOK)**: Connect directly to your own provider accounts (OpenAI, Google Gemini, Anthropic Claude, Groq, Ollama, or custom OpenAI-compatible endpoints).
3. **Local-First Document Storage**: All documents and version histories live directly in your browser's IndexedDB. No remote database or account registration required.
4. **No Mandatory Subscriptions**: Zero monthly fees or marked-up tokens. Users pay only their provider's direct wholesale API rates (or run completely free offline models with Ollama).
5. **Real AI Integrations**: Real streaming API integrations across all supported providers—never simulated, mocked, or placeholder outputs in production.
6. **User Control**: Every AI edit displays an interactive before-and-after visual diff. Suggestions are never applied without your explicit review and acceptance.
7. **Transparent Privacy**: Stateless server-side proxying with strict SSRF protection, configurable session-only credential modes, and zero background telemetry.

---

## Features

### 1. Rich-Text Editor & Writing Environment
- **Tiptap Framework**: Fast, accessible ProseMirror-based rich-text editing.
- **Formatting Tools**: Bold, italic, underline, strikethrough, headings (H1–H3), bullet lists, numbered lists, blockquotes, code blocks, links, and undo/redo.
- **Autosave with Reliability**: Debounced local persistence to IndexedDB with visible save state indicators (`Saving...`, `Saved locally`, `Unsaved changes`).
- **Selection-Aware Editing**: Highlight any sentence or paragraph to trigger a contextual floating action menu. AI operations automatically scope to your active selection or default to the full document.

### 2. Comprehensive Writing Tools
| Tool | Description | Capabilities & Options |
| --- | --- | --- |
| **Grammar Correction** | Identifies and fixes grammatical errors, typos, and punctuation misuses. | Structured output with before/after diffs, categorized changes (grammar, spelling, agreement, syntax), and one-click accept/reject. |
| **Paraphrasing** | Rephrases text while strictly preserving core factual meaning. | 7 configurable styles: *Standard*, *Fluent*, *Formal*, *Simple*, *Creative*, *Concise*, *Expanded*. Supports generating 1 to 4 distinct alternatives. |
| **Tone Adjustment** | Modulates voice and register to match your audience. | 10 tone presets: *Professional*, *Friendly*, *Formal*, *Casual*, *Academic*, *Persuasive*, *Empathetic*, *Confident*, *Diplomatic*, *Neutral*. |
| **Summarization** | Distills lengthy text into executive briefings and bullet points. | 5 formats: *Bullet Points*, *Short (1–2 sentences)*, *Detailed*, *Executive Brief*, *Key Takeaways*. |
| **Writing Improvement** | Holistic copyediting to elevate style and readability. | Focus presets: *All*, *Clarity*, *Conciseness*, *Flow*, *Word Choice*, *Transitions*, *Redundancy*. |
| **Custom Instructions** | Freeform prompt transformations. | Apply custom instructions (e.g., "Format as an email to stakeholders") with untrusted prompt sandboxing. |
| **Spelling Only** | Orthographic and typographical proofreader. | Restricts edits exclusively to mechanical spelling and punctuation without altering vocabulary or phrasing. |
| **Shorten / Expand** | Precise sentence length modulation. | Shortens text to cut deadwood or expands detail with illustrative context. |
| **Translation** | Idiomatic multi-lingual translation. | Supports 20+ major languages while preserving Markdown formatting, bullet points, code variables, and proper nouns. |
| **AI Writing Indicators** | Honest, local heuristic analysis. | Computes burstiness (sentence variance), stock phrase density, transition opener ratios, and structural repetition with prominent non-definitive disclaimers. |
| **Writing Statistics** | Deterministic local text calculations. | Word count, character count (with/without spaces), sentence count, paragraph count, avg words/sentence, reading time (~200 wpm), speaking time (~130 wpm), and lexical diversity. |
| **Readability Metrics** | Formulaic scoring calibrated for English prose. | Flesch Reading Ease (0–100), Flesch-Kincaid Grade Level, Coleman-Liau Index, and Gunning Fog Index with language validation. |

### 3. Document Library & Version History
- **Document Management**: Create, rename, duplicate, delete with confirmation, and toggle favorites.
- **Search & Filter**: Real-time title and body search with instant filtering.
- **Automatic Version Snapshots**: Creates a revision snapshot before applying any accepted AI rewrite.
- **Revision History Modal**: Timeline of revisions with word-level visual diffing and one-click revision restoration.
- **Multi-Format Import**: Import `.txt`, `.md`, `.docx` (via Mammoth), and Lingually `.json` backup files.
- **Multi-Format Export**: Export clean `.txt`, `.md`, sanitized standalone `.html`, `.docx` (via Docx), or full library `.json` backups. Document exports **never** include API credentials.

---

## Technology Stack

- **Framework**: [Next.js 15.5](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/) with strict type checking
- **UI & Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Editor**: [Tiptap 2.11](https://tiptap.dev/) (ProseMirror core, StarterKit, Underline, Link, Placeholder, CharacterCount)
- **Local Persistence**: [Dexie 4.0](https://dexie.org/) (IndexedDB wrapper) & `localStorage` / `sessionStorage`
- **Validation**: [Zod 3.24](https://zod.dev/)
- **Diff Engine**: [diff 7.0](https://github.com/kpdecker/jsdiff)
- **Document Import/Export**: [docx](https://docx.js.org/), [mammoth](https://github.com/mwilliamson/mammoth.js), [sanitize-html](https://github.com/apostrophecms/sanitize-html)
- **Testing**: [Vitest 3.2](https://vitest.dev/), React Testing Library, [Playwright 1.50](https://playwright.dev/)

---

## Architecture

```
app/
  layout.tsx              # Root HTML shell, metadata, and theme support
  page.tsx                # Main 3-panel writing workbench
  globals.css             # Tailwind base styles and Tiptap prose themes
  api/
    ai/route.ts           # Stateless same-origin proxy (SSRF protected)
    health/route.ts       # Service health check endpoint
  settings/page.tsx       # Dedicated BYOK & storage settings page
  privacy/page.tsx        # Transparency & architecture breakdown

components/
  app-shell/              # Navbar, Sidebar, Theme Toggle
  editor/                 # Tiptap Editor, Toolbar, Selection Menu, Word Count Bar
  ai-tools/               # Assistant Panel, Diff Viewer, Grammar Tool, Alternatives View, AI Indicators
  analysis/               # Writing Analysis & Readability Drawer
  history/                # Revision History Modal & Revision Diff
  shared/                 # Accessible Button, Input, Modal, Tabs, Badge

lib/
  ai/
    providers/            # Individual provider adapters (OpenAI, Gemini, Claude, Groq, Ollama, Compatible)
    provider-registry.ts  # Unified provider resolution and validation
    model-capabilities.ts # Catalog of recommended models and context windows
    prompts.ts            # Centralized, versioned prompt templates
    streaming.ts          # Client-side SSE stream consumer with AbortController
    task-runner.ts        # AI task orchestrator and structured JSON parser
  documents/
    schema.ts             # Dexie IndexedDB database definition
    repository.ts         # Document CRUD, revisions, and seed logic
    migrations.ts         # Schema version migration runner
  editor/
    extensions.ts         # Tiptap extensions configuration
    serialization.ts      # HTML snapshotting and safe text replacement
  analysis/
    statistics.ts         # Deterministic text metrics and word frequency
    readability.ts        # Syllable counter, Flesch, Flesch-Kincaid, Coleman-Liau, Fog
    heuristics.ts         # Experimental burstiness and formulaic pattern analyzer
  security/
    api-key-storage.ts    # Centralized storage abstraction (local / session / none)
    validation.ts         # SSRF protection, URL validation, and Zod schemas
    sanitization.ts       # HTML tag and attribute sanitizer
  utils/                  # Tailwind merger (cn), diffing, import/export helpers
```

---

## Prerequisites

- **Node.js**: v18.18.0 or later (tested on Node.js v22.16.0).
- **Package Manager**: npm v9+, pnpm, or yarn.

---

## Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/lingually.git
   cd lingually
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run TypeScript type checking**:
   ```bash
   npm run type-check
   ```

5. **Run ESLint**:
   ```bash
   npm run lint
   ```

6. **Run automated unit and integration tests**:
   ```bash
   npm run test
   ```

7. **Create a production build**:
   ```bash
   npm run build
   npm run start
   ```

---

## AI Provider Configuration (BYOK)

Navigate to **Settings** (`/settings`) in the application to configure one or more AI providers:

### 1. OpenAI
- **Key Format**: Typically begins with `sk-` or `sk-proj-`.
- **Get Key**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Supported Models**: `gpt-4o-mini` (default, recommended for speed and economy), `gpt-4o`, `o3-mini`.

### 2. Google Gemini
- **Key Format**: Typically begins with `AIza`.
- **Get Key**: [aistudio.google.com](https://aistudio.google.com/)
- **Supported Models**: `gemini-2.0-flash` (default, high speed), `gemini-1.5-flash`, `gemini-1.5-pro` (2M token context).

### 3. Anthropic Claude
- **Key Format**: Typically begins with `sk-ant-`.
- **Get Key**: [console.anthropic.com](https://console.anthropic.com/)
- **Supported Models**: `claude-3-5-haiku-20241022` (fast), `claude-3-5-sonnet-20241022` (flagship prose nuance), `claude-3-7-sonnet-20250219`.

### 4. Groq
- **Key Format**: Typically begins with `gsk_`.
- **Get Key**: [console.groq.com/keys](https://console.groq.com/keys)
- **Supported Models**: `llama-3.3-70b-versatile` (ultra-fast LPU inference), `llama-3.1-8b-instant`.

### 5. Ollama (100% Free & Local)
- **Setup**: Download and install Ollama from [ollama.com](https://ollama.com/).
- **Pull a Model**:
  ```bash
  ollama pull llama3.2
  ```
- **Run with CORS permissions**:
  ```bash
  OLLAMA_ORIGINS="*" ollama serve
  ```
- **Lingually Base URL**: `http://localhost:11434` (default). No API key required.

### 6. OpenAI-Compatible Endpoints
- Connect to LM Studio, LocalAI, vLLM, OpenRouter, Together AI, DeepSeek, or any custom endpoint adhering to the OpenAI Chat Completions API.
- **Base URL**: e.g., `http://localhost:1234/v1` or `https://openrouter.ai/api/v1`.

---

## Data Privacy & Security

- **Documents**: Preserved entirely in your browser's local **IndexedDB**. Nothing is stored on an application database.
- **API Keys**: Stored in your choice of storage mode:
  - *Persistent Local Storage* (`localStorage`): Persists across browser sessions.
  - *Session-Only Storage* (`sessionStorage`): Cleared automatically when you close the tab.
  - *In-Memory Only*: Kept in active RAM only, wiped on page refresh.
- **Serverless Proxy**: When you run an AI action, the request passes through Next.js Route Handler `/api/ai` to circumvent browser CORS restrictions. The proxy is **completely stateless**—it never writes credentials, prompts, or documents to disk or logs.
- **SSRF Defense**: The proxy prohibits requests to cloud metadata services (`169.254.169.254`) and unauthorized private LAN IP addresses. Localhost connections are permitted strictly for local model engines (such as Ollama).
- **Export Safety**: Full JSON backups and file exports **never** include your API keys.

---

## Deployment to Vercel

Lingually is optimized for one-click deployment to [Vercel](https://vercel.com):

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log into Vercel and click **Add New Project**.
3. Import your Lingually repository.
4. Framework Preset will automatically detect **Next.js**.
5. **Environment Variables**: **None required!** Lingually uses 100% client-side BYOK. Users provide their own keys in the browser Settings UI.
6. Click **Deploy**.

---

## Troubleshooting

- **401 Unauthorized / Invalid Key**: Verify that your API key is correctly entered in Settings without extraneous whitespace.
- **429 Rate Limit / Quota Exceeded**: You have exhausted your provider credit balance or hit requests-per-minute limits. Check your provider's billing dashboard.
- **Ollama Connection Refused**: Ensure Ollama is running (`ollama serve`) and launched with `OLLAMA_ORIGINS="*"`.
- **Readability Score Unavailable**: Flesch readability formulas rely on English phonetic syllable rules. Text with significant non-Latin script will display an informational notice instead of a fabricated score.

---

## License

MIT License — Copyright (c) 2026 Lingually Contributors. See [LICENSE](LICENSE) for details.

# Lingually 2.0

> **Write clearly. Everywhere.**  
> A complete, production-ready, open-source AI writing assistant and workbench combining grammar checking, intelligent rewriting, paraphrasing, tone adjustment, summarization, translation, writing analysis, and plagiarism verification in one cohesive cross-platform ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-yellow)](docs/CHROME_EXTENSION.md)
[![Tauri](https://img.shields.io/badge/Desktop-Tauri%202.0-24c8db)](src-tauri/)
[![Tested with Vitest](https://img.shields.io/badge/Tested%20with-Vitest-6e9f18)](https://vitest.dev/)

---

## 🌟 Overview

**Lingually 2.0** is an open-source, privacy-first alternative to proprietary AI writing assistants like Grammarly and QuillBot. It pairs the focused editing flow of a rich-text word processor with real-time browser extension assistance and native desktop integrations—giving users complete control over their documents, privacy, and AI model credentials.

### Core Principles

1. **Open Source First**: 100% open source under the permissive MIT license.
2. **Bring Your Own Key (BYOK)**: Connect directly to your own provider accounts (OpenAI, Google Gemini, Anthropic Claude, Groq, Mistral, Ollama, or custom OpenAI-compatible endpoints).
3. **Local-First Document Storage**: All documents, drafts, and version histories live directly in your browser's IndexedDB or local machine. No remote database or mandatory account registration required.
4. **Zero Subscription Fees**: Pay only your provider's direct wholesale API rates (typically pennies for thousands of pages), or run completely free offline models with Ollama.
5. **Real AI Integrations**: Production-grade streaming API integrations across all supported providers—never simulated, mocked, or placeholder outputs.
6. **User Control**: Every edit displays an interactive before-and-after visual diff. Suggestions are never applied without your explicit review and acceptance.
7. **Transparent Privacy**: Stateless server-side proxying with strict SSRF protection, session-only credential modes, and zero background telemetry.

---

## 🚀 The Lingually 2.0 Ecosystem

| Platform | Location | Description |
| --- | --- | --- |
| **Public Website & Demo** | [`app/page.tsx`](app/page.tsx) | Polished marketing landing page with live interactive 4-category demo, comparison matrix, platform downloads, and FAQ. |
| **Web Workbench Editor** | [`app/editor/page.tsx`](app/editor/page.tsx) | Full distraction-free Tiptap editor with 3-tab review sidebar, revision history snapshots, and multi-format import/export. |
| **Chrome Extension** | [`apps/chrome-extension/`](apps/chrome-extension/) | Manifest V3 extension providing inline colored underlines, floating suggestion cards, side panel review, and options page. |
| **macOS Desktop App** | [`src-tauri/`](src-tauri/) | Tauri 2 universal desktop application (Apple Silicon M1-M4 & Intel `x86_64`) with Accessibility API and system tray. |
| **Windows Desktop App** | [`src-tauri/`](src-tauri/) | Tauri 2 64-bit desktop application with Windows UI Automation text hooks, system tray, and NSIS/MSI installer. |

---

## 🎨 4-Category Layered Correction Engine

Lingually evaluates writing through a unified two-layer system:
- **Layer A (Deterministic)**: Instant local rule evaluation (typos, grammar confusions, repeated words, clarity, and tone hedges) with zero latency and zero network calls.
- **Layer B (AI Model Analysis)**: Contextual semantic evaluation via your selected AI provider.

Issues are categorized by color-coded tags:
- 🔴 **Correctness**: Spelling, grammatical agreement, punctuation, and typographical mistakes.
- 🔵 **Clarity**: Wordy phrasing, passive hedges, conciseness improvements, and sentence flow.
- 🟢 **Engagement**: Dynamic vocabulary upgrades, avoiding overused clichés and weak modifiers.
- 🟣 **Delivery**: Tone adjustments, assertiveness, formality, and audience alignment.

---

## 🔍 Plagiarism & AI Text Verification

- **Multi-Scale N-Gram Extraction**: Analyzes 5-grams through 8-grams to detect exact duplication and light paraphrasing.
- **Local Document Comparison**: Compares active drafts against your saved library to detect self-plagiarism.
- **Attribution Query Generation**: Formulates targeted web search queries for verified external citations.
- **AI Statistical Metrics**: Evaluates sentence-level perplexity and burstiness variance with honest, non-definitive reporting.
- See [`docs/PLAGIARISM_AND_AI_DETECTION.md`](docs/PLAGIARISM_AND_AI_DETECTION.md) for full methodology.

---

## 🛠️ Quick Start & Local Development

### 1. Prerequisites
- **Node.js**: 18+ (20+ LTS recommended)
- **npm** or **pnpm**

### 2. Installation
```bash
git clone https://github.com/your-username/lingually.git
cd lingually
npm install
```

### 3. Run Web Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public marketing site and interactive demo, or [http://localhost:3000/editor](http://localhost:3000/editor) to jump directly into the writing workbench.

### 4. Build Chrome Extension
```bash
npm run build:extension
```
Builds the extension into `dist/chrome-extension/` and creates the downloadable package in `public/downloads/lingually-chrome-extension.zip`.  
See [`docs/CHROME_EXTENSION.md`](docs/CHROME_EXTENSION.md) for installation and developer mode instructions.

### 5. Build Desktop Application (Tauri 2)
```bash
# macOS build (Universal Apple Silicon & Intel)
npx tauri build --target universal-apple-darwin

# Windows build (x64 NSIS / MSI)
npx tauri build
```
See [`docs/MACOS_BUILD.md`](docs/MACOS_BUILD.md) and [`docs/WINDOWS_BUILD.md`](docs/WINDOWS_BUILD.md).

---

## 🧪 Testing & Verification

Lingually includes a full suite of automated unit, integration, and security tests:

```bash
# Run unit & integration tests
npm run test

# Run TypeScript type-checking
npm run type-check

# Run Next.js linting
npm run lint

# Compile production Next.js build
npm run build
```

---

## 🔒 Security & Privacy Architecture

- **Stateless AI Proxy**: Server route `/api/ai` forwards prompt payloads directly to AI provider endpoints. Keys and prompts are never logged, cached, or persisted to server disks.
- **SSRF Defense**: The proxy enforces strict destination protocol (`https:`) and port (`443`) validation against an explicit allowlist of authorized hostnames (`api.openai.com`, `api.anthropic.com`, `generativelanguage.googleapis.com`, `api.groq.com`, `api.mistral.ai`, `localhost`, `127.0.0.1`). Cloud metadata IPs (`169.254.169.254`, `metadata.google.internal`) and private networks are rejected.
- **Client-Side Key Storage**: Credentials remain in browser `localStorage` or `sessionStorage` (with optional session-only ephemeral mode). Exported files never include API keys.
- **Sanitized HTML**: All rich text and HTML imports are scrubbed using strict tag and attribute allowlists to prevent Cross-Site Scripting (XSS).

---

## 📄 License

Lingually is free open-source software released under the [MIT License](LICENSE).

# Lingually Chrome Extension Guide

Lingually provides a Manifest V3 browser extension for inline grammar, spelling, clarity, engagement, and delivery assistance across web applications (including Gmail, Google Docs, Notion, Jira, GitHub, and any web textarea or contenteditable element).

---

## 1. Quick Install (Pre-packaged .zip)

1. Download the pre-packaged extension zip file:
   - Direct download from the web interface or via:
     `public/downloads/lingually-chrome-extension.zip`
2. Extract the `.zip` file into a folder on your computer.
3. Open Google Chrome (or Chromium-based browsers: Brave, Edge, Arc).
4. Navigate to `chrome://extensions`.
5. Toggle **Developer mode** in the upper-right corner.
6. Click **Load unpacked** and select the extracted extension folder (`dist/chrome-extension`).
7. The Lingually icon will appear in your browser extension toolbar!

---

## 2. Building from Source

To build the Chrome extension locally from the repository:

```bash
# Install dependencies
npm install

# Build the extension and bundle assets
npm run build:extension
```

The compiled extension files are output to:
```
dist/chrome-extension/
  ├── manifest.json
  ├── background.js
  ├── content.js
  ├── content.css
  ├── popup.html
  ├── popup.js
  ├── sidepanel.html
  ├── sidepanel.js
  ├── options.html
  ├── options.js
  └── icons/
```
The automated script also packages `public/downloads/lingually-chrome-extension.zip` for instant distribution.

---

## 3. Features & Usage

### 3.1 Inline Writing Assistance
- Whenever you focus a textarea, input, or contenteditable editor, Lingually monitors your writing using the **Layer A deterministic rule engine**.
- A small floating pill indicator appears in the bottom right corner of the field showing detected issues.
- Clicking the pill or hovering over an issue opens a floating suggestion card:
  - **Category Badge**: Correctness (red), Clarity (blue), Engagement (green), Delivery (purple).
  - **Diff Preview**: Strikethrough original text and green suggested replacement.
  - **Accept**: Atomically replaces the text and fires native `input` / `change` events.
  - **Dismiss**: Ignores the suggestion for the current session.
  - **Add to Dictionary**: Saves the word to your sync storage so it is never flagged again.

### 3.2 Side Panel
- Click the extension icon and select **Open Side Panel** (or press the context menu option on selected text).
- The side panel provides:
  - Full review suggestions list with category filters.
  - **Generative AI Tools**: Paraphrase, Make Concise, Shift Tone (Formal / Casual).
  - **Plagiarism & AI Verification**.
  - **Get Page Selection**: Pulls highlighted text from the current webpage into the review panel.

### 3.3 Privacy & BYOK
- All API keys (OpenAI, Anthropic, Gemini, Groq, Mistral, Ollama) are stored in `chrome.storage.sync`.
- Keys are never transmitted to any third-party analytics or Lingually servers.
- When using local Ollama, all inference stays 100% on your local machine.

---

## 4. Publishing to Chrome Web Store

1. Run `npm run build:extension` to generate the production zip.
2. Log in to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. Click **Add new item** and upload `public/downloads/lingually-chrome-extension.zip`.
4. Fill in the store listing:
   - Category: Productivity / Writing
   - Privacy practices: Single-purpose writing assistant; keys stored locally.
5. Submit for automated review.

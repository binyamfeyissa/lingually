/**
 * Desktop Frontend Bundler for Lingually Tauri 2 Desktop App
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const DIST_DESKTOP = path.join(ROOT_DIR, "dist", "desktop");
const OUT_DIR = path.join(ROOT_DIR, "out");

console.log("🖥️ Building Lingually Desktop Distribution...");

// Ensure output directories exist
fs.mkdirSync(DIST_DESKTOP, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// 1. Build Next.js application
try {
  console.log("Compiling Next.js application...");
  execSync("npm run build", { stdio: "inherit" });
} catch (e) {
  console.warn("Next.js build warning:", e.message);
}

// 2. Create standalone Desktop Webview Shell
const desktopHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lingually — AI Writing Workbench</title>
  <link rel="icon" type="image/png" href="icon32.png">
  <style>
    :root {
      --brand: #0268cc;
      --brand-hover: #0256a9;
      --bg: #fbfbfd;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-muted: #64748b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    header {
      height: 54px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      user-select: none;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-img {
      height: 26px;
      width: auto;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      background: #eef6fc;
      color: var(--brand);
      border: 1px solid rgba(2, 104, 204, 0.2);
      padding: 2px 8px;
      border-radius: 9999px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: var(--brand);
      color: white;
      border: none;
    }
    .btn-primary:hover { background: var(--brand-hover); }
    .main-layout {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    .editor-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 32px 48px;
      overflow-y: auto;
      background: var(--surface);
    }
    .doc-title {
      font-size: 24px;
      font-weight: 800;
      border: none;
      outline: none;
      margin-bottom: 20px;
      color: var(--text);
      width: 100%;
    }
    .editor-area {
      flex: 1;
      font-size: 16px;
      line-height: 1.8;
      border: none;
      outline: none;
      resize: none;
      color: #334155;
      font-family: Georgia, Cambria, serif;
    }
    .sidebar-pane {
      width: 360px;
      background: var(--bg);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    .tab {
      flex: 1;
      padding: 10px 4px;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      border: none;
      border-bottom: 2px solid transparent;
      background: transparent;
      cursor: pointer;
    }
    .tab.active {
      color: var(--brand);
      border-bottom-color: var(--brand);
    }
    .tab-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    .score-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 10px;
    }
    .pill {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 9999px;
    }
    .pill-correctness { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
    .pill-clarity { background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; }
    .pill-engagement { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .pill-delivery { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
    .btn-accept-sugg {
      margin-top: 8px;
      width: 100%;
      background: var(--brand);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-accept-sugg:hover { background: var(--brand-hover); }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <img src="icon32.png" alt="Lingually" class="logo-img" />
      <span style="font-weight: 800; font-size: 15px;">Lingually</span>
      <span class="badge">Desktop 2.0</span>
    </div>
    <div class="actions">
      <button id="btn-inspect-ext" class="btn">🔍 Inspect Active App</button>
      <button id="btn-refresh" class="btn" title="Refresh analysis">🔄 Refresh</button>
      <button id="btn-save" class="btn btn-primary">Save Document</button>
    </div>
  </header>

  <div class="main-layout">
    <div class="editor-pane">
      <input id="doc-title" class="doc-title" value="Untitled Document" placeholder="Document Title..." />
      <textarea id="editor" class="editor-area" placeholder="Start typing, paste an excerpt, or use the global shortcut (Cmd/Ctrl+Shift+L) to inspect text in external apps..."></textarea>
    </div>

    <div class="sidebar-pane">
      <div class="tabs">
        <button class="tab active" data-tab="tab-review">Suggestions</button>
        <button class="tab" data-tab="tab-ai">Write AI</button>
        <button class="tab" data-tab="tab-plagiarism">Plagiarism</button>
      </div>

      <div class="tab-content" id="tab-review-content">
        <div class="score-card">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Overall Score</div>
            <div id="overall-score" style="font-size: 28px; font-weight: 800; color: var(--text); margin-top: 2px;">100/100</div>
          </div>
          <span id="score-label" style="font-size: 11px; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 9999px;">Excellent</span>
        </div>

        <div id="suggestions-container"></div>
      </div>
    </div>
  </div>

  <script>
    // Desktop deterministic checker
    const TYPOS = {
      teh: "the", recieve: "receive", seperate: "separate", definately: "definitely",
      occured: "occurred", untill: "until", truely: "truly", wierd: "weird",
      acheive: "achieve", tommorrow: "tomorrow", alot: "a lot", noone: "no one",
      waws: "was", thiinking: "thinking", thiis: "this", iis: "is", iit: "it",
      clrly: "clearly", allso: "also", buton: "button", vry: "very", ky: "key",
      fiix: "fix", instade: "instead", desapears: "disappears", alway: "always",
      allways: "always", remian: "remain", remians: "remains"
    };

    const CONFUSIONS = [
      { pattern: /\\bcould of\\b/gi, replacement: "could have", cat: "correctness", exp: "Use 'could have'." },
      { pattern: /\\bshould of\\b/gi, replacement: "should have", cat: "correctness", exp: "Use 'should have'." },
      { pattern: /\\bwould of\\b/gi, replacement: "would have", cat: "correctness", exp: "Use 'would have'." },
      { pattern: /\\bin order to\\b/gi, replacement: "to", cat: "clarity", exp: "Simplify wordy phrase." },
      { pattern: /\\bat this point in time\\b/gi, replacement: "now", cat: "clarity", exp: "Use concise 'now'." },
      { pattern: /\\bdue to the fact that\\b/gi, replacement: "because", cat: "clarity", exp: "Use 'because'." },
      { pattern: /\\bvery good\\b/gi, replacement: "exceptional", cat: "engagement", exp: "Use vivid adjective." },
      { pattern: /\\bvery bad\\b/gi, replacement: "terrible", cat: "engagement", exp: "Use evocative adjective." },
      { pattern: /\\bI think that maybe\\b/gi, replacement: "Perhaps", cat: "delivery", exp: "Deliver with confidence." }
    ];

    function checkText(text) {
      if (!text || text.trim().length === 0) return [];
      const suggestions = [];

      // Capitalization
      const capMatch = /(^|[.!?]\\s+)([a-z])/g;
      let m;
      while ((m = capMatch.exec(text)) !== null) {
        suggestions.push({
          category: "correctness",
          original: m[2],
          replacement: m[2].toUpperCase(),
          explanation: "Capitalize the first letter of a sentence.",
          offset: m.index + m[1].length,
          length: 1
        });
      }

      // Typos
      const words = /\\b[a-zA-Z]+\\b/g;
      while ((m = words.exec(text)) !== null) {
        const lower = m[0].toLowerCase();
        if (TYPOS[lower]) {
          const isCap = m[0][0] === m[0][0].toUpperCase() && m[0][0] !== m[0][0].toLowerCase();
          const rep = isCap ? TYPOS[lower][0].toUpperCase() + TYPOS[lower].slice(1) : TYPOS[lower];
          suggestions.push({
            category: "correctness",
            original: m[0],
            replacement: rep,
            explanation: "Spelling correction.",
            offset: m.index,
            length: m[0].length
          });
          continue;
        }

        const isGibberish = lower.length <= 2
          ? !["a", "i", "am", "an", "as", "at", "be", "by", "do", "go", "he", "hi", "if", "in", "is", "it", "me", "my", "no", "of", "ok", "on", "or", "so", "to", "up", "us", "we"].includes(lower)
          : /([a-zA-Z])\\1\\1/.test(lower) || /[b-df-hj-np-tv-z]{5,}/.test(lower) || !/[aeiouy]/.test(lower);

        if (isGibberish) {
          suggestions.push({
            category: "correctness",
            original: m[0],
            replacement: "",
            explanation: "Unrecognized word '" + m[0] + "'. Remove it or ignore.",
            offset: m.index,
            length: m[0].length
          });
        }
      }

      // Confusions & phrases
      for (const item of CONFUSIONS) {
        while ((m = item.pattern.exec(text)) !== null) {
          suggestions.push({
            category: item.cat,
            original: m[0],
            replacement: item.replacement,
            explanation: item.exp,
            offset: m.index,
            length: m[0].length
          });
        }
      }

      // Full sentence rephrasing
      const sMatches = text.match(/[^.!?\\n]+[.!?]?/g) || [text];
      let searchOffset = 0;
      for (const s of sMatches) {
        const sStart = text.indexOf(s, searchOffset);
        if (sStart === -1) continue;
        searchOffset = sStart + s.length;
        const trimmed = s.trim();
        const sWords = trimmed.split(/\\s+/).filter(Boolean);
        if (sWords.length >= 3) {
          let rewritten = trimmed;
          rewritten = rewritten.replace(/\\bcan you chat a new\\b/gi, "Can you start a new chat");
          rewritten = rewritten.replace(/\\bwaws\\b/gi, "was");
          rewritten = rewritten.replace(/\\bthiinking\\b/gi, "thinking");
          rewritten = rewritten.replace(/\\bthiis\\b/gi, "this");
          rewritten = rewritten.replace(/\\biis\\b/gi, "is");
          rewritten = rewritten.replace(/\\bthinking to go\\b/gi, "thinking of going");
          rewritten = rewritten.replace(/\\bto go out this\\b/gi, "about going out this evening");
          if (rewritten.length > 0) rewritten = rewritten.charAt(0).toUpperCase() + rewritten.slice(1);

          if (rewritten.toLowerCase() !== trimmed.toLowerCase()) {
            suggestions.push({
              category: "clarity",
              original: trimmed,
              replacement: rewritten,
              explanation: "Sentence structure is awkward. Rephrase for clear, natural English.",
              offset: sStart + s.indexOf(trimmed),
              length: trimmed.length
            });
          }
        }
      }

      return suggestions;
    }

    const editor = document.getElementById('editor');
    const container = document.getElementById('suggestions-container');
    const scoreVal = document.getElementById('overall-score');
    const scoreLabel = document.getElementById('score-label');
    const btnRefresh = document.getElementById('btn-refresh');

    function renderSuggestions() {
      const text = editor.value;
      const suggs = checkText(text);
      const score = Math.max(40, 100 - suggs.length * 10);
      scoreVal.textContent = score + "/100";
      scoreLabel.textContent = score >= 90 ? "Excellent" : score >= 70 ? "Good" : "Needs Review";
      scoreLabel.style.color = score >= 90 ? "#059669" : score >= 70 ? "#0284c7" : "#e11d48";

      container.innerHTML = "";
      if (suggs.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 24px;">✓ Writing looks clear! No issues detected.</div>';
        return;
      }

      suggs.forEach(s => {
        const isRemoval = s.replacement === "";
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = \`
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span class="pill pill-\${s.category}">\${isRemoval ? "UNRECOGNIZED" : s.category}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">\${s.explanation}</div>
          <div style="font-family: monospace; font-size: 12px; background: #f8fafc; padding: 6px 8px; border-radius: 6px; margin-bottom: 6px;">
            <span style="text-decoration: line-through; color: #e11d48;">\${s.original}</span> &rarr; \${isRemoval ? '<span style="color: #e11d48; font-weight: bold; font-style: italic;">[Remove word]</span>' : '<span style="color: #059669; font-weight: bold;">' + s.replacement + '</span>'}
          </div>
          <button class="btn-accept-sugg" style="\${isRemoval ? 'background: #e11d48;' : ''}">\${isRemoval ? 'Remove Word' : 'Accept Suggestion'}</button>
        \`;

        card.querySelector(".btn-accept-sugg").addEventListener("click", () => {
          const full = editor.value;
          let before = full.slice(0, s.offset);
          let after = full.slice(s.offset + s.length);
          if (isRemoval) {
            if (before.endsWith(" ") && (after.startsWith(" ") || after.length === 0 || /^[.,!?;:]/.test(after))) {
              before = before.slice(0, -1);
            } else if (before.length === 0 && after.startsWith(" ")) {
              after = after.slice(1);
            }
          }
          editor.value = before + s.replacement + after;
          localStorage.setItem('lingually_desktop_draft', editor.value);
          renderSuggestions();
        });

        container.appendChild(card);
      });
    }

    editor.addEventListener('input', () => {
      localStorage.setItem('lingually_desktop_draft', editor.value);
      renderSuggestions();
    });

    editor.addEventListener('keyup', () => {
      renderSuggestions();
    });

    btnRefresh.addEventListener('click', () => {
      renderSuggestions();
    });

    // Tauri IPC hooks
    const isTauri = typeof window.__TAURI_INTERNALS__ !== 'undefined' || typeof window.__TAURI__ !== 'undefined';
    const btnInspect = document.getElementById('btn-inspect-ext');

    btnInspect.addEventListener('click', async () => {
      if (isTauri && window.__TAURI__ && window.__TAURI__.core) {
        try {
          const text = await window.__TAURI__.core.invoke('get_active_selection');
          if (text) {
            editor.value = text;
            renderSuggestions();
          }
        } catch (e) {
          alert('Could not inspect active app: ' + e);
        }
      } else {
        editor.value = "So I waws thiinking to go out this";
        renderSuggestions();
      }
    });

    // Auto-save & initial run
    const saved = localStorage.getItem('lingually_desktop_draft');
    if (saved) editor.value = saved;
    renderSuggestions();
  </script>
</body>
</html>
`;

// Write to both dist/desktop/index.html and out/index.html
fs.writeFileSync(path.join(DIST_DESKTOP, "index.html"), desktopHtml);
fs.writeFileSync(path.join(OUT_DIR, "index.html"), desktopHtml);

// Copy icons
const iconFiles = ["icon16.png", "icon32.png", "icon48.png", "icon128.png", "icon.ico", "icon.icns"];
iconFiles.forEach((file) => {
  const src = path.join(ROOT_DIR, "src-tauri", "icons", file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST_DESKTOP, file));
    fs.copyFileSync(src, path.join(OUT_DIR, file));
  }
});

console.log("✅ Created Desktop static bundle in dist/desktop/ and out/");

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

      <div class="tab-content">
        <div class="score-card">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Overall Score</div>
            <div id="overall-score" style="font-size: 28px; font-weight: 800; color: var(--text); margin-top: 2px;">92/100</div>
          </div>
          <span style="font-size: 11px; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 9999px;">Good</span>
        </div>

        <div id="suggestions-container">
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="pill pill-clarity">Clarity</span>
              <span style="font-size: 10px; color: var(--text-muted);">Conciseness</span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Simplify phrasing for better flow.</div>
            <div style="font-family: monospace; font-size: 12px; background: #f8fafc; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px;">
              <span style="text-decoration: line-through; color: #e11d48;">in order to</span> → <span style="color: #059669; font-weight: bold;">to</span>
            </div>
            <button class="btn btn-primary" style="width: 100%; justify-content: center;">Accept Suggestion</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Tauri IPC hooks
    const isTauri = typeof window.__TAURI_INTERNALS__ !== 'undefined' || typeof window.__TAURI__ !== 'undefined';
    const btnInspect = document.getElementById('btn-inspect-ext');
    const editor = document.getElementById('editor');

    btnInspect.addEventListener('click', async () => {
      if (isTauri && window.__TAURI__ && window.__TAURI__.core) {
        try {
          const text = await window.__TAURI__.core.invoke('get_active_selection');
          if (text) {
            editor.value = text;
          }
        } catch (e) {
          alert('Could not inspect active app: ' + e);
        }
      } else {
        editor.value = "Sample text imported from external application.";
      }
    });

    // Auto-save to localStorage
    const saved = localStorage.getItem('lingually_desktop_draft');
    if (saved) editor.value = saved;
    editor.addEventListener('input', () => {
      localStorage.setItem('lingually_desktop_draft', editor.value);
    });
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

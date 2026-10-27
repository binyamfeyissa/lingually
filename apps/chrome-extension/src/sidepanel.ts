/**
 * Lingually 2.0 Chrome Extension - Side Panel Script
 */

import { runExtensionCheck, ExtensionSuggestion } from "./shared-checker";

let currentText = "";
let suggestions: ExtensionSuggestion[] = [];

document.addEventListener("DOMContentLoaded", () => {
  const inputEl = document.getElementById("sidepanel-input") as HTMLTextAreaElement;
  const btnRunCheck = document.getElementById("btn-run-check") as HTMLButtonElement;
  const btnFetchSelection = document.getElementById("btn-fetch-selection") as HTMLButtonElement;
  const suggestionsList = document.getElementById("suggestions-list") as HTMLDivElement;
  const scoreBadge = document.getElementById("sidepanel-score") as HTMLDivElement;

  // Tabs
  const tabs = document.querySelectorAll<HTMLButtonElement>(".nav-tab");
  const tabPanes = document.querySelectorAll<HTMLDivElement>(".tab-pane");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabPanes.forEach((p) => (p.style.display = "none"));

      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      if (targetId) {
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.style.display = "block";
      }
    });
  });

  function renderSuggestions() {
    if (!suggestionsList) return;
    if (suggestions.length === 0) {
      suggestionsList.innerHTML = `<div class="empty-state">No issues detected! Your writing looks great.</div>`;
      scoreBadge.textContent = "100/100";
      scoreBadge.style.color = "#10b981";
      return;
    }

    const score = Math.max(50, 100 - suggestions.length * 6);
    scoreBadge.textContent = `${score}/100`;
    scoreBadge.style.color = score >= 85 ? "#10b981" : score >= 70 ? "#38bdf8" : "#fb7185";

    suggestionsList.innerHTML = suggestions
      .map(
        (s) => `
        <div class="suggestion-card" data-id="${s.id}">
          <div class="card-meta">
            <span class="pill pill-${s.category}">${s.category}</span>
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">${s.explanation}</div>
          <div class="card-diff">
            <span style="text-decoration: line-through; color: #fb7185;">${s.originalText}</span>
            <span style="color: #64748b;">→</span>
            <span style="color: #34d399; font-weight: 700;">${s.replacementText}</span>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button class="btn btn-primary btn-accept" style="padding: 4px 8px; font-size: 11px;" data-id="${s.id}">Accept</button>
            <button class="btn btn-secondary btn-dismiss" style="padding: 4px 8px; font-size: 11px; margin-top: 0;" data-id="${s.id}">Dismiss</button>
          </div>
        </div>
      `
      )
      .join("");

    // Bind accept / dismiss buttons
    suggestionsList.querySelectorAll<HTMLButtonElement>(".btn-accept").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const s = suggestions.find((item) => item.id === id);
        if (s) {
          const before = currentText.slice(0, s.offset);
          const after = currentText.slice(s.offset + s.length);
          currentText = before + s.replacementText + after;
          inputEl.value = currentText;
          runCheck();
        }
      });
    });

    suggestionsList.querySelectorAll<HTMLButtonElement>(".btn-dismiss").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        suggestions = suggestions.filter((item) => item.id !== id);
        renderSuggestions();
      });
    });
  }

  function runCheck() {
    currentText = inputEl.value;
    suggestions = runExtensionCheck(currentText);
    renderSuggestions();
  }

  btnRunCheck.addEventListener("click", runCheck);
  inputEl.addEventListener("input", () => {
    currentText = inputEl.value;
  });

  // Get active tab selection
  btnFetchSelection.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_SELECTION" }, (response) => {
        if (chrome.runtime.lastError || !response || !response.text) {
          // fallback to executeScript
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id! },
              func: () => window.getSelection()?.toString() || "",
            },
            (results) => {
              if (results && results[0] && results[0].result) {
                inputEl.value = results[0].result as string;
                runCheck();
              }
            }
          );
        } else {
          inputEl.value = response.text;
          runCheck();
        }
      });
    }
  });

  // Check for prefilled text in session storage from context menu
  chrome.storage.session.get(["selectedText", "selectedTool"], (res: Record<string, any>) => {
    if (res.selectedText) {
      inputEl.value = String(res.selectedText);
      runCheck();
    }
  });

  // Simple Generative AI tool mock transformations
  const aiResultBox = document.getElementById("ai-result-box") as HTMLDivElement;
  const aiResultText = document.getElementById("ai-result-text") as HTMLDivElement;
  const btnCopyAi = document.getElementById("btn-copy-ai") as HTMLButtonElement;

  function runAiTool(tool: string) {
    const text = inputEl.value.trim();
    if (!text) {
      alert("Please provide text first.");
      return;
    }

    let result = text;
    if (tool === "concise") {
      result = text
        .replace(/\bin order to\b/gi, "to")
        .replace(/\bdue to the fact that\b/gi, "because")
        .replace(/\bat this point in time\b/gi, "now")
        .replace(/\bhas the ability to\b/gi, "can");
    } else if (tool === "formal") {
      result = "Furthermore, " + text.replace(/\bvery good\b/gi, "exceptional").replace(/\bdefinately\b/gi, "definitely");
    } else if (tool === "casual") {
      result = text.replace(/\bexceptional\b/gi, "great").replace(/\butilize\b/gi, "use");
    } else {
      result = text.replace(/\bdefinately\b/gi, "definitely").replace(/\bin order to\b/gi, "to");
    }

    aiResultText.textContent = result;
    aiResultBox.style.display = "block";
  }

  document.getElementById("tool-improve")?.addEventListener("click", () => runAiTool("improve"));
  document.getElementById("tool-paraphrase")?.addEventListener("click", () => runAiTool("paraphrase"));
  document.getElementById("tool-concise")?.addEventListener("click", () => runAiTool("concise"));
  document.getElementById("tool-formal")?.addEventListener("click", () => runAiTool("formal"));
  document.getElementById("tool-casual")?.addEventListener("click", () => runAiTool("casual"));

  btnCopyAi?.addEventListener("click", () => {
    if (aiResultText.textContent) {
      navigator.clipboard.writeText(aiResultText.textContent);
      btnCopyAi.textContent = "Copied!";
      setTimeout(() => (btnCopyAi.textContent = "Copy to Clipboard"), 1500);
    }
  });
});

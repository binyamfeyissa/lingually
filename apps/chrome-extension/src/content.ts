/**
 * Lingually 2.0 Chrome Extension - Content Script
 */

import { runExtensionCheck, ExtensionSuggestion } from "./shared-checker";

let activeElement: HTMLElement | null = null;
let currentSuggestions: ExtensionSuggestion[] = [];
let personalDictionary: Set<string> = new Set();
let isExtensionEnabled = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// UI DOM elements
let badgeElement: HTMLDivElement | null = null;
let cardElement: HTMLDivElement | null = null;

// Initialize extension settings from storage
chrome.storage.sync.get(["lingually_enabled", "lingually_dictionary"], (res: Record<string, any>) => {
  if (res.lingually_enabled !== undefined) {
    isExtensionEnabled = Boolean(res.lingually_enabled);
  }
  if (Array.isArray(res.lingually_dictionary)) {
    personalDictionary = new Set((res.lingually_dictionary as string[]).map((w: string) => w.toLowerCase()));
  }
});

// React to storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.lingually_enabled) {
    isExtensionEnabled = Boolean(changes.lingually_enabled.newValue);
    if (!isExtensionEnabled) {
      removeUI();
    }
  }
  if (changes.lingually_dictionary) {
    const list = (changes.lingually_dictionary.newValue as string[]) || [];
    personalDictionary = new Set(list.map((w: string) => w.toLowerCase()));
    if (activeElement) {
      checkActiveElement();
    }
  }
});

function isEditable(el: Element | null): el is HTMLElement {
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "textarea") return true;
  if (tag === "input") {
    const inputType = (el as HTMLInputElement).type.toLowerCase();
    return ["text", "search", "email", "url", ""].includes(inputType);
  }
  return (el as HTMLElement).isContentEditable || el.getAttribute("contenteditable") === "true";
}

function getText(el: HTMLElement): string {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    return el.value;
  }
  return el.innerText || el.textContent || "";
}

function setText(el: HTMLElement, newText: string): void {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    el.value = newText;
    if (start !== null && end !== null) {
      el.setSelectionRange(start, end);
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (el.isContentEditable) {
    el.innerText = newText;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function removeUI() {
  if (badgeElement && badgeElement.parentNode) {
    badgeElement.parentNode.removeChild(badgeElement);
    badgeElement = null;
  }
  if (cardElement && cardElement.parentNode) {
    cardElement.parentNode.removeChild(cardElement);
    cardElement = null;
  }
}

function updateBadgePosition() {
  if (!badgeElement || !activeElement) return;
  const rect = activeElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  badgeElement.style.top = `${scrollY + rect.bottom - 32}px`;
  badgeElement.style.left = `${scrollX + rect.right - 90}px`;
}

function renderBadge(count: number) {
  if (!activeElement || !isExtensionEnabled) {
    removeUI();
    return;
  }

  if (!badgeElement) {
    badgeElement = document.createElement("div");
    badgeElement.className = "lingually-ext-badge";
    badgeElement.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (currentSuggestions.length > 0) {
        showSuggestionCard(currentSuggestions[0]);
      } else {
        // Open side panel for deeper analysis
        chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" });
      }
    });
    document.body.appendChild(badgeElement);
  }

  badgeElement.className = `lingually-ext-badge ${count > 0 ? "lingually-ext-badge-has-issues" : ""}`;
  badgeElement.innerHTML = `
    <span class="lingually-ext-badge-dot"></span>
    <span>${count > 0 ? `${count} issue${count > 1 ? "s" : ""}` : "Lingually"}</span>
  `;

  updateBadgePosition();
}

function showSuggestionCard(s: ExtensionSuggestion) {
  if (!activeElement) return;
  if (cardElement && cardElement.parentNode) {
    cardElement.parentNode.removeChild(cardElement);
    cardElement = null;
  }

  cardElement = document.createElement("div");
  cardElement.className = "lingually-ext-card";

  const rect = activeElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  cardElement.style.top = `${scrollY + rect.top + 20}px`;
  cardElement.style.left = `${scrollX + Math.min(rect.left + 20, window.innerWidth - 360)}px`;

  cardElement.innerHTML = `
    <div class="lingually-ext-header">
      <span class="lingually-ext-category lingually-cat-${s.category}">${s.category}</span>
      <span style="font-size: 11px; color: #64748b;">${currentSuggestions.indexOf(s) + 1} of ${currentSuggestions.length}</span>
    </div>
    <div class="lingually-ext-explanation">${s.explanation}</div>
    <div class="lingually-ext-diff">
      <span class="lingually-ext-original">${s.originalText}</span>
      <span class="lingually-ext-arrow">→</span>
      <span class="lingually-ext-replacement">${s.replacementText}</span>
    </div>
    <div class="lingually-ext-actions">
      <button class="lingually-ext-btn-accept" id="lingually-accept-btn">Accept</button>
      <button class="lingually-ext-btn-dismiss" id="lingually-dismiss-btn">Dismiss</button>
    </div>
    <button class="lingually-ext-btn-dict" id="lingually-dict-btn">Add "${s.originalText}" to dictionary</button>
  `;

  document.body.appendChild(cardElement);

  // Bind actions
  const acceptBtn = cardElement.querySelector("#lingually-accept-btn");
  const dismissBtn = cardElement.querySelector("#lingually-dismiss-btn");
  const dictBtn = cardElement.querySelector("#lingually-dict-btn");

  acceptBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    applySuggestion(s);
  });

  dismissBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    dismissSuggestion(s);
  });

  dictBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    addToDictionary(s.originalText);
  });
}

function applySuggestion(s: ExtensionSuggestion) {
  if (!activeElement) return;
  const fullText = getText(activeElement);

  // Exact replacement at offset or match
  const before = fullText.slice(0, s.offset);
  const after = fullText.slice(s.offset + s.length);
  const updated = before + s.replacementText + after;

  setText(activeElement, updated);

  // Re-run check immediately
  checkActiveElement();
}

function dismissSuggestion(s: ExtensionSuggestion) {
  currentSuggestions = currentSuggestions.filter((item) => item.id !== s.id);
  renderBadge(currentSuggestions.length);
  if (currentSuggestions.length > 0) {
    showSuggestionCard(currentSuggestions[0]);
  } else if (cardElement && cardElement.parentNode) {
    cardElement.parentNode.removeChild(cardElement);
    cardElement = null;
  }
}

function addToDictionary(word: string) {
  const cleanWord = word.trim().toLowerCase();
  personalDictionary.add(cleanWord);
  chrome.storage.sync.get(["lingually_dictionary"], (res: Record<string, any>) => {
    const existing = (res.lingually_dictionary as string[]) || [];
    if (!existing.includes(cleanWord)) {
      chrome.storage.sync.set({ lingually_dictionary: [...existing, cleanWord] });
    }
  });
  checkActiveElement();
}

function checkActiveElement() {
  if (!activeElement || !isExtensionEnabled) {
    removeUI();
    return;
  }

  const text = getText(activeElement);
  if (text.length < 3) {
    currentSuggestions = [];
    removeUI();
    return;
  }

  currentSuggestions = runExtensionCheck(text, personalDictionary);
  renderBadge(currentSuggestions.length);
}

// Event Listeners for editable elements
document.addEventListener(
  "focusin",
  (event) => {
    const target = event.target as HTMLElement;
    if (isEditable(target)) {
      activeElement = target;
      checkActiveElement();
    }
  },
  true
);

document.addEventListener(
  "input",
  (event) => {
    const target = event.target as HTMLElement;
    if (isEditable(target)) {
      activeElement = target;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        checkActiveElement();
      }, 350);
    }
  },
  true
);

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  // If clicked outside active card or badge, dismiss card
  if (
    cardElement &&
    !cardElement.contains(target) &&
    badgeElement &&
    !badgeElement.contains(target)
  ) {
    if (cardElement.parentNode) {
      cardElement.parentNode.removeChild(cardElement);
      cardElement = null;
    }
  }
});

window.addEventListener("scroll", updateBadgePosition, { passive: true });
window.addEventListener("resize", updateBadgePosition, { passive: true });

// Listen for context menu triggers from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "LINGUALLY_CONTEXT_MENU_ACTION") {
    // If user clicked a context menu tool, active element can be targeted or inspected
    if (activeElement && msg.text) {
      // Content script is aware
    }
  }
});

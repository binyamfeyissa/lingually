/**
 * Lingually 2.0 Chrome Extension - Content Script
 * QuillBot-Style In-Page Writing Assistant
 */

import { runExtensionCheck, paraphraseText, ExtensionSuggestion } from "./shared-checker";

let activeElement: HTMLElement | null = null;
let currentSuggestions: ExtensionSuggestion[] = [];
let personalDictionary: Set<string> = new Set();
let isExtensionEnabled = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// UI Elements
let floatingBtn: HTMLDivElement | null = null;
let underlineLayer: HTMLDivElement | null = null;
let tooltipElement: HTMLDivElement | null = null;
let modalElement: HTMLDivElement | null = null;
let mirrorElement: HTMLDivElement | null = null;

// Paraphrase state
let activeParaphraseMode: "standard" | "fluency" | "formal" | "shorten" | "expand" = "standard";
const dismissedRephrases: Set<string> = new Set();

// Load settings
chrome.storage.sync.get(["lingually_enabled", "lingually_dictionary"], (res: Record<string, any>) => {
  if (res.lingually_enabled !== undefined) {
    isExtensionEnabled = Boolean(res.lingually_enabled);
  }
  if (Array.isArray(res.lingually_dictionary)) {
    personalDictionary = new Set((res.lingually_dictionary as string[]).map((w: string) => w.toLowerCase()));
  }
});

// React to storage updates
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
  // Ignore Lingually UI elements themselves
  if (el.closest(".lingually-modal") || el.closest(".lingually-tooltip") || el.closest(".lingually-floating-btn")) {
    return false;
  }
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
      el.setSelectionRange(Math.min(start, newText.length), Math.min(end, newText.length));
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
  if (floatingBtn && floatingBtn.parentNode) {
    floatingBtn.parentNode.removeChild(floatingBtn);
    floatingBtn = null;
  }
  if (underlineLayer && underlineLayer.parentNode) {
    underlineLayer.parentNode.removeChild(underlineLayer);
    underlineLayer = null;
  }
  if (tooltipElement && tooltipElement.parentNode) {
    tooltipElement.parentNode.removeChild(tooltipElement);
    tooltipElement = null;
  }
  if (modalElement && modalElement.parentNode) {
    modalElement.parentNode.removeChild(modalElement);
    modalElement = null;
  }
}

function updatePositions() {
  if (!activeElement) return;
  updateFloatingBtnPosition();
  renderUnderlines();
}

// 1. Floating Action Button (Icon-only, bottom-right)
function updateFloatingBtnPosition() {
  if (!floatingBtn || !activeElement) return;
  const rect = activeElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Position inside the bottom-right of editable element, or slightly outside if too small
  const top = scrollY + rect.bottom - (rect.height > 44 ? 36 : 30);
  const left = scrollX + rect.right - 36;

  floatingBtn.style.top = `${Math.max(scrollY + 4, top)}px`;
  floatingBtn.style.left = `${Math.max(scrollX + 4, left)}px`;
}

function renderFloatingBtn(count: number) {
  if (!activeElement || !isExtensionEnabled) {
    removeUI();
    return;
  }

  if (!floatingBtn) {
    floatingBtn = document.createElement("div");
    floatingBtn.className = "lingually-floating-btn";
    floatingBtn.title = "Lingually Writing Assistant";

    const brandIconUrl = chrome.runtime.getURL("icons/icon32.png");

    floatingBtn.innerHTML = `
      <img class="lingually-floating-icon-img" src="${brandIconUrl}" alt="Lingually" />
      <div class="lingually-floating-badge" id="lingually-badge-el"></div>
    `;

    // Click toggles the In-Page Modal (QuillBot style)
    floatingBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleModal();
    });

    document.body.appendChild(floatingBtn);
  }

  const badgeEl = floatingBtn.querySelector("#lingually-badge-el") as HTMLDivElement;
  if (badgeEl) {
    if (count > 0) {
      badgeEl.className = "lingually-floating-badge";
      badgeEl.textContent = count > 99 ? "99+" : String(count);
      badgeEl.style.display = "flex";
    } else {
      badgeEl.className = "lingually-floating-badge lingually-floating-badge-clean";
      badgeEl.textContent = "";
      badgeEl.style.display = "block";
    }
  }

  updateFloatingBtnPosition();
}

// 2. Underlines Layer & Highlighting on Flagged Words
function ensureUnderlineLayer() {
  if (!underlineLayer || !underlineLayer.parentNode) {
    underlineLayer = document.createElement("div");
    underlineLayer.className = "lingually-underline-layer";
    document.documentElement.appendChild(underlineLayer);
  }
  underlineLayer.innerHTML = "";
}

let inputMirror: HTMLDivElement | null = null;

function getInputMirror(): HTMLDivElement {
  if (!inputMirror) {
    inputMirror = document.createElement("div");
    inputMirror.id = "lingually-input-mirror";
    inputMirror.style.position = "fixed";
    inputMirror.style.top = "-9999px";
    inputMirror.style.left = "-9999px";
    inputMirror.style.visibility = "hidden";
    inputMirror.style.pointerEvents = "none";
    inputMirror.style.whiteSpace = "pre-wrap";
    inputMirror.style.wordWrap = "break-word";
    inputMirror.style.overflowWrap = "break-word";
    inputMirror.style.boxSizing = "border-box";
    document.documentElement.appendChild(inputMirror);
  }
  return inputMirror;
}

function copyInputStyles(source: HTMLElement, target: HTMLDivElement) {
  const cs = window.getComputedStyle(source);
  target.style.fontFamily = cs.fontFamily;
  target.style.fontSize = cs.fontSize;
  target.style.fontWeight = cs.fontWeight;
  target.style.fontStyle = cs.fontStyle;
  target.style.lineHeight = cs.lineHeight;
  target.style.letterSpacing = cs.letterSpacing;
  target.style.textTransform = cs.textTransform;
  target.style.paddingTop = cs.paddingTop;
  target.style.paddingRight = cs.paddingRight;
  target.style.paddingBottom = cs.paddingBottom;
  target.style.paddingLeft = cs.paddingLeft;
  target.style.borderTopWidth = cs.borderTopWidth;
  target.style.borderLeftWidth = cs.borderLeftWidth;
  target.style.boxSizing = cs.boxSizing;
  target.style.width = `${source.clientWidth}px`;
  if (source instanceof HTMLInputElement) {
    target.style.whiteSpace = "pre";
  } else {
    target.style.whiteSpace = "pre-wrap";
  }
}

function renderUnderlines() {
  if (!activeElement || !isExtensionEnabled || currentSuggestions.length === 0) {
    if (underlineLayer) underlineLayer.innerHTML = "";
    return;
  }

  ensureUnderlineLayer();
  if (!underlineLayer) return;

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const elemRect = activeElement.getBoundingClientRect();

  if (activeElement.isContentEditable) {
    // Range-based positioning for contenteditable elements (Claude, ChatGPT, Gmail, etc.)
    renderContentEditableUnderlines(activeElement, scrollX, scrollY);
  } else if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
    // Mirror-based positioning for textarea / input
    renderInputUnderlines(activeElement, elemRect, scrollX, scrollY);
  }
}

function renderContentEditableUnderlines(container: HTMLElement, scrollX: number, scrollY: number) {
  if (!underlineLayer) return;

  // Flatten all text nodes
  const textNodes: Array<{ node: Text; start: number; end: number }> = [];
  let currentOffset = 0;

  function collectTextNodes(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      textNodes.push({
        node: node as Text,
        start: currentOffset,
        end: currentOffset + text.length,
      });
      currentOffset += text.length;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        collectTextNodes(node.childNodes[i]);
      }
    }
  }

  collectTextNodes(container);

  currentSuggestions.forEach((s) => {
    const sStart = s.offset;
    const sEnd = s.offset + s.length;

    // Find the text nodes containing this range
    for (const t of textNodes) {
      if (sStart < t.end && sEnd > t.start) {
        const nodeStart = Math.max(0, sStart - t.start);
        const nodeEnd = Math.min(t.node.length, sEnd - t.start);

        try {
          const range = document.createRange();
          range.setStart(t.node, nodeStart);
          range.setEnd(t.node, nodeEnd);
          const rects = range.getClientRects();

          for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            if (r.width === 0 || r.height === 0) continue;

            const u = document.createElement("div");
            u.className = `lingually-underline lingually-underline-${s.category}`;
            u.style.top = `${scrollY + r.bottom - 3}px`;
            u.style.left = `${scrollX + r.left}px`;
            u.style.width = `${r.width}px`;

            u.addEventListener("mouseenter", (e) => {
              e.stopPropagation();
              showTooltip(s, r, scrollX, scrollY);
            });

            u.addEventListener("click", (e) => {
              e.stopPropagation();
              showTooltip(s, r, scrollX, scrollY);
            });

            underlineLayer?.appendChild(u);
          }
        } catch {
          // ignore range errors
        }
      }
    }
  });
}

function renderInputUnderlines(
  input: HTMLTextAreaElement | HTMLInputElement,
  elemRect: DOMRect,
  scrollX: number,
  scrollY: number
) {
  if (!underlineLayer) return;
  const fullText = input.value;
  if (!fullText) return;

  const mirror = getInputMirror();
  copyInputStyles(input, mirror);

  currentSuggestions.forEach((s) => {
    const before = fullText.slice(0, s.offset);
    const target = fullText.slice(s.offset, s.offset + s.length);

    mirror.textContent = "";
    mirror.appendChild(document.createTextNode(before));
    const marker = document.createElement("span");
    marker.textContent = target;
    mirror.appendChild(marker);

    const mirrorRect = mirror.getBoundingClientRect();
    const clientRects = marker.getClientRects();

    for (let i = 0; i < clientRects.length; i++) {
      const cr = clientRects[i];
      if (cr.width === 0 || cr.height === 0) continue;

      const spanLeft = cr.left - mirrorRect.left;
      const spanTop = cr.top - mirrorRect.top;
      const spanWidth = cr.width;
      const spanHeight = cr.height;

      const left = elemRect.left + spanLeft - input.scrollLeft;
      const top = elemRect.top + spanTop + spanHeight - input.scrollTop;

      // Only render if within the input viewport bounds
      if (
        left >= elemRect.left - 4 &&
        left + 4 <= elemRect.right &&
        top >= elemRect.top &&
        top <= elemRect.bottom + 8
      ) {
        const u = document.createElement("div");
        u.className = `lingually-underline lingually-underline-${s.category}`;
        u.style.top = `${scrollY + top - 2}px`;
        u.style.left = `${scrollX + left}px`;
        u.style.width = `${Math.max(12, spanWidth)}px`;

        const r = {
          left,
          top: top - spanHeight,
          bottom: top,
          right: left + spanWidth,
          width: spanWidth,
          height: spanHeight,
        } as DOMRect;

        u.addEventListener("mouseenter", (e) => {
          e.stopPropagation();
          showTooltip(s, r, scrollX, scrollY);
        });

        u.addEventListener("click", (e) => {
          e.stopPropagation();
          showTooltip(s, r, scrollX, scrollY);
        });

        underlineLayer?.appendChild(u);
      }
    }
  });
}

// 3. Inline Quick Suggestion Tooltip (anchored to underlined word)
function showTooltip(s: ExtensionSuggestion, rect: DOMRect, scrollX: number, scrollY: number) {
  if (tooltipElement && tooltipElement.parentNode) {
    tooltipElement.parentNode.removeChild(tooltipElement);
    tooltipElement = null;
  }

  tooltipElement = document.createElement("div");
  tooltipElement.className = "lingually-tooltip";

  // Position right below the word
  const top = scrollY + rect.bottom + 6;
  const left = Math.min(scrollX + rect.left, window.innerWidth + scrollX - 310);

  tooltipElement.style.top = `${top}px`;
  tooltipElement.style.left = `${Math.max(scrollX + 8, left)}px`;

  const isRemoval = s.replacementText === "";
  const isRephrase = s.explanation.toLowerCase().includes("rephrase");

  const suggestedDisplay = isRemoval
    ? `<span class="lingually-suggested-remove">[Remove word]</span>`
    : `<span class="lingually-suggested">${escapeHtml(s.replacementText)}</span>`;

  const acceptBtnText = isRemoval
    ? "Remove"
    : isRephrase
    ? "Accept Rephrase"
    : "Accept";

  const badgeText = isRemoval ? "UNRECOGNIZED" : isRephrase ? "REPHRASE" : s.category;

  tooltipElement.innerHTML = `
    <div class="lingually-tooltip-header">
      <span class="lingually-cat-badge lingually-cat-${s.category}">${badgeText}</span>
      <span style="font-size: 11px; color: #94a3b8; cursor: pointer;" id="tooltip-close-btn">&times;</span>
    </div>
    <div class="lingually-tooltip-body">
      <span class="lingually-strikethrough">${escapeHtml(s.originalText)}</span>
      <span class="lingually-arrow">&rarr;</span>
      ${suggestedDisplay}
    </div>
    <div class="lingually-tooltip-reason">${escapeHtml(s.explanation)}</div>
    <div class="lingually-tooltip-actions">
      <button class="lingually-btn-accept ${isRemoval ? "lingually-btn-remove" : ""}" id="tooltip-accept-btn">${acceptBtnText}</button>
      ${isRephrase ? `<button class="lingually-btn-dismiss" id="tooltip-open-modal-btn">Paraphrase Modes</button>` : ""}
      <button class="lingually-btn-dismiss" id="tooltip-dismiss-btn">Ignore</button>
    </div>
    ${!isRephrase ? `<button class="lingually-btn-dict-link" id="tooltip-dict-btn">Add "${escapeHtml(s.originalText)}" to dictionary</button>` : ""}
  `;

  document.body.appendChild(tooltipElement);

  tooltipElement.querySelector("#tooltip-accept-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    applySuggestion(s);
    dismissTooltip();
  });

  tooltipElement.querySelector("#tooltip-open-modal-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    dismissTooltip();
    openModal();
    // Switch to paraphrase tab
    const tabParaBtn = modalElement?.querySelector("#tab-btn-paraphrase") as HTMLButtonElement;
    tabParaBtn?.click();
  });

  tooltipElement.querySelector("#tooltip-dismiss-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    dismissSuggestion(s);
    dismissTooltip();
  });

  tooltipElement.querySelector("#tooltip-close-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    dismissTooltip();
  });

  tooltipElement.querySelector("#tooltip-dict-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    addToDictionary(s.originalText);
    dismissTooltip();
  });
}

function dismissTooltip() {
  if (tooltipElement && tooltipElement.parentNode) {
    tooltipElement.parentNode.removeChild(tooltipElement);
    tooltipElement = null;
  }
}

// 4. In-Page Floating Modal (QuillBot Style)
function makeDraggable(modal: HTMLElement, handle: HTMLElement) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  handle.addEventListener("mousedown", (e) => {
    if (
      (e.target as HTMLElement).closest(".lingually-modal-close") ||
      (e.target as HTMLElement).closest(".lingually-modal-btn-icon")
    ) {
      return;
    }
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = modal.getBoundingClientRect();
    initialLeft = rect.left + (window.scrollX || window.pageXOffset);
    initialTop = rect.top + (window.scrollY || window.pageYOffset);

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      modal.style.left = `${Math.max(10, initialLeft + dx)}px`;
      modal.style.top = `${Math.max(10, initialTop + dy)}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

function toggleModal() {
  if (modalElement) {
    closeModal();
  } else {
    openModal();
  }
}

function getReviewSuggestions(): ExtensionSuggestion[] {
  return currentSuggestions.filter(
    (s) => !s.id.startsWith("ext_rephrase") && !s.explanation.toLowerCase().includes("rephrase")
  );
}

function getRephraseSuggestion(): ExtensionSuggestion | undefined {
  return currentSuggestions.find(
    (s) => s.id.startsWith("ext_rephrase") || s.explanation.toLowerCase().includes("rephrase")
  );
}

function openModal(initialTab: "review" | "paraphrase" = "review") {
  if (!activeElement) return;
  if (modalElement) closeModal();

  modalElement = document.createElement("div");
  modalElement.className = "lingually-modal";

  // Prevent clicks inside modal from closing it via document listener
  modalElement.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  const rect = activeElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Position anchored near active element
  let top = scrollY + rect.bottom + 8;
  let left = scrollX + rect.right - 380;

  // Keep within viewport boundaries
  if (left < scrollX + 16) left = scrollX + 16;
  if (top + 460 > window.innerHeight + scrollY) {
    top = Math.max(scrollY + 16, scrollY + rect.top - 460);
  }

  modalElement.style.top = `${top}px`;
  modalElement.style.left = `${left}px`;

  const brandIconUrl = chrome.runtime.getURL("icons/icon32.png");
  const reviewCount = getReviewSuggestions().length;

  modalElement.innerHTML = `
    <div class="lingually-modal-header" id="modal-drag-header" title="Drag to reposition">
      <div class="lingually-modal-brand">
        <img src="${brandIconUrl}" style="width: 18px; height: 18px; border-radius: 4px; object-fit: contain;" alt="Lingually" />
        <span>Lingually Assistant</span>
      </div>
      <div class="lingually-modal-header-actions">
        <button class="lingually-modal-btn-icon" id="modal-refresh-btn" title="Refresh analysis">
          <svg class="lingually-refresh-icon" style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
        <button class="lingually-modal-close" id="modal-close-x" title="Close">&times;</button>
      </div>
    </div>

    <div class="lingually-modal-tabs">
      <button class="lingually-tab-btn ${initialTab === "review" ? "active" : ""}" id="tab-btn-review">
        01 // REVIEW (<span id="modal-review-count">${reviewCount}</span>)
      </button>
      <button class="lingually-tab-btn ${initialTab === "paraphrase" ? "active" : ""}" id="tab-btn-paraphrase">
        02 // PARAPHRASE
      </button>
    </div>

    <div class="lingually-modal-content">
      <div id="pane-review" style="display: ${initialTab === "review" ? "block" : "none"};"></div>
      <div id="pane-paraphrase" style="display: ${initialTab === "paraphrase" ? "block" : "none"};"></div>
    </div>
  `;

  document.body.appendChild(modalElement);

  // Enable dragging via header
  const header = modalElement.querySelector("#modal-drag-header") as HTMLElement;
  if (header) makeDraggable(modalElement, header);

  // Refresh button
  modalElement.querySelector("#modal-refresh-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = modalElement?.querySelector("#modal-refresh-btn");
    const icon = btn?.querySelector("svg");
    icon?.classList.add("lingually-spin");

    checkActiveElement();
    updateReviewPane();
    updateParaphrasePane();

    setTimeout(() => {
      icon?.classList.remove("lingually-spin");
    }, 400);
  });

  // Close button
  modalElement.querySelector("#modal-close-x")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeModal();
  });

  const tabReviewBtn = modalElement.querySelector("#tab-btn-review") as HTMLButtonElement;
  const tabParaBtn = modalElement.querySelector("#tab-btn-paraphrase") as HTMLButtonElement;
  const paneReview = modalElement.querySelector("#pane-review") as HTMLDivElement;
  const panePara = modalElement.querySelector("#pane-paraphrase") as HTMLDivElement;

  tabReviewBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    tabReviewBtn.classList.add("active");
    tabParaBtn.classList.remove("active");
    paneReview.style.display = "block";
    panePara.style.display = "none";
    updateReviewPane();
  });

  tabParaBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    tabParaBtn.classList.add("active");
    tabReviewBtn.classList.remove("active");
    paneReview.style.display = "none";
    panePara.style.display = "block";
    updateParaphrasePane();
  });

  updateReviewPane();
  updateParaphrasePane();
}

function closeModal() {
  if (modalElement && modalElement.parentNode) {
    modalElement.parentNode.removeChild(modalElement);
    modalElement = null;
  }
}

function updateReviewPane() {
  if (!modalElement || !activeElement) return;
  const paneReview = modalElement.querySelector("#pane-review") as HTMLDivElement;
  if (!paneReview) return;

  const reviewSuggestions = getReviewSuggestions();
  const countSpan = modalElement.querySelector("#modal-review-count");
  if (countSpan) countSpan.textContent = String(reviewSuggestions.length);

  const score = Math.max(40, 100 - reviewSuggestions.length * 10);

  if (reviewSuggestions.length === 0) {
    paneReview.innerHTML = `
      <div class="lingually-empty-review">
        <div class="lingually-empty-icon">&#10003;</div>
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">Writing looks clear!</div>
        <div>No spelling or grammar errors detected.</div>
      </div>
    `;
    return;
  }

  paneReview.innerHTML = `
    <div class="lingually-score-banner">
      <div>Writing Health Score: <span class="lingually-score-value">${score}/100</span></div>
      ${reviewSuggestions.length > 1 ? `<button class="lingually-btn-fix-all" id="btn-fix-all">Fix All (${reviewSuggestions.length})</button>` : ""}
    </div>
    <div class="lingually-issues-list" id="modal-issues-list"></div>
  `;

  const listEl = paneReview.querySelector("#modal-issues-list") as HTMLDivElement;
  reviewSuggestions.forEach((s) => {
    const isRemoval = s.replacementText === "";

    const suggestedDisplay = isRemoval
      ? `<span class="lingually-suggested-remove">[Remove word]</span>`
      : `<span class="lingually-suggested">${escapeHtml(s.replacementText)}</span>`;

    const acceptBtnText = isRemoval ? "Remove" : "Accept";
    const badgeText = isRemoval ? "UNRECOGNIZED" : s.category;

    const item = document.createElement("div");
    item.className = "lingually-issue-card";
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="lingually-cat-badge lingually-cat-${s.category}">${badgeText}</span>
      </div>
      <div class="lingually-tooltip-body" style="margin: 4px 0;">
        <span class="lingually-strikethrough">${escapeHtml(s.originalText)}</span>
        <span class="lingually-arrow">&rarr;</span>
        ${suggestedDisplay}
      </div>
      <div class="lingually-tooltip-reason" style="margin-bottom: 8px;">${escapeHtml(s.explanation)}</div>
      <div class="lingually-tooltip-actions">
        <button class="lingually-btn-accept ${isRemoval ? "lingually-btn-remove" : ""}">${acceptBtnText}</button>
        <button class="lingually-btn-dismiss">Ignore</button>
      </div>
      <button class="lingually-btn-dict-link" style="margin-top: 6px;">Add "${escapeHtml(s.originalText)}" to dictionary</button>
    `;

    item.querySelector(".lingually-btn-accept")?.addEventListener("click", (e) => {
      e.stopPropagation();
      applySuggestion(s);
      updateReviewPane();
      updateParaphrasePane();
    });

    item.querySelector(".lingually-btn-dismiss")?.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissSuggestion(s);
      updateReviewPane();
    });

    item.querySelector(".lingually-btn-dict-link")?.addEventListener("click", (e) => {
      e.stopPropagation();
      addToDictionary(s.originalText);
      updateReviewPane();
    });

    listEl.appendChild(item);
  });

  paneReview.querySelector("#btn-fix-all")?.addEventListener("click", (e) => {
    e.stopPropagation();
    fixAllSuggestions();
    updateReviewPane();
    updateParaphrasePane();
  });
}

function updateParaphrasePane() {
  if (!modalElement || !activeElement) return;
  const panePara = modalElement.querySelector("#pane-paraphrase") as HTMLDivElement;
  if (!panePara) return;

  const currentText = getText(activeElement);
  const rephraseSugg = getRephraseSuggestion();

  panePara.innerHTML = `
    ${
      rephraseSugg
        ? `
      <div class="lingually-rephrase-box-modal" style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span class="lingually-cat-badge lingually-cat-clarity">SUGGESTED REPHRASE</span>
        </div>
        <div class="lingually-tooltip-body" style="margin: 4px 0;">
          <span class="lingually-strikethrough">${escapeHtml(rephraseSugg.originalText)}</span>
          <span class="lingually-arrow">&rarr;</span>
          <span class="lingually-suggested" style="color: #0284c7;">${escapeHtml(rephraseSugg.replacementText)}</span>
        </div>
        <div class="lingually-tooltip-reason" style="margin-bottom: 8px;">${escapeHtml(rephraseSugg.explanation)}</div>
        <div class="lingually-tooltip-actions">
          <button class="lingually-btn-accept" id="btn-modal-accept-rephrase" style="background: #0284c7; border-color: #0284c7;">Accept Rephrase</button>
          <button class="lingually-btn-dismiss" id="btn-modal-dismiss-rephrase">Ignore</button>
        </div>
      </div>
    `
        : ""
    }

    <div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 6px;">PARAPHRASE MODE</div>
    <div class="lingually-mode-selector">
      <button class="lingually-mode-chip ${activeParaphraseMode === "standard" ? "active" : ""}" data-mode="standard">Standard</button>
      <button class="lingually-mode-chip ${activeParaphraseMode === "fluency" ? "active" : ""}" data-mode="fluency">Fluency</button>
      <button class="lingually-mode-chip ${activeParaphraseMode === "formal" ? "active" : ""}" data-mode="formal">Formal</button>
      <button class="lingually-mode-chip ${activeParaphraseMode === "shorten" ? "active" : ""}" data-mode="shorten">Shorten</button>
      <button class="lingually-mode-chip ${activeParaphraseMode === "expand" ? "active" : ""}" data-mode="expand">Expand</button>
    </div>

    <div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">CURRENT TEXT</div>
    <div class="lingually-paraphrase-box" id="para-input-preview">${escapeHtml(currentText || "(No text entered in field)")}</div>

    <button class="lingually-btn-paraphrase" id="btn-run-paraphrase">
      <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      <span>Paraphrase with Lingually</span>
    </button>

    <div class="lingually-paraphrase-output" id="para-output-area" style="display: none;">
      <div style="font-size: 11px; font-weight: 600; color: #059669; margin-bottom: 4px;">PARAPHRASED REWRITE</div>
      <div class="lingually-paraphrase-box" id="para-output-text" style="background: #f0fdf4; border-color: #bbf7d0;"></div>
      <div class="lingually-paraphrase-actions">
        <button class="lingually-btn-replace" id="btn-insert-page">Replace in Text Field</button>
        <button class="lingually-btn-copy" id="btn-copy-para">Copy</button>
      </div>
    </div>
  `;

  if (rephraseSugg) {
    panePara.querySelector("#btn-modal-accept-rephrase")?.addEventListener("click", (e) => {
      e.stopPropagation();
      applySuggestion(rephraseSugg);
      updateReviewPane();
      updateParaphrasePane();
    });

    panePara.querySelector("#btn-modal-dismiss-rephrase")?.addEventListener("click", (e) => {
      e.stopPropagation();
      dismissSuggestion(rephraseSugg);
      updateParaphrasePane();
    });
  }

  panePara.innerHTML = `
    <div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 6px;">PARAPHRASE MODE</div>
    <div class="lingually-mode-selector">
      <button class="lingually-mode-chip ${activeParaphraseMode === "standard" ? "active" : ""}" data-mode="standard">Standard</button>
      <button class="lingually-mode-chip ${activeParaphraseMode === "fluency" ? "active" : ""}" data-mode="fluency">Fluency</button>
      <button class="lingually-mode-chip ${activeParaphraseMode === "formal" ? "active" : ""}" data-mode="formal">Formal</button>
      <button class="lingually-mode-chip ${activeParaphraseMode === "shorten" ? "active" : ""}" data-mode="shorten">Shorten</button>
      <button class="lingually-mode-chip ${activeParaphraseMode === "expand" ? "active" : ""}" data-mode="expand">Expand</button>
    </div>

    <div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px;">CURRENT TEXT</div>
    <div class="lingually-paraphrase-box" id="para-input-preview">${escapeHtml(currentText || "(No text entered in field)")}</div>

    <button class="lingually-btn-paraphrase" id="btn-run-paraphrase">
      <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      <span>Paraphrase with Lingually</span>
    </button>

    <div class="lingually-paraphrase-output" id="para-output-area" style="display: none;">
      <div style="font-size: 11px; font-weight: 600; color: #059669; margin-bottom: 4px;">PARAPHRASED REWRITE</div>
      <div class="lingually-paraphrase-box" id="para-output-text" style="background: #f0fdf4; border-color: #bbf7d0;"></div>
      <div class="lingually-paraphrase-actions">
        <button class="lingually-btn-replace" id="btn-insert-page">Replace in Text Field</button>
        <button class="lingually-btn-copy" id="btn-copy-para">Copy</button>
      </div>
    </div>
  `;

  let currentParaphraseOutput = "";

  const runParaphrase = () => {
    const textToRewrite = getText(activeElement!);
    if (!textToRewrite || textToRewrite.trim().length === 0) return;

    const btn = panePara.querySelector("#btn-run-paraphrase") as HTMLButtonElement;
    if (btn) {
      btn.innerHTML = `<span>Paraphrasing...</span>`;
      btn.disabled = true;
    }

    setTimeout(() => {
      currentParaphraseOutput = paraphraseText(textToRewrite, activeParaphraseMode);
      const outputArea = panePara.querySelector("#para-output-area") as HTMLDivElement;
      const outputText = panePara.querySelector("#para-output-text") as HTMLDivElement;
      if (outputText) outputText.textContent = currentParaphraseOutput;
      if (outputArea) outputArea.style.display = "block";

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>Re-paraphrase</span>
        `;
      }
    }, 120);
  };

  // Mode chips: auto re-paraphrase immediately on chip click
  panePara.querySelectorAll<HTMLButtonElement>(".lingually-mode-chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      panePara.querySelectorAll(".lingually-mode-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeParaphraseMode = chip.getAttribute("data-mode") as any;
      runParaphrase();
    });
  });

  panePara.querySelector("#btn-run-paraphrase")?.addEventListener("click", (e) => {
    e.stopPropagation();
    runParaphrase();
  });

  panePara.querySelector("#btn-insert-page")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (activeElement && currentParaphraseOutput) {
      setText(activeElement, currentParaphraseOutput);
      checkActiveElement();
      updateReviewPane();
      updateParaphrasePane();
    }
  });

  panePara.querySelector("#btn-copy-para")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentParaphraseOutput) {
      navigator.clipboard.writeText(currentParaphraseOutput);
      const copyBtn = panePara.querySelector("#btn-copy-para") as HTMLButtonElement;
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 1500);
    }
  });

  // Auto-run if input has text so results are immediately visible
  if (currentText && currentText.trim().length > 0) {
    runParaphrase();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applySuggestion(s: ExtensionSuggestion) {
  if (!activeElement) return;
  if (s.id.startsWith("ext_rephrase") || s.explanation.toLowerCase().includes("rephrase")) {
    dismissedRephrases.add(s.originalText.trim().toLowerCase());
    dismissedRephrases.add(s.replacementText.trim().toLowerCase());
  }

  const fullText = getText(activeElement);

  let before = fullText.slice(0, s.offset);
  let after = fullText.slice(s.offset + s.length);

  // If this is a removal, also trim adjacent whitespace cleanly
  if (s.replacementText === "") {
    if (before.endsWith(" ") && (after.startsWith(" ") || after.length === 0 || /^[.,!?;:]/.test(after))) {
      before = before.slice(0, -1);
    } else if (before.length === 0 && after.startsWith(" ")) {
      after = after.slice(1);
    }
  }

  const updated = before + s.replacementText + after;
  setText(activeElement, updated);
  checkActiveElement();
}

function fixAllSuggestions() {
  if (!activeElement || currentSuggestions.length === 0) return;
  let fullText = getText(activeElement);

  // Apply review suggestions from right to left so offsets remain valid
  const toFix = getReviewSuggestions();
  const sorted = [...toFix].sort((a, b) => b.offset - a.offset);
  for (const s of sorted) {
    let before = fullText.slice(0, s.offset);
    let after = fullText.slice(s.offset + s.length);
    if (s.replacementText === "") {
      if (before.endsWith(" ") && (after.startsWith(" ") || after.length === 0 || /^[.,!?;:]/.test(after))) {
        before = before.slice(0, -1);
      } else if (before.length === 0 && after.startsWith(" ")) {
        after = after.slice(1);
      }
    }
    fullText = before + s.replacementText + after;
  }

  setText(activeElement, fullText);
  checkActiveElement();
}

function dismissSuggestion(s: ExtensionSuggestion) {
  if (s.id.startsWith("ext_rephrase") || s.explanation.toLowerCase().includes("rephrase")) {
    dismissedRephrases.add(s.originalText.trim().toLowerCase());
    dismissedRephrases.add(s.replacementText.trim().toLowerCase());
  }
  currentSuggestions = currentSuggestions.filter((item) => item.id !== s.id);
  renderFloatingBtn(getReviewSuggestions().length);
  renderUnderlines();
  if (modalElement) {
    updateReviewPane();
    updateParaphrasePane();
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
  if (text.length < 2) {
    currentSuggestions = [];
    renderFloatingBtn(0);
    renderUnderlines();
    if (modalElement) {
      updateReviewPane();
      updateParaphrasePane();
    }
    return;
  }

  const rawSuggestions = runExtensionCheck(text, personalDictionary);
  currentSuggestions = rawSuggestions.filter(
    (s) =>
      !dismissedRephrases.has(s.originalText.trim().toLowerCase()) &&
      !dismissedRephrases.has(s.replacementText.trim().toLowerCase())
  );

  renderFloatingBtn(getReviewSuggestions().length);
  renderUnderlines();
  if (modalElement) {
    updateReviewPane();
    updateParaphrasePane();
  }
}

// Global Event Listeners & Low-Latency Keystroke Monitoring
function handleEditorKeystroke(target: HTMLElement) {
  if (isEditable(target)) {
    activeElement = target;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      checkActiveElement();
      if (modalElement) {
        updateReviewPane();
        const paraPreview = modalElement.querySelector("#para-input-preview");
        if (paraPreview) {
          paraPreview.textContent = getText(activeElement!) || "(No text entered in field)";
        }
      }
    }, 100);
  }
}

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
    handleEditorKeystroke(event.target as HTMLElement);
  },
  true
);

document.addEventListener(
  "keyup",
  (event) => {
    const key = event.key;
    if (["Shift", "Control", "Alt", "Meta", "Escape"].includes(key)) return;
    handleEditorKeystroke(event.target as HTMLElement);
  },
  true
);

document.addEventListener(
  "paste",
  (event) => {
    handleEditorKeystroke(event.target as HTMLElement);
  },
  true
);

document.addEventListener(
  "cut",
  (event) => {
    handleEditorKeystroke(event.target as HTMLElement);
  },
  true
);

// Click outside handler for modal and tooltip
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  if (tooltipElement && !tooltipElement.contains(target) && !target.classList.contains("lingually-underline")) {
    dismissTooltip();
  }

  if (
    modalElement &&
    !modalElement.contains(target) &&
    floatingBtn &&
    !floatingBtn.contains(target) &&
    !target.classList.contains("lingually-floating-btn")
  ) {
    closeModal();
  }
});

window.addEventListener("scroll", updatePositions, { passive: true });
window.addEventListener("resize", updatePositions, { passive: true });

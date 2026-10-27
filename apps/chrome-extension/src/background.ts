/**
 * Lingually 2.0 Chrome Extension - Background Service Worker
 */

chrome.runtime.onInstalled.addListener(() => {
  // Initialize default extension storage if not already present
  chrome.storage.sync.get(["lingually_enabled", "lingually_goals"], (res) => {
    if (res.lingually_enabled === undefined) {
      chrome.storage.sync.set({
        lingually_enabled: true,
        lingually_goals: {
          audience: "general",
          formality: "neutral",
          domain: "general",
          intent: "inform",
        },
      });
    }
  });

  // Create context menu entries
  chrome.contextMenus.create({
    id: "lingually_root",
    title: "Lingually Writing Assistant",
    contexts: ["selection", "editable"],
  });

  chrome.contextMenus.create({
    parentId: "lingually_root",
    id: "lingually_improve",
    title: "✨ Improve Writing",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    parentId: "lingually_root",
    id: "lingually_paraphrase",
    title: "🔄 Paraphrase Selection",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    parentId: "lingually_root",
    id: "lingually_summarize",
    title: "📝 Summarize Selection",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    parentId: "lingually_root",
    id: "lingually_sidepanel",
    title: "📖 Open Side Panel",
    contexts: ["all"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === "lingually_sidepanel") {
    chrome.sidePanel.open({ windowId: tab.windowId });
    return;
  }

  if (info.selectionText) {
    // Save selected text into session storage for the side panel
    chrome.storage.session.set({
      selectedText: info.selectionText,
      selectedTool: info.menuItemId.toString().replace("lingually_", ""),
      timestamp: Date.now(),
    });

    // Open side panel to display the result
    chrome.sidePanel.open({ windowId: tab.windowId });

    // Also notify active tab content script
    chrome.tabs.sendMessage(tab.id, {
      type: "LINGUALLY_CONTEXT_MENU_ACTION",
      tool: info.menuItemId,
      text: info.selectionText,
    }).catch(() => {
      // Content script may not be loaded on internal pages
    });
  }
});

// Message listener for communication between popup, content script, and sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDEPANEL") {
    if (sender.tab && sender.tab.windowId) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
      sendResponse({ success: true });
    }
  } else if (message.type === "GET_EXTENSION_STATUS") {
    chrome.storage.sync.get(["lingually_enabled"], (res) => {
      sendResponse({ enabled: res.lingually_enabled !== false });
    });
    return true; // Keep channel open for async response
  }
});

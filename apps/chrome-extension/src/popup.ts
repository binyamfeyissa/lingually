/**
 * Lingually 2.0 Chrome Extension - Popup Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const toggleEnabled = document.getElementById("toggle-enabled") as HTMLInputElement;
  const btnSidepanel = document.getElementById("btn-sidepanel") as HTMLButtonElement;
  const btnEditor = document.getElementById("btn-editor") as HTMLButtonElement;
  const btnOptions = document.getElementById("btn-options") as HTMLButtonElement;

  // Load current enabled state
  chrome.storage.sync.get(["lingually_enabled"], (res) => {
    toggleEnabled.checked = res.lingually_enabled !== false;
  });

  // Toggle state change
  toggleEnabled.addEventListener("change", () => {
    chrome.storage.sync.set({ lingually_enabled: toggleEnabled.checked });
  });

  // Open Side Panel
  btnSidepanel.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.windowId) {
      chrome.sidePanel.open({ windowId: tab.windowId });
      window.close();
    }
  });

  // Open Web Editor
  btnEditor.addEventListener("click", () => {
    chrome.storage.sync.get(["lingually_workbench_url"], (res: Record<string, any>) => {
      const targetUrl = (res.lingually_workbench_url as string) || "https://lingually-os.vercel.app/editor";
      chrome.tabs.create({ url: targetUrl });
      window.close();
    });
  });

  // Open Options / Settings
  btnOptions.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
});

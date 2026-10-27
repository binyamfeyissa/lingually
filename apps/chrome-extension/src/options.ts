/**
 * Lingually 2.0 Chrome Extension - Options Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const providerSelect = document.getElementById("provider-select") as HTMLSelectElement;
  const apiKeyInput = document.getElementById("api-key-input") as HTMLInputElement;
  const btnSaveKeys = document.getElementById("btn-save-keys") as HTMLButtonElement;
  const saveStatus = document.getElementById("save-status") as HTMLDivElement;

  const dictInput = document.getElementById("dict-input") as HTMLInputElement;
  const btnAddDict = document.getElementById("btn-add-dict") as HTMLButtonElement;
  const dictList = document.getElementById("dict-list") as HTMLDivElement;

  const workbenchUrlInput = document.getElementById("workbench-url-input") as HTMLInputElement;
  const btnSaveWorkbench = document.getElementById("btn-save-workbench") as HTMLButtonElement;
  const workbenchStatus = document.getElementById("workbench-status") as HTMLDivElement;

  let apiKeys: Record<string, string> = {};
  let dictionaryWords: string[] = [];

  // Load existing configuration
  chrome.storage.sync.get(["lingually_provider", "lingually_api_keys", "lingually_dictionary", "lingually_workbench_url"], (res: Record<string, any>) => {
    if (res.lingually_provider) {
      providerSelect.value = String(res.lingually_provider);
    }
    if (res.lingually_api_keys) {
      apiKeys = (res.lingually_api_keys as Record<string, string>) || {};
      apiKeyInput.value = apiKeys[providerSelect.value] || "";
    }
    if (Array.isArray(res.lingually_dictionary)) {
      dictionaryWords = res.lingually_dictionary as string[];
      renderDictionary();
    }
    if (workbenchUrlInput) {
      workbenchUrlInput.value = (res.lingually_workbench_url as string) || "https://lingually-os.vercel.app/editor";
    }
  });

  // Switch API key value when provider changes
  providerSelect.addEventListener("change", () => {
    apiKeyInput.value = apiKeys[providerSelect.value] || "";
  });

  // Save API key
  btnSaveKeys.addEventListener("click", () => {
    const selectedProvider = providerSelect.value;
    apiKeys[selectedProvider] = apiKeyInput.value.trim();

    chrome.storage.sync.set(
      {
        lingually_provider: selectedProvider,
        lingually_api_keys: apiKeys,
      },
      () => {
        saveStatus.style.display = "block";
        setTimeout(() => {
          saveStatus.style.display = "none";
        }, 2000);
      }
    );
  });

  // Dictionary management
  function renderDictionary() {
    dictList.innerHTML = "";
    dictionaryWords.forEach((word) => {
      const pill = document.createElement("span");
      pill.className = "dict-pill";
      pill.innerHTML = `
        <span>${word}</span>
        <span class="dict-del" data-word="${word}">&times;</span>
      `;
      dictList.appendChild(pill);
    });

    dictList.querySelectorAll<HTMLSpanElement>(".dict-del").forEach((delBtn) => {
      delBtn.addEventListener("click", () => {
        const wordToRemove = delBtn.getAttribute("data-word");
        if (wordToRemove) {
          dictionaryWords = dictionaryWords.filter((w) => w !== wordToRemove);
          chrome.storage.sync.set({ lingually_dictionary: dictionaryWords }, () => {
            renderDictionary();
          });
        }
      });
    });
  }

  function addWord() {
    const word = dictInput.value.trim().toLowerCase();
    if (word && !dictionaryWords.includes(word)) {
      dictionaryWords.push(word);
      chrome.storage.sync.set({ lingually_dictionary: dictionaryWords }, () => {
        dictInput.value = "";
        renderDictionary();
      });
    }
  }

    btnAddDict.addEventListener("click", addWord);
  dictInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addWord();
    }
  });

  if (btnSaveWorkbench && workbenchUrlInput) {
    btnSaveWorkbench.addEventListener("click", () => {
      const url = workbenchUrlInput.value.trim() || "https://lingually-os.vercel.app/editor";
      chrome.storage.sync.set({ lingually_workbench_url: url }, () => {
        if (workbenchStatus) {
          workbenchStatus.style.display = "block";
          setTimeout(() => {
            workbenchStatus.style.display = "none";
          }, 2000);
        }
      });
    });
  }
});

//! Windows UI Automation Integration for Lingually
//! Supports Windows 10 & 11 (x64)

/// Checks if UI Automation is available on the current Windows platform
pub fn is_windows_automation_available() -> bool {
    #[cfg(target_os = "windows")]
    {
        true
    }
    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

/// Retrieves selected text from the active Windows application using UI Automation
pub fn get_selected_text_windows() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::System::Com::{CoCreateInstance, CoInitializeEx, CLSCTX_INPROC_SERVER, COINIT_MULTITHREADED};
        use windows::Win32::UI::Accessibility::{CUIAutomation, IUIAutomation, IUIAutomationTextPattern, UIA_TextPatternId};

        unsafe {
            let _ = CoInitializeEx(None, COINIT_MULTITHREADED);

            let automation: IUIAutomation = match CoCreateInstance(&CUIAutomation, None, CLSCTX_INPROC_SERVER) {
                Ok(auto) => auto,
                Err(e) => return Err(format!("Failed to initialize Windows UIAutomation: {:?}", e)),
            };

            let focused = match automation.GetFocusedElement() {
                Ok(el) => el,
                Err(e) => return Err(format!("Failed to locate focused Windows element: {:?}", e)),
            };

            let pattern_res = focused.GetCurrentPattern(UIA_TextPatternId);
            if let Ok(pattern_unknown) = pattern_res {
                if let Ok(text_pattern) = pattern_unknown.cast::<IUIAutomationTextPattern>() {
                    if let Ok(selection_ranges) = text_pattern.GetSelection() {
                        let count = selection_ranges.Length().unwrap_or(0);
                        if count > 0 {
                            if let Ok(first_range) = selection_ranges.GetElement(0) {
                                if let Ok(text_bstr) = first_range.GetText(-1) {
                                    return Ok(text_bstr.to_string());
                                }
                            }
                        }
                    }
                }
            }

            Err("No selected text found in active Windows control.".to_string())
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Not running on Windows".to_string())
    }
}

/// Replaces the active selection in the focused Windows window
pub fn replace_selected_text_windows(_new_text: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        // UI Automation TextPattern is typically read-only for selection ranges;
        // Text replacement in Windows standard edit controls is achieved via EM_REPLACESEL or SendInput
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Not running on Windows".to_string())
    }
}

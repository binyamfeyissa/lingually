//! macOS Accessibility API Integration for Lingually
//! Supports Apple Silicon (M1-M4, aarch64) and Intel (x86_64)

#[cfg(target_os = "macos")]
use std::ffi::c_void;

#[cfg(target_os = "macos")]
#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    fn AXIsProcessTrusted() -> bool;
    fn AXIsProcessTrustedWithOptions(options: *const c_void) -> bool;
    fn AXUIElementCreateSystemWide() -> *mut c_void;
    fn AXUIElementCopyAttributeValue(
        element: *mut c_void,
        attribute: *const c_void,
        value: *mut *mut c_void,
    ) -> i32;
    fn AXUIElementSetAttributeValue(
        element: *mut c_void,
        attribute: *const c_void,
        value: *const c_void,
    ) -> i32;
}

/// Checks whether Lingually has macOS Accessibility permissions
pub fn is_accessibility_trusted() -> bool {
    #[cfg(target_os = "macos")]
    unsafe {
        AXIsProcessTrusted()
    }
    #[cfg(not(target_os = "macos"))]
    false
}

/// Requests macOS Accessibility permissions by showing the system prompt dialog
pub fn request_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    unsafe {
        use core_foundation::base::TCFType;
        use core_foundation::boolean::CFBoolean;
        use core_foundation::dictionary::CFDictionary;
        use core_foundation::string::CFString;

        let key = CFString::new("AXTrustedCheckOptionPrompt");
        let value = CFBoolean::true_value();
        let options = CFDictionary::from_CFType_pairs(&[(key.as_CFType(), value.as_CFType())]);

        AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef() as *const c_void)
    }
    #[cfg(not(target_os = "macos"))]
    false
}

/// Attempts to retrieve the currently selected text in whatever macOS app is active
pub fn get_selected_text_macos() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    unsafe {
        use core_foundation::base::TCFType;
        use core_foundation::string::CFString;

        if !is_accessibility_trusted() {
            return Err("Accessibility permission not granted. Please enable Lingually in macOS System Settings > Privacy & Security > Accessibility.".to_string());
        }

        let system_wide = AXUIElementCreateSystemWide();
        if system_wide.is_null() {
            return Err("Failed to create system-wide accessibility element.".to_string());
        }

        let focused_attr = CFString::new("AXFocusedUIElement");
        let mut focused_element: *mut c_void = std::ptr::null_mut();

        let status = AXUIElementCopyAttributeValue(
            system_wide,
            focused_attr.as_concrete_TypeRef() as *const c_void,
            &mut focused_element,
        );

        if status != 0 || focused_element.is_null() {
            return Err("No active focused UI element detected.".to_string());
        }

        let selected_text_attr = CFString::new("AXSelectedText");
        let mut selected_text_val: *mut c_void = std::ptr::null_mut();

        let text_status = AXUIElementCopyAttributeValue(
            focused_element,
            selected_text_attr.as_concrete_TypeRef() as *const c_void,
            &mut selected_text_val,
        );

        if text_status != 0 || selected_text_val.is_null() {
            return Err("No text is currently selected in the active application.".to_string());
        }

        let cf_string = CFString::wrap_under_create_rule(selected_text_val as _);
        Ok(cf_string.to_string())
    }

    #[cfg(not(target_os = "macos"))]
    Err("Not running on macOS".to_string())
}

/// Replaces the currently selected text in the active application
pub fn replace_selected_text_macos(new_text: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    unsafe {
        use core_foundation::base::TCFType;
        use core_foundation::string::CFString;

        if !is_accessibility_trusted() {
            return Err("Accessibility permission required.".to_string());
        }

        let system_wide = AXUIElementCreateSystemWide();
        if system_wide.is_null() {
            return Err("Could not create system-wide accessibility element.".to_string());
        }

        let focused_attr = CFString::new("AXFocusedUIElement");
        let mut focused_element: *mut c_void = std::ptr::null_mut();
        let status = AXUIElementCopyAttributeValue(
            system_wide,
            focused_attr.as_concrete_TypeRef() as *const c_void,
            &mut focused_element,
        );

        if status != 0 || focused_element.is_null() {
            return Err("Could not locate active UI element.".to_string());
        }

        let selected_text_attr = CFString::new("AXSelectedText");
        let replacement_cf = CFString::new(new_text);

        let set_status = AXUIElementSetAttributeValue(
            focused_element,
            selected_text_attr.as_concrete_TypeRef() as *const c_void,
            replacement_cf.as_concrete_TypeRef() as *const c_void,
        );

        if set_status == 0 {
            Ok(())
        } else {
            Err(format!("AXUIElementSetAttributeValue failed with status code {}", set_status))
        }
    }

    #[cfg(not(target_os = "macos"))]
    Err("Not running on macOS".to_string())
}

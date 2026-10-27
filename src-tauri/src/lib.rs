//! Lingually Desktop Application Core Library
//! Cross-platform support for macOS (Universal) and Windows (x64)

pub mod macos_accessibility;
pub mod windows_accessibility;

use serde::Serialize;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

#[derive(Serialize)]
pub struct DesktopInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
    pub accessibility_granted: bool,
}

#[tauri::command]
fn get_desktop_info() -> DesktopInfo {
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    let accessibility_granted = if os == "macos" {
        macos_accessibility::is_accessibility_trusted()
    } else {
        true
    };

    DesktopInfo {
        os,
        arch,
        version: env!("CARGO_PKG_VERSION").to_string(),
        accessibility_granted,
    }
}

#[tauri::command]
fn check_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos_accessibility::is_accessibility_trusted()
    }
    #[cfg(target_os = "windows")]
    {
        windows_accessibility::is_windows_automation_available()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        true
    }
}

#[tauri::command]
fn request_accessibility_permission() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos_accessibility::request_accessibility_permission()
    }
    #[cfg(not(target_os = "macos"))]
    {
        true
    }
}

#[tauri::command]
fn get_active_selection() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        macos_accessibility::get_selected_text_macos()
    }
    #[cfg(target_os = "windows")]
    {
        windows_accessibility::get_selected_text_windows()
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Err("Unsupported operating system".to_string())
    }
}

#[tauri::command]
fn replace_active_selection(replacement: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        macos_accessibility::replace_selected_text_macos(&replacement)
    }
    #[cfg(target_os = "windows")]
    {
        windows_accessibility::replace_selected_text_windows(&replacement)
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = replacement;
        Err("Unsupported operating system".to_string())
    }
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            // Build system tray menu
            let quit_i = MenuItem::with_id(app, "quit", "Quit Lingually", true, None::<&str>)?;
            let show_i = MenuItem::with_id(app, "show", "Open Workbench", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app: &AppHandle, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_desktop_info,
            check_accessibility_permission,
            request_accessibility_permission,
            get_active_selection,
            replace_active_selection
        ])
        .run(tauri::generate_context!())
        .expect("error while running lingually desktop application");
}

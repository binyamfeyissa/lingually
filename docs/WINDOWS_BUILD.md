# Lingually Windows Desktop Application Guide

Lingually for Windows is built with **Tauri 2**, offering a memory-efficient native desktop assistant compatible with Windows 10 and Windows 11 (64-bit).

---

## 1. Prerequisites

1. **Microsoft C++ Build Tools**:
   Install Visual Studio 2022 Build Tools with the **Desktop development with C++** workload.
2. **Rust & Cargo**:
   Install via [rustup.rs](https://rustup.rs/) using the default `x86_64-pc-windows-msvc` toolchain.
3. **Node.js**:
   Node.js 18+ (Node 20 or 22 LTS recommended).
4. **WebView2**:
   Included by default in Windows 10 (version 1803+) and Windows 11.

---

## 2. Building the Windows Installer

### Development Mode
```powershell
npm run dev
npx tauri dev
```

### Production Build (.msi & .exe)
```powershell
npx tauri build
```

Build artifacts will be generated in:
```
src-tauri/target/release/bundle/
  ├── nsis/
  │   └── Lingually_2.0.0_x64-setup.exe
  └── msi/
      └── Lingually_2.0.0_x64_en-US.msi
```

---

## 3. Windows Features

### 3.1 UI Automation Integration
Lingually integrates with the native Windows `IUIAutomation` and `IUIAutomationTextPattern` APIs to inspect selected text in supported applications without requiring clipboard polling:
- Compatible with Windows Notepad, Microsoft Word, Outlook, Microsoft Edge, and modern Electron applications.

### 3.2 Global Hotkey
- **`Ctrl + Shift + L`**: Toggles the floating Lingually Assistant HUD over the current active window.

### 3.3 System Tray Menu
- Runs discreetly in the Windows Notification Area (System Tray).
- Right-click menu options:
  - **Open Workbench**: Displays the primary editing workbench.
  - **Quit Lingually**: Fully terminates background monitoring.

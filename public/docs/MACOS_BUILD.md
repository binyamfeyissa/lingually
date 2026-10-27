# Lingually macOS Desktop Application Guide

Lingually for macOS is built with **Tauri 2**, providing a native, lightweight, and high-performance desktop experience supporting both **Apple Silicon (M1-M4, aarch64)** and **Intel (x86_64)** Mac systems.

---

## 1. Prerequisites

To build Lingually on macOS:

1. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
2. **Rust & Cargo**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source "$HOME/.cargo/env"
   ```
3. **Rust Targets for Universal Mac Binary**:
   ```bash
   rustup target add aarch64-apple-darwin
   rustup target add x86_64-apple-darwin
   ```
4. **Node.js**: Node 18+ (Node 20 or 22 LTS recommended).

---

## 2. Building the macOS Application

### Development Mode
```bash
# Start local dev server and Tauri native window
npm run dev
npx tauri dev
```

### Production Universal Build (.dmg & .app)
To compile a universal macOS application containing native slices for both Apple Silicon and Intel:

```bash
# Compile universal binary
npx tauri build --target universal-apple-darwin
```

Output location:
```
src-tauri/target/universal-apple-darwin/release/bundle/
  ├── dmg/
  │   └── Lingually_2.0.0_universal.dmg
  └── macos/
      └── Lingually.app
```

---

## 3. macOS Accessibility Permissions

Lingually uses the macOS Accessibility API (`ApplicationServices` framework) to inspect and replace selected text across other Mac desktop applications:

1. On first launch, when invoking the global shortcut (`⌘ + Shift + L`), macOS will display an accessibility permission prompt.
2. If skipped, open **System Settings > Privacy & Security > Accessibility**.
3. Toggle the switch next to **Lingually** to allow permission.
4. If running from Terminal in development, grant permission to Terminal or iTerm.

---

## 4. Code Signing and Notarization

To distribute the `.dmg` or `.app` outside the Mac App Store without Gatekeeper warnings:

```bash
# 1. Sign using Developer ID Application certificate
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"

# 2. Notarize with Apple notarytool
export APPLE_ID="developer@example.com"
export APPLE_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAM_ID"

npx tauri build --target universal-apple-darwin
```

GitHub Actions automatically handles code signing when secrets (`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_ID`, `APPLE_PASSWORD`) are configured in repository settings.

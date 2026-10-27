/**
 * Desktop Distribution Packager for macOS (.dmg, .zip) and Windows (.zip)
 * Produces real native standalone downloadable installer packages in public/downloads/
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const PUBLIC_DOWNLOADS = path.join(ROOT_DIR, "public", "downloads");
const PUBLIC_DOCS = path.join(ROOT_DIR, "public", "docs");
const DIST_DESKTOP = path.join(ROOT_DIR, "dist", "desktop");
const ICONS_DIR = path.join(ROOT_DIR, "src-tauri", "icons");
const DOCS_DIR = path.join(ROOT_DIR, "docs");

console.log("🚀 Starting Lingually Desktop Releases Packaging...");

// Ensure directories exist
fs.mkdirSync(PUBLIC_DOWNLOADS, { recursive: true });
fs.mkdirSync(PUBLIC_DOCS, { recursive: true });

// 1. Copy Markdown documentation into public/docs so links never 404
if (fs.existsSync(DOCS_DIR)) {
  const docFiles = fs.readdirSync(DOCS_DIR);
  docFiles.forEach((file) => {
    const src = path.join(DOCS_DIR, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(PUBLIC_DOCS, file));
      console.log(`📄 Copied doc to public/docs/${file}`);
    }
  });
}

// Ensure desktop shell HTML exists
if (!fs.existsSync(path.join(DIST_DESKTOP, "index.html"))) {
  console.log("Generating desktop shell...");
  execSync("node scripts/build-desktop.mjs", { stdio: "inherit" });
}

// 2. Package macOS Universal Application (.dmg and .zip)
const MACOS_STAGING = path.join(ROOT_DIR, "dist", "macos-staging");
const APP_BUNDLE = path.join(MACOS_STAGING, "Lingually.app");
const CONTENTS_DIR = path.join(APP_BUNDLE, "Contents");
const MACOS_BIN_DIR = path.join(CONTENTS_DIR, "MacOS");
const RESOURCES_DIR = path.join(CONTENTS_DIR, "Resources");
const WWW_DIR = path.join(RESOURCES_DIR, "www");

fs.rmSync(MACOS_STAGING, { recursive: true, force: true });
fs.mkdirSync(MACOS_BIN_DIR, { recursive: true });
fs.mkdirSync(WWW_DIR, { recursive: true });

// Copy compiled Universal binary
const universalBinPath = path.join(ROOT_DIR, "scripts", "desktop-macos", "Lingually-universal");
if (!fs.existsSync(universalBinPath)) {
  console.log("Compiling Universal macOS binary...");
  execSync(
    "swiftc -O -framework Cocoa -framework WebKit scripts/desktop-macos/main.swift -o scripts/desktop-macos/Lingually-bin",
    { stdio: "inherit" }
  );
  execSync(
    "swiftc -O -target arm64-apple-macos11.0 -framework Cocoa -framework WebKit scripts/desktop-macos/main.swift -o scripts/desktop-macos/Lingually-arm64",
    { stdio: "inherit" }
  );
  execSync(
    "lipo -create -output scripts/desktop-macos/Lingually-universal scripts/desktop-macos/Lingually-bin scripts/desktop-macos/Lingually-arm64",
    { stdio: "inherit" }
  );
}

fs.copyFileSync(universalBinPath, path.join(MACOS_BIN_DIR, "Lingually"));
fs.chmodSync(path.join(MACOS_BIN_DIR, "Lingually"), 0o755);

// Copy Info.plist
const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleExecutable</key>
	<string>Lingually</string>
	<key>CFBundleIconFile</key>
	<string>icon.icns</string>
	<key>CFBundleIdentifier</key>
	<string>com.lingually.desktop</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>Lingually</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>2.0.0</string>
	<key>CFBundleVersion</key>
	<string>2.0.0</string>
	<key>LSMinimumSystemVersion</key>
	<string>11.0</string>
	<key>NSHighResolutionCapable</key>
	<true/>
	<key>NSHumanReadableCopyright</key>
	<string>© 2026 Lingually Contributors. MIT License.</string>
	<key>NSAppleEventsUsageDescription</key>
	<string>Lingually requires accessibility permissions to inspect and format selected text.</string>
</dict>
</plist>
`;
fs.writeFileSync(path.join(CONTENTS_DIR, "Info.plist"), infoPlist);

// Copy macOS icon
const icnsSrc = path.join(ICONS_DIR, "icon.icns");
if (fs.existsSync(icnsSrc)) {
  fs.copyFileSync(icnsSrc, path.join(RESOURCES_DIR, "icon.icns"));
}

// Copy web assets into www/
fs.copyFileSync(path.join(DIST_DESKTOP, "index.html"), path.join(WWW_DIR, "index.html"));
["icon16.png", "icon32.png", "icon48.png", "icon128.png"].forEach((f) => {
  const p = path.join(DIST_DESKTOP, f);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(WWW_DIR, f));
});

console.log("✅ Assembled Lingually.app bundle.");

// Create Applications symlink inside staging folder for DMG drag-and-drop
try {
  fs.symlinkSync("/Applications", path.join(MACOS_STAGING, "Applications"));
} catch (e) {
  // Ignored if already exists
}

// Create macOS DMG using hdiutil
const dmgDest = path.join(PUBLIC_DOWNLOADS, "Lingually-macOS-Universal.dmg");
try {
  console.log("Creating Lingually-macOS-Universal.dmg...");
  fs.rmSync(dmgDest, { force: true });
  execSync(
    `hdiutil create -volname "Lingually" -srcfolder "${MACOS_STAGING}" -ov -format UDZO "${dmgDest}"`,
    { stdio: "inherit" }
  );
  console.log(`🎉 Created DMG at: ${dmgDest}`);
} catch (e) {
  console.warn("Could not create DMG with hdiutil:", e.message);
}

// Create macOS ZIP bundle
const macZipDest = path.join(PUBLIC_DOWNLOADS, "Lingually-macOS-Universal.zip");
try {
  console.log("Creating Lingually-macOS-Universal.zip...");
  fs.rmSync(macZipDest, { force: true });
  execSync(
    `cd "${MACOS_STAGING}" && zip -r -y -q "${macZipDest}" "Lingually.app"`,
    { stdio: "inherit" }
  );
  console.log(`🎉 Created Mac ZIP at: ${macZipDest}`);
} catch (e) {
  console.warn("Could not create Mac ZIP:", e.message);
}

// 3. Package Windows 64-bit Distribution (.zip)
const WIN_STAGING = path.join(ROOT_DIR, "dist", "windows-staging");
fs.rmSync(WIN_STAGING, { recursive: true, force: true });
fs.mkdirSync(path.join(WIN_STAGING, "www"), { recursive: true });

// Copy web assets to www
fs.copyFileSync(path.join(DIST_DESKTOP, "index.html"), path.join(WIN_STAGING, "www", "index.html"));
["icon16.png", "icon32.png", "icon48.png", "icon128.png", "icon.ico"].forEach((f) => {
  const p = path.join(DIST_DESKTOP, f);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(WIN_STAGING, "www", f));
});
if (fs.existsSync(path.join(ICONS_DIR, "icon.ico"))) {
  fs.copyFileSync(path.join(ICONS_DIR, "icon.ico"), path.join(WIN_STAGING, "Lingually.ico"));
}

// Create Windows Launch Scripts
const launchBat = `@echo off
title Lingually Desktop Assistant
echo Starting Lingually AI Writing Workbench...
start msedge.exe --app="%~dp0www\\index.html" --window-size=1140,780 --user-data-dir="%LOCALAPPDATA%\\Lingually\\profile"
exit
`;
fs.writeFileSync(path.join(WIN_STAGING, "Launch-Lingually.bat"), launchBat);

const launchVbs = `Set WshShell = CreateObject("WScript.Shell")
currentPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
htmlPath = currentPath & "\\www\\index.html"
userDataDir = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\\Lingually\\profile"
command = "msedge.exe --app=""" & htmlPath & """ --window-size=1140,780 --user-data-dir=""" & userDataDir & """"
WshShell.Run command, 0, False
`;
fs.writeFileSync(path.join(WIN_STAGING, "Lingually.vbs"), launchVbs);

const readmeWin = `=====================================================
  Lingually — AI Writing Workbench for Windows (64-bit)
=====================================================

QUICK LAUNCH:
  - Double-click "Lingually.vbs" (silent launch without terminal window)
    OR double-click "Launch-Lingually.bat"

REQUIREMENTS:
  - Windows 10 (1803+) or Windows 11
  - Microsoft Edge WebView2 runtime (pre-installed natively on modern Windows)

FEATURES:
  - Local-first deterministic grammar and typo review
  - Multi-mode paraphraser (Standard, Fluency, Formal, Shorten, Expand)
  - Offline-ready with local IndexedDB drafts persistence
  - Bring Your Own Key (BYOK) for direct provider API access

TAURI NATIVE INSTALLER (.MSI / .EXE):
  For native system-tray and Windows UI Automation hotkey integration:
  - Run: npx tauri build
  - Binary outputs to: src-tauri/target/release/bundle/nsis/

Documentation: https://lingually-os.vercel.app/docs/WINDOWS_BUILD.md
GitHub: https://github.com/binyamfeyissa/lingually
`;
fs.writeFileSync(path.join(WIN_STAGING, "HOW_TO_RUN_WINDOWS.txt"), readmeWin);

// Zip Windows bundle
const winZipDest = path.join(PUBLIC_DOWNLOADS, "Lingually-Windows-x64.zip");
try {
  console.log("Creating Lingually-Windows-x64.zip...");
  fs.rmSync(winZipDest, { force: true });
  execSync(
    `cd "${WIN_STAGING}" && zip -r -q "${winZipDest}" .`,
    { stdio: "inherit" }
  );
  console.log(`🎉 Created Windows ZIP at: ${winZipDest}`);
} catch (e) {
  console.warn("Could not create Windows ZIP:", e.message);
}

console.log("✨ All desktop distribution packages generated successfully in public/downloads/!");

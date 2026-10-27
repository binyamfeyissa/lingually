/**
 * Desktop Frontend Bundler for Lingually macOS & Windows Desktop Apps
 * Produces production-grade, self-contained, offline-ready desktop workbench.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT_DIR = process.cwd();
const DIST_DESKTOP = path.join(ROOT_DIR, "dist", "desktop");
const OUT_DIR = path.join(ROOT_DIR, "out");
const ICONS_DIR = path.join(ROOT_DIR, "src-tauri", "icons");
const DOWNLOADS_DIR = path.join(ROOT_DIR, "public", "downloads");

console.log("🖥️ Building Production Lingually Desktop Distribution...");

// Ensure output directories exist
fs.mkdirSync(DIST_DESKTOP, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// 1. Bundle Desktop TypeScript Application via esbuild
console.log("📦 Compiling Desktop Application bundle with esbuild...");
const bundleOutPath = path.join(DIST_DESKTOP, "app.bundle.js");
execSync(
  `npx esbuild apps/desktop/src/app.ts --bundle --outfile="${bundleOutPath}" --format=iife --target=es2020 --minify`,
  { stdio: "inherit" }
);

// 2. Read Stylesheet & Application Bundle
const cssContent = fs.readFileSync(path.join(ROOT_DIR, "apps", "desktop", "src", "styles.css"), "utf8");
const jsContent = fs.readFileSync(bundleOutPath, "utf8");

// Base64 favicon
let faviconBase64 = "";
const icon32Path = path.join(DOWNLOADS_DIR, "icon32.png");
if (fs.existsSync(icon32Path)) {
  faviconBase64 = fs.readFileSync(icon32Path).toString("base64");
}

// 3. Assemble Standalone Production HTML
const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lingually — AI Writing Workbench</title>
  ${faviconBase64 ? `<link rel="icon" type="image/png" href="data:image/png;base64,${faviconBase64}">` : ""}
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="app-root"></div>
  <script>
${jsContent}
  </script>
</body>
</html>`;

const indexPath = path.join(DIST_DESKTOP, "index.html");
fs.writeFileSync(indexPath, standaloneHtml, "utf8");
console.log(`✅ Generated standalone workbench at: ${indexPath} (${(standaloneHtml.length / 1024).toFixed(1)} KB)`);

// 4. Copy to out/
fs.copyFileSync(indexPath, path.join(OUT_DIR, "index.html"));

// Copy icons
["icon16.png", "icon32.png", "icon48.png", "icon128.png"].forEach((f) => {
  const src = path.join(DOWNLOADS_DIR, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST_DESKTOP, f));
    fs.copyFileSync(src, path.join(OUT_DIR, f));
  }
});

if (fs.existsSync(path.join(ICONS_DIR, "icon.icns"))) {
  fs.copyFileSync(path.join(ICONS_DIR, "icon.icns"), path.join(DIST_DESKTOP, "icon.icns"));
  fs.copyFileSync(path.join(ICONS_DIR, "icon.icns"), path.join(OUT_DIR, "icon.icns"));
}

if (fs.existsSync(path.join(ICONS_DIR, "icon.ico"))) {
  fs.copyFileSync(path.join(ICONS_DIR, "icon.ico"), path.join(DIST_DESKTOP, "icon.ico"));
  fs.copyFileSync(path.join(ICONS_DIR, "icon.ico"), path.join(OUT_DIR, "icon.ico"));
}

console.log("🎉 Lingually Desktop Webview Shell successfully built!");

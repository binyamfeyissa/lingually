/**
 * Chrome Extension Bundler for Lingually 2.0
 */

import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import zlib from "node:zlib";

const ROOT_DIR = process.cwd();
const EXT_DIR = path.join(ROOT_DIR, "apps", "chrome-extension");
const OUT_DIR = path.join(ROOT_DIR, "dist", "chrome-extension");
const PUBLIC_DOWNLOADS = path.join(ROOT_DIR, "public", "downloads");

// Ensure output directories exist
fs.mkdirSync(path.join(OUT_DIR, "icons"), { recursive: true });
fs.mkdirSync(PUBLIC_DOWNLOADS, { recursive: true });

console.log("📦 Building Lingually Chrome Extension...");

// 1. Compile TypeScript entry points with esbuild
await esbuild.build({
  entryPoints: [path.join(EXT_DIR, "src", "background.ts")],
  outfile: path.join(OUT_DIR, "background.js"),
  bundle: true,
  format: "esm",
  target: ["chrome110"],
  sourcemap: false,
});

await esbuild.build({
  entryPoints: [
    path.join(EXT_DIR, "src", "content.ts"),
    path.join(EXT_DIR, "src", "popup.ts"),
    path.join(EXT_DIR, "src", "sidepanel.ts"),
    path.join(EXT_DIR, "src", "options.ts"),
  ],
  outdir: OUT_DIR,
  bundle: true,
  format: "iife",
  target: ["chrome110"],
  sourcemap: false,
});

console.log("✅ Compiled TypeScript files.");

// 2. Copy static assets
fs.copyFileSync(path.join(EXT_DIR, "manifest.json"), path.join(OUT_DIR, "manifest.json"));
fs.copyFileSync(path.join(EXT_DIR, "src", "content.css"), path.join(OUT_DIR, "content.css"));
fs.copyFileSync(path.join(EXT_DIR, "src", "popup.html"), path.join(OUT_DIR, "popup.html"));
fs.copyFileSync(path.join(EXT_DIR, "src", "sidepanel.html"), path.join(OUT_DIR, "sidepanel.html"));
fs.copyFileSync(path.join(EXT_DIR, "src", "options.html"), path.join(OUT_DIR, "options.html"));

console.log("✅ Copied HTML, CSS, and manifest.");

// 3. Helper to create valid PNG icon buffers without external dependencies
function createPng(width, height, r = 99, g = 102, b = 241) {
  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }
  function calcCrc(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(calcCrc(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data: filter byte (0) + row pixels
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Gradient / rounded box effect
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = 255;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk("IHDR", ihdr);
  const idatChunk = makeChunk("IDAT", idatData);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icons
[16, 32, 48, 128].forEach((size) => {
  const iconBuf = createPng(size, size, 99, 102, 241);
  fs.writeFileSync(path.join(OUT_DIR, "icons", `icon${size}.png`), iconBuf);
});

console.log("✅ Generated PNG extension icons.");

// 4. Create ZIP package for distribution
const zipFile = path.join(PUBLIC_DOWNLOADS, "lingually-chrome-extension.zip");
try {
  execSync(`cd "${OUT_DIR}" && zip -r "${zipFile}" ./*`);
  console.log(`🎉 Packaged extension into: ${zipFile}`);
} catch (e) {
  console.warn("Could not create zip package:", e.message);
}

console.log("✨ Chrome Extension build complete in dist/chrome-extension!");

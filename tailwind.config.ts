import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ArtCraft Core Palette */
        bg: {
          DEFAULT: "var(--bg)",
          raised: "var(--bg-raised)",
          sunken: "var(--bg-sunken)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          strong: "var(--ink-strong)",
        },
        muted: "var(--muted)",
        faint: "var(--faint)",
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          ink: "var(--accent-ink)",
          foreground: "var(--invert-fg)",
        },
        "invert-bg": "var(--invert-bg)",
        "invert-fg": "var(--invert-fg)",
        danger: {
          DEFAULT: "var(--danger)",
          dark: "var(--danger)",
          subtle: "rgba(179, 38, 30, 0.12)",
        },

        /* Backward-compatible aliases */
        background: "var(--bg)",
        foreground: "var(--ink)",
        surface: {
          DEFAULT: "var(--bg-raised)",
          muted: "var(--bg-sunken)",
          subtle: "var(--bg-sunken)",
          border: "var(--line)",
        },
        brand: {
          50: "#eef6fc",
          100: "#d9ecf9",
          200: "#b7ddf5",
          300: "#83c4ef",
          400: "#48a5e4",
          500: "#2d81ff",
          600: "#1659c4",
          700: "#024587",
          800: "#053b70",
          900: "#0a325d",
          DEFAULT: "#2d81ff",
        },
        success: {
          DEFAULT: "#0f8b44",
          subtle: "rgba(15, 139, 68, 0.12)",
          dark: "#065f46",
        },
        warning: {
          DEFAULT: "#d97706",
          subtle: "rgba(217, 119, 6, 0.12)",
          dark: "#78350f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Archivo", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Instrument Serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;

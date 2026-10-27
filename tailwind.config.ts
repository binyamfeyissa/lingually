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
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
          subtle: "var(--surface-subtle)",
          border: "var(--surface-border)",
        },
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc0fb",
          400: "#369ef7",
          500: "#0c82eb",
          600: "#0265c8",
          700: "#0350a2",
          800: "#074485",
          900: "#0c3a6e",
          DEFAULT: "#0c82eb",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        success: {
          DEFAULT: "#10b981",
          subtle: "#ecfdf5",
          dark: "#065f46",
        },
        warning: {
          DEFAULT: "#f59e0b",
          subtle: "#fffbeb",
          dark: "#78350f",
        },
        danger: {
          DEFAULT: "#ef4444",
          subtle: "#fef2f2",
          dark: "#991b1b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;

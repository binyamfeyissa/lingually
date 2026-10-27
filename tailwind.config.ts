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
          50: "#eef6fc",
          100: "#d9ecf9",
          200: "#b7ddf5",
          300: "#83c4ef",
          400: "#48a5e4",
          500: "#0268cc",
          600: "#0256a9",
          700: "#024587",
          800: "#053b70",
          900: "#0a325d",
          DEFAULT: "#0268cc",
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

"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const saved = localStorage.getItem("lingually_theme") as "light" | "dark" | "system" | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      applyTheme("system");
    }
  }, []);

  const applyTheme = (t: "light" | "dark" | "system") => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else if (t === "light") {
      root.classList.remove("dark");
      root.removeAttribute("data-theme");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        root.removeAttribute("data-theme");
      }
    }
  };

  const cycleTheme = () => {
    const nextTheme = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
    setTheme(nextTheme);
    localStorage.setItem("lingually_theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      onClick={cycleTheme}
      className={`h-8 w-8 inline-flex items-center justify-center rounded-none border border-line text-muted hover:text-ink hover:bg-bg-raised transition-colors ${className || ""}`}
      title={`Theme: ${theme.toUpperCase()} (Click to cycle)`}
      aria-label="Toggle visual theme"
    >
      {theme === "light" && <Sun className="h-3.5 w-3.5 text-amber-500" />}
      {theme === "dark" && <Moon className="h-3.5 w-3.5 text-accent" />}
      {theme === "system" && <Monitor className="h-3.5 w-3.5 text-muted" />}
    </button>
  );
}

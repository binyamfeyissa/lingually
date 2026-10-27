"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "../shared/button";

export function ThemeToggle() {
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
    } else if (t === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
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
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
      aria-label="Toggle visual theme"
    >
      {theme === "light" && <Sun className="h-4 w-4 text-amber-500" />}
      {theme === "dark" && <Moon className="h-4 w-4 text-brand-400" />}
      {theme === "system" && <Monitor className="h-4 w-4 text-foreground/70" />}
    </Button>
  );
}

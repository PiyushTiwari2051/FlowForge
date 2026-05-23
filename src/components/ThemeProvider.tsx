"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeId =
  | "dark-zinc"
  | "dark-midnight"
  | "dark-forest"
  | "dark-velvet"
  | "dark-crimson"
  | "light-indigo"
  | "light-amber"
  | "light-emerald"
  | "light-rose"
  | "light-teal";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  isDark: boolean;
  color: string; // Preview dot color
}

export const THEMES: ThemeOption[] = [
  { id: "dark-zinc", name: "Deep Zinc", isDark: true, color: "#27272a" },
  { id: "dark-midnight", name: "Midnight Blue", isDark: true, color: "#111c44" },
  { id: "dark-forest", name: "Charcoal Forest", isDark: true, color: "#0f2e1e" },
  { id: "dark-velvet", name: "Dark Velvet", isDark: true, color: "#3b0764" },
  { id: "dark-crimson", name: "Crimson Noir", isDark: true, color: "#5c0808" },
  { id: "light-indigo", name: "Paper White", isDark: false, color: "#4f46e5" },
  { id: "light-amber", name: "Warm Amber", isDark: false, color: "#d97706" },
  { id: "light-emerald", name: "Soft Emerald", isDark: false, color: "#059669" },
  { id: "light-rose", name: "Rose Quartz", isDark: false, color: "#db2777" },
  { id: "light-teal", name: "Cool Teal", isDark: false, color: "#0d9488" },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  isDark: boolean;
  activeThemeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("dark-zinc");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("flowforge-theme") as ThemeId;
    if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
      if (savedTheme.startsWith("dark-")) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.setAttribute("data-theme", "dark-zinc");
      document.documentElement.classList.add("dark");
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem("flowforge-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme.startsWith("dark-")) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const activeThemeOption = THEMES.find((t) => t.id === theme) || THEMES[0];
  const isDark = activeThemeOption.isDark;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, activeThemeOption }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

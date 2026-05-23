"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, THEMES, ThemeId, ThemeOption } from "@/components/ThemeProvider";
import { Palette, Check, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSelector() {
  const { theme, setTheme, isDark, activeThemeOption } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const darkThemes = THEMES.filter((t) => t.isDark);
  const lightThemes = THEMES.filter((t) => !t.isDark);

  const selectTheme = (id: ThemeId) => {
    setTheme(id);
    setIsOpen(false);
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-all active:scale-[0.98]"
        aria-label="Select color theme"
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="w-2.5 h-2.5 rounded-full border border-zinc-700/50 shadow-inner shrink-0" style={{ backgroundColor: activeThemeOption.color }} />
        <span className="text-xs font-medium hidden md:inline truncate max-w-[90px]">
          {activeThemeOption.name}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto">
              {/* Dark Themes Section */}
              <div>
                <div className="px-2.5 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800/40 mb-1 font-mono">
                  <Moon className="w-2.5 h-2.5 text-zinc-400" />
                  <span>Dark Modes</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {darkThemes.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectTheme(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        theme === item.id
                          ? "bg-zinc-800 text-zinc-150 font-medium border border-zinc-750"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-zinc-700/50 shadow-inner shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      {theme === item.id && <Check className="w-3.5 h-3.5 text-zinc-300" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Light Themes Section */}
              <div className="mt-1">
                <div className="px-2.5 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800/40 mb-1 font-mono">
                  <Sun className="w-2.5 h-2.5 text-zinc-400" />
                  <span>Light Modes</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {lightThemes.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectTheme(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        theme === item.id
                          ? "bg-zinc-800 text-zinc-150 font-medium border border-zinc-750"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-zinc-700/50 shadow-inner shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      {theme === item.id && <Check className="w-3.5 h-3.5 text-zinc-300" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

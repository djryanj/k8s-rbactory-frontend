// src/context/theme/ThemeProvider.tsx
import React, { useState, useEffect } from "react";
import { ThemeContext, type Theme, type ResolvedTheme } from "./ThemeContext";

const THEME_STORAGE_KEY = "k8s-rbac-theme";

// Helper to get system preference
const getSystemTheme = (): ResolvedTheme => {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
};

// Helper to resolve theme to actual light/dark
const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }

    // Default to system if no preference stored
    return "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(theme),
  );

  // Apply theme to DOM
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    const root = window.document.documentElement;

    // Remove old theme class
    root.classList.remove("light", "dark");

    // Add new theme class
    root.classList.add(resolved);

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system theme changes (only when theme is "system")
  useEffect(() => {
    if (theme !== "system") {
      return; // Don't listen if user has explicit preference
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? "dark" : "light";
      setResolvedTheme(newResolved);

      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newResolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      // Toggle between light and dark (skip system in toggle)
      if (prev === "dark") return "light";
      return "dark";
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    resolvedTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

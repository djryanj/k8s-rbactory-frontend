// src/components/ThemeToggle/ThemeToggle.tsx
import React, { useRef, useEffect } from "react";
import { useTheme } from "../../context/theme";
import { Sun, Moon, Check } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const themes = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
  ];

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showMenu) {
        setShowMenu(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showMenu]);

  // Focus first menu item when opened
  useEffect(() => {
    if (showMenu && menuRef.current) {
      const firstButton = menuRef.current.querySelector("button");
      firstButton?.focus();
    }
  }, [showMenu]);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    setShowMenu(false);
    announceToScreenReader(`Theme changed to ${newTheme}`);
    buttonRef.current?.focus();
  };

  const currentTheme = themes.find((t) => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Sun;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className={combineClasses(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          neutralColors.bg,
          neutralColors.hover,
          infoColors.ring
        )}
        aria-label={`Current theme: ${currentTheme?.label}. Click to change theme.`}
        aria-expanded={showMenu}
        aria-haspopup="true"
        aria-controls="theme-menu"
      >
        <CurrentIcon
          size={18}
          className={theme === "light" ? "text-yellow-600" : "text-blue-600"}
          aria-hidden="true"
        />
        <span
          className={combineClasses(
            "text-sm font-medium hidden sm:inline",
            neutralColors.text
          )}
        >
          Theme
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          <div
            ref={menuRef}
            id="theme-menu"
            role="menu"
            aria-label="Theme selection"
            className={combineClasses(
              "absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-20 overflow-hidden",
              neutralColors.bg,
              neutralColors.border
            )}
          >
            {themes.map(({ value, label, icon: Icon }) => {
              const isSelected = theme === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => handleThemeChange(value)}
                  className={combineClasses(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-inset",
                    isSelected
                      ? combineClasses(
                          "bg-k8s-blue text-white",
                          infoColors.ring
                        )
                      : combineClasses(
                          neutralColors.text,
                          neutralColors.hover,
                          infoColors.ring
                        )
                  )}
                  aria-label={`${label} theme${
                    isSelected ? " (selected)" : ""
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="font-medium flex-1">{label}</span>
                  {isSelected && (
                    <Check size={16} className="ml-auto" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Screen reader announcement */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {showMenu ? "Theme menu opened" : ""}
      </div>
    </div>
  );
};

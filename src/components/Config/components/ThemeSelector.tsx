// src/components/Config/components/ThemeSelector.tsx
import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import type { ThemeOption } from "../types";

interface ThemeSelectorProps {
  selectedTheme: ThemeOption;
  onThemeChange: (theme: ThemeOption) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const themes: Array<{
    value: ThemeOption;
    icon: React.ComponentType<{
      size: number;
      className?: string;
      "aria-hidden"?: boolean;
    }>;
    iconColor: string;
    label: string;
    description: string;
    ariaLabel: string;
  }> = [
    {
      value: "light",
      icon: Sun,
      iconColor: "text-yellow-500",
      label: "Light",
      description: "Bright mode",
      ariaLabel: "Light theme: Bright mode",
    },
    {
      value: "dark",
      icon: Moon,
      iconColor: "text-indigo-500",
      label: "Dark",
      description: "Easy on eyes",
      ariaLabel: "Dark theme: Easy on eyes",
    },
    {
      value: "system",
      icon: Monitor,
      iconColor: neutralColors.icon,
      label: "System",
      description: "Auto switch",
      ariaLabel: "System theme: Auto switch based on system preferences",
    },
  ];

  return (
    <section aria-labelledby="appearance-heading">
      <h3
        id="appearance-heading"
        className={combineClasses(
          "text-lg font-semibold mb-4",
          neutralColors.text
        )}
      >
        Appearance
      </h3>
      <fieldset className="space-y-3">
        <legend
          className={combineClasses(
            "block text-sm font-medium mb-2",
            neutralColors.text
          )}
        >
          Theme
        </legend>
        <div
          className="grid grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Theme selection"
        >
          {themes.map(
            ({
              value,
              icon: Icon,
              iconColor,
              label,
              description,
              ariaLabel,
            }) => (
              <button
                key={value}
                type="button"
                onClick={() => onThemeChange(value)}
                className={combineClasses(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  selectedTheme === value
                    ? combineClasses(
                        infoColors.border,
                        infoColors.bg,
                        "shadow-sm"
                      )
                    : combineClasses(neutralColors.border, neutralColors.hover),
                  infoColors.ring
                )}
                role="radio"
                aria-checked={selectedTheme === value}
                aria-label={ariaLabel}
              >
                <Icon size={24} className={iconColor} aria-hidden={true} />
                <div className="text-center">
                  <div
                    className={combineClasses(
                      "font-medium text-sm",
                      neutralColors.text
                    )}
                  >
                    {label}
                  </div>
                  <div
                    className={combineClasses("text-xs", neutralColors.icon)}
                  >
                    {description}
                  </div>
                </div>
              </button>
            )
          )}
        </div>
        <p
          className={combineClasses("text-xs italic", neutralColors.icon)}
          role="note"
        >
          Theme changes apply immediately for preview. Click "Save Changes" to
          persist.
        </p>
      </fieldset>
    </section>
  );
};

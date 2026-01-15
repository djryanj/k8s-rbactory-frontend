// src/components/RolePresets/RolePresetsCompact.tsx
import React, { useState } from "react";
import { useRBAC } from "../../context/rbac";
import { PRESET_ROLES } from "../../utils/presetRoles";
import { ChevronDown, ChevronUp, Zap, Check } from "lucide-react";
import { type PresetRole } from "../../types/presets.types";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";

export const RolePresetsCompact: React.FC = () => {
  const { loadPreset } = useRBAC();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadedPresetId, setLoadedPresetId] = useState<string | null>(null);

  const successColors = ACCESSIBLE_COLORS.success;
  const criticalColors = ACCESSIBLE_COLORS.critical;
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_ROLES.find((p: PresetRole) => p.id === presetId);
    if (preset) {
      loadPreset(preset.permissions, preset.isClusterRole);
      setLoadedPresetId(presetId);
      announceToScreenReader(
        `${preset.name} template loaded with ${
          preset.permissions.length
        } resource${preset.permissions.length === 1 ? "" : "s"}. ${
          preset.isClusterRole ? "Cluster-scoped role" : "Namespace-scoped role"
        }.`,
      );
    }
  };

  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    announceToScreenReader(
      newState
        ? "Quick start templates expanded"
        : "Quick start templates collapsed",
    );
  };

  return (
    <section
      className={combineClasses(
        "rounded-lg border overflow-hidden transform-gpu transition-all",
        neutralColors.bg,
        neutralColors.border,
      )}
      aria-labelledby="presets-heading"
    >
      {/* Header - Always Visible */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={combineClasses(
          "w-full flex items-center gap-3 p-4 transition-all text-left",
          "focus:outline-none",
          neutralColors.hover,
        )}
        aria-expanded={isExpanded}
        aria-controls="presets-content"
      >
        <div
          className={combineClasses(
            "p-2 rounded-lg flex-shrink-0 transition-transform",
            infoColors.bg,
            isExpanded && "scale-110",
          )}
        >
          <Zap
            size={20}
            className={combineClasses(infoColors.icon, "transition-transform")}
            aria-hidden="true"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            id="presets-heading"
            className={combineClasses(
              "font-semibold text-base flex items-center gap-2",
              neutralColors.text,
            )}
          >
            Quick Start Templates
            {!isExpanded && (
              <span
                className={combineClasses(
                  "text-xs px-2 py-0.5 rounded-full border font-medium",
                  neutralColors.icon,
                  neutralColors.border,
                )}
              >
                {PRESET_ROLES.length} available
              </span>
            )}
          </h3>
          <p className={combineClasses("text-sm mt-0.5", neutralColors.icon)}>
            {isExpanded
              ? "Choose a template to quickly configure common role patterns"
              : "Start with a pre-configured role template for common use cases"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp
              size={20}
              className={neutralColors.icon}
              aria-hidden="true"
            />
          ) : (
            <ChevronDown
              size={20}
              className={neutralColors.icon}
              aria-hidden="true"
            />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div
          id="presets-content"
          className={combineClasses(
            "border-t p-4 space-y-4",
            neutralColors.border,
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRESET_ROLES.map((preset: PresetRole) => {
              const scopeColors = preset.isClusterRole
                ? criticalColors
                : infoColors;
              const isLoaded = loadedPresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset.id)}
                  disabled={isLoaded}
                  className={combineClasses(
                    "border-2 rounded-lg p-3 transition-all transform-gpu text-left",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    "disabled:cursor-default",
                    isLoaded
                      ? combineClasses(
                          successColors.border,
                          successColors.bg,
                          "shadow-sm",
                        )
                      : combineClasses(
                          neutralColors.border,
                          neutralColors.bg,
                          neutralColors.hover,
                          "hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]",
                          "cursor-pointer",
                        ),
                    infoColors.ring,
                  )}
                  aria-label={
                    isLoaded
                      ? `${preset.name} template loaded`
                      : `Load ${preset.name} template with ${
                          preset.permissions.length
                        } resource${preset.permissions.length === 1 ? "" : "s"}`
                  }
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4
                      className={combineClasses(
                        "font-medium text-sm",
                        isLoaded ? successColors.text : neutralColors.text,
                      )}
                    >
                      {preset.name}
                    </h4>
                    <span
                      className={combineClasses(
                        "text-xs px-2 py-0.5 rounded border font-medium flex-shrink-0",
                        scopeColors.bg,
                        scopeColors.text,
                        scopeColors.border,
                      )}
                      aria-label={`${
                        preset.isClusterRole ? "Cluster" : "Namespace"
                      }-scoped role`}
                    >
                      {preset.isClusterRole ? "Cluster" : "Namespace"}
                    </span>
                  </div>

                  <p
                    className={combineClasses(
                      "text-xs mb-3",
                      neutralColors.icon,
                    )}
                  >
                    {preset.description}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={combineClasses("text-xs", neutralColors.icon)}
                    >
                      {preset.permissions.length} resource
                      {preset.permissions.length === 1 ? "" : "s"}
                    </span>

                    {isLoaded && (
                      <span
                        className={combineClasses(
                          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded",
                          successColors.text,
                        )}
                      >
                        <Check size={14} aria-hidden="true" />
                        Loaded
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Screen reader summary */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Quick start templates section.{" "}
        {isExpanded ? "Expanded. " : "Collapsed. "}
        {PRESET_ROLES.length} template{PRESET_ROLES.length === 1 ? "" : "s"}{" "}
        available.
        {loadedPresetId && (
          <>
            {" "}
            Currently loaded:{" "}
            {
              PRESET_ROLES.find((p: PresetRole) => p.id === loadedPresetId)
                ?.name
            }
            .
          </>
        )}
      </div>
    </section>
  );
};

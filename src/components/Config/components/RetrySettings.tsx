// src/components/Config/components/RetrySettings.tsx
import React from "react";
import { RefreshCw } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import { announceToScreenReader } from "../../../utils/accessibility";
import type { RetryConfig } from "../../../context/config";

interface RetrySettingsProps {
  config: RetryConfig;
  onConfigChange: (config: RetryConfig) => void;
}

const MAX_ATTEMPTS_OPTIONS = [3, 5, 7, 10] as const;
const INITIAL_DELAY_OPTIONS = [5, 10, 15, 30] as const;

export const RetrySettings: React.FC<RetrySettingsProps> = ({
  config,
  onConfigChange,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const handleEnabledChange = (enabled: boolean) => {
    onConfigChange({ ...config, enabled });
    announceToScreenReader(
      `Automatic retries ${enabled ? "enabled" : "disabled"}`
    );
  };

  const handleMaxAttemptsChange = (maxAttempts: number) => {
    onConfigChange({ ...config, maxAttempts });
    announceToScreenReader(`Maximum retry attempts changed to ${maxAttempts}`);
  };

  const handleInitialDelayChange = (initialDelaySeconds: number) => {
    onConfigChange({ ...config, initialDelaySeconds });
    announceToScreenReader(
      `Initial retry delay changed to ${initialDelaySeconds} seconds`
    );
  };

  return (
    <section aria-labelledby="retry-settings-heading">
      <h3
        id="retry-settings-heading"
        className={combineClasses(
          "text-lg font-semibold mb-4 flex items-center gap-2",
          neutralColors.text
        )}
      >
        <RefreshCw size={18} aria-hidden="true" />
        Connection Retry Settings
      </h3>

      <div className="space-y-4">
        {/* Enable/Disable Automatic Retries */}
        <div
          className={combineClasses(
            "flex items-center justify-between p-4 rounded-lg",
            "bg-gray-50 dark:bg-gray-700/50"
          )}
        >
          <div className="flex-1">
            <div
              id="retry-enabled-toggle-label"
              className={combineClasses("font-medium", neutralColors.text)}
            >
              Enable Automatic Retries
            </div>
            <div className={combineClasses("text-sm", neutralColors.icon)}>
              Automatically retry failed connection attempts
            </div>
          </div>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleEnabledChange(e.target.checked)}
                className="sr-only peer"
                aria-labelledby="retry-enabled-toggle-label"
                aria-describedby="retry-enabled-toggle-description"
              />
              <div
                className={combineClasses(
                  "w-11 h-6 rounded-full peer transition-colors",
                  "peer-focus:outline-none peer-focus:ring-4",
                  "peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800",
                  "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                  "after:bg-white after:border-gray-300 after:border",
                  "after:rounded-full after:h-5 after:w-5 after:transition-all",
                  "peer-checked:after:translate-x-full peer-checked:after:border-white",
                  config.enabled
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-600"
                )}
                role="presentation"
              />
              <span className="sr-only">
                {config.enabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
        </div>
        <span id="retry-enabled-toggle-description" className="sr-only">
          Toggle to enable or disable automatic connection retry attempts
        </span>

        {/* Maximum Retry Attempts */}
        {config.enabled && (
          <div>
            <label
              htmlFor="max-retry-attempts"
              className={combineClasses(
                "block text-sm font-medium mb-2",
                neutralColors.text
              )}
            >
              Maximum Retry Attempts
            </label>
            <select
              id="max-retry-attempts"
              value={config.maxAttempts}
              onChange={(e) => handleMaxAttemptsChange(Number(e.target.value))}
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                infoColors.ring
              )}
              aria-describedby="max-retry-attempts-description"
            >
              {MAX_ATTEMPTS_OPTIONS.map((attempts) => (
                <option key={attempts} value={attempts}>
                  {attempts} attempts
                </option>
              ))}
            </select>
            <p
              id="max-retry-attempts-description"
              className={combineClasses("mt-2 text-xs", neutralColors.icon)}
            >
              Number of times to retry before giving up (uses exponential
              backoff)
            </p>
          </div>
        )}

        {/* Initial Retry Delay */}
        {config.enabled && (
          <div>
            <label
              htmlFor="initial-retry-delay"
              className={combineClasses(
                "block text-sm font-medium mb-2",
                neutralColors.text
              )}
            >
              Initial Retry Delay
            </label>
            <select
              id="initial-retry-delay"
              value={config.initialDelaySeconds}
              onChange={(e) => handleInitialDelayChange(Number(e.target.value))}
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                infoColors.ring
              )}
              aria-describedby="initial-retry-delay-description"
            >
              {INITIAL_DELAY_OPTIONS.map((seconds) => (
                <option key={seconds} value={seconds}>
                  {seconds} seconds
                </option>
              ))}
            </select>
            <p
              id="initial-retry-delay-description"
              className={combineClasses("mt-2 text-xs", neutralColors.icon)}
            >
              Time to wait before first retry (doubles with each attempt)
            </p>
          </div>
        )}

        {/* Retry Schedule Preview */}
        {config.enabled && (
          <div
            className={combineClasses(
              "p-3 rounded-lg border",
              "bg-blue-50 dark:bg-blue-900/20",
              "border-blue-200 dark:border-blue-800"
            )}
          >
            <div
              className={combineClasses(
                "text-xs font-medium mb-2",
                "text-blue-900 dark:text-blue-100"
              )}
            >
              Retry Schedule Preview:
            </div>
            <div
              className={combineClasses(
                "text-xs space-y-1",
                "text-blue-700 dark:text-blue-300"
              )}
            >
              {Array.from({ length: config.maxAttempts }, (_, i) => {
                const delay = config.initialDelaySeconds * Math.pow(2, i);
                const cappedDelay = Math.min(delay, 60);
                const totalTime = Array.from({ length: i + 1 }, (_, j) =>
                  Math.min(config.initialDelaySeconds * Math.pow(2, j), 60)
                ).reduce((a, b) => a + b, 0);
                return (
                  <div key={i}>
                    Attempt {i + 1}: Wait {cappedDelay}s (total: {totalTime}s)
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

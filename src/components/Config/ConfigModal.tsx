// src/components/Config/ConfigModal.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useConfig } from "../../context/config";
import { useTheme } from "../../context/theme";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";
import { FEATURE_FLAGS } from "../../utils/featureFlags";
import {
  ModalHeader,
  ModalFooter,
  ThemeSelector,
  ApiConfiguration,
  ClusterBrowserSettings,
} from "./components";
import type { ThemeOption } from "./types";

interface ConfigModalProps {
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ onClose }) => {
  const {
    apiEndpoint,
    setApiEndpoint,
    clusterBrowserEnabled,
    setClusterBrowserEnabled,
    defaultResourceLoadSize,
    setdefaultResourceLoadSize,
    resetConfig,
  } = useConfig();
  const { theme, setTheme } = useTheme();

  const neutralColors = ACCESSIBLE_COLORS.neutral;

  // Check if cluster browser feature is available at build time
  const isClusterBrowserAvailable = FEATURE_FLAGS.CLUSTER_BROWSER;

  // Store original values to revert on cancel
  const originalValuesRef = useRef({
    theme,
    apiEndpoint,
    clusterBrowserEnabled,
    defaultResourceLoadSize,
  });

  // Local state for form values
  const [localEndpoint, setLocalEndpoint] = useState(apiEndpoint);
  const [localBrowserEnabled, setLocalBrowserEnabled] = useState(
    clusterBrowserEnabled
  );
  const [localTheme, setLocalTheme] = useState<ThemeOption>(theme);
  const [localResourceLoadSize, setLocalResourceLoadSize] = useState(
    defaultResourceLoadSize
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Focus trap refs
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Memoize handleCancel to avoid recreating on every render
  const handleCancel = useCallback(() => {
    // Revert theme if it was changed
    if (theme !== originalValuesRef.current.theme) {
      setTheme(originalValuesRef.current.theme);
    }
    announceToScreenReader("Settings dialog closed without saving");
    onClose();
  }, [theme, setTheme, onClose]);

  // Memoize handleSave
  const handleSave = useCallback(() => {
    // Only save cluster browser settings if feature is available
    if (isClusterBrowserAvailable) {
      setApiEndpoint(localEndpoint);
      setClusterBrowserEnabled(localBrowserEnabled);
      setdefaultResourceLoadSize(localResourceLoadSize);
    }
    setTheme(localTheme);
    setHasChanges(false);
    announceToScreenReader("Settings saved successfully");
    onClose();
  }, [
    localEndpoint,
    localBrowserEnabled,
    localTheme,
    localResourceLoadSize,
    isClusterBrowserAvailable,
    setApiEndpoint,
    setClusterBrowserEnabled,
    setTheme,
    setdefaultResourceLoadSize,
    onClose,
  ]);

  // Memoize handleReset
  const handleReset = useCallback(() => {
    const confirmed = window.confirm("Reset all settings to defaults?");
    if (confirmed) {
      resetConfig();
      const defaultTheme: ThemeOption = "system";
      // Only reset cluster browser settings if feature is available
      if (isClusterBrowserAvailable) {
        setLocalEndpoint(
          import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1"
        );
        setLocalBrowserEnabled(true);
        setLocalResourceLoadSize(20);
      }
      setLocalTheme(defaultTheme);
      setTheme(defaultTheme);
      setHasChanges(false);
      announceToScreenReader("All settings reset to defaults");
    }
  }, [resetConfig, setTheme, isClusterBrowserAvailable]);

  // Handle theme change with immediate preview
  const handleThemeChange = useCallback(
    (newTheme: ThemeOption) => {
      setLocalTheme(newTheme);
      setTheme(newTheme); // Apply immediately for preview
      setHasChanges(true);
      announceToScreenReader(`Theme changed to ${newTheme}`);
    },
    [setTheme]
  );

  // Handle API endpoint change
  const handleEndpointChange = useCallback((endpoint: string) => {
    setLocalEndpoint(endpoint);
    setHasChanges(true);
  }, []);

  // Handle cluster browser toggle
  const handleBrowserToggle = useCallback((enabled: boolean) => {
    setLocalBrowserEnabled(enabled);
    setHasChanges(true);
    announceToScreenReader(
      `Cluster browser ${enabled ? "enabled" : "disabled"}`
    );
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((size: number) => {
    setLocalResourceLoadSize(size);
    setHasChanges(true);
  }, []);

  // Set focus to modal on mount and announce to screen readers
  useEffect(() => {
    announceToScreenReader("Settings dialog opened");
    firstFocusableRef.current?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleCancel]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div
        ref={modalRef}
        className={combineClasses(
          "rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
          neutralColors.bg
        )}
        role="document"
      >
        {/* Header */}
        <ModalHeader
          title="Settings"
          onClose={handleCancel}
          firstFocusableRef={firstFocusableRef}
        />

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <ThemeSelector
            selectedTheme={localTheme}
            onThemeChange={handleThemeChange}
          />

          {/* Cluster Browser Settings - Only show if feature is available */}
          {isClusterBrowserAvailable && (
            <>
              {/* API Configuration */}
              <ApiConfiguration
                endpoint={localEndpoint}
                onEndpointChange={handleEndpointChange}
              />

              {/* Cluster Browser Settings */}
              <ClusterBrowserSettings
                enabled={localBrowserEnabled}
                pageSize={localResourceLoadSize}
                onEnabledChange={handleBrowserToggle}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <ModalFooter
          hasChanges={hasChanges}
          onSave={handleSave}
          onCancel={handleCancel}
          onReset={handleReset}
        />

        {/* Screen reader status */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {hasChanges ? "You have unsaved changes" : "No unsaved changes"}
        </div>
      </div>
    </div>
  );
};

// src/components/Layout/AppLayout.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useConfig } from "../../context/config";
import { Shield, Wand2, Database, Settings } from "lucide-react";
import { PolicyBuilderTab } from "../Tabs/PolicyBuilderTab";
import { ClusterBrowserTab } from "../Tabs/ClusterBrowserTab";
import { ConfigModal } from "../Config";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";
import { FEATURE_FLAGS } from "../../utils/featureFlags";

type TabType = "policybuilder" | "browser";

export const AppLayout: React.FC = () => {
  const { clusterBrowserEnabled } = useConfig();
  const [activeTab, setActiveTab] = useState<TabType>("policybuilder");
  const [showConfig, setShowConfig] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const isClusterBrowserAvailable = FEATURE_FLAGS.CLUSTER_BROWSER;
  const showClusterBrowser = isClusterBrowserAvailable && clusterBrowserEnabled;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const offset = window.scrollY;
        const newScrolled = offset > 80;

        if (newScrolled !== scrolled) {
          setScrolled(newScrolled);
        }
      }, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    if (activeTab === "browser" && !showClusterBrowser) {
      setActiveTab("policybuilder");
      announceToScreenReader(
        "Cluster browser disabled, switched to Policy Builder tab"
      );
    }
  }, [activeTab, showClusterBrowser]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    announceToScreenReader(
      `Switched to ${
        tab === "policybuilder" ? "Policy Builder" : "Cluster Browser"
      } tab`
    );
  }, []);

  // Expose tab switching to child components
  const switchToPolicyBuilder = useCallback(() => {
    handleTabChange("policybuilder");
  }, [handleTabChange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-k8s-blue focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <header
        className={combineClasses(
          "border-b shadow-sm sticky top-0 z-50 transition-all duration-300 ease-in-out",
          neutralColors.bg,
          neutralColors.border
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={combineClasses(
              "flex items-center justify-between overflow-hidden transition-all duration-300 ease-in-out",
              scrolled
                ? "h-0 opacity-0 transform -translate-y-4"
                : "h-16 opacity-100 transform translate-y-0"
            )}
            aria-hidden={scrolled}
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-k8s-blue to-k8s-lightblue p-2 rounded-lg">
                <Shield className="text-white" size={24} aria-hidden="true" />
              </div>
              <div>
                <h1
                  className={combineClasses(
                    "text-xl font-bold",
                    neutralColors.text
                  )}
                >
                  K8s RBACtory
                </h1>
              </div>
            </div>
          </div>

          <div
            className={combineClasses(
              "flex items-center justify-between transition-all duration-300 ease-in-out",
              scrolled ? "py-3" : "py-0 -mb-px"
            )}
          >
            <nav
              className="flex gap-1"
              role="tablist"
              aria-label="Main navigation"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "policybuilder"}
                aria-controls="policybuilder-panel"
                id="policybuilder-tab"
                onClick={() => handleTabChange("policybuilder")}
                className={combineClasses(
                  "flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-inset",
                  activeTab === "policybuilder"
                    ? combineClasses(
                        "border-k8s-blue text-k8s-blue dark:text-k8s-lightblue",
                        infoColors.ring
                      )
                    : combineClasses(
                        "border-transparent",
                        neutralColors.icon,
                        neutralColors.hover
                      )
                )}
              >
                <Wand2 size={18} aria-hidden="true" />
                Policy Builder
              </button>

              {showClusterBrowser && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "browser"}
                  aria-controls="browser-panel"
                  id="browser-tab"
                  onClick={() => handleTabChange("browser")}
                  className={combineClasses(
                    "flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-inset",
                    activeTab === "browser"
                      ? combineClasses(
                          "border-k8s-blue text-k8s-blue dark:text-k8s-lightblue",
                          infoColors.ring
                        )
                      : combineClasses(
                          "border-transparent",
                          neutralColors.icon,
                          neutralColors.hover
                        )
                  )}
                >
                  <Database size={18} aria-hidden="true" />
                  Cluster Browser
                </button>
              )}
            </nav>

            <div
              className="flex items-center gap-3"
              role="group"
              aria-label="Header actions"
            >
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className={combineClasses(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-all transform-gpu",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  "hover:scale-105 active:scale-95",
                  neutralColors.text,
                  neutralColors.hover,
                  neutralColors.ring
                )}
                aria-label="Open settings"
                title="Settings"
              >
                <Settings size={18} aria-hidden="true" />
                <span className="hidden sm:inline text-sm">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        tabIndex={-1}
      >
        <div
          id="policybuilder-panel"
          role="tabpanel"
          aria-labelledby="policybuilder-tab"
          hidden={activeTab !== "policybuilder"}
        >
          {activeTab === "policybuilder" && <PolicyBuilderTab />}
        </div>
        {showClusterBrowser && (
          <div
            id="browser-panel"
            role="tabpanel"
            aria-labelledby="browser-tab"
            hidden={activeTab !== "browser"}
          >
            {activeTab === "browser" && (
              <ClusterBrowserTab
                onOpenSettings={() => setShowConfig(true)}
                onSwitchToPolicyBuilder={switchToPolicyBuilder}
              />
            )}
          </div>
        )}
      </main>

      <footer
        className={combineClasses(
          "border-t mt-12",
          neutralColors.bg,
          neutralColors.border
        )}
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className={combineClasses("text-sm", neutralColors.icon)}>
              <p>
                Built with ❤️ for the Kubernetes community •{" "}
                <a
                  href="https://kubernetes.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={combineClasses(
                    "text-k8s-blue dark:text-k8s-lightblue hover:underline",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:rounded",
                    infoColors.ring
                  )}
                >
                  Kubernetes
                </a>
              </p>
            </div>
            <nav
              className={combineClasses(
                "flex items-center gap-4 text-sm",
                neutralColors.icon
              )}
              aria-label="Footer navigation"
            >
              <a
                href="https://github.com/djryanj/k8s-rbactory-frontend/issues"
                target="_blank"
                rel="noopener noreferrer"
                className={combineClasses(
                  "hover:text-k8s-blue dark:hover:text-k8s-lightblue transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:rounded",
                  infoColors.ring
                )}
              >
                Report Issue
              </a>
              <span aria-hidden="true">•</span>
              <a
                href="https://github.com/djryanj/k8s-rbactory-frontend/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className={combineClasses(
                  "hover:text-k8s-blue dark:hover:text-k8s-lightblue transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:rounded",
                  infoColors.ring
                )}
              >
                Apache License 2.0
              </a>
            </nav>
          </div>
        </div>
      </footer>

      {showConfig && <ConfigModal onClose={() => setShowConfig(false)} />}
    </div>
  );
};

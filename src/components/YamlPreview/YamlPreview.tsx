// src/components/YamlPreview/YamlPreview.tsx
import React, { useState, useMemo } from "react";
import { useRBAC } from "../../context/rbac";
import {
  generateCompleteYAML,
  generateRoleYAML,
  generateBindingYAML,
  downloadYAML,
} from "../../utils/yamlGenerator";
import {
  Download,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";

type ViewMode = "combined" | "role" | "binding";

export const YamlPreview: React.FC = () => {
  const { manifest } = useRBAC();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("combined");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const successColors = ACCESSIBLE_COLORS.success;
  const warningColors = ACCESSIBLE_COLORS.warning;
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  // Generate YAML based on view mode
  const yamlContent = useMemo(() => {
    try {
      switch (viewMode) {
        case "role":
          return generateRoleYAML(manifest);
        case "binding":
          return generateBindingYAML(manifest);
        case "combined":
        default:
          return generateCompleteYAML(manifest);
      }
    } catch (error) {
      return `# Error generating YAML\n# ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }, [manifest, viewMode]);

  // Validation checks
  const validationIssues = useMemo(() => {
    const issues: string[] = [];

    if (manifest.role.permissions.length === 0) {
      issues.push("No resource permissions defined");
    }

    const permissionsWithoutVerbs = manifest.role.permissions.filter(
      (p) => p.verbs.length === 0
    );
    if (permissionsWithoutVerbs.length > 0) {
      issues.push(
        `${permissionsWithoutVerbs.length} resource(s) have no verbs selected`
      );
    }

    if (manifest.binding.subjects.length === 0) {
      issues.push("No subjects assigned to the role binding");
    }

    return issues;
  }, [manifest]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(yamlContent);
      setCopied(true);
      announceToScreenReader("YAML copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      announceToScreenReader("Failed to copy YAML to clipboard");
    }
  };

  const handleCopy = () => {
    void copyToClipboard();
  };

  const handleDownload = () => {
    const filename =
      viewMode === "combined"
        ? `${manifest.role.name}-rbac.yaml`
        : viewMode === "role"
        ? `${manifest.role.name}-role.yaml`
        : `${manifest.binding.name}-binding.yaml`;

    downloadYAML(yamlContent, filename);
    announceToScreenReader(`Downloaded ${filename}`);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    announceToScreenReader(
      `Viewing ${
        mode === "combined"
          ? "combined Role and Binding"
          : mode === "role"
          ? "Role only"
          : "Binding only"
      }`
    );
  };

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    announceToScreenReader(
      `YAML preview ${newState ? "collapsed" : "expanded"}`
    );
  };

  const getLineCount = () => {
    return yamlContent.split("\n").length;
  };

  const viewModeLabels: Record<ViewMode, string> = {
    combined: "Combined Role and Binding",
    role: "Role Only",
    binding: "Binding Only",
  };

  return (
    <section
      className={combineClasses(
        "rounded-lg border overflow-hidden",
        neutralColors.bg,
        neutralColors.border
      )}
      aria-labelledby="yaml-preview-heading"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-900 dark:to-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText
              className="text-green-400 dark:text-green-300"
              size={20}
              aria-hidden="true"
            />
            <h3
              id="yaml-preview-heading"
              className="text-lg font-semibold text-white"
            >
              YAML Preview
            </h3>
            <span
              className="text-xs text-gray-300 dark:text-gray-400 bg-gray-600 dark:bg-gray-700 px-2 py-1 rounded"
              aria-label={`${getLineCount()} lines of YAML`}
            >
              {getLineCount()} lines
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleCollapse}
            className={combineClasses(
              "text-gray-300 dark:text-gray-400 hover:text-white transition-all p-2 rounded",
              "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white"
            )}
            aria-label={
              isCollapsed ? "Expand YAML preview" : "Collapse YAML preview"
            }
            aria-expanded={!isCollapsed}
            aria-controls="yaml-content"
          >
            {isCollapsed ? (
              <Eye size={20} aria-hidden="true" />
            ) : (
              <EyeOff size={20} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* View Mode Tabs */}
        {!isCollapsed && (
          <div
            className="flex gap-2 mt-3"
            role="tablist"
            aria-label="YAML view mode"
          >
            {(["combined", "role", "binding"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={viewMode === mode}
                aria-controls="yaml-content"
                onClick={() => handleViewModeChange(mode)}
                className={combineClasses(
                  "px-3 py-1.5 rounded text-sm font-medium transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white",
                  viewMode === mode
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "bg-gray-600 dark:bg-gray-800 text-gray-200 dark:text-gray-300 hover:bg-gray-500 dark:hover:bg-gray-700"
                )}
              >
                {mode === "combined"
                  ? "Combined"
                  : mode === "role"
                  ? "Role Only"
                  : "Binding Only"}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div id="yaml-content">
          {/* Validation Warnings */}
          {validationIssues.length > 0 && (
            <div
              className={combineClasses(
                "border-b px-4 py-3",
                warningColors.bg,
                warningColors.border
              )}
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className={combineClasses(
                    "flex-shrink-0 mt-0.5",
                    warningColors.icon
                  )}
                  size={18}
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <p
                    className={combineClasses(
                      "text-sm font-medium mb-1",
                      warningColors.text
                    )}
                  >
                    Validation Warnings
                  </p>
                  <ul
                    className={combineClasses(
                      "text-sm space-y-1",
                      warningColors.text
                    )}
                    aria-label="Validation issues"
                  >
                    {validationIssues.map((issue, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span
                          className={combineClasses(
                            "w-1 h-1 rounded-full",
                            "bg-yellow-600 dark:bg-yellow-400"
                          )}
                          aria-hidden="true"
                        ></span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* YAML Content */}
          <div className="relative">
            <pre
              className="bg-gray-900 dark:bg-black text-gray-100 dark:text-gray-200 p-4 overflow-x-auto text-sm font-mono leading-relaxed max-h-96 overflow-y-auto"
              aria-label={`${viewModeLabels[viewMode]} YAML content`}
              role="region"
              tabIndex={0}
            >
              <code className="language-yaml">{yamlContent}</code>
            </pre>

            {/* Action Buttons */}
            <div
              className="absolute top-2 right-2 flex gap-2"
              role="group"
              aria-label="YAML actions"
            >
              <button
                type="button"
                onClick={handleCopy}
                className={combineClasses(
                  "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  "bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700 text-white",
                  "focus:ring-white"
                )}
                aria-label={
                  copied ? "YAML copied to clipboard" : "Copy YAML to clipboard"
                }
              >
                {copied ? (
                  <>
                    <Check size={16} aria-hidden="true" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} aria-hidden="true" />
                    Copy
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className={combineClasses(
                  "flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  successColors.bg,
                  "text-white",
                  successColors.hover,
                  "focus:ring-white"
                )}
                aria-label="Download YAML file"
              >
                <Download size={16} aria-hidden="true" />
                Download
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div
            className={combineClasses(
              "border-t px-4 py-3",
              "bg-gray-50 dark:bg-gray-700/50",
              neutralColors.border
            )}
          >
            <dl
              className={combineClasses(
                "flex items-center justify-between text-xs flex-wrap gap-2",
                neutralColors.icon
              )}
            >
              <div className="flex items-center gap-4">
                <div>
                  <dt className="inline font-medium">Role: </dt>
                  <dd className="inline">{manifest.role.name}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Binding: </dt>
                  <dd className="inline">{manifest.binding.name}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Scope: </dt>
                  <dd className="inline">
                    {manifest.role.namespace
                      ? `Namespace (${manifest.role.namespace})`
                      : "Cluster-wide"}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <dt className="inline font-medium">Resources: </dt>
                  <dd className="inline">{manifest.role.permissions.length}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">Subjects: </dt>
                  <dd className="inline">{manifest.binding.subjects.length}</dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Usage Instructions */}
          <div
            className={combineClasses(
              "border-t px-4 py-3",
              infoColors.bg,
              infoColors.border
            )}
          >
            <details
              className="group"
              open={showInstructions}
              onToggle={(e) =>
                setShowInstructions((e.target as HTMLDetailsElement).open)
              }
            >
              <summary
                className={combineClasses(
                  "cursor-pointer text-sm font-medium flex items-center gap-2 list-none",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 rounded",
                  infoColors.text,
                  infoColors.ring
                )}
                tabIndex={0}
                role="button"
                aria-expanded={showInstructions}
              >
                <ChevronRight
                  size={16}
                  className="transform transition-transform group-open:rotate-90"
                  aria-hidden="true"
                />
                How to apply this YAML
              </summary>
              <div
                className={combineClasses(
                  "mt-3 space-y-2 text-sm",
                  infoColors.text
                )}
                role="region"
                aria-label="YAML application instructions"
              >
                <div>
                  <p className="font-medium">Option 1: Direct apply</p>
                  <pre
                    className={combineClasses(
                      "p-2 rounded text-xs overflow-x-auto mt-1",
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                    )}
                    tabIndex={0}
                    role="code"
                  >
                    kubectl apply -f {manifest.role.name}-rbac.yaml
                  </pre>
                </div>

                <div>
                  <p className="font-medium mt-3">Option 2: Copy and pipe</p>
                  <pre
                    className={combineClasses(
                      "p-2 rounded text-xs overflow-x-auto mt-1",
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                    )}
                    tabIndex={0}
                    role="code"
                  >
                    cat &lt;&lt;EOF | kubectl apply -f -{"\n"}
                    {yamlContent.split("\n").slice(0, 3).join("\n")}
                    {"\n"}
                    ...{"\n"}
                    EOF
                  </pre>
                </div>

                <div>
                  <p className="font-medium mt-3">Verify the resources:</p>
                  <pre
                    className={combineClasses(
                      "p-2 rounded text-xs overflow-x-auto mt-1",
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                    )}
                    tabIndex={0}
                    role="code"
                  >
                    {manifest.role.namespace
                      ? `kubectl get role,rolebinding -n ${manifest.role.namespace}`
                      : `kubectl get clusterrole,clusterrolebinding | grep ${manifest.role.name}`}
                  </pre>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}

      {/* Screen reader status */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isCollapsed
          ? "YAML preview collapsed"
          : `Viewing ${viewModeLabels[viewMode]}. ${getLineCount()} lines. ${
              validationIssues.length > 0
                ? `${validationIssues.length} validation warning${
                    validationIssues.length === 1 ? "" : "s"
                  }.`
                : "No validation issues."
            }`}
      </div>
    </section>
  );
};

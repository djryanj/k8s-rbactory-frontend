// src/components/RBACVisualizer/shared/ResourceAccessFooter.tsx
import React, { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import type { KubernetesResource, AccessGrant } from "../../../services/api";
import { copyToClipboard } from "../utils/clipboard";
import { downloadYAML } from "../../../utils/yamlGenerator";
import { generateK8sFilename } from "../../../utils/filenameUtils";
import { formatAccessReportYAML } from "../utils/yamlFormatters"; // NEW IMPORT
import {
  ACCESSIBLE_COLORS,
  combineClasses,
  getButtonClasses,
  getCardClasses,
} from "../../../utils/colors";
import { announceToScreenReader } from "../../../utils/accessibility";

interface ResourceAccessFooterProps {
  resource: KubernetesResource;
  accessGrants: AccessGrant[];
}

export const ResourceAccessFooter: React.FC<ResourceAccessFooterProps> = ({
  resource,
  accessGrants,
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null);

  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const successColors = ACCESSIBLE_COLORS.success;

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text, label);
    setCopiedItem(label);
    announceToScreenReader(`${label} copied to clipboard`);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleDownload = (content: string, filename: string, label: string) => {
    downloadYAML(content, filename);
    setDownloadedItem(label);
    announceToScreenReader(`${label} downloaded`);
    setTimeout(() => setDownloadedItem(null), 2000);
  };

  // Use the centralized formatter
  const accessReport = formatAccessReportYAML(resource, accessGrants);
  const filename = generateK8sFilename(
    resource.kind,
    resource.name,
    "access-report"
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Export Access Report */}
        <div className={getCardClasses("accent", "slate")}>
          <div className="flex flex-col gap-3">
            <div>
              <h4
                className={combineClasses(
                  "text-sm font-semibold mb-1 flex items-center gap-2",
                  neutralColors.text
                )}
              >
                <Download size={16} aria-hidden="true" />
                Export Access Report
              </h4>
              <p className={combineClasses("text-xs", neutralColors.icon)}>
                Download or copy a summary of all access grants
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCopy(accessReport, "access-report")}
                title="Copy access report to clipboard"
                className={combineClasses(
                  getButtonClasses("secondary", "slate", "md"),
                  "w-full"
                )}
                aria-label="Copy access report to clipboard"
              >
                {copiedItem === "access-report" ? (
                  <>
                    <Check
                      size={14}
                      className={successColors.icon}
                      aria-hidden="true"
                    />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  handleDownload(accessReport, filename, "access-report")
                }
                title="Download access report"
                className={combineClasses(
                  getButtonClasses("primary", "slate", "md"),
                  "w-full"
                )}
                aria-label="Download access report"
              >
                {downloadedItem === "access-report" ? (
                  <>
                    <Check
                      size={14}
                      className={successColors.icon}
                      aria-hidden="true"
                    />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download size={16} aria-hidden="true" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Resource Metadata */}
        <div className={getCardClasses("accent", "slate")}>
          <div className="flex flex-col gap-2">
            <h4
              className={combineClasses(
                "text-sm font-semibold",
                neutralColors.text
              )}
            >
              Resource Information
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className={neutralColors.icon}>Kind:</span>
                <span
                  className={combineClasses("font-mono", neutralColors.text)}
                >
                  {resource.kind}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={neutralColors.icon}>Name:</span>
                <span
                  className={combineClasses("font-mono", neutralColors.text)}
                >
                  {resource.name}
                </span>
              </div>
              {resource.namespace && (
                <div className="flex justify-between">
                  <span className={neutralColors.icon}>Namespace:</span>
                  <span
                    className={combineClasses("font-mono", neutralColors.text)}
                  >
                    {resource.namespace}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className={neutralColors.icon}>Created:</span>
                <span
                  className={combineClasses("font-mono", neutralColors.text)}
                >
                  {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// src/components/ResourceSelector/CustomResourceForm.tsx
import React, { useState } from "react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";
import { COMMON_CRDS, getCRDsByCategory } from "../../utils/commonCRDs";

interface CustomResourceFormProps {
  onAdd: (name: string, apiGroup: string) => void;
  onCancel: () => void;
  existingResources: string[];
}

export const CustomResourceForm: React.FC<CustomResourceFormProps> = ({
  onAdd,
  onCancel,
  existingResources,
}) => {
  const [resourceName, setResourceName] = useState("");
  const [apiGroup, setApiGroup] = useState("");
  const [error, setError] = useState("");

  const successColors = ACCESSIBLE_COLORS.success;
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const criticalColors = ACCESSIBLE_COLORS.critical;

  const handleCRDSelect = (crdKey: string) => {
    if (!crdKey) return;

    const crd = COMMON_CRDS[crdKey];

    if (crd) {
      setResourceName(crd.name);
      setApiGroup(crd.apiGroup);
      setError("");
      announceToScreenReader(`${crd.displayName} selected and pre-filled`);
    }
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resourceName.trim()) {
      setError("Resource name is required");
      return;
    }

    if (!apiGroup.trim()) {
      setError("API group is required for custom resources");
      return;
    }

    if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(resourceName)) {
      setError("Resource name must be lowercase alphanumeric with hyphens");
      return;
    }

    if (existingResources.includes(resourceName)) {
      setError("This resource is already added");
      return;
    }

    onAdd(resourceName, apiGroup);
  };

  const isFormValid = resourceName.trim() && apiGroup.trim();

  return (
    <form
      onSubmit={validateAndSubmit}
      className={combineClasses(
        "p-4 rounded-lg border",
        "bg-gray-50 dark:bg-gray-800/50",
        neutralColors.border,
      )}
      aria-label="Custom resource form"
    >
      <div className="space-y-3">
        {/* Common CRDs Quick Select */}
        <div>
          <label
            htmlFor="common-crd-select"
            className={combineClasses(
              "block text-sm font-medium mb-2",
              neutralColors.text,
            )}
          >
            Quick Select Common CRD
          </label>
          <select
            id="common-crd-select"
            onChange={(e) => handleCRDSelect(e.target.value)}
            className={combineClasses(
              "w-full px-3 py-2 border-2 rounded-lg transition-all transform-gpu",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "hover:shadow-md focus:shadow-lg",
              "cursor-pointer",
              neutralColors.bg,
              neutralColors.text,
              neutralColors.border,
              infoColors.ring,
            )}
          >
            <option value="">
              -- Select a common CRD or enter custom below --
            </option>
            {Object.entries(getCRDsByCategory()).map(([category, crds]) =>
              crds.length > 0 ? (
                <optgroup key={category} label={category}>
                  {crds.map((crd) => (
                    <option
                      key={`${crd.name}.${crd.apiGroup}`}
                      value={`${crd.name}.${crd.apiGroup}`}
                    >
                      {crd.displayName} ({crd.name})
                    </option>
                  ))}
                </optgroup>
              ) : null,
            )}
          </select>
          <p className={combineClasses("text-xs mt-1", neutralColors.icon)}>
            Select a common CRD to auto-fill the fields below
          </p>
        </div>

        {/* Resource Name and API Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="custom-resource-name"
              className={combineClasses(
                "block text-sm font-medium mb-1",
                neutralColors.text,
              )}
            >
              Resource Name
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            </label>
            <input
              id="custom-resource-name"
              type="text"
              value={resourceName}
              onChange={(e) => {
                setResourceName(e.target.value.toLowerCase());
                setError("");
              }}
              placeholder="myresources"
              autoComplete="off"
              className={combineClasses(
                "w-full px-3 py-2 border-2 rounded-lg transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "hover:shadow-md focus:shadow-lg",
                neutralColors.bg,
                neutralColors.text,
                error ? criticalColors.border : neutralColors.border,
                error ? criticalColors.ring : infoColors.ring,
              )}
              required
              aria-describedby="resource-name-help"
            />
            <p
              id="resource-name-help"
              className={combineClasses("text-xs mt-1", neutralColors.icon)}
            >
              Plural name (e.g., "certificates", "ingressroutes")
            </p>
          </div>

          <div>
            <label
              htmlFor="custom-api-group"
              className={combineClasses(
                "block text-sm font-medium mb-1",
                neutralColors.text,
              )}
            >
              API Group
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            </label>
            <input
              id="custom-api-group"
              type="text"
              value={apiGroup}
              onChange={(e) => {
                setApiGroup(e.target.value);
                setError("");
              }}
              placeholder="mycompany.com"
              autoComplete="off"
              className={combineClasses(
                "w-full px-3 py-2 border-2 rounded-lg transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "hover:shadow-md focus:shadow-lg",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                infoColors.ring,
              )}
              required
              aria-describedby="api-group-help"
            />
            <p
              id="api-group-help"
              className={combineClasses("text-xs mt-1", neutralColors.icon)}
            >
              Domain-style group (e.g., "cert-manager.io")
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            className={combineClasses(
              "p-3 border rounded-lg text-sm",
              criticalColors.bg,
              criticalColors.text,
              criticalColors.border,
            )}
            role="alert"
            aria-live="assertive"
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!isFormValid}
            className={combineClasses(
              "flex-1 px-4 py-2 rounded-lg font-medium transition-all transform-gpu",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "disabled:cursor-not-allowed",
              isFormValid
                ? combineClasses(
                    successColors.bg,
                    "text-white",
                    "border-2 border-transparent",
                    "hover:shadow-lg active:scale-[0.98]",
                    "hover:scale-[1.02]",
                    successColors.hover,
                    successColors.ring,
                  )
                : combineClasses(
                    "bg-gray-300 dark:bg-gray-600",
                    "text-gray-500 dark:text-gray-400",
                    "border-2 border-gray-300 dark:border-gray-600",
                    "opacity-60",
                  ),
            )}
            aria-label={
              isFormValid
                ? `Add custom resource ${resourceName}`
                : "Enter resource name and API group to add"
            }
          >
            Add Custom Resource
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={combineClasses(
              "px-4 py-2 border-2 rounded-lg font-medium transition-all transform-gpu",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "hover:shadow-md active:scale-[0.98]",
              "hover:scale-[1.02]",
              neutralColors.text,
              neutralColors.border,
              neutralColors.hover,
              neutralColors.ring,
            )}
            aria-label="Cancel adding custom resource"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

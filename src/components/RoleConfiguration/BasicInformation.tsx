// src/components/RoleConfiguration/BasicInformation.tsx
import React, { useState, useEffect } from "react";
import { useRBAC } from "../../context/rbac";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";

export const BasicInformation: React.FC = () => {
  const {
    manifest,
    updateRoleName,
    updateBindingName,
    validationErrors,
    resetCounter,
  } = useRBAC();

  const [touchedFields, setTouchedFields] = useState({
    roleName: false,
    bindingName: false,
  });

  const criticalColors = ACCESSIBLE_COLORS.critical;
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  useEffect(() => {
    setTouchedFields({
      roleName: false,
      bindingName: false,
    });
  }, [resetCounter]);

  const showRoleNameError =
    touchedFields.roleName && !!validationErrors.roleName;
  const showBindingNameError =
    touchedFields.bindingName && !!validationErrors.bindingName;

  const handleRoleNameChange = (newName: string) => {
    updateRoleName(newName);
  };

  const handleRoleNameBlur = () => {
    setTouchedFields((prev) => ({ ...prev, roleName: true }));
    if (validationErrors.roleName) {
      announceToScreenReader(`Role name error: ${validationErrors.roleName}`);
    }
  };

  const handleBindingNameChange = (newName: string) => {
    updateBindingName(newName);
  };

  const handleBindingNameBlur = () => {
    setTouchedFields((prev) => ({ ...prev, bindingName: true }));
    if (validationErrors.bindingName) {
      announceToScreenReader(
        `Binding name error: ${validationErrors.bindingName}`
      );
    }
  };

  return (
    <div className="space-y-4">
      <h4
        className={combineClasses(
          "text-base font-semibold",
          neutralColors.text
        )}
      >
        Basic Information
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="role-name"
            className={combineClasses(
              "block text-sm font-medium mb-1",
              neutralColors.text
            )}
          >
            Role Name
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <input
            id="role-name"
            type="text"
            value={manifest.role.name}
            onChange={(e) => handleRoleNameChange(e.target.value)}
            onBlur={handleRoleNameBlur}
            placeholder="my-role"
            className={combineClasses(
              "w-full px-3 py-2 border-2 rounded-lg transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "hover:shadow-md focus:shadow-lg",
              neutralColors.bg,
              neutralColors.text,
              showRoleNameError
                ? combineClasses(criticalColors.border, criticalColors.ring)
                : combineClasses(neutralColors.border, infoColors.ring)
            )}
            aria-describedby={
              showRoleNameError ? "role-name-error" : "role-name-hint"
            }
            aria-invalid={showRoleNameError}
            required
          />
          {showRoleNameError ? (
            <p
              id="role-name-error"
              className={combineClasses("mt-1 text-sm", criticalColors.text)}
              role="alert"
              aria-live="polite"
            >
              {validationErrors.roleName}
            </p>
          ) : (
            <span
              id="role-name-hint"
              className={combineClasses(
                "mt-1 text-xs block",
                neutralColors.icon
              )}
            >
              Lowercase alphanumeric characters or hyphens
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="binding-name"
            className={combineClasses(
              "block text-sm font-medium mb-1",
              neutralColors.text
            )}
          >
            Binding Name
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <input
            id="binding-name"
            type="text"
            value={manifest.binding.name}
            onChange={(e) => handleBindingNameChange(e.target.value)}
            onBlur={handleBindingNameBlur}
            placeholder="my-role-binding"
            className={combineClasses(
              "w-full px-3 py-2 border-2 rounded-lg transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "hover:shadow-md focus:shadow-lg",
              neutralColors.bg,
              neutralColors.text,
              showBindingNameError
                ? combineClasses(criticalColors.border, criticalColors.ring)
                : combineClasses(neutralColors.border, infoColors.ring)
            )}
            aria-describedby={
              showBindingNameError ? "binding-name-error" : "binding-name-hint"
            }
            aria-invalid={showBindingNameError}
            required
          />
          {showBindingNameError ? (
            <p
              id="binding-name-error"
              className={combineClasses("mt-1 text-sm", criticalColors.text)}
              role="alert"
              aria-live="polite"
            >
              {validationErrors.bindingName}
            </p>
          ) : (
            <span
              id="binding-name-hint"
              className={combineClasses(
                "mt-1 text-xs block",
                neutralColors.icon
              )}
            >
              Lowercase alphanumeric characters or hyphens
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

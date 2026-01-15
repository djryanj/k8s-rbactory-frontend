// src/components/RoleConfiguration/RoleConfiguration.tsx
import React from "react";
import { Settings } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { BasicInformation } from "./BasicInformation";
import { ScopeSelector } from "./ScopeSelector";
import { SubjectManager } from "./SubjectManager";

export const RoleConfiguration: React.FC = () => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  return (
    <section
      className={combineClasses(
        "rounded-lg border p-6 transform-gpu transition-all space-y-8",
        neutralColors.bg,
        neutralColors.border,
      )}
      aria-labelledby="role-config-heading"
    >
      {/* Main Heading */}
      <div>
        <h3
          id="role-config-heading"
          className={combineClasses(
            "text-xl font-bold mb-2 flex items-center gap-2",
            neutralColors.text,
          )}
        >
          <Settings className={infoColors.icon} size={24} aria-hidden="true" />
          Role Configuration
        </h3>
        <p className={combineClasses("text-sm", neutralColors.icon)}>
          Configure your Kubernetes RBAC role, scope, and subject bindings
        </p>
      </div>

      {/* Divider */}
      <div className={combineClasses("border-t", neutralColors.border)} />

      {/* Basic Information Section */}
      <BasicInformation />

      {/* Divider */}
      <div className={combineClasses("border-t", neutralColors.border)} />

      {/* Scope Selection Section */}
      <ScopeSelector />

      {/* Divider */}
      <div className={combineClasses("border-t", neutralColors.border)} />

      {/* Subject Management Section */}
      <SubjectManager />
    </section>
  );
};

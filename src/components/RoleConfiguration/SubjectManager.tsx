// src/components/RoleConfiguration/SubjectManager.tsx
import React, { useState, useEffect } from "react";
import { type Subject, type SubjectType } from "../../types/rbac.types";
import { useRBAC } from "../../context/rbac";
import { validateSubjectName, ValidationError } from "../../utils/validation";
// Lucide icons - ONLY for UI affordances, NOT for K8s resources
import { Plus, X, UserPlus } from "lucide-react";
import {
  ACCESSIBLE_COLORS,
  combineClasses,
  getButtonClasses,
  getDisabledButtonClasses,
} from "../../utils/colors";
import { announceToScreenReader } from "../../utils/accessibility";
// K8s icon system - matching ResourceCard.tsx pattern
import { K8sResourceIcon } from "@/icons";

export const SubjectManager: React.FC = () => {
  const { manifest, addSubject, removeSubject, resetCounter } = useRBAC();
  const [subjectKind, setSubjectKind] = useState<SubjectType>("User");
  const [subjectName, setSubjectName] = useState("");
  const [subjectNamespace, setSubjectNamespace] = useState("default");
  const [subjectError, setSubjectError] = useState("");
  const [subjectNameTouched, setSubjectNameTouched] = useState(false);

  const criticalColors = ACCESSIBLE_COLORS.critical;
  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const cyanColors = ACCESSIBLE_COLORS.cyan;
  const emeraldColors = ACCESSIBLE_COLORS.emerald;
  const purpleColors = ACCESSIBLE_COLORS.purple;

  const showSubjectError = subjectNameTouched && !!subjectError;
  const canAddSubject = subjectName.trim().length > 0;

  useEffect(() => {
    setSubjectNameTouched(false);
    setSubjectError("");
    setSubjectName("");
    setSubjectKind("User");
    setSubjectNamespace("default");
  }, [resetCounter]);

  const handleAddSubject = () => {
    try {
      validateSubjectName(subjectName, subjectKind);

      const subject: Subject = {
        kind: subjectKind as SubjectType,
        name: subjectName,
        ...(subjectKind === "ServiceAccount" &&
          subjectNamespace && { namespace: subjectNamespace }),
      };

      addSubject(subject);

      announceToScreenReader(
        `${subjectKind} "${subjectName}" added${
          subjectKind === "ServiceAccount" && subjectNamespace
            ? ` in namespace ${subjectNamespace}`
            : ""
        }. Total subjects: ${manifest.binding.subjects.length + 1}.`,
      );

      setSubjectName("");
      setSubjectNamespace("default");
      setSubjectError("");
      setSubjectNameTouched(false);
    } catch (err) {
      if (err instanceof ValidationError) {
        setSubjectError(err.message);
        announceToScreenReader(`Error: ${err.message}`);
      }
    }
  };

  const handleRemoveSubject = (idx: number) => {
    const subject = manifest.binding.subjects[idx];
    if (!subject) return;

    removeSubject(idx);

    announceToScreenReader(
      `${subject.kind} "${subject.name}" removed. ${
        manifest.binding.subjects.length - 1
      } subject${
        manifest.binding.subjects.length - 1 === 1 ? "" : "s"
      } remaining.`,
    );
  };

  const handleSubjectKindChange = (newKind: SubjectType) => {
    setSubjectKind(newKind);
    setSubjectError("");
    setSubjectNameTouched(false);
    announceToScreenReader(`Subject type changed to ${newKind}`);
  };

  const handleSubjectNameBlur = () => {
    setSubjectNameTouched(true);
    if (subjectName.trim()) {
      try {
        validateSubjectName(subjectName, subjectKind);
        setSubjectError("");
      } catch (err) {
        if (err instanceof ValidationError) {
          setSubjectError(err.message);
        }
      }
    }
  };

  const handleSubjectNameChange = (value: string) => {
    setSubjectName(value);
    if (subjectError) {
      setSubjectError("");
    }
  };

  const getSubjectPlaceholder = (kind: SubjectType): string => {
    switch (kind) {
      case "User":
        return "user@example.com";
      case "Group":
        return "developers";
      case "ServiceAccount":
        return "my-service-account";
    }
  };

  const getSubjectColors = (kind: SubjectType) => {
    switch (kind) {
      case "User":
        return cyanColors;
      case "Group":
        return emeraldColors;
      case "ServiceAccount":
        return purpleColors;
    }
  };

  /**
   * Maps RBAC SubjectType to K8s CDN icon kind strings.
   * Matches the pattern used in ResourceCard.tsx
   */
  const getK8sIconKind = (subjectType: SubjectType): string => {
    const mapping: Record<SubjectType, string> = {
      User: "user",
      Group: "group",
      ServiceAccount: "sa",
    };
    return mapping[subjectType];
  };

  return (
    <div className="space-y-4">
      <div>
        <h4
          className={combineClasses(
            "text-base font-semibold flex items-center gap-2",
            neutralColors.text,
          )}
        >
          <UserPlus className={infoColors.icon} size={18} aria-hidden="true" />
          Subjects
        </h4>
        <p className={combineClasses("text-sm mt-1", neutralColors.icon)}>
          Add users, groups, or service accounts that will be granted these
          permissions
        </p>
      </div>

      <form
        key={`subject-form-${resetCounter}`}
        onSubmit={(e) => {
          e.preventDefault();
          handleAddSubject();
        }}
        className="space-y-4"
        aria-label="Add subject form"
      >
        <div>
          <label
            className={combineClasses(
              "block text-sm font-medium mb-2",
              neutralColors.text,
            )}
          >
            Subject Type
          </label>
          <fieldset>
            <legend className="sr-only">Select subject type</legend>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-3"
              role="radiogroup"
            >
              {/* User Option */}
              <label
                className={combineClasses(
                  "flex flex-col gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer transform-gpu",
                  "focus-within:ring-2 focus-within:ring-offset-2",
                  "hover:scale-[1.02] active:scale-[0.99]",
                  subjectKind === "User"
                    ? combineClasses(
                        infoColors.border,
                        infoColors.bg,
                        "shadow-md hover:shadow-lg",
                      )
                    : combineClasses(
                        neutralColors.border,
                        neutralColors.hover,
                        "hover:shadow-md",
                      ),
                  infoColors.ring,
                )}
              >
                <input
                  type="radio"
                  name="subject-type"
                  value="User"
                  checked={subjectKind === "User"}
                  onChange={(e) =>
                    handleSubjectKindChange(e.target.value as SubjectType)
                  }
                  className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)]"
                  aria-label="User"
                  aria-describedby="user-description"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <K8sResourceIcon
                      kind={getK8sIconKind("User")}
                      size={18}
                      className={combineClasses(
                        "transition-all flex-shrink-0",
                        infoColors.icon,
                      )}
                    />
                    <span
                      className={combineClasses(
                        "font-medium",
                        subjectKind === "User"
                          ? infoColors.text
                          : neutralColors.text,
                      )}
                    >
                      User
                    </span>
                    {subjectKind === "User" && (
                      <span
                        className={combineClasses(
                          "ml-auto px-2 py-0.5 rounded text-xs font-medium border",
                          infoColors.bg,
                          infoColors.text,
                          infoColors.border,
                        )}
                        aria-label="Currently selected"
                      >
                        Selected
                      </span>
                    )}
                  </div>
                  <p
                    id="user-description"
                    className={combineClasses("text-sm", neutralColors.icon)}
                  >
                    Individual account
                  </p>
                </div>
              </label>

              {/* Group Option */}
              <label
                className={combineClasses(
                  "flex flex-col gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer transform-gpu",
                  "focus-within:ring-2 focus-within:ring-offset-2",
                  "hover:scale-[1.02] active:scale-[0.99]",
                  subjectKind === "Group"
                    ? combineClasses(
                        infoColors.border,
                        infoColors.bg,
                        "shadow-md hover:shadow-lg",
                      )
                    : combineClasses(
                        neutralColors.border,
                        neutralColors.hover,
                        "hover:shadow-md",
                      ),
                  infoColors.ring,
                )}
              >
                <input
                  type="radio"
                  name="subject-type"
                  value="Group"
                  checked={subjectKind === "Group"}
                  onChange={(e) =>
                    handleSubjectKindChange(e.target.value as SubjectType)
                  }
                  className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)]"
                  aria-label="Group"
                  aria-describedby="group-description"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <K8sResourceIcon
                      kind={getK8sIconKind("Group")}
                      size={18}
                      className={combineClasses(
                        "transition-all flex-shrink-0",
                        infoColors.icon,
                      )}
                    />
                    <span
                      className={combineClasses(
                        "font-medium",
                        subjectKind === "Group"
                          ? infoColors.text
                          : neutralColors.text,
                      )}
                    >
                      Group
                    </span>
                    {subjectKind === "Group" && (
                      <span
                        className={combineClasses(
                          "ml-auto px-2 py-0.5 rounded text-xs font-medium border",
                          infoColors.bg,
                          infoColors.text,
                          infoColors.border,
                        )}
                        aria-label="Currently selected"
                      >
                        Selected
                      </span>
                    )}
                  </div>
                  <p
                    id="group-description"
                    className={combineClasses("text-sm", neutralColors.icon)}
                  >
                    Multiple users
                  </p>
                </div>
              </label>

              {/* Service Account Option */}
              <label
                className={combineClasses(
                  "flex flex-col gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer transform-gpu",
                  "focus-within:ring-2 focus-within:ring-offset-2",
                  "hover:scale-[1.02] active:scale-[0.99]",
                  subjectKind === "ServiceAccount"
                    ? combineClasses(
                        infoColors.border,
                        infoColors.bg,
                        "shadow-md hover:shadow-lg",
                      )
                    : combineClasses(
                        neutralColors.border,
                        neutralColors.hover,
                        "hover:shadow-md",
                      ),
                  infoColors.ring,
                )}
              >
                <input
                  type="radio"
                  name="subject-type"
                  value="ServiceAccount"
                  checked={subjectKind === "ServiceAccount"}
                  onChange={(e) =>
                    handleSubjectKindChange(e.target.value as SubjectType)
                  }
                  className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-[rect(0,0,0,0)]"
                  aria-label="Service Account"
                  aria-describedby="serviceaccount-description"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <K8sResourceIcon
                      kind={getK8sIconKind("ServiceAccount")}
                      size={18}
                      className={combineClasses(
                        "transition-all flex-shrink-0",
                        infoColors.icon,
                      )}
                    />
                    <span
                      className={combineClasses(
                        "font-medium",
                        subjectKind === "ServiceAccount"
                          ? infoColors.text
                          : neutralColors.text,
                      )}
                    >
                      Service Account
                    </span>
                    {subjectKind === "ServiceAccount" && (
                      <span
                        className={combineClasses(
                          "ml-auto px-2 py-0.5 rounded text-xs font-medium border",
                          infoColors.bg,
                          infoColors.text,
                          infoColors.border,
                        )}
                        aria-label="Currently selected"
                      >
                        Selected
                      </span>
                    )}
                  </div>
                  <p
                    id="serviceaccount-description"
                    className={combineClasses("text-sm", neutralColors.icon)}
                  >
                    Pod identity
                  </p>
                </div>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Name and Namespace Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            className={subjectKind === "ServiceAccount" ? "" : "md:col-span-2"}
          >
            <label
              htmlFor="subject-name"
              className={combineClasses(
                "block text-sm font-medium mb-1",
                neutralColors.text,
              )}
            >
              Name
            </label>
            <input
              id="subject-name"
              type="text"
              value={subjectName}
              onChange={(e) => handleSubjectNameChange(e.target.value)}
              onBlur={handleSubjectNameBlur}
              placeholder={getSubjectPlaceholder(subjectKind)}
              autoComplete="off"
              className={combineClasses(
                "w-full px-3 py-2 border-2 rounded-lg transition-all",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "hover:shadow-md focus:shadow-lg",
                neutralColors.bg,
                neutralColors.text,
                showSubjectError
                  ? combineClasses(criticalColors.border, criticalColors.ring)
                  : combineClasses(neutralColors.border, infoColors.ring),
              )}
              aria-describedby={
                showSubjectError ? "subject-name-error" : "subject-name-hint"
              }
              aria-invalid={showSubjectError}
              required
            />
            {!showSubjectError && (
              <span
                id="subject-name-hint"
                className={combineClasses(
                  "text-xs mt-1 block",
                  neutralColors.icon,
                )}
              >
                {subjectKind === "User" && "Email or username"}
                {subjectKind === "Group" && "Group name"}
                {subjectKind === "ServiceAccount" && "Service account name"}
              </span>
            )}
          </div>

          {subjectKind === "ServiceAccount" && (
            <div>
              <label
                htmlFor="subject-namespace"
                className={combineClasses(
                  "block text-sm font-medium mb-1",
                  neutralColors.text,
                )}
              >
                Namespace
              </label>
              <input
                id="subject-namespace"
                type="text"
                value={subjectNamespace}
                onChange={(e) => setSubjectNamespace(e.target.value)}
                placeholder="default"
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
                aria-describedby="subject-namespace-hint"
              />
              <span
                id="subject-namespace-hint"
                className={combineClasses(
                  "text-xs mt-1 block",
                  neutralColors.icon,
                )}
              >
                Where the SA exists
              </span>
            </div>
          )}
        </div>

        {showSubjectError && (
          <div
            id="subject-name-error"
            className={combineClasses(
              "p-2 border rounded text-sm",
              criticalColors.bg,
              criticalColors.text,
              criticalColors.border,
            )}
            role="alert"
            aria-live="assertive"
          >
            {subjectError}
          </div>
        )}

        <button
          type="submit"
          disabled={!canAddSubject}
          className={combineClasses(
            canAddSubject
              ? getButtonClasses("primary", "slate", "md")
              : getDisabledButtonClasses("md"),
            "w-full",
          )}
          aria-label={
            canAddSubject
              ? `Add ${subjectKind} ${subjectName}`
              : "Enter a subject name to add"
          }
        >
          <Plus size={16} aria-hidden="true" />
          Add Subject
        </button>
      </form>

      {/* Subjects List */}
      <div
        role="region"
        aria-labelledby="subjects-list-heading"
        aria-live="polite"
        aria-atomic="false"
      >
        <h5 id="subjects-list-heading" className="sr-only">
          Added Subjects ({manifest.binding.subjects.length})
        </h5>

        {manifest.binding.subjects.length === 0 ? (
          <div
            className={combineClasses(
              "text-center py-6 px-4 rounded-lg",
              "bg-gray-50 dark:bg-gray-800/50",
            )}
            role="status"
          >
            <div className={combineClasses("text-sm", neutralColors.icon)}>
              <p>No subjects added yet.</p>
              <p className="text-xs mt-1">
                Use the form above to add users, groups, or service accounts.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Added subjects list">
            {manifest.binding.subjects.map((subject: Subject, idx: number) => {
              const subjectColors = getSubjectColors(subject.kind);

              return (
                <li
                  key={idx}
                  className={combineClasses(
                    "flex items-center justify-between p-3 rounded-lg border transition-all transform-gpu",
                    "hover:shadow-md hover:scale-[1.01]",
                    "bg-gray-50 dark:bg-gray-700/50",
                    neutralColors.border,
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={combineClasses(
                        "flex-shrink-0 p-2 rounded-lg",
                        subjectColors.bg,
                      )}
                      aria-hidden="true"
                    >
                      <K8sResourceIcon
                        kind={getK8sIconKind(subject.kind)}
                        size={16}
                        className="transition-all flex-shrink-0"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={combineClasses(
                          "font-medium truncate",
                          neutralColors.text,
                        )}
                      >
                        {subject.name}
                      </div>
                      <div
                        className={combineClasses(
                          "text-xs",
                          neutralColors.icon,
                        )}
                      >
                        <span>{subject.kind}</span>
                        {subject.namespace && (
                          <>
                            <span aria-hidden="true"> • </span>
                            <span>
                              <span className="sr-only">in namespace </span>
                              {subject.namespace}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(idx)}
                    className={combineClasses(
                      "flex-shrink-0 p-2 rounded-full transition-all transform-gpu ml-2",
                      "focus:outline-none focus:ring-2 focus:ring-offset-1",
                      "hover:scale-110 active:scale-95",
                      "hover:shadow-md",
                      criticalColors.text,
                      criticalColors.hover,
                      criticalColors.ring,
                    )}
                    aria-label={`Remove ${subject.kind} ${subject.name}${
                      subject.namespace
                        ? ` from namespace ${subject.namespace}`
                        : ""
                    }`}
                    title={`Remove ${subject.name}`}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Summary for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {manifest.binding.subjects.length} subject
        {manifest.binding.subjects.length === 1 ? "" : "s"} added to binding.
        {manifest.binding.subjects.length > 0 && (
          <>
            {" "}
            Subjects:{" "}
            {manifest.binding.subjects
              .map(
                (s: Subject) =>
                  `${s.kind} ${s.name}${
                    s.namespace ? ` in namespace ${s.namespace}` : ""
                  }`,
              )
              .join(", ")}
          </>
        )}
      </div>
    </div>
  );
};

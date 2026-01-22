// src/components/RBACBrowser/components/BrowserFilters.tsx
import React from "react";
import { Search, X, Loader, Filter, Info, AlertTriangle } from "lucide-react";
import { K8sResourceIcon } from "@/icons";
import type { BrowserFiltersProps } from "../types";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import type { FilterState } from "../types";

// Define the valid resource kinds as a type
type ResourceKind =
  | "Role"
  | "ClusterRole"
  | "RoleBinding"
  | "ClusterRoleBinding"
  | "Principal"
  | "Resource";

// Principal type options
const PRINCIPAL_TYPES = [
  {
    value: "ServiceAccount",
    label: "ServiceAccounts",
    shortLabel: "ServiceAccounts",
    description: "Namespace-scoped service identities",
    iconKind: "ServiceAccount" as const,
  },
  {
    value: "User",
    label: "Users",
    shortLabel: "Users",
    description: "Cluster-scoped user identities",
    iconKind: "User" as const,
  },
  {
    value: "Group",
    label: "Groups",
    shortLabel: "Groups",
    description: "Cluster-scoped user groups",
    iconKind: "Group" as const,
  },
] as const;

// Resource type configuration with display info
const RESOURCE_TYPES: Array<{
  kind: ResourceKind;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    kind: "Role",
    label: "Roles",
    shortLabel: "Roles",
    description: "Namespace-scoped permissions",
  },
  {
    kind: "ClusterRole",
    label: "ClusterRoles",
    shortLabel: "Cluster Roles",
    description: "Cluster-wide permissions",
  },
  {
    kind: "RoleBinding",
    label: "RoleBindings",
    shortLabel: "Bindings",
    description: "Namespace-scoped role assignments",
  },
  {
    kind: "ClusterRoleBinding",
    label: "ClusterRoleBindings",
    shortLabel: "Cluster Bindings",
    description: "Cluster-wide role assignments",
  },
  {
    kind: "Principal",
    label: "Principals",
    shortLabel: "Principals",
    description: "Users, groups, and service accounts",
  },
  {
    kind: "Resource",
    label: "Resources",
    shortLabel: "Resources",
    description: "Kubernetes resources and their access",
  },
];

// Common Kubernetes resource types
const KUBERNETES_RESOURCE_TYPES = [
  { value: "secrets", label: "Secrets", icon: "Secret" },
  { value: "configmaps", label: "ConfigMaps", icon: "ConfigMap" },
  { value: "pods", label: "Pods", icon: "Pod" },
  { value: "services", label: "Services", icon: "Service" },
  { value: "deployments", label: "Deployments", icon: "Deployment" },
  { value: "statefulsets", label: "StatefulSets", icon: "StatefulSet" },
  { value: "daemonsets", label: "DaemonSets", icon: "DaemonSet" },
  {
    value: "persistentvolumeclaims",
    label: "PVCs",
    icon: "PersistentVolumeClaim",
  },
] as const;

export const BrowserFilters: React.FC<BrowserFiltersProps> = ({
  filters,
  counts,
  namespaces,
  onFilterChange,
  isLoading,
  filteredCounts,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;
  const warningColors = ACCESSIBLE_COLORS.warning;

  const getCountForKind = (kind: ResourceKind): number => {
    switch (kind) {
      case "Role":
        return counts.roles;
      case "ClusterRole":
        return counts.clusterRoles;
      case "RoleBinding":
        return counts.roleBindings;
      case "ClusterRoleBinding":
        return counts.clusterRoleBindings;
      case "Principal":
        return counts.principals;
      case "Resource":
        return counts.resources ?? 0;
      default:
        return 0;
    }
  };

  const getFilteredCountForKind = (kind: ResourceKind): number | undefined => {
    if (!filteredCounts) return undefined;

    switch (kind) {
      case "Role":
        return filteredCounts.roles;
      case "ClusterRole":
        return filteredCounts.clusterRoles;
      case "RoleBinding":
        return filteredCounts.roleBindings;
      case "ClusterRoleBinding":
        return filteredCounts.clusterRoleBindings;
      case "Principal":
        return filteredCounts.principals;
      case "Resource":
        return filteredCounts.resources;
      default:
        return undefined;
    }
  };

  // Check if namespace filtering is active
  const isNamespaceFiltered =
    ((filters.selectedKind === "Role" ||
      filters.selectedKind === "RoleBinding") &&
      filters.selectedNamespace !== "") ||
    (filters.selectedKind === "Principal" &&
      filters.principalNamespaceFilter !== "") ||
    (filters.selectedKind === "Resource" && filters.selectedNamespace !== "");

  // Check if any filters are active (for clear all button)
  const hasActiveFilters =
    filters.selectedNamespace !== "" ||
    filters.principalNamespaceFilter !== "" ||
    filters.principalTypeFilter !== undefined ||
    filters.resourceTypeFilter !== undefined ||
    filters.searchTerm !== "";

  return (
    <div role="search" aria-label="Search and filter resources">
      {/* Resource Type Button Group */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 gap-2">
          <label
            id="resource-type-label"
            className={combineClasses(
              "block text-xs font-medium",
              neutralColors.text
            )}
          >
            Resource Type
          </label>

          {/* Filter indicators and clear button */}
          <div className="flex items-center gap-2">
            {/* Namespace filter indicator */}
            {isNamespaceFiltered && (
              <span
                className={combineClasses(
                  "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                  warningColors.bg,
                  warningColors.text,
                  warningColors.border
                )}
                role="status"
                aria-label="Counts are filtered by namespace"
              >
                <Filter size={10} aria-hidden="true" />
                <span>Filtered by namespace</span>
              </span>
            )}

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  const updates: Partial<FilterState> = {
                    selectedNamespace: "",
                    principalNamespaceFilter: "",
                    searchTerm: "",
                  };

                  if (filters.principalTypeFilter !== undefined) {
                    updates.principalTypeFilter = undefined;
                  }

                  if (filters.resourceTypeFilter !== undefined) {
                    updates.resourceTypeFilter = undefined;
                  }

                  onFilterChange(updates);
                }}
                className={combineClasses(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all border",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  "hover:shadow-sm",
                  neutralColors.text,
                  neutralColors.border,
                  neutralColors.hover,
                  neutralColors.ring
                )}
                aria-label="Clear all active filters"
                title="Clear all filters"
              >
                <X size={12} aria-hidden="true" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Resource type buttons grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2"
          role="radiogroup"
          aria-labelledby="resource-type-label"
        >
          {RESOURCE_TYPES.map((type) => {
            const totalCount = getCountForKind(type.kind);
            const filteredCount = getFilteredCountForKind(type.kind);
            const displayCount = filteredCount ?? totalCount;
            const isSelected = filters.selectedKind === type.kind;
            const showFiltered =
              filteredCount !== undefined && filteredCount !== totalCount;

            return (
              <button
                key={type.kind}
                type="button"
                onClick={() => onFilterChange({ selectedKind: type.kind })}
                disabled={isLoading}
                className={combineClasses(
                  "relative px-3 py-3 rounded-lg border-2 transition-all text-left",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  "hover:shadow-md active:scale-[0.98]",
                  "transform-gpu",
                  "disabled:cursor-not-allowed disabled:opacity-75",
                  isSelected
                    ? combineClasses(
                        infoColors.bg,
                        infoColors.text,
                        infoColors.border,
                        "shadow-sm",
                        infoColors.ring
                      )
                    : combineClasses(
                        neutralColors.bg,
                        neutralColors.text,
                        neutralColors.border,
                        neutralColors.hover,
                        neutralColors.ring
                      )
                )}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${type.label}: ${
                  isLoading
                    ? "loading"
                    : showFiltered
                      ? `${displayCount} of ${totalCount} items in selected namespace`
                      : `${displayCount} items`
                }. ${type.description}`}
                aria-busy={isLoading}
                title={type.description}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div
                    className={combineClasses(
                      "absolute top-2 right-2 w-2 h-2 rounded-full",
                      "bg-blue-600 dark:bg-blue-400"
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Filtered indicator */}
                {showFiltered && !isSelected && (
                  <div
                    className={combineClasses(
                      "absolute top-2 right-2",
                      warningColors.text
                    )}
                    aria-hidden="true"
                    title="Filtered by namespace"
                  >
                    <Filter size={10} />
                  </div>
                )}

                {/* Icon and content */}
                <div className="flex items-center gap-2">
                  {/* Kubernetes Icon */}
                  <K8sResourceIcon
                    kind={type.kind}
                    size={24}
                    className={combineClasses(
                      "flex-shrink-0 transition-colors",
                      isSelected ? infoColors.icon : neutralColors.icon
                    )}
                    aria-hidden="true"
                  />

                  {/* Label and count */}
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-semibold leading-tight truncate">
                      {type.shortLabel}
                    </span>

                    {/* Count or Loading State */}
                    {isLoading ? (
                      <span
                        className={combineClasses(
                          "flex items-center gap-1 text-xs font-medium",
                          isSelected
                            ? "opacity-90"
                            : combineClasses("opacity-70", neutralColors.icon)
                        )}
                      >
                        <Loader
                          size={10}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                        <span>Loading...</span>
                      </span>
                    ) : showFiltered &&
                      type.kind === "Principal" &&
                      filters.principalNamespaceFilter ? (
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={combineClasses(
                            "text-xs font-medium",
                            isSelected
                              ? "opacity-90"
                              : combineClasses("opacity-70", neutralColors.icon)
                          )}
                        >
                          {displayCount}
                        </span>
                        <span
                          className={combineClasses(
                            "text-[10px] font-normal",
                            isSelected
                              ? "opacity-70"
                              : combineClasses("opacity-50", neutralColors.icon)
                          )}
                        >
                          ServiceAccounts
                        </span>
                      </div>
                    ) : showFiltered ? (
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={combineClasses(
                            "text-xs font-medium",
                            isSelected
                              ? "opacity-90"
                              : combineClasses("opacity-70", neutralColors.icon)
                          )}
                        >
                          {displayCount}
                        </span>
                        <span
                          className={combineClasses(
                            "text-[10px] font-normal",
                            isSelected
                              ? "opacity-70"
                              : combineClasses("opacity-50", neutralColors.icon)
                          )}
                        >
                          of {totalCount}
                        </span>
                      </div>
                    ) : (
                      <span
                        className={combineClasses(
                          "text-xs font-medium",
                          isSelected
                            ? "opacity-90"
                            : combineClasses("opacity-70", neutralColors.icon)
                        )}
                      >
                        {displayCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Namespace and Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Namespace Filter - Show for Role/RoleBinding/Resource */}
        {(filters.selectedKind === "Role" ||
          filters.selectedKind === "RoleBinding" ||
          filters.selectedKind === "Resource") && (
          <div>
            <label
              htmlFor="namespace-filter"
              className={combineClasses(
                "block text-xs font-medium mb-1",
                neutralColors.text
              )}
            >
              Namespace
            </label>
            <select
              id="namespace-filter"
              value={filters.selectedNamespace}
              onChange={(e) =>
                onFilterChange({ selectedNamespace: e.target.value })
              }
              disabled={isLoading}
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "disabled:cursor-not-allowed disabled:opacity-60",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                infoColors.ring
              )}
              aria-label="Filter by namespace"
            >
              <option value="">All Namespaces</option>
              {namespaces.map((ns) => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Principal Namespace Filter */}
        {filters.selectedKind === "Principal" && (
          <div>
            <label
              htmlFor="principal-namespace-filter"
              className={combineClasses(
                "block text-xs font-medium mb-1",
                neutralColors.text
              )}
            >
              Namespace
            </label>
            <select
              id="principal-namespace-filter"
              value={filters.principalNamespaceFilter}
              onChange={(e) => {
                const newNamespace = e.target.value;

                // Check if current type is incompatible with namespace filtering
                if (
                  newNamespace &&
                  filters.principalTypeFilter &&
                  filters.principalTypeFilter !== "ServiceAccount"
                ) {
                  // Don't allow namespace selection for User/Group
                  return;
                }

                // When selecting a namespace, auto-select ServiceAccounts if no type is selected
                if (newNamespace && !filters.principalTypeFilter) {
                  onFilterChange({
                    principalNamespaceFilter: newNamespace,
                    principalTypeFilter: "ServiceAccount",
                  });
                } else if (!newNamespace) {
                  // When clearing namespace, clear type filter too
                  const updates: Partial<FilterState> = {
                    principalNamespaceFilter: "",
                  };

                  if (filters.principalTypeFilter !== undefined) {
                    updates.principalTypeFilter = undefined;
                  }

                  onFilterChange(updates);
                } else {
                  onFilterChange({ principalNamespaceFilter: newNamespace });
                }
              }}
              disabled={
                isLoading ||
                (filters.principalTypeFilter !== undefined &&
                  filters.principalTypeFilter !== "ServiceAccount")
              }
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "disabled:cursor-not-allowed disabled:opacity-60",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                infoColors.ring
              )}
              aria-label="Filter principals by namespace"
            >
              <option value="">All Namespaces</option>
              {namespaces.map((ns) => (
                <option key={ns} value={ns}>
                  {ns}
                </option>
              ))}
            </select>
            {filters.principalNamespaceFilter &&
              filters.principalTypeFilter === "ServiceAccount" && (
                <p
                  className={combineClasses(
                    "text-xs mt-1 flex items-start gap-1.5",
                    "text-blue-700 dark:text-blue-300"
                  )}
                >
                  <Info
                    size={12}
                    className="flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>
                    Showing only ServiceAccounts in this namespace. Users and
                    Groups are cluster-scoped.
                  </span>
                </p>
              )}
          </div>
        )}

        {/* Resource Type Filter - Only show for Resource kind */}
        {filters.selectedKind === "Resource" && (
          <div>
            <label
              htmlFor="resource-type-filter"
              className={combineClasses(
                "block text-xs font-medium mb-1",
                neutralColors.text
              )}
            >
              Resource Type
            </label>
            <select
              id="resource-type-filter"
              value={filters.resourceTypeFilter || ""}
              onChange={(e) =>
                onFilterChange({
                  resourceTypeFilter: e.target.value || undefined,
                })
              }
              disabled={isLoading}
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "disabled:cursor-not-allowed disabled:opacity-60",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                infoColors.ring
              )}
              aria-label="Filter by resource type"
            >
              <option value="">Select Resource Type</option>
              {KUBERNETES_RESOURCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {filters.resourceTypeFilter && (
              <p
                className={combineClasses(
                  "text-xs mt-1 flex items-start gap-1.5",
                  "text-blue-700 dark:text-blue-300"
                )}
              >
                <Info
                  size={12}
                  className="flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  Showing {filters.resourceTypeFilter} and their RBAC access
                  information
                </span>
              </p>
            )}
          </div>
        )}

        {/* Search Input */}
        <div
          className={
            filters.selectedKind === "Principal" ||
            filters.selectedKind === "Role" ||
            filters.selectedKind === "RoleBinding" ||
            filters.selectedKind === "Resource"
              ? ""
              : "md:col-span-2"
          }
        >
          <label
            htmlFor="search-input"
            className={combineClasses(
              "flex items-center justify-between text-xs font-medium mb-1",
              neutralColors.text
            )}
          >
            <span>Search</span>
            {filters.searchTerm && (
              <span
                className={combineClasses("font-normal", neutralColors.icon)}
              >
                Press{" "}
                <kbd className="px-1 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600">
                  ESC
                </kbd>{" "}
                to clear
              </span>
            )}
          </label>
          <div className="relative">
            <Search
              className={combineClasses(
                "absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none",
                neutralColors.icon
              )}
              size={16}
              aria-hidden="true"
            />
            <input
              id="search-input"
              type="text"
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  onFilterChange({ searchTerm: "" });
                  e.currentTarget.blur();
                }
              }}
              disabled={isLoading}
              placeholder="Search by name..."
              className={combineClasses(
                "w-full pl-9 pr-9 py-2 border rounded-lg text-sm transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-1",
                "disabled:cursor-not-allowed disabled:opacity-60",
                neutralColors.bg,
                neutralColors.text,
                neutralColors.border,
                infoColors.ring
              )}
              aria-label="Search resources by name"
              aria-describedby={
                filters.searchTerm ? "search-clear-hint" : undefined
              }
            />
            {filters.searchTerm && !isLoading && (
              <>
                <span id="search-clear-hint" className="sr-only">
                  Press Escape to clear search
                </span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ searchTerm: "" })}
                  className={combineClasses(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-600",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    neutralColors.icon,
                    "hover:text-gray-600 dark:hover:text-gray-300",
                    infoColors.ring
                  )}
                  title="Clear search (Esc)"
                  aria-label="Clear search"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Principal Type Button Group - Now on its own row */}
      {filters.selectedKind === "Principal" && (
        <div className="mt-3">
          <label
            id="principal-type-label"
            className={combineClasses(
              "block text-xs font-medium mb-1",
              neutralColors.text
            )}
          >
            Principal Type
          </label>
          <div
            className="grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-labelledby="principal-type-label"
          >
            {PRINCIPAL_TYPES.map((type) => {
              const isSelected = filters.principalTypeFilter === type.value;
              const isDisabled =
                isLoading ||
                (type.value !== "ServiceAccount" &&
                  filters.principalNamespaceFilter !== "");

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    if (type.value === "User" || type.value === "Group") {
                      onFilterChange({
                        principalTypeFilter: type.value,
                        principalNamespaceFilter: "",
                      });
                    } else {
                      onFilterChange({ principalTypeFilter: type.value });
                    }
                  }}
                  disabled={isDisabled}
                  className={combineClasses(
                    "px-3 py-2 rounded-lg border-2 transition-all text-left",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    "hover:shadow-md active:scale-[0.98]",
                    "transform-gpu",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    isSelected
                      ? combineClasses(
                          infoColors.bg,
                          infoColors.text,
                          infoColors.border,
                          "shadow-sm",
                          infoColors.ring
                        )
                      : combineClasses(
                          neutralColors.bg,
                          neutralColors.text,
                          neutralColors.border,
                          neutralColors.hover,
                          neutralColors.ring
                        )
                  )}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${type.label}. ${type.description}`}
                  title={type.description}
                >
                  {/* Icon and content */}
                  <div className="flex items-center gap-2">
                    {/* Kubernetes Icon */}
                    <K8sResourceIcon
                      kind={type.iconKind}
                      size={20}
                      className={combineClasses(
                        "flex-shrink-0 transition-colors",
                        isSelected ? infoColors.icon : neutralColors.icon
                      )}
                      aria-hidden="true"
                    />

                    {/* Label and scope */}
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-sm font-semibold leading-tight">
                        {type.shortLabel}
                      </span>
                      <span
                        className={combineClasses(
                          "text-[10px] font-normal",
                          isSelected
                            ? "opacity-90"
                            : combineClasses("opacity-70", neutralColors.icon)
                        )}
                      >
                        {type.value === "ServiceAccount"
                          ? "Namespace"
                          : "Cluster"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {filters.principalTypeFilter &&
            filters.principalTypeFilter !== "ServiceAccount" && (
              <p
                className={combineClasses(
                  "text-xs mt-1 flex items-start gap-1.5",
                  "text-amber-700 dark:text-amber-300"
                )}
              >
                <AlertTriangle
                  size={12}
                  className="flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>
                  {filters.principalTypeFilter}s are cluster-scoped. Namespace
                  filter is disabled.
                </span>
              </p>
            )}
        </div>
      )}
    </div>
  );
};

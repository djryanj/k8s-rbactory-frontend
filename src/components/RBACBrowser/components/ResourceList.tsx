// src/components/RBACBrowser/components/ResourceList.tsx
import React from "react";
import { Loader, ChevronDown, Search } from "lucide-react";
import { ResourceCard } from "./ResourceCard";
import { PrincipalCard } from "./PrincipalCard";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import type { ResourceListProps } from "../types";

export const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  principals,
  selectedKind,
  selectedResource,
  searchTerm,
  onResourceSelect,
  onPrincipalSelect,
  onImportRole,
  loading,
  autoLoading,
  hasMore,
  onLoadMore,
  onScroll,
  scrollContainerRef,
  totalCount,
  currentCount,
  onClearSearch,
}) => {
  const infoColors = ACCESSIBLE_COLORS.info;
  const successColors = ACCESSIBLE_COLORS.success;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  const filteredResources =
    selectedKind === "Principal"
      ? []
      : resources.filter(
          (resource) =>
            resource?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource?.namespace
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );

  const filteredPrincipals = principals.filter((principal) => {
    if (!principal) return false;

    // Only search filter - type and namespace filtering done in parent
    return (
      principal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      principal.kind?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const displayItems =
    selectedKind === "Principal" ? filteredPrincipals : filteredResources;

  // Empty state
  if (displayItems.length === 0 && !loading) {
    return (
      <div className="text-center py-12 px-4" role="status" aria-live="polite">
        <div
          className={combineClasses(
            "inline-flex items-center justify-center w-16 h-16 rounded-full mb-4",
            neutralColors.bg,
            neutralColors.border,
            "border-2"
          )}
          aria-hidden="true"
        >
          <Search className={neutralColors.icon} size={32} />
        </div>

        <p
          className={combineClasses(
            "text-base font-medium mb-2",
            neutralColors.text
          )}
        >
          {currentCount === 0
            ? `No ${selectedKind.toLowerCase()}s found`
            : "No items match your search"}
        </p>

        {searchTerm && (
          <>
            <p className={combineClasses("text-sm mb-4", neutralColors.icon)}>
              Try adjusting your search term or filters
            </p>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className={combineClasses(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2",
                  infoColors.text,
                  infoColors.hover,
                  infoColors.ring
                )}
                aria-label="Clear search filter"
              >
                Clear search
              </button>
            )}
          </>
        )}

        {currentCount === 0 && !searchTerm && (
          <p className={combineClasses("text-sm", neutralColors.icon)}>
            This cluster doesn't have any {selectedKind.toLowerCase()}s yet
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={onScroll}
      className="space-y-3 max-h-[500px] overflow-y-auto"
      role="region"
      aria-label={`${selectedKind} list`}
      aria-live="polite"
      aria-busy={loading || autoLoading}
    >
      {/* Screen reader announcement for list */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {displayItems.length} {selectedKind.toLowerCase()}
        {displayItems.length !== 1 ? "s" : ""} displayed
        {searchTerm && ` matching "${searchTerm}"`}.
        {hasMore && ` ${totalCount - currentCount} more available.`}
      </div>

      {/* Resource list */}
      {selectedKind !== "Principal" && (
        <div className="space-y-3 p-3">
          {filteredResources.map((resource, index) => {
            const isSelected =
              selectedResource?.name === resource.name &&
              selectedResource?.kind === resource.kind &&
              selectedResource?.namespace === resource.namespace;

            const canImport =
              resource.kind === "Role" || resource.kind === "ClusterRole";

            return (
              <ResourceCard
                key={`${resource.kind}-${
                  resource.namespace || "no-namespace"
                }-${resource.name}-${index}`}
                resource={resource}
                isSelected={isSelected}
                onSelect={() => {
                  void onResourceSelect(resource);
                }}
                {...(canImport && {
                  onImport: () => onImportRole(resource),
                })}
              />
            );
          })}
        </div>
      )}

      {/* Principal list */}
      {selectedKind === "Principal" && (
        <div className="space-y-3 p-3">
          {filteredPrincipals.map((principal, index) => {
            const isSelected =
              selectedResource?.name === principal.name &&
              selectedResource?.kind === principal.kind &&
              selectedResource?.namespace === principal.namespace;

            return (
              <PrincipalCard
                key={`${principal.kind}-${
                  principal.namespace || "no-namespace"
                }-${principal.name}-${index}`}
                principal={principal}
                isSelected={isSelected}
                onSelect={() => {
                  void onPrincipalSelect(principal);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Auto-loading indicator */}
      {autoLoading && (
        <div
          className={combineClasses(
            "flex items-center justify-center py-3 px-4 rounded-lg border",
            successColors.bg,
            successColors.border
          )}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader
            className={combineClasses("animate-spin mr-2", successColors.icon)}
            size={16}
            aria-hidden="true"
          />
          <span
            className={combineClasses(
              "text-sm font-medium",
              successColors.text
            )}
          >
            Loading more items automatically...
          </span>
        </div>
      )}

      {/* Load more button */}
      {hasMore && !autoLoading && !loading && (
        <button
          onClick={onLoadMore}
          className={combineClasses(
            "w-full py-3 px-4 rounded-lg border text-sm font-medium",
            "flex items-center justify-center gap-2 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            neutralColors.bg,
            neutralColors.border,
            neutralColors.text,
            neutralColors.hover,
            neutralColors.ring,
            "min-h-[44px]"
          )}
          aria-label={`Load more ${selectedKind.toLowerCase()}s. ${
            totalCount - currentCount
          } remaining`}
        >
          <ChevronDown size={16} aria-hidden="true" />
          <span>
            Load More
            <span className="sr-only"> {selectedKind.toLowerCase()}s</span>
          </span>
          <span
            className={combineClasses(
              "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ml-1",
              infoColors.bg,
              infoColors.text,
              infoColors.border
            )}
            aria-label={`${totalCount - currentCount} items remaining`}
          >
            {totalCount - currentCount} remaining
          </span>
        </button>
      )}

      {/* End of list indicator */}
      {!hasMore && currentCount > 0 && !autoLoading && (
        <div
          className={combineClasses(
            "text-center py-4 px-4 rounded-lg border",
            neutralColors.bg,
            neutralColors.border
          )}
          role="status"
          aria-live="polite"
        >
          <p
            className={combineClasses(
              "text-sm font-medium",
              neutralColors.text
            )}
          >
            End of list
          </p>
          <p className={combineClasses("text-xs mt-1", neutralColors.icon)}>
            {currentCount} {selectedKind.toLowerCase()}
            {currentCount !== 1 ? "s" : ""} loaded
          </p>
        </div>
      )}
    </div>
  );
};

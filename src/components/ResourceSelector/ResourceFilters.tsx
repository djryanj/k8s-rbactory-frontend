// src/components/ResourceSelector/ResourceFilters.tsx
import React from "react";
import { Search, Filter, XCircle } from "lucide-react";
import { type CategoryKey } from "../../types/rbac.types";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";
import { RESOURCE_CATEGORIES } from "../../utils/resourceMetadata";

interface ResourceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  resultsCount: number;
  selectedCount: number;
  onClearAll?: () => void;
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  resultsCount,
  selectedCount,
  onClearAll,
}) => {
  const neutralColors = ACCESSIBLE_COLORS.neutral;
  const infoColors = ACCESSIBLE_COLORS.info;
  const criticalColors = ACCESSIBLE_COLORS.critical;

  const categories = Object.keys(RESOURCE_CATEGORIES) as CategoryKey[];

  return (
    <div role="search" aria-label="Search and filter resources">
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <label htmlFor="resource-search" className="sr-only">
            Search resources by name or description
          </label>
          <Search
            className={combineClasses(
              "absolute left-3 top-1/2 transform -translate-y-1/2",
              neutralColors.icon
            )}
            size={18}
            aria-hidden="true"
          />
          <input
            id="resource-search"
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={combineClasses(
              "w-full pl-10 pr-3 py-2 border rounded-md transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              neutralColors.bg,
              neutralColors.text,
              neutralColors.border,
              infoColors.ring
            )}
            aria-describedby="search-results-count"
          />
        </div>
        <div className="relative">
          <label htmlFor="category-filter" className="sr-only">
            Filter by category
          </label>
          <Filter
            className={combineClasses(
              "absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none",
              neutralColors.icon
            )}
            size={18}
            aria-hidden="true"
          />
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={combineClasses(
              "pl-10 pr-8 py-2 border rounded-md appearance-none transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              neutralColors.bg,
              neutralColors.text,
              neutralColors.border,
              infoColors.ring
            )}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => {
              const categoryInfo = RESOURCE_CATEGORIES[cat];
              return (
                <option key={cat} value={cat}>
                  {categoryInfo.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Results Summary with Clear All Button */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          id="search-results-count"
          className={combineClasses("text-sm", neutralColors.icon)}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {resultsCount} resource{resultsCount === 1 ? "" : "s"} found
          {selectedCount > 0 && (
            <span className="font-medium"> • {selectedCount} selected</span>
          )}
        </div>

        {/* Clear All Button - Only show when resources are selected */}
        {selectedCount > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className={combineClasses(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "border",
              criticalColors.text,
              criticalColors.hover,
              criticalColors.border,
              criticalColors.ring
            )}
            aria-label={`Clear all ${selectedCount} selected resources`}
          >
            <XCircle size={16} aria-hidden="true" />
            <span>Clear All ({selectedCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};

// src/components/RBACVisualizer/shared/CollapsibleList.tsx
import { useState, useEffect, useId } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../../utils/colors";
import { announceToScreenReader } from "../../../utils/accessibility";
import type { CollapsibleListProps } from "../types";

/**
 * Reusable collapsible list component with "Show More" functionality
 * Fully accessible with ARIA attributes and keyboard navigation
 */
export function CollapsibleList<T>({
  items,
  renderItem,
  initialShowCount = 5,
  emptyMessage = "No items",
  ariaLabel,
}: CollapsibleListProps<T>) {
  const [showAll, setShowAll] = useState(false);
  const listId = useId();
  const buttonId = useId();

  const infoColors = ACCESSIBLE_COLORS.info;
  const neutralColors = ACCESSIBLE_COLORS.neutral;

  useEffect(() => {
    setShowAll(false);
  }, [items.length]);

  const handleToggle = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);

    // Announce to screen readers
    if (newShowAll) {
      announceToScreenReader(`Showing all ${items.length} items`);
    } else {
      announceToScreenReader(
        `Showing ${initialShowCount} of ${items.length} items`
      );
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div
        className={combineClasses(
          "text-sm italic p-3 rounded-lg border",
          neutralColors.icon,
          neutralColors.bg,
          neutralColors.border
        )}
        role="status"
        aria-live="polite"
      >
        {emptyMessage}
      </div>
    );
  }

  const displayItems = showAll ? items : items.slice(0, initialShowCount);
  const hasMore = items.length > initialShowCount;
  const hiddenCount = items.length - initialShowCount;

  return (
    <div role="region" aria-labelledby={buttonId}>
      {/* List container */}
      <div
        id={listId}
        className="space-y-2"
        role="list"
        aria-label={ariaLabel || "Items list"}
        aria-live="polite"
        aria-atomic="false"
      >
        {displayItems.map((item, idx) => (
          <div key={`item-${idx}`} role="listitem">
            {renderItem(item, idx)}
          </div>
        ))}
      </div>

      {/* Screen reader announcement for current state */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Showing {displayItems.length} of {items.length} items
        {hasMore && !showAll && `. ${hiddenCount} more available.`}
      </div>

      {/* Expand/Collapse button */}
      {hasMore && (
        <button
          id={buttonId}
          onClick={handleToggle}
          className={combineClasses(
            "mt-3 w-full flex items-center justify-center gap-2 px-3 py-2",
            "text-sm font-medium rounded-lg border transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            infoColors.text,
            infoColors.hover,
            infoColors.border,
            infoColors.ring,
            "min-h-[44px]" // Touch target size
          )}
          aria-expanded={showAll}
          aria-controls={listId}
          aria-label={
            showAll
              ? `Show less. Currently showing all ${items.length} items`
              : `Show all items. Currently showing ${initialShowCount} of ${items.length} items. ${hiddenCount} more available`
          }
        >
          {showAll ? (
            <>
              <ChevronUp size={16} aria-hidden="true" />
              <span>Show Less</span>
              <span className="sr-only">. Hide {hiddenCount} items</span>
            </>
          ) : (
            <>
              <ChevronDown size={16} aria-hidden="true" />
              <span>Show All</span>
              <span
                className={combineClasses(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ml-1",
                  infoColors.bg,
                  infoColors.text,
                  infoColors.border
                )}
                aria-label={`${hiddenCount} more items`}
              >
                {hiddenCount} more
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

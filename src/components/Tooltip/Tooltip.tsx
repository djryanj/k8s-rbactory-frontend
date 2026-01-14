// src/components/Tooltip/Tooltip.tsx
import React, { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { ACCESSIBLE_COLORS, combineClasses } from "../../utils/colors";

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  iconSize?: number;
  iconClassName?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
  className,
  iconSize = 14,
  iconClassName,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const neutralColors = ACCESSIBLE_COLORS.neutral;

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spacing = 8;

      let top = 0;
      let left = 0;

      switch (side) {
        case "top":
          top = triggerRect.top - tooltipRect.height - spacing;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = triggerRect.bottom + spacing;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - spacing;
          break;
        case "right":
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + spacing;
          break;
      }

      // Keep tooltip within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < spacing) left = spacing;
      if (left + tooltipRect.width > viewportWidth - spacing) {
        left = viewportWidth - tooltipRect.width - spacing;
      }
      if (top < spacing) top = spacing;
      if (top + tooltipRect.height > viewportHeight - spacing) {
        top = viewportHeight - tooltipRect.height - spacing;
      }

      setPosition({ top, left });
    }
  }, [isVisible, side]);

  const handleShow = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 200); // Small delay before showing
  };

  const handleHide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100); // Small delay before hiding
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span className={combineClasses("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={handleShow}
        onMouseLeave={handleHide}
        onFocus={handleShow}
        onBlur={handleHide}
        className={combineClasses(
          "inline-flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-full",
          "transition-colors",
          neutralColors.icon,
          "hover:text-blue-600 dark:hover:text-blue-400",
          "focus:ring-blue-500"
        )}
        aria-label="More information"
        aria-describedby={isVisible ? "tooltip-content" : undefined}
      >
        {children || (
          <HelpCircle
            size={iconSize}
            className={iconClassName}
            aria-hidden="true"
          />
        )}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={combineClasses(
            "fixed z-50 px-3 py-2 rounded-lg shadow-lg border",
            "max-w-xs text-xs leading-relaxed",
            "animate-in fade-in zoom-in-95 duration-200",
            "bg-gray-900 dark:bg-gray-100",
            "text-white dark:text-gray-900",
            "border-gray-700 dark:border-gray-300"
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {content}
          {/* Arrow indicator */}
          <div
            className={combineClasses(
              "absolute w-2 h-2 rotate-45",
              "bg-gray-900 dark:bg-gray-100",
              "border-gray-700 dark:border-gray-300",
              side === "top" &&
                "bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b",
              side === "bottom" &&
                "top-[-5px] left-1/2 -translate-x-1/2 border-l border-t",
              side === "left" &&
                "right-[-5px] top-1/2 -translate-y-1/2 border-t border-r",
              side === "right" &&
                "left-[-5px] top-1/2 -translate-y-1/2 border-b border-l"
            )}
            aria-hidden="true"
          />
        </div>
      )}
    </span>
  );
};

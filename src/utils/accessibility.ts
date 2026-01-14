// src/utils/accessibility.ts
/**
 * Accessibility utilities for improved screen reader support and keyboard navigation
 */

/**
 * Announce a message to screen readers using a live region
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export const announceToScreenReader = (
  message: string,
  priority: "polite" | "assertive" = "polite"
): void => {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Generate a unique ID for ARIA relationships
 * @param prefix - Prefix for the ID
 * @returns A unique ID string
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Trap focus within a container (useful for modals/dialogs)
 * @param container - The container element
 * @returns Cleanup function
 */
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  // Focus first element
  firstElement?.focus();

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
};

/**
 * Create a visually hidden but screen-reader accessible element
 * @param text - The text content
 * @returns The element
 */
export const createScreenReaderOnly = (text: string): HTMLSpanElement => {
  const span = document.createElement("span");
  span.className = "sr-only";
  span.textContent = text;
  return span;
};

/**
 * Check if an element is keyboard focusable
 * @param element - The element to check
 * @returns Whether the element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const tabindex = element.getAttribute("tabindex");
  if (tabindex === "-1") return false;

  const tag = element.tagName.toLowerCase();
  const focusableTags = ["a", "button", "input", "select", "textarea"];

  return (
    focusableTags.includes(tag) ||
    (tabindex !== null && parseInt(tabindex) >= 0)
  );
};

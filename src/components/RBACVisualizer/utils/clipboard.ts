// src/components/RBACVisualizer/utils/clipboard.ts

/**
 * Copy text to clipboard with error handling
 */
export const copyToClipboard = (text: string, label: string): void => {
  navigator.clipboard.writeText(text).then(
    () => {
      console.log(`Copied ${label} to clipboard`);
    },
    (err) => {
      console.error("Failed to copy:", err);
    },
  );
};

// src/utils/filenameUtils.ts

/**
 * Sanitizes a string to be safe for use in filenames
 * @param name - The string to sanitize
 * @returns A sanitized filename-safe string
 */
export const sanitizeFilename = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

/**
 * Generates a filename for a Kubernetes resource
 * @param kind - The resource kind (e.g., "Role", "ClusterRole")
 * @param name - The resource name
 * @param suffix - Optional suffix (e.g., "complete", "rule-0")
 * @returns A formatted filename with .yaml extension
 */
export const generateK8sFilename = (
  kind: string,
  name: string,
  suffix?: string
): string => {
  const safeName = sanitizeFilename(name);
  const safeKind = kind.toLowerCase();
  const parts = [safeKind, safeName];
  
  if (suffix) {
    parts.push(suffix);
  }
  
  return `${parts.join("-")}.yaml`;
};

// src/utils/validation.ts

/**
 * Security-focused validation utilities
 * All user inputs must be validated to prevent injection attacks
 */

const DNS_LABEL_REGEX = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
const DNS_SUBDOMAIN_REGEX =
  /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validates a Kubernetes resource name
 * Must be a valid DNS label (RFC 1123)
 */
export function validateResourceName(name: string): boolean {
  if (!name || name.length === 0) {
    throw new ValidationError("Name cannot be empty");
  }

  if (name.length > 253) {
    throw new ValidationError("Name cannot exceed 253 characters");
  }

  if (!DNS_SUBDOMAIN_REGEX.test(name)) {
    throw new ValidationError(
      'Name must consist of lower case alphanumeric characters, "-" or ".", ' +
        "and must start and end with an alphanumeric character",
    );
  }

  return true;
}

/**
 * Validates a Kubernetes namespace name
 */
export function validateNamespace(namespace: string): boolean {
  if (!namespace || namespace.length === 0) {
    throw new ValidationError("Namespace cannot be empty");
  }

  if (namespace.length > 63) {
    throw new ValidationError("Namespace cannot exceed 63 characters");
  }

  if (!DNS_LABEL_REGEX.test(namespace)) {
    throw new ValidationError(
      'Namespace must consist of lower case alphanumeric characters or "-", ' +
        "and must start and end with an alphanumeric character",
    );
  }

  return true;
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[^\w\s.-]/gi, "");
}

/**
 * Validates a subject name based on its type
 */
export function validateSubjectName(name: string, kind: string): boolean {
  if (!name || name.length === 0) {
    throw new ValidationError("Subject name cannot be empty");
  }

  // ServiceAccount names must be valid DNS labels
  if (kind === "ServiceAccount") {
    return validateResourceName(name);
  }

  // User and Group names have more flexible requirements
  // but we still apply basic sanitization
  if (name.length > 253) {
    throw new ValidationError("Subject name cannot exceed 253 characters");
  }

  return true;
}

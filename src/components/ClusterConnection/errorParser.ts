// src/components/ClusterConnection/errorParser.ts
import {
  ShieldAlert,
  AlertTriangle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ErrorType, type ParsedError } from "./types";

/**
 * Common Kubernetes resources that indicate RBAC issues when access fails
 */
const K8S_RESOURCES = [
  "namespaces",
  "pods",
  "deployments",
  "services",
  "configmaps",
  "secrets",
  "roles",
  "rolebindings",
  "clusterroles",
  "clusterrolebindings",
  "serviceaccounts",
  "nodes",
  "persistentvolumes",
  "persistentvolumeclaims",
  "ingresses",
  "daemonsets",
  "statefulsets",
  "replicasets",
  "jobs",
  "cronjobs",
];

/**
 * Common Kubernetes operations that indicate RBAC issues when they fail
 */
const K8S_OPERATIONS = [
  "list",
  "get",
  "watch",
  "create",
  "update",
  "patch",
  "delete",
];

/**
 * Error payload structure from API
 */
interface ErrorPayload {
  error?: string;
  message?: string;
  statusCode?: number;
  details?: string;
}

/**
 * Extracted error information
 */
interface ExtractedError {
  message: string;
  statusCode?: number;
}

/**
 * Attempts to parse error as JSON
 */
const tryParseJSON = (error: string): ErrorPayload | null => {
  try {
    const parsed = JSON.parse(error);
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Extracts the actual error message from various formats
 */
const extractErrorMessage = (error: string): ExtractedError => {
  // Try to parse as JSON first
  const jsonPayload = tryParseJSON(error);
  if (jsonPayload) {
    // Extract message with proper fallback handling
    const message: string = 
      jsonPayload.error ?? 
      jsonPayload.message ?? 
      error;
    
    const statusCode = jsonPayload.statusCode;
    
    // Only include statusCode if it's defined
    if (statusCode !== undefined) {
      return { message, statusCode };
    }
    return { message };
  }

  // Check if it's a structured error string (e.g., "500: message")
  const statusCodeMatch = error.match(/^(\d{3}):\s*(.+)$/);
  if (statusCodeMatch) {
    const statusCodeStr = statusCodeMatch[1];
    const messageStr = statusCodeMatch[2];
    
    if (statusCodeStr && messageStr) {
      return {
        message: messageStr,
        statusCode: parseInt(statusCodeStr, 10),
      };
    }
  }

  return { message: error };
};

/**
 * Extracts resource name from Kubernetes error messages
 */
const extractResource = (error: string): string => {
  const resourceMatch = error.match(/resource "([^"]+)"/);
  if (resourceMatch) {
    const resource = resourceMatch[1];
    if (resource) {
      return resource;
    }
  }

  // Check for resource names in "Failed to [operation] [resource]" pattern
  const lowerError = error.toLowerCase();
  for (const resource of K8S_RESOURCES) {
    if (lowerError.includes(resource)) {
      return resource;
    }
  }

  return "resource";
};

/**
 * Extracts operation from error messages
 */
const extractOperation = (error: string): string | null => {
  const lowerError = error.toLowerCase();
  
  // Check for "cannot [operation]" pattern
  const cannotMatch = lowerError.match(/cannot\s+(\w+)/);
  if (cannotMatch) {
    const operation = cannotMatch[1];
    if (operation) {
      return operation;
    }
  }

  // Check for "failed to [operation]" pattern
  const failedMatch = lowerError.match(/failed\s+to\s+(\w+)/);
  if (failedMatch) {
    const operation = failedMatch[1];
    if (operation) {
      return operation;
    }
  }

  // Check for any known operations
  for (const operation of K8S_OPERATIONS) {
    if (lowerError.includes(operation)) {
      return operation;
    }
  }

  return null;
};

/**
 * Extracts user/service account from Kubernetes error messages
 */
const extractUser = (error: string): string | null => {
  const userMatch = error.match(/User "([^"]+)"/);
  if (userMatch) {
    const user = userMatch[1];
    if (user) {
      return user;
    }
  }
  return null;
};

/**
 * Checks if error is related to Kubernetes resource operations
 */
const isResourceOperationError = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  
  // Check for resource names
  const hasResource = K8S_RESOURCES.some((resource) =>
    lowerMessage.includes(resource)
  );
  
  // Check for operations
  const hasOperation = K8S_OPERATIONS.some((operation) =>
    lowerMessage.includes(operation)
  );
  
  // Check for failure patterns
  const hasFailurePattern =
    lowerMessage.includes("failed to") ||
    lowerMessage.includes("unable to") ||
    lowerMessage.includes("could not");
  
  return hasResource && (hasOperation || hasFailurePattern);
};

/**
 * Parses RBAC/Permission errors
 */
const parseRBACError = (message: string, originalError: string): ParsedError => {
  const resource = extractResource(message);
  const operation = extractOperation(message);
  const user = extractUser(message);

  const operationText = operation ? `'${operation}'` : "access";
  
  // Build a more informative message with user context if available
  const baseMessage = `The service account lacks permission to ${operationText} ${resource}.`;
  const userContext = user ? ` (User: ${user})` : "";
  
  return {
    type: ErrorType.RBAC,
    title: "Insufficient Permissions",
    message: baseMessage + userContext,
    details: originalError,
    suggestions: [
      user
        ? `Verify the service account "${user}" has the necessary ClusterRole and/or Role bindings`
        : "Verify the service account has the necessary ClusterRole or Role bindings",
      operation
        ? `Grant '${operation}' permission for ${resource}`
        : `Grant appropriate permissions for ${resource}`,
      "Check if the namespace-scoped permissions are correctly configured",
      "Ensure the service account exists and is properly configured",
      "Review the RBAC configuration documentation at: https://github.com/djryanj/k8s-rbactory-backend?tab=readme-ov-file#service-account-with-proper-rbac",
    ],
    icon: ShieldAlert,
  };
};

/**
 * Parses authentication errors
 */
const parseAuthenticationError = (originalError: string): ParsedError => {
  return {
    type: ErrorType.AUTHENTICATION,
    title: "Authentication Failed",
    message: "Unable to authenticate with the Kubernetes cluster.",
    details: originalError,
    suggestions: [
      "Verify your kubeconfig file is valid and up-to-date",
      "Check if your authentication token has expired",
      "Ensure the cluster URL and credentials are correct",
      "Try refreshing your cluster credentials",
    ],
    icon: ShieldAlert,
  };
};

/**
 * Parses network connectivity errors
 */
const parseNetworkError = (originalError: string): ParsedError => {
  return {
    type: ErrorType.NETWORK,
    title: "Connection Failed",
    message: "Unable to reach the Kubernetes cluster.",
    details: originalError,
    suggestions: [
      "Verify the backend API URL is correct and accessible",
      "Check your network connection",
      "Ensure any VPN or proxy settings are configured correctly",
      "Verify the cluster is running and accepting connections",
    ],
    icon: AlertTriangle,
  };
};

/**
 * Parses server errors (5xx)
 */
const parseServerError = (
  message: string,
  originalError: string
): ParsedError => {
  // Check if it's actually an RBAC issue disguised as a server error
  if (isResourceOperationError(message)) {
    return parseRBACError(message, originalError);
  }

  return {
    type: ErrorType.SERVER,
    title: "Server Error",
    message: "The Kubernetes API server encountered an error.",
    details: originalError,
    suggestions: [
      "Check the Kubernetes API server logs for more details",
      "Verify the cluster is healthy and all control plane components are running",
      "Try refreshing the connection in a few moments",
      "Contact your cluster administrator if the issue persists",
    ],
    icon: XCircle,
  };
};

/**
 * Parses unknown/generic errors
 */
const parseUnknownError = (originalError: string): ParsedError => {
  return {
    type: ErrorType.UNKNOWN,
    title: "Connection Error",
    message: "An unexpected error occurred while connecting to the cluster.",
    details: originalError,
    suggestions: [
      "Check the cluster connection settings",
      "Verify your credentials and permissions",
      "Review the error details below for more information",
      "Try refreshing the connection",
    ],
    icon: AlertCircle,
  };
};

/**
 * Checks if error is RBAC/Permission related
 */
const isRBACError = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("forbidden") ||
    lowerMessage.includes("cannot list") ||
    lowerMessage.includes("cannot get") ||
    lowerMessage.includes("cannot watch") ||
    lowerMessage.includes("cannot create") ||
    lowerMessage.includes("cannot update") ||
    lowerMessage.includes("cannot delete") ||
    lowerMessage.includes("is forbidden") ||
    lowerMessage.includes("permission denied") ||
    lowerMessage.includes("access denied") ||
    isResourceOperationError(message)
  );
};

/**
 * Checks if error is authentication related
 */
const isAuthenticationError = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("authentication") ||
    lowerMessage.includes("invalid token") ||
    lowerMessage.includes("token expired") ||
    lowerMessage.includes("unauthenticated")
  );
};

/**
 * Checks if error is network related
 */
const isNetworkError = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("network") ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("connection refused") ||
    lowerMessage.includes("econnrefused") ||
    lowerMessage.includes("fetch failed") ||
    lowerMessage.includes("enotfound") ||
    lowerMessage.includes("econnreset")
  );
};

/**
 * Checks if error is server error (5xx) based on status code or message
 */
const isServerError = (message: string, statusCode?: number): boolean => {
  if (statusCode !== undefined && statusCode >= 500 && statusCode < 600) {
    return true;
  }
  
  const lowerMessage = message.toLowerCase();
  return (
    lowerMessage.includes("500") ||
    lowerMessage.includes("internal server") ||
    lowerMessage.includes("service unavailable") ||
    lowerMessage.includes("bad gateway")
  );
};

/**
 * Main error parser function
 * Categorizes and parses Kubernetes API errors into user-friendly format
 * 
 * @param error - Raw error string (may be JSON or plain text)
 * @returns ParsedError object with categorized error information
 * 
 * @example
 * // JSON payload
 * parseError('{"error":"Failed to list roles"}')
 * 
 * @example
 * // Plain text with user info
 * parseError('namespaces is forbidden: User "system:serviceaccount:k8s-rbactory:k8s-rbactory-reader" cannot list resource "namespaces"')
 * 
 * @example
 * // With status code
 * parseError('500: Internal server error')
 */
export const parseError = (error: string): ParsedError => {
  // Extract the actual message and status code
  const { message, statusCode } = extractErrorMessage(error);
  
  // Check error type in order of specificity
  if (isRBACError(message)) {
    return parseRBACError(message, error);
  }

  if (isAuthenticationError(message)) {
    return parseAuthenticationError(error);
  }

  if (isNetworkError(message)) {
    return parseNetworkError(error);
  }

  if (isServerError(message, statusCode)) {
    return parseServerError(message, error);
  }

  return parseUnknownError(error);
};

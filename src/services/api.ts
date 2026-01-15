// src/services/api.ts
export type { PaginatedResponse } from "../types/api.types";
import { type IAPIClient } from "../types/api.types";

export interface ClusterRBACResource {
  kind: string;
  name: string;
  namespace?: string;
  rules?: PolicyRule[];
  subjects?: Subject[];
  roleRef?: RoleRef;
  labels?: Record<string, string>;
  createdAt: string;
}

interface PolicyRule {
  apiGroups: string[];
  resources: string[];
  resourceNames?: string[];
  verbs: string[];
}

interface Subject {
  kind: string;
  name: string;
  namespace?: string;
}

interface RoleRef {
  kind: string;
  name: string;
  apiGroup: string;
}

export interface ClusterInfo {
  version: string;
  namespaces: string[];
  nodeCount: number;
}

export interface RBACListResponse {
  items: ClusterRBACResource[];
  totalCount: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

export interface ResourceCounts {
  roles: number;
  clusterRoles: number;
  roleBindings: number;
  clusterRoleBindings: number;
  principals: number;
}

export interface Principal {
  kind: string;
  name: string;
  namespace?: string;
  bindingCount: number;
  roleCount: number;
  bindings?: string[];
  roles?: string[];
}

export interface PrincipalListResponse {
  items: Principal[];
  totalCount: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

export interface RelationshipResponse {
  role?: ClusterRBACResource;
  binding?: ClusterRBACResource;
  relatedBindings: ClusterRBACResource[];
  relatedRoles: ClusterRBACResource[];
}

/**
 * API error response structure from backend
 */
interface APIErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Custom error class for API errors with detailed information
 */
export class APIError extends Error {
  public statusCode: number;
  public details?: Record<string, unknown>;
  public validationErrors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, unknown>,
    validationErrors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;

    // Only set optional properties if they have defined values
    if (details !== undefined) {
      this.details = details;
    }

    if (validationErrors !== undefined) {
      this.validationErrors = validationErrors;
    }
  }
}

/**
 * Type guard to check if error is an APIError
 */
export const isAPIError = (error: unknown): error is APIError => {
  return error instanceof APIError;
};

/**
 * Type guard to check if a value is a valid JSON response
 */
const isJsonResponse = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

class APIClient implements IAPIClient {
  private baseURL: string;
  private connected: boolean = false;
  private abortController: AbortController | null = null;

  constructor(baseURL?: string) {
    // Use provided baseURL, environment variable, or default
    this.baseURL =
      baseURL || import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
    this.connected = false;
    // Cancel any pending requests
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Parses error response from the API
   * Handles both JSON error responses and plain text
   */
  private async parseErrorResponse(response: Response): Promise<APIError> {
    const contentType = response.headers.get("content-type");

    // Try to parse JSON error response
    if (contentType?.includes("application/json")) {
      try {
        const errorData: unknown = await response.json();

        if (isJsonResponse(errorData)) {
          const typedError = errorData as APIErrorResponse;

          const message =
            typedError.message ||
            typedError.error ||
            `HTTP ${response.status}: ${response.statusText}`;

          return new APIError(
            message,
            typedError.statusCode || response.status,
            typedError.details,
            typedError.errors,
          );
        }
      } catch (parseError) {
        console.error("Failed to parse JSON error response:", parseError);
      }
    }

    // Try to get plain text error
    try {
      const text = await response.text();
      if (text) {
        // Include status code in the message for better error detection
        const messageWithStatus = `HTTP ${response.status}: ${text}`;
        return new APIError(messageWithStatus, response.status);
      }
    } catch (textError) {
      console.error("Failed to parse text error response:", textError);
    }

    // Final fallback - make sure status code is included
    return new APIError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
    );
  }
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout = 60000,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: "cors",
      });
      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        const error = await this.parseErrorResponse(response);
        throw error;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw APIError as-is
      if (error instanceof APIError) {
        throw error;
      }

      // Handle abort/timeout
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new APIError("Request timeout", 408);
        }

        // Enhanced CORS error detection
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError") ||
          error.message.includes("Load failed")
        ) {
          // This is likely a CORS error or network error
          // Try to provide more context
          const corsHint =
            "This is likely a CORS (Cross-Origin Resource Sharing) error. " +
            "The backend server must be configured to allow requests from this origin. " +
            `Origin: ${window.location.origin}, Target: ${url}`;

          throw new APIError(
            `Network error: ${error.message}. ${corsHint}`,
            0,
            {
              originalError: error.message,
              url: url,
              origin: window.location.origin,
            },
          );
        }

        // Handle other network errors
        if (error.message.includes("fetch")) {
          throw new APIError("Network error: Unable to reach the server", 0, {
            originalError: error.message,
          });
        }

        throw new APIError(error.message, 0);
      }

      throw new APIError("Unknown error occurred", 0);
    }
  }

  /**
   * Helper method to fetch and parse JSON with type safety
   */
  private async fetchJSON<T>(
    url: string,
    options?: RequestInit,
    timeout?: number,
  ): Promise<T> {
    const response = await this.fetchWithTimeout(url, options, timeout);
    const data: unknown = await response.json();
    return data as T;
  }

  async checkConnection(): Promise<boolean> {
    try {
      // Use /healthz endpoint (correct Kubernetes convention)
      await this.fetchWithTimeout(`${this.baseURL}/healthz`, {}, 5000);
      this.connected = true;
      return true;
    } catch (error) {
      console.error("Connection check failed:", error);
      this.connected = false;
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getClusterInfo(): Promise<ClusterInfo> {
    try {
      return await this.fetchJSON<ClusterInfo>(`${this.baseURL}/cluster/info`);
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to fetch cluster info",
        0,
      );
    }
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const data = await this.fetchJSON<{ namespaces: string[] }>(
        `${this.baseURL}/namespaces`,
      );
      return data.namespaces;
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to fetch namespaces",
        0,
      );
    }
  }

  async listRoles(
    namespace?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<RBACListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (namespace) {
      params.append("namespace", namespace);
    }

    try {
      const url = `${this.baseURL}/roles?${params}`;
      return await this.fetchJSON<RBACListResponse>(url);
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to fetch roles",
        0,
      );
    }
  }

  async listClusterRoles(
    limit: number = 50,
    offset: number = 0,
  ): Promise<RBACListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    try {
      return await this.fetchJSON<RBACListResponse>(
        `${this.baseURL}/clusterroles?${params}`,
      );
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error
          ? error.message
          : "Failed to fetch cluster roles",
        0,
      );
    }
  }

  async listRoleBindings(
    namespace?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<RBACListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (namespace) {
      params.append("namespace", namespace);
    }

    try {
      const url = `${this.baseURL}/rolebindings?${params}`;
      return await this.fetchJSON<RBACListResponse>(url);
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error
          ? error.message
          : "Failed to fetch role bindings",
        0,
      );
    }
  }

  async listClusterRoleBindings(
    limit: number = 50,
    offset: number = 0,
  ): Promise<RBACListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    try {
      return await this.fetchJSON<RBACListResponse>(
        `${this.baseURL}/clusterrolebindings?${params}`,
      );
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error
          ? error.message
          : "Failed to fetch cluster role bindings",
        0,
      );
    }
  }

  async listPrincipals(
    namespace?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PrincipalListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (namespace) {
      params.append("namespace", namespace);
    }

    try {
      const url = `${this.baseURL}/principals?${params}`;
      return await this.fetchJSON<PrincipalListResponse>(url);
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to fetch principals",
        0,
      );
    }
  }

  async getCounts(): Promise<ResourceCounts> {
    try {
      return await this.fetchJSON<ResourceCounts>(`${this.baseURL}/counts`);
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to fetch counts",
        0,
      );
    }
  }

  async getRole(namespace: string, name: string): Promise<ClusterRBACResource> {
    try {
      return await this.fetchJSON<ClusterRBACResource>(
        `${this.baseURL}/roles/${namespace}/${name}`,
      );
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to fetch role",
        0,
      );
    }
  }

  async getClusterRole(name: string): Promise<ClusterRBACResource> {
    try {
      return await this.fetchJSON<ClusterRBACResource>(
        `${this.baseURL}/clusterroles/${name}`,
      );
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error ? error.message : "Failed to fetch cluster role",
        0,
      );
    }
  }

  async getRelationships(
    kind: string,
    namespace: string,
    name: string,
  ): Promise<RelationshipResponse> {
    const url = namespace
      ? `${this.baseURL}/relationships/${kind}/${namespace}/${name}`
      : `${this.baseURL}/relationships/${kind}/${name}`;

    try {
      return await this.fetchJSON<RelationshipResponse>(url);
    } catch (error) {
      if (isAPIError(error)) {
        throw error;
      }
      throw new APIError(
        error instanceof Error
          ? error.message
          : "Failed to fetch relationships",
        0,
      );
    }
  }
}

// Create singleton instance without baseURL - will be set by ConnectionProvider
export const apiClient = new APIClient();

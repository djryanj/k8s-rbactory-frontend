// src/services/api.ts
export type { PaginatedResponse } from '../types/api.types';
import { type IAPIClient } from '../types/api.types';


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

// Updated to support pagination
export interface RBACListResponse {
  items: ClusterRBACResource[];
  totalCount: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

// New interface for counts
export interface ResourceCounts {
  roles: number;
  clusterRoles: number;
  roleBindings: number;
  clusterRoleBindings: number;
  principals: number;
}

// New interface for principals
export interface Principal {
  kind: string;
  name: string;
  namespace?: string;
  bindingCount: number;
  roleCount: number;
  bindings?: string[]; // Array of binding names
  roles?: string[]; // Array of role names
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

class APIClient implements IAPIClient {
  private baseURL: string;
  private connected: boolean = false;
  private abortController: AbortController | null = null;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
  }

  setBaseURL(url: string) {
    this.baseURL = url;
    this.connected = false;
    // Cancel any pending requests
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 60000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request was cancelled');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/healthz`, {}, 5000);
      this.connected = response.ok;
      return this.connected;
    } catch (error) {
      console.error('Connection check failed:', error);
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getClusterInfo(): Promise<ClusterInfo> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/cluster/info`);
    if (!response.ok) {
      throw new Error('Failed to fetch cluster info');
    }
    return response.json();
  }

  async listNamespaces(): Promise<string[]> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/namespaces`);
    if (!response.ok) {
      throw new Error('Failed to fetch namespaces');
    }
    const data = await response.json();
    return data.namespaces;
  }

  async listRoles(namespace?: string, limit: number = 50, offset: number = 0): Promise<RBACListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (namespace) {
      params.append('namespace', namespace);
    }
    
    const url = `${this.baseURL}/roles?${params}`;
    const response = await this.fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }
    return response.json();
  }

  async listClusterRoles(limit: number = 50, offset: number = 0): Promise<RBACListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const response = await this.fetchWithTimeout(`${this.baseURL}/clusterroles?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cluster roles');
    }
    return response.json();
  }

  async listRoleBindings(namespace?: string, limit: number = 50, offset: number = 0): Promise<RBACListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (namespace) {
      params.append('namespace', namespace);
    }
    
    const url = `${this.baseURL}/rolebindings?${params}`;
    const response = await this.fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error('Failed to fetch role bindings');
    }
    return response.json();
  }

  async listClusterRoleBindings(limit: number = 50, offset: number = 0): Promise<RBACListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    const response = await this.fetchWithTimeout(`${this.baseURL}/clusterrolebindings?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cluster role bindings');
    }
    return response.json();
  }

  // New method for principals
  async listPrincipals(namespace?: string, limit: number = 50, offset: number = 0): Promise<PrincipalListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (namespace) {
      params.append('namespace', namespace);
    }
    
    const url = `${this.baseURL}/principals?${params}`;
    const response = await this.fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error('Failed to fetch principals');
    }
    return response.json();
  }

  // New method for getting counts
  async getCounts(): Promise<ResourceCounts> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/counts`);
    if (!response.ok) {
      throw new Error('Failed to fetch counts');
    }
    return response.json();
  }

  async getRole(namespace: string, name: string): Promise<ClusterRBACResource> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/roles/${namespace}/${name}`);
    if (!response.ok) {
      throw new Error('Failed to fetch role');
    }
    return response.json();
  }

  async getClusterRole(name: string): Promise<ClusterRBACResource> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/clusterroles/${name}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cluster role');
    }
    return response.json();
  }
    async getRelationships(kind: string, namespace: string, name: string): Promise<RelationshipResponse> {
    const url = namespace 
      ? `${this.baseURL}/relationships/${kind}/${namespace}/${name}`
      : `${this.baseURL}/relationships/${kind}/${name}`;
    
    const response = await this.fetchWithTimeout(url);
    if (!response.ok) {
      throw new Error('Failed to fetch relationships');
    }
    return response.json();
  }
  
}

export const apiClient = new APIClient();

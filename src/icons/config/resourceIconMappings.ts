// src/icons/config/resourceIconMappings.ts
import type { IconCategory } from "../types/icon.types";

const CDN_BASE_URL_LABELED =
  "https://cdn.jsdelivr.net/gh/kubernetes/community@master/icons/svg/resources/labeled";
const CDN_BASE_URL_UNLABELED =
  "https://cdn.jsdelivr.net/gh/kubernetes/community@master/icons/svg/resources/unlabeled";

/**
 * Unified icon mapping configuration.
 */
interface ResourceIconMapping {
  cdnIcon?: string;
  category: IconCategory;
}

/**
 * Maps category names to their representative unlabeled icons.
 * Used for category section headers.
 */
const CATEGORY_ICON_MAP: Record<string, string> = {
  workloads: "pod",
  workload: "pod",
  configuration: "cm",
  config: "cm",
  storage: "pv",
  networking: "svc",
  network: "svc",
  security: "c-role",
  rbac: "c-role",
  custom: "crd",
  user: "user",
  group: "group",
  cluster: "kubelet",
  node: "node",
  default: "kubelet",
};

/**
 * Special fallback mappings for icons that fail to load.
 */
export const ICON_FALLBACK_MAP: Readonly<Record<string, string>> = {
  node: "node",
  nodes: "node",
  kubelet: "cluster",
  "kube-proxy": "cluster",
  "k-proxy": "cluster",
} as const;

/**
 * Complete mapping of Kubernetes resource kinds to their icon configuration.
 */
export const RESOURCE_ICON_MAPPINGS: Readonly<
  Record<string, ResourceIconMapping>
> = {
  // Workloads
  pod: { cdnIcon: "pod", category: "workloads" },
  pods: { cdnIcon: "pod", category: "workloads" },
  deployment: { cdnIcon: "deploy", category: "workloads" },
  deployments: { cdnIcon: "deploy", category: "workloads" },
  statefulset: { cdnIcon: "sts", category: "workloads" },
  statefulsets: { cdnIcon: "sts", category: "workloads" },
  daemonset: { cdnIcon: "ds", category: "workloads" },
  daemonsets: { cdnIcon: "ds", category: "workloads" },
  replicaset: { cdnIcon: "rs", category: "workloads" },
  replicasets: { cdnIcon: "rs", category: "workloads" },
  replicationcontroller: { category: "workloads" },
  replicationcontrollers: { category: "workloads" },
  job: { cdnIcon: "job", category: "workloads" },
  jobs: { cdnIcon: "job", category: "workloads" },
  cronjob: { cdnIcon: "cronjob", category: "workloads" },
  cronjobs: { cdnIcon: "cronjob", category: "workloads" },

  // Configuration
  configmap: { cdnIcon: "cm", category: "configuration" },
  configmaps: { cdnIcon: "cm", category: "configuration" },
  cm: { cdnIcon: "cm", category: "configuration" },
  secret: { cdnIcon: "secret", category: "configuration" },
  secrets: { cdnIcon: "secret", category: "configuration" },
  resourcequota: { category: "configuration" },
  resourcequotas: { category: "configuration" },
  limitrange: { category: "configuration" },
  limitranges: { category: "configuration" },
  horizontalpodautoscaler: { category: "configuration" },
  horizontalpodautoscalers: { category: "configuration" },
  hpa: { category: "configuration" },
  poddisruptionbudget: { category: "configuration" },
  poddisruptionbudgets: { category: "configuration" },
  pdb: { category: "configuration" },

  // Storage
  persistentvolume: { cdnIcon: "pv", category: "storage" },
  persistentvolumes: { cdnIcon: "pv", category: "storage" },
  pv: { cdnIcon: "pv", category: "storage" },
  persistentvolumeclaim: { cdnIcon: "pvc", category: "storage" },
  persistentvolumeclaims: { cdnIcon: "pvc", category: "storage" },
  pvc: { cdnIcon: "pvc", category: "storage" },
  storageclass: { cdnIcon: "sc", category: "storage" },
  storageclasses: { cdnIcon: "sc", category: "storage" },
  sc: { cdnIcon: "sc", category: "storage" },
  volume: { cdnIcon: "vol", category: "storage" },
  volumes: { cdnIcon: "vol", category: "storage" },
  volumeattachment: { category: "storage" },
  volumeattachments: { category: "storage" },
  csidriver: { category: "storage" },
  csidrivers: { category: "storage" },
  csinode: { category: "storage" },
  csinodes: { category: "storage" },

  // Networking
  service: { cdnIcon: "svc", category: "networking" },
  services: { cdnIcon: "svc", category: "networking" },
  svc: { cdnIcon: "svc", category: "networking" },
  ingress: { cdnIcon: "ing", category: "networking" },
  ingresses: { cdnIcon: "ing", category: "networking" },
  networkpolicy: { cdnIcon: "netpol", category: "networking" },
  networkpolicies: { cdnIcon: "netpol", category: "networking" },
  netpol: { cdnIcon: "netpol", category: "networking" },
  endpoint: { cdnIcon: "ep", category: "networking" },
  endpoints: { cdnIcon: "ep", category: "networking" },
  ep: { cdnIcon: "ep", category: "networking" },
  endpointslice: { category: "networking" },
  endpointslices: { category: "networking" },
  ingressclass: { category: "networking" },
  ingressclasses: { category: "networking" },

  // RBAC & Security
  role: { cdnIcon: "role", category: "security" },
  roles: { cdnIcon: "role", category: "security" },
  clusterrole: { cdnIcon: "c-role", category: "security" },
  clusterroles: { cdnIcon: "c-role", category: "security" },
  rolebinding: { cdnIcon: "rb", category: "security" },
  rolebindings: { cdnIcon: "rb", category: "security" },
  clusterrolebinding: { cdnIcon: "crb", category: "security" },
  clusterrolebindings: { cdnIcon: "crb", category: "security" },
  serviceaccount: { cdnIcon: "sa", category: "security" },
  serviceaccounts: { cdnIcon: "sa", category: "security" },
  sa: { cdnIcon: "sa", category: "security" },
  podsecuritypolicy: { category: "security" },
  podsecuritypolicies: { category: "security" },
  psp: { category: "security" },
  certificatesigningrequest: { category: "security" },
  certificatesigningrequests: { category: "security" },
  csr: { category: "security" },

  // RBAC Subjects
  user: { cdnIcon: "user", category: "user" },
  users: { cdnIcon: "user", category: "user" },
  principal: { cdnIcon: "user", category: "user" },
  principals: { cdnIcon: "user", category: "user" },
  group: { cdnIcon: "group", category: "group" },
  groups: { cdnIcon: "group", category: "group" },

  // Cluster / Node resources
  namespace: { cdnIcon: "ns", category: "default" },
  namespaces: { cdnIcon: "ns", category: "default" },
  ns: { cdnIcon: "ns", category: "default" },

  // Node-related resources - keep CDN attempts but map to proper fallback categories
  node: { cdnIcon: "node", category: "node" },
  nodes: { cdnIcon: "node", category: "node" },

  // Cluster infrastructure - map to cluster category
  kubelet: { cdnIcon: "kubelet", category: "cluster" },
  "kube-proxy": { cdnIcon: "k-proxy", category: "cluster" },
  "k-proxy": { cdnIcon: "k-proxy", category: "cluster" },

  // Cluster as a resource type (not just category)
  cluster: { category: "cluster" },
  clusters: { category: "cluster" },

  // Events and other cluster resources
  event: { category: "default" },
  events: { category: "default" },

  // API resources
  apiservice: { category: "default" },
  apiservices: { category: "default" },

  // Lease resources
  lease: { category: "default" },
  leases: { category: "default" },

  // Priority classes
  priorityclass: { category: "default" },
  priorityclasses: { category: "default" },
  pc: { category: "default" },

  // Runtime classes
  runtimeclass: { category: "default" },
  runtimeclasses: { category: "default" },

  // Custom Resources
  crd: { cdnIcon: "crd", category: "custom" },
  crds: { cdnIcon: "crd", category: "custom" },
  custom: { cdnIcon: "crd", category: "custom" },
  customresourcedefinition: { cdnIcon: "crd", category: "custom" },
  customresourcedefinitions: { cdnIcon: "crd", category: "custom" },
} as const;

/**
 * Get the fallback icon category for a given resource kind.
 */
export function getCategoryForKind(kind: string): IconCategory {
  const normalized = kind.toLowerCase();
  const mapping = RESOURCE_ICON_MAPPINGS[normalized];

  if (process.env.NODE_ENV === "development" && !mapping) {
    console.warn(
      `[Icon] No mapping found for kind: "${kind}", using default category`,
    );
  }

  return mapping?.category ?? "default";
}

/**
 * Check if a resource kind has a known mapping.
 */
export function hasKindMapping(kind: string): boolean {
  return kind.toLowerCase() in RESOURCE_ICON_MAPPINGS;
}

/**
 * Check if a kind/category has a CDN icon available.
 */
export function hasCdnIcon(kind: string): boolean {
  const normalized = kind.toLowerCase();

  // Check if it's a category name
  if (normalized in CATEGORY_ICON_MAP) {
    return true;
  }

  // Check if it's a resource kind
  const mapping = RESOURCE_ICON_MAPPINGS[normalized];
  return mapping?.cdnIcon !== undefined;
}

/**
 * Get the CDN URL for a resource kind's icon.
 *
 * @param kind - The resource kind or category name
 * @param unlabeled - Whether to use the unlabeled icon version
 */
export function getCdnIconUrl(
  kind: string,
  unlabeled: boolean = false,
): string {
  const normalized = kind.toLowerCase();

  // Check if it's a category name
  if (normalized in CATEGORY_ICON_MAP) {
    const iconName = CATEGORY_ICON_MAP[normalized];
    // Categories always use unlabeled icons
    return `${CDN_BASE_URL_UNLABELED}/${iconName}.svg`;
  }

  // It's a resource kind
  const mapping = RESOURCE_ICON_MAPPINGS[normalized];

  if (!mapping?.cdnIcon) {
    return "";
  }

  const baseUrl = unlabeled ? CDN_BASE_URL_UNLABELED : CDN_BASE_URL_LABELED;
  return `${baseUrl}/${mapping.cdnIcon}.svg`;
}

/**
 * Get the fallback icon kind for a failed icon load.
 */
export function getFallbackIconKind(kind: string): string | undefined {
  const normalized = kind.toLowerCase();
  return ICON_FALLBACK_MAP[normalized];
}

/**
 * Check if a string is a category name.
 */
export function isCategoryName(value: string): boolean {
  return value.toLowerCase() in CATEGORY_ICON_MAP;
}

/**
 * Get all resource kinds that have CDN icons available.
 */
export function getKindsWithCdnIcons(): string[] {
  return Object.entries(RESOURCE_ICON_MAPPINGS)
    .filter(([_, config]) => config.cdnIcon !== undefined)
    .map(([kind]) => kind);
}

/**
 * Get complete icon configuration for a resource kind.
 */
export function getIconConfig(kind: string): ResourceIconMapping | undefined {
  return RESOURCE_ICON_MAPPINGS[kind.toLowerCase()];
}

/**
 * Get the representative icon name for a category.
 */
export function getCategoryIconName(category: string): string | undefined {
  return CATEGORY_ICON_MAP[category.toLowerCase()];
}

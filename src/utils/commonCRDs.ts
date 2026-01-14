// src/utils/commonCRDs.ts

export interface CommonCRD {
  name: string;
  displayName: string;
  apiGroup: string;
  category: string;
  description: string;
  commonVerbs: string[];
}

export const COMMON_CRDS: Record<string, CommonCRD> = {
  // Argo CD
  "applications.argoproj.io": {
    name: "applications",
    displayName: "Argo CD Application",
    apiGroup: "argoproj.io",
    category: "GitOps",
    description: "Argo CD application for GitOps deployments",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "appprojects.argoproj.io": {
    name: "appprojects",
    displayName: "Argo CD AppProject",
    apiGroup: "argoproj.io",
    category: "GitOps",
    description: "Argo CD project for organizing applications",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  
  // Argo Workflows
  "workflows.argoproj.io": {
    name: "workflows",
    displayName: "Argo Workflow",
    apiGroup: "argoproj.io",
    category: "GitOps",
    description: "Argo workflow for container-native workflows",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "workflowtemplates.argoproj.io": {
    name: "workflowtemplates",
    displayName: "Argo Workflow Template",
    apiGroup: "argoproj.io",
    category: "GitOps",
    description: "Reusable workflow template",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  
  // Cert-Manager
  "certificates.cert-manager.io": {
    name: "certificates",
    displayName: "Certificate",
    apiGroup: "cert-manager.io",
    category: "Security",
    description: "TLS certificate managed by cert-manager",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "certificaterequests.cert-manager.io": {
    name: "certificaterequests",
    displayName: "Certificate Request",
    apiGroup: "cert-manager.io",
    category: "Security",
    description: "Request for a TLS certificate",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "issuers.cert-manager.io": {
    name: "issuers",
    displayName: "Issuer",
    apiGroup: "cert-manager.io",
    category: "Security",
    description: "Certificate issuer (namespace-scoped)",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "clusterissuers.cert-manager.io": {
    name: "clusterissuers",
    displayName: "ClusterIssuer",
    apiGroup: "cert-manager.io",
    category: "Security",
    description: "Certificate issuer (cluster-scoped)",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  
  // Istio
  "virtualservices.networking.istio.io": {
    name: "virtualservices",
    displayName: "Virtual Service",
    apiGroup: "networking.istio.io",
    category: "Service Mesh",
    description: "Istio virtual service for traffic routing",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "destinationrules.networking.istio.io": {
    name: "destinationrules",
    displayName: "Destination Rule",
    apiGroup: "networking.istio.io",
    category: "Service Mesh",
    description: "Istio destination rule for traffic policies",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "gateways.networking.istio.io": {
    name: "gateways",
    displayName: "Gateway",
    apiGroup: "networking.istio.io",
    category: "Service Mesh",
    description: "Istio gateway for ingress/egress traffic",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "serviceentries.networking.istio.io": {
    name: "serviceentries",
    displayName: "Service Entry",
    apiGroup: "networking.istio.io",
    category: "Service Mesh",
    description: "Istio service entry for external services",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  
  // Prometheus Operator
  "prometheuses.monitoring.coreos.com": {
    name: "prometheuses",
    displayName: "Prometheus",
    apiGroup: "monitoring.coreos.com",
    category: "Monitoring",
    description: "Prometheus server instance",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "servicemonitors.monitoring.coreos.com": {
    name: "servicemonitors",
    displayName: "Service Monitor",
    apiGroup: "monitoring.coreos.com",
    category: "Monitoring",
    description: "Prometheus service monitor for scraping metrics",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "podmonitors.monitoring.coreos.com": {
    name: "podmonitors",
    displayName: "Pod Monitor",
    apiGroup: "monitoring.coreos.com",
    category: "Monitoring",
    description: "Prometheus pod monitor for scraping metrics",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "alertmanagers.monitoring.coreos.com": {
    name: "alertmanagers",
    displayName: "Alertmanager",
    apiGroup: "monitoring.coreos.com",
    category: "Monitoring",
    description: "Alertmanager instance for handling alerts",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  
  // Knative
  "services.serving.knative.dev": {
    name: "services",
    displayName: "Knative Service",
    apiGroup: "serving.knative.dev",
    category: "Serverless",
    description: "Knative serving service",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "routes.serving.knative.dev": {
    name: "routes",
    displayName: "Knative Route",
    apiGroup: "serving.knative.dev",
    category: "Serverless",
    description: "Knative route for traffic routing",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  
  // Flux CD
  "gitrepositories.source.toolkit.fluxcd.io": {
    name: "gitrepositories",
    displayName: "Git Repository",
    apiGroup: "source.toolkit.fluxcd.io",
    category: "GitOps",
    description: "Flux Git repository source",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "kustomizations.kustomize.toolkit.fluxcd.io": {
    name: "kustomizations",
    displayName: "Kustomization",
    apiGroup: "kustomize.toolkit.fluxcd.io",
    category: "GitOps",
    description: "Flux Kustomization for applying manifests",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "helmreleases.helm.toolkit.fluxcd.io": {
    name: "helmreleases",
    displayName: "Helm Release",
    apiGroup: "helm.toolkit.fluxcd.io",
    category: "GitOps",
    description: "Flux Helm release",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  
  // External Secrets Operator
  "externalsecrets.external-secrets.io": {
    name: "externalsecrets",
    displayName: "External Secret",
    apiGroup: "external-secrets.io",
    category: "Security",
    description: "External secret synchronized from external provider",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "secretstores.external-secrets.io": {
    name: "secretstores",
    displayName: "Secret Store",
    apiGroup: "external-secrets.io",
    category: "Security",
    description: "External secret store configuration",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  
  // Crossplane
  "compositeresourcedefinitions.apiextensions.crossplane.io": {
    name: "compositeresourcedefinitions",
    displayName: "Composite Resource Definition",
    apiGroup: "apiextensions.crossplane.io",
    category: "Infrastructure",
    description: "Crossplane composite resource definition",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
  "compositions.apiextensions.crossplane.io": {
    name: "compositions",
    displayName: "Composition",
    apiGroup: "apiextensions.crossplane.io",
    category: "Infrastructure",
    description: "Crossplane composition template",
    commonVerbs: ["get", "list", "watch", "create", "update", "patch", "delete"],
  },
};

export const CRD_CATEGORIES = [
  "GitOps",
  "Service Mesh",
  "Monitoring",
  "Security",
  "Serverless",
  "Infrastructure",
] as const;

export type CRDCategory = (typeof CRD_CATEGORIES)[number];

export function getCRDsByCategory(): Record<CRDCategory, CommonCRD[]> {
  const result = {} as Record<CRDCategory, CommonCRD[]>;
  
  CRD_CATEGORIES.forEach(category => {
    result[category] = [];
  });
  
  Object.values(COMMON_CRDS).forEach(crd => {
    const category = crd.category as CRDCategory;
    if (result[category]) {
      result[category].push(crd);
    }
  });
  
  return result;
}

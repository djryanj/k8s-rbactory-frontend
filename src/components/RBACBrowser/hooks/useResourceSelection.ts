// src/components/RBACBrowser/hooks/useResourceSelection.ts
import { useCallback } from "react";
import { useClusterRBAC } from "../../../context/clusterRBAC";
import { useConnection } from "../../../context/connection";
import type { ClusterRBACResource, Principal } from "../../../services/api";

export const useResourceSelection = () => {
  const { apiClientInstance } = useConnection();
  const {
    selectedResource,
    setSelectedResource,
    setRelatedResources,
    setIsLoadingRelationships,
  } = useClusterRBAC();

  const handleResourceSelect = useCallback(
    async (resource: ClusterRBACResource) => {
      if (!resource) return;

      setSelectedResource(resource);
      setIsLoadingRelationships(true);

      try {
        const relationships = await apiClientInstance.getRelationships(
          resource.kind,
          resource.namespace || "",
          resource.name,
        );

        setRelatedResources(relationships);
      } catch (err) {
        console.error("Failed to load relationships:", err);
        setRelatedResources({
          relatedBindings: [],
          relatedRoles: [],
        });
      } finally {
        setIsLoadingRelationships(false);
      }
    },
    [
      apiClientInstance,
      setSelectedResource,
      setRelatedResources,
      setIsLoadingRelationships,
    ],
  );

  const handlePrincipalSelect = useCallback(
    async (principal: Principal) => {
      if (!principal) return;

      const pseudoResource: ClusterRBACResource = {
        kind: principal.kind,
        name: principal.name,
        subjects: [],
        createdAt: new Date().toISOString(),
        labels: {},
      };

      if (principal.namespace) {
        pseudoResource.namespace = principal.namespace;
      }

      setSelectedResource(pseudoResource);
      setIsLoadingRelationships(true);

      try {
        const relationships = await apiClientInstance.getRelationships(
          principal.kind,
          principal.namespace || "",
          principal.name,
        );

        setRelatedResources(relationships);
      } catch (err) {
        console.error("Failed to load relationships:", err);
        setRelatedResources({
          relatedBindings: [],
          relatedRoles: [],
        });
      } finally {
        setIsLoadingRelationships(false);
      }
    },
    [
      apiClientInstance,
      setSelectedResource,
      setRelatedResources,
      setIsLoadingRelationships,
    ],
  );

  return {
    selectedResource,
    handleResourceSelect,
    handlePrincipalSelect,
  };
};

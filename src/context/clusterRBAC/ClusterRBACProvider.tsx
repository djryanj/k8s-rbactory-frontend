// src/context/clusterRBAC/ClusterRBACProvider.tsx
import React, { useState } from "react";
import type {
  ClusterRBACResource,
  RelationshipResponse,
} from "../../services/api";
import { ClusterRBACContext } from "./ClusterRBACContext";

const initialRelatedResources: RelationshipResponse = {
  relatedBindings: [],
  relatedRoles: [],
};

export const ClusterRBACProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedResource, setSelectedResource] =
    useState<ClusterRBACResource | null>(null);
  const [relatedResources, setRelatedResources] =
    useState<RelationshipResponse>(initialRelatedResources);
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false);

  const value = {
    selectedResource,
    setSelectedResource,
    relatedResources,
    setRelatedResources,
    isLoadingRelationships,
    setIsLoadingRelationships,
  };

  return (
    <ClusterRBACContext.Provider value={value}>
      {children}
    </ClusterRBACContext.Provider>
  );
};

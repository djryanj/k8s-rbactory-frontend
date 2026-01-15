// src/context/clusterRBAC/ClusterRBACContext.ts
import { createContext } from "react";
import type {
  ClusterRBACResource,
  RelationshipResponse,
} from "../../services/api";

export interface ClusterRBACContextType {
  selectedResource: ClusterRBACResource | null;
  setSelectedResource: (resource: ClusterRBACResource | null) => void;
  relatedResources: RelationshipResponse;
  setRelatedResources: (resources: RelationshipResponse) => void;
  isLoadingRelationships: boolean;
  setIsLoadingRelationships: (loading: boolean) => void;
}

export const ClusterRBACContext = createContext<
  ClusterRBACContextType | undefined
>(undefined);

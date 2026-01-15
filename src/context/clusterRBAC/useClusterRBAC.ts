// src/context/clusterRBAC/useClusterRBAC.ts
import { useContext } from "react";
import {
  ClusterRBACContext,
  type ClusterRBACContextType,
} from "./ClusterRBACContext";

export const useClusterRBAC = (): ClusterRBACContextType => {
  const context = useContext(ClusterRBACContext);
  if (context === undefined) {
    throw new Error("useClusterRBAC must be used within a ClusterRBACProvider");
  }
  return context;
};

// src/components/Tabs/ClusterBrowserTab.tsx
import React from "react";
import { ClusterConnection } from "../ClusterConnection/ClusterConnection";
import { RBACBrowser } from "../RBACBrowser/RBACBrowser";
import { RBACVisualizer } from "../RBACVisualizer/RBACVisualizer";
import { useClusterRBAC } from "../../context/clusterRBAC";

interface ClusterBrowserTabProps {
  onOpenSettings: () => void;
  onSwitchToPolicyBuilder: () => void;
}

export const ClusterBrowserTab: React.FC<ClusterBrowserTabProps> = ({
  onOpenSettings,
  onSwitchToPolicyBuilder,
}) => {
  const { selectedResource, relatedResources, isLoadingRelationships } =
    useClusterRBAC();

  return (
    <div className="space-y-8">
      <div className="sr-only" role="status" aria-live="polite">
        Cluster Browser tab loaded. Browse and visualize RBAC resources from
        your connected Kubernetes cluster.
      </div>

      <section aria-labelledby="cluster-connection-heading">
        <h2 id="cluster-connection-heading" className="sr-only">
          Cluster Connection Status
        </h2>
        <ClusterConnection onOpenSettings={onOpenSettings} />
      </section>

      <section aria-labelledby="rbac-browser-heading">
        <h2 id="rbac-browser-heading" className="sr-only">
          RBAC Resource Browser
        </h2>
        <RBACBrowser />
      </section>

      <section aria-labelledby="rbac-visualizer-heading">
        <h2 id="rbac-visualizer-heading" className="sr-only">
          RBAC Relationship Visualizer
        </h2>
        <RBACVisualizer
          mode="browser"
          selectedResource={selectedResource}
          relatedResources={relatedResources}
          isLoadingRelationships={isLoadingRelationships}
          onSwitchToPolicyBuilder={onSwitchToPolicyBuilder}
        />
      </section>
    </div>
  );
};

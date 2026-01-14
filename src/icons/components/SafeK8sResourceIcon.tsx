// src/icons/components/SafeK8sResourceIcon.tsx
import React from "react";
import { K8sResourceIcon } from "./K8sResourceIcon";
import { IconErrorBoundary } from "./IconErrorBoundary";
import type { K8sResourceIconProps } from "../types/icon.types";

export const SafeK8sResourceIcon: React.FC<K8sResourceIconProps> = (props) => {
  return (
    <IconErrorBoundary {...(props.size !== undefined && { size: props.size })}>
      <K8sResourceIcon {...props} />
    </IconErrorBoundary>
  );
};

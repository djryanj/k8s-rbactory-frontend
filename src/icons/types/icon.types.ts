// src/icons/types/icon.types.ts
import type { SVGProps } from "react";

export type SVGComponent = React.FC<SVGProps<SVGSVGElement>>;

export type IconCategory =
  | "workloads"
  | "configuration"
  | "storage"
  | "networking"
  | "security"
  | "custom"
  | "user"
  | "group"
  | "node" // Add new category
  | "cluster" // Add new category
  | "default";

export interface K8sResourceIconProps {
  kind: string;
  size?: number;
  className?: string;
  category?: IconCategory;
  onError?: (kind: string) => void;
  eager?: boolean;
  unlabeled?: boolean;
}

export type IconResolution =
  | { type: "svg"; component: SVGComponent; source: "category" | "default" }
  | { type: "image"; url: string; source: "cdn" };

export interface IconCacheStats {
  size: number;
  maxSize: number;
  failedIcons: string[];
}

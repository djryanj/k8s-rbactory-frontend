// src/icons/index.ts
export { K8sResourceIcon } from "./components/K8sResourceIcon";
export { SafeK8sResourceIcon } from "./components/SafeK8sResourceIcon";
export { IconErrorBoundary } from "./components/IconErrorBoundary";

export { useK8sIcon } from "./hooks/useK8sIcon";
export { useIconCache } from "./hooks/useIconCache";

export { getIconCache, resetIconCache } from "./services/iconCache";
export { resolveIcon, preloadIcons } from "./services/iconResolver";

export {
  getCategoryForKind,
  hasKindMapping,
  hasCdnIcon,
  getCdnIconUrl,
  getKindsWithCdnIcons,
  getIconConfig,
  getFallbackIconKind,
  isCategoryName,
  getCategoryIconName,
} from "./config/resourceIconMappings";

export { getFallbackIcon, getAvailableCategories } from "./config/fallbackIcons";

// Optional: Export individual fallback icons if needed elsewhere
export {
  WorkloadsIcon,
  ConfigurationIcon,
  StorageIcon,
  NetworkingIcon,
  SecurityIcon,
  CustomIcon,
  UserIcon,
  GroupIcon,
  DefaultIcon,
  NodeIcon,
  ClusterIcon,
} from "./fallbacks";

export type {
  K8sResourceIconProps,
  IconCategory,
  IconResolution,
  SVGComponent,
  IconCacheStats,
} from "./types/icon.types";

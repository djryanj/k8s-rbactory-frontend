// src/icons/config/fallbackIcons.ts
import {
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
} from "../fallbacks";

import type { IconCategory, SVGComponent } from "../types/icon.types";

export const FALLBACK_ICONS: Readonly<Record<IconCategory, SVGComponent>> = {
  workloads: WorkloadsIcon,
  configuration: ConfigurationIcon,
  storage: StorageIcon,
  networking: NetworkingIcon,
  security: SecurityIcon,
  custom: CustomIcon,
  user: UserIcon,
  group: GroupIcon,
  node: NodeIcon,
  cluster: ClusterIcon,
  default: DefaultIcon,
} as const;

export function getFallbackIcon(category: IconCategory): SVGComponent {
  return FALLBACK_ICONS[category];
}

export function getAvailableCategories(): IconCategory[] {
  return Object.keys(FALLBACK_ICONS) as IconCategory[];
}

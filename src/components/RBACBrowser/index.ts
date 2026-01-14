// src/components/RBACBrowser/index.ts
export { RBACBrowser } from "./RBACBrowser";

export type {
  ResourceKind,
  ResourceCounts,
  FilterState,
  PaginationState,
} from "./types";

export { useResourceData } from "./hooks/useResourceData";
export { useResourceFilters } from "./hooks/useResourceFilters";
export { useResourceSelection } from "./hooks/useResourceSelection";

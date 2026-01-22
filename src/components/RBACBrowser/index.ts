// src/components/RBACBrowser/index.ts
export { RBACBrowser } from "./RBACBrowser";

export type {
  ResourceKind,
  FilterState,
  PaginationState,
} from "./types";

export type { ResourceCounts } from "../../services/api";
export { useResourceData } from "./hooks/useResourceData";
export { useResourceFilters } from "./hooks/useResourceFilters";
export { useResourceSelection } from "./hooks/useResourceSelection";

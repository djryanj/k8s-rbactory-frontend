// src/types/presets.types.ts
import { type ResourcePermission } from "./rbac.types";

export interface PresetRole {
  id: string;
  name: string;
  description: string;
  isClusterRole: boolean;
  permissions: ResourcePermission[];
}

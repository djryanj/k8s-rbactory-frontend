// src/components/ClusterConnection/types.ts
import { type ComponentType } from "react";

export enum ErrorType {
  RBAC = "rbac",
  NETWORK = "network",
  SERVER = "server",
  AUTHENTICATION = "authentication",
  UNKNOWN = "unknown",
}

export interface ParsedError {
  type: ErrorType;
  title: string;
  message: string;
  details?: string;
  suggestions: string[];
  icon: ComponentType<{ size?: number; className?: string }>;
}

export interface ClusterConnectionProps {
  onOpenSettings: () => void;
}

export interface ErrorDisplayProps {
  error: ParsedError;
  onOpenSettings: () => void;
}

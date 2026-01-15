// src/context/connection/ConnectionContext.ts
import { createContext } from "react";
import type { ClusterInfo } from "../../types/api.types";
import type { IAPIClient } from "../../types/api.types";

export interface ConnectionContextType {
  connected: boolean;
  loading: boolean;
  clusterInfo: ClusterInfo | null;
  error: string | null;
  retrying: boolean;
  retryCount: number;
  nextRetryIn: number | null;
  checkConnection: () => Promise<void>;
  cancelRetry: () => void;
  apiClientInstance: IAPIClient;
}

export const ConnectionContext = createContext<
  ConnectionContextType | undefined
>(undefined);

// src/context/config/ConfigContext.ts
import { createContext } from 'react';

export interface ConfigContextType {
  apiEndpoint: string;
  setApiEndpoint: (endpoint: string) => void;
  clusterBrowserEnabled: boolean;
  setClusterBrowserEnabled: (enabled: boolean) => void;
  defaultResourceLoadSize: number;
  setdefaultResourceLoadSize: (size: number) => void;
  resetConfig: () => void;
}

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

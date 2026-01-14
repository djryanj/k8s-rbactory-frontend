// src/context/config/useConfig.ts
import { useContext } from 'react';
import { ConfigContext, type ConfigContextType } from './ConfigContext';

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

// src/context/rbac/useRBAC.ts
import { useContext } from 'react';
import { RBACContext, type RBACContextType } from './RBACContext';

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

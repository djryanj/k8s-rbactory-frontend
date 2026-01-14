// src/icons/hooks/useIconCache.ts
import { useState, useCallback } from "react";
import { getIconCache } from "../services/iconCache";
import type { IconCacheStats } from "../types/icon.types";

export function useIconCache() {
  const cache = getIconCache();
  const [stats, setStats] = useState<IconCacheStats>(cache.getStats());

  const updateStats = useCallback(() => {
    setStats(cache.getStats());
  }, [cache]);

  const clear = useCallback(() => {
    cache.clear();
    updateStats();
  }, [cache, updateStats]);

  const remove = useCallback(
    (kind: string) => {
      cache.remove(kind);
      updateStats();
    },
    [cache, updateStats]
  );

  const has = useCallback(
    (kind: string) => {
      return cache.has(kind);
    },
    [cache]
  );

  return {
    stats,
    clear,
    remove,
    has,
    refresh: updateStats,
  };
}

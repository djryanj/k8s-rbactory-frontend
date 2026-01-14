// src/icons/hooks/useK8sIcon.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { resolveIcon } from "../services/iconResolver";
import { getIconCache } from "../services/iconCache";
import type { IconResolution, IconCategory } from "../types/icon.types";

export interface UseK8sIconOptions {
  kind: string;
  category?: IconCategory;
  onError?: (kind: string) => void;
}

export interface UseK8sIconReturn {
  resolution: IconResolution;
  hasError: boolean;
  handleError: () => void;
  retry: () => void;
}

export function useK8sIcon(options: UseK8sIconOptions): UseK8sIconReturn {
  const { kind, category, onError } = options;
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [kind]);

  const resolution = useMemo(
    () =>
      resolveIcon({
        kind,
        hasImageError: hasError,
        ...(category !== undefined && { explicitCategory: category }),
      }),
    [kind, category, hasError]
  );

  const handleError = useCallback(() => {
    const cache = getIconCache();
    cache.add(kind);
    setHasError(true);
    onError?.(kind);
  }, [kind, onError]);

  const retry = useCallback(() => {
    const cache = getIconCache();
    cache.remove(kind);
    setHasError(false);
  }, [kind]);

  return {
    resolution,
    hasError,
    handleError,
    retry,
  };
}

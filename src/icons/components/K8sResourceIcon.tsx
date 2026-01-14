// src/icons/components/K8sResourceIcon.tsx
import React, { useState } from "react";
import type { K8sResourceIconProps } from "../types/icon.types";
import { resolveIcon } from "../services/iconResolver";
import { getIconCache } from "../services/iconCache";
import {
  getFallbackIconKind,
  getIconConfig,
} from "../config/resourceIconMappings";

export const K8sResourceIcon: React.FC<K8sResourceIconProps> = ({
  kind,
  size = 24,
  className = "",
  category,
  onError,
  eager = false,
  unlabeled = false,
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [currentKind, setCurrentKind] = useState(kind);

  const resolution = resolveIcon({
    kind: currentKind,
    ...(category !== undefined && { explicitCategory: category }),
    hasImageError,
    unlabeled,
  });

  const handleImageError = () => {
    const cache = getIconCache();

    // Check if there's a fallback icon kind for this resource
    const fallbackKind = getFallbackIconKind(currentKind);

    if (fallbackKind && !hasImageError) {
      // Check if the fallback is also a CDN icon or just a category
      const fallbackConfig = getIconConfig(fallbackKind);

      if (fallbackConfig?.cdnIcon) {
        // Try the fallback CDN icon
        setCurrentKind(fallbackKind);
        return;
      }
    }

    // No CDN fallback available, use category SVG fallback
    cache.add(currentKind);
    setHasImageError(true);
    onError?.(kind);
  };

  if (resolution.type === "image") {
    return (
      <img
        src={resolution.url}
        alt={`${kind} icon`}
        width={size}
        height={size}
        className={className}
        onError={handleImageError}
        loading={eager ? "eager" : "lazy"}
      />
    );
  }

  const SvgComponent = resolution.component;
  return (
    <SvgComponent
      width={size}
      height={size}
      className={className}
      aria-label={`${kind} icon`}
    />
  );
};

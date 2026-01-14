// src/icons/services/iconResolver.ts
import { getCategoryForKind, hasCdnIcon, getCdnIconUrl, isCategoryName } from "../config/resourceIconMappings";
import { getFallbackIcon } from "../config/fallbackIcons";
import { getIconCache } from "./iconCache";
import type { IconResolution, IconCategory } from "../types/icon.types";

export interface ResolveIconOptions {
  kind: string;
  explicitCategory?: IconCategory;
  hasImageError?: boolean;
  unlabeled?: boolean;
}

export function resolveIcon(options: ResolveIconOptions): IconResolution {
  const { kind, explicitCategory, hasImageError = false, unlabeled = false } = options;
  const cache = getIconCache();

  // If there was an image error, skip CDN and use fallback
  if (hasImageError) {
    const category = explicitCategory ?? getCategoryForKind(kind);
    return {
      type: "svg",
      component: getFallbackIcon(category),
      source: category === "default" ? "default" : "category",
    };
  }

  // PRIORITY 1: Try CDN if icon exists and hasn't failed before
  const hasFailed = cache.has(kind);
  if (hasCdnIcon(kind) && !hasFailed) {
    const url = getCdnIconUrl(kind, unlabeled);
    
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Icon] Resolving "${kind}": CDN URL = ${url}`);
    }
    
    return {
      type: "image",
      url,
      source: "cdn",
    };
  }

  // PRIORITY 2: Use category-based fallback
  const category = explicitCategory ?? (isCategoryName(kind) ? kind as IconCategory : getCategoryForKind(kind));
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Icon] Resolving "${kind}": Using fallback category = ${category}`);
  }
  
  return {
    type: "svg",
    component: getFallbackIcon(category),
    source: category === "default" ? "default" : "category",
  };
}

export async function preloadIcons(kinds: string[], unlabeled: boolean = false): Promise<void> {
  const cache = getIconCache();

  const promises = kinds
    .filter((kind) => hasCdnIcon(kind) && !cache.has(kind))
    .map((kind) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => {
          cache.add(kind);
          resolve();
        };
        img.src = getCdnIconUrl(kind, unlabeled);
      });
    });

  await Promise.all(promises);
}

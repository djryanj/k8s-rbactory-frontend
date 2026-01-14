// src/icons/services/iconCache.ts
import type { IconCacheStats } from "../types/icon.types";

export class IconCache {
  private failedIcons = new Set<string>();
  private readonly maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  has(kind: string): boolean {
    return this.failedIcons.has(this.normalize(kind));
  }

  add(kind: string): void {
    const normalized = this.normalize(kind);

    if (this.failedIcons.size >= this.maxSize) {
      const firstItem = this.failedIcons.values().next().value;
      if (firstItem) {
        this.failedIcons.delete(firstItem);
      }
    }

    this.failedIcons.add(normalized);
  }

  remove(kind: string): boolean {
    return this.failedIcons.delete(this.normalize(kind));
  }

  clear(): void {
    this.failedIcons.clear();
  }

  getStats(): IconCacheStats {
    return {
      size: this.failedIcons.size,
      maxSize: this.maxSize,
      failedIcons: Array.from(this.failedIcons),
    };
  }

  private normalize(kind: string): string {
    return kind.toLowerCase().trim();
  }
}

let cacheInstance: IconCache | null = null;

export function getIconCache(): IconCache {
  if (!cacheInstance) {
    cacheInstance = new IconCache();
  }
  return cacheInstance;
}

export function resetIconCache(): void {
  cacheInstance = null;
}

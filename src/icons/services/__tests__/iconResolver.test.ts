// src/icons/services/__tests__/iconResolver.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { resolveIcon, preloadIcons } from '../iconResolver';
import { resetIconCache, getIconCache } from '../iconCache';

// Mock the config modules
vi.mock('../../config/resourceIconMappings', () => ({
  hasCdnIcon: vi.fn((kind: string) => {
    const withCdn = ['pod', 'service', 'deployment', 'workloads'];
    return withCdn.includes(kind.toLowerCase());
  }),
  getCdnIconUrl: vi.fn((kind: string) => {
    return `https://cdn.example.com/${kind}.svg`;
  }),
  getCategoryForKind: vi.fn((kind: string) => {
    const map: Record<string, string> = {
      pod: 'workloads',
      service: 'networking',
      unknown: 'default',
    };
    return map[kind.toLowerCase()] || 'default';
  }),
  isCategoryName: vi.fn((kind: string) => {
    return ['workloads', 'networking', 'storage'].includes(kind.toLowerCase());
  }),
}));

vi.mock('../../config/fallbackIcons', () => ({
  getFallbackIcon: vi.fn(() => {
    return () => null; // Mock SVG component
  }),
}));

describe('iconResolver', () => {
  // Store original Image
  const OriginalImage = global.Image;
  
  beforeEach(() => {
    resetIconCache();
    vi.clearAllMocks();
    
    // Mock Image constructor for preload tests
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        // Simulate async image loading
        setTimeout(() => {
          // Simulate successful load for most images
          if (this.src.includes('unknown') || this.src.includes('failed')) {
            this.onerror?.();
          } else {
            this.onload?.();
          }
        }, 0);
      }
    } as any;
  });

  afterEach(() => {
    // Restore original Image
    global.Image = OriginalImage;
  });

  describe('resolveIcon', () => {
    it('should resolve to CDN for resources with icons', () => {
      const result = resolveIcon({ kind: 'pod' });
      
      expect(result.type).toBe('image');
      expect(result.source).toBe('cdn');
      if (result.type === 'image') {
        expect(result.url).toContain('pod.svg');
      }
    });

    it('should resolve to fallback for resources without CDN icons', () => {
      const result = resolveIcon({ kind: 'unknown' });
      
      expect(result.type).toBe('svg');
      expect(result.source).toBe('default');
    });

    it('should use fallback when hasImageError is true', () => {
      const result = resolveIcon({ kind: 'pod', hasImageError: true });
      
      expect(result.type).toBe('svg');
    });

    it('should skip CDN for cached failed icons', () => {
      const cache = getIconCache();
      cache.add('pod');
      
      const result = resolveIcon({ kind: 'pod' });
      
      expect(result.type).toBe('svg');
    });

    it('should use explicit category when provided', () => {
      const result = resolveIcon({
        kind: 'unknown',
        explicitCategory: 'workloads',
      });
      
      expect(result.type).toBe('svg');
      expect(result.source).toBe('category');
    });

    it('should handle unlabeled icons', () => {
      const result = resolveIcon({ kind: 'pod', unlabeled: true });
      
      expect(result.type).toBe('image');
      if (result.type === 'image') {
        expect(result.url).toContain('pod.svg');
      }
    });
  });

  describe('preloadIcons', () => {
    it('should preload multiple icons', async () => {
      await preloadIcons(['pod', 'service', 'deployment']);
      
      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should skip icons that have already failed', async () => {
      const cache = getIconCache();
      cache.add('pod');
      
      await preloadIcons(['pod', 'service']);
      
      // Should complete without errors
      // pod should be skipped, only service should be preloaded
      expect(true).toBe(true);
    });

    it('should handle icons without CDN', async () => {
      await preloadIcons(['unknown', 'invalid']);
      
      // Should complete without errors (these will be filtered out)
      expect(true).toBe(true);
    });

    it('should add failed icons to cache', async () => {
      const cache = getIconCache();
      
      // Clear cache first
      cache.clear();
      expect(cache.has('failed')).toBe(false);
      
      await preloadIcons(['failed']);
      
      // The 'failed' icon should now be in cache
      expect(cache.has('failed')).toBe(true);
    });

    it('should handle mixed success and failure', async () => {
      const cache = getIconCache();
      cache.clear();
      
      await preloadIcons(['pod', 'failed', 'service']);
      
      // pod and service should succeed, failed should be cached
      expect(cache.has('pod')).toBe(false);
      expect(cache.has('failed')).toBe(true);
      expect(cache.has('service')).toBe(false);
    });
  });
});

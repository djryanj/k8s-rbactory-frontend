// src/icons/config/__tests__/resourceIconMappings.test.ts
import { describe, it, expect } from 'vitest';
import {
  getCategoryForKind,
  hasKindMapping,
  hasCdnIcon,
  getCdnIconUrl,
  getFallbackIconKind,
  isCategoryName,
  getCategoryIconName,
  getKindsWithCdnIcons,
  getIconConfig,
} from '../resourceIconMappings';

describe('resourceIconMappings', () => {
  describe('getCategoryForKind', () => {
    it('should return correct category for workload resources', () => {
      expect(getCategoryForKind('pod')).toBe('workloads');
      expect(getCategoryForKind('deployment')).toBe('workloads');
      expect(getCategoryForKind('statefulset')).toBe('workloads');
    });

    it('should return correct category for configuration resources', () => {
      expect(getCategoryForKind('configmap')).toBe('configuration');
      expect(getCategoryForKind('secret')).toBe('configuration');
    });

    it('should return correct category for storage resources', () => {
      expect(getCategoryForKind('persistentvolume')).toBe('storage');
      expect(getCategoryForKind('pvc')).toBe('storage');
    });

    it('should return correct category for networking resources', () => {
      expect(getCategoryForKind('service')).toBe('networking');
      expect(getCategoryForKind('ingress')).toBe('networking');
    });

    it('should return correct category for security resources', () => {
      expect(getCategoryForKind('role')).toBe('security');
      expect(getCategoryForKind('clusterrole')).toBe('security');
      expect(getCategoryForKind('serviceaccount')).toBe('security');
    });

    it('should return correct category for RBAC subjects', () => {
      expect(getCategoryForKind('user')).toBe('user');
      expect(getCategoryForKind('group')).toBe('group');
    });

    it('should return correct category for node resources', () => {
      expect(getCategoryForKind('node')).toBe('node');
      expect(getCategoryForKind('nodes')).toBe('node');
    });

    it('should return correct category for cluster resources', () => {
      expect(getCategoryForKind('cluster')).toBe('cluster');
      expect(getCategoryForKind('kubelet')).toBe('cluster');
    });

    it('should handle case insensitivity', () => {
      expect(getCategoryForKind('POD')).toBe('workloads');
      expect(getCategoryForKind('Service')).toBe('networking');
    });

    it('should return default for unknown resources', () => {
      expect(getCategoryForKind('unknown-resource')).toBe('default');
      expect(getCategoryForKind('')).toBe('default');
    });

    it('should handle plural forms', () => {
      expect(getCategoryForKind('pods')).toBe('workloads');
      expect(getCategoryForKind('services')).toBe('networking');
      expect(getCategoryForKind('nodes')).toBe('node');
    });
  });

  describe('hasKindMapping', () => {
    it('should return true for mapped resources', () => {
      expect(hasKindMapping('pod')).toBe(true);
      expect(hasKindMapping('service')).toBe(true);
      expect(hasKindMapping('node')).toBe(true);
    });

    it('should return false for unmapped resources', () => {
      expect(hasKindMapping('unknown')).toBe(false);
      expect(hasKindMapping('')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(hasKindMapping('POD')).toBe(true);
      expect(hasKindMapping('Service')).toBe(true);
    });
  });

  describe('hasCdnIcon', () => {
    it('should return true for resources with CDN icons', () => {
      expect(hasCdnIcon('pod')).toBe(true);
      expect(hasCdnIcon('service')).toBe(true);
      expect(hasCdnIcon('deployment')).toBe(true);
    });

    it('should return true for category names', () => {
      expect(hasCdnIcon('workloads')).toBe(true);
      expect(hasCdnIcon('networking')).toBe(true);
      expect(hasCdnIcon('cluster')).toBe(true);
    });

    it('should return false for resources without CDN icons', () => {
      expect(hasCdnIcon('resourcequota')).toBe(false);
      expect(hasCdnIcon('limitrange')).toBe(false);
    });

    it('should return false for unknown resources', () => {
      expect(hasCdnIcon('unknown')).toBe(false);
    });
  });

  describe('getCdnIconUrl', () => {
    it('should return labeled CDN URL for resources', () => {
      const url = getCdnIconUrl('pod');
      expect(url).toContain('labeled');
      expect(url).toContain('pod.svg');
    });

    it('should return unlabeled CDN URL when requested', () => {
      const url = getCdnIconUrl('pod', true);
      expect(url).toContain('unlabeled');
      expect(url).toContain('pod.svg');
    });

    it('should return unlabeled CDN URL for categories', () => {
      const url = getCdnIconUrl('workloads');
      expect(url).toContain('unlabeled');
      expect(url).toContain('pod.svg');
    });

    it('should handle abbreviations correctly', () => {
      const url = getCdnIconUrl('cm');
      expect(url).toContain('cm.svg');
    });

    it('should return empty string for resources without CDN icons', () => {
      expect(getCdnIconUrl('resourcequota')).toBe('');
      expect(getCdnIconUrl('unknown')).toBe('');
    });

    it('should map service account to sa', () => {
      const url = getCdnIconUrl('serviceaccount');
      expect(url).toContain('sa.svg');
    });
  });

  describe('getFallbackIconKind', () => {
    it('should return fallback for node', () => {
      expect(getFallbackIconKind('node')).toBe('node');
      expect(getFallbackIconKind('nodes')).toBe('node');
    });

    it('should return fallback for kubelet', () => {
      expect(getFallbackIconKind('kubelet')).toBe('cluster');
    });

    it('should return fallback for kube-proxy', () => {
      expect(getFallbackIconKind('kube-proxy')).toBe('cluster');
      expect(getFallbackIconKind('k-proxy')).toBe('cluster');
    });

    it('should return undefined for resources without fallback', () => {
      expect(getFallbackIconKind('pod')).toBeUndefined();
      expect(getFallbackIconKind('service')).toBeUndefined();
    });
  });

  describe('isCategoryName', () => {
    it('should return true for valid category names', () => {
      expect(isCategoryName('workloads')).toBe(true);
      expect(isCategoryName('networking')).toBe(true);
      expect(isCategoryName('cluster')).toBe(true);
    });

    it('should return false for resource kinds', () => {
      expect(isCategoryName('pod')).toBe(false);
      expect(isCategoryName('service')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isCategoryName('WORKLOADS')).toBe(true);
      expect(isCategoryName('Networking')).toBe(true);
    });
  });

  describe('getCategoryIconName', () => {
    it('should return icon name for categories', () => {
      expect(getCategoryIconName('workloads')).toBe('pod');
      expect(getCategoryIconName('networking')).toBe('svc');
      expect(getCategoryIconName('storage')).toBe('pv');
    });

    it('should return undefined for non-categories', () => {
      expect(getCategoryIconName('unknown')).toBeUndefined();
    });
  });

  describe('getKindsWithCdnIcons', () => {
    it('should return array of kinds with CDN icons', () => {
      const kinds = getKindsWithCdnIcons();
      expect(kinds).toContain('pod');
      expect(kinds).toContain('service');
      expect(kinds).toContain('deployment');
      expect(kinds).not.toContain('resourcequota');
    });
  });

  describe('getIconConfig', () => {
    it('should return config for valid resources', () => {
      const config = getIconConfig('pod');
      expect(config).toEqual({
        cdnIcon: 'pod',
        category: 'workloads',
      });
    });

    it('should return undefined for unknown resources', () => {
      expect(getIconConfig('unknown')).toBeUndefined();
    });

    it('should be case insensitive', () => {
      const config = getIconConfig('POD');
      expect(config).toBeDefined();
      expect(config?.category).toBe('workloads');
    });
  });
});

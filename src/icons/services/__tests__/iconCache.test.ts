// src/icons/services/__tests__/iconCache.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { IconCache, getIconCache, resetIconCache } from "../iconCache";

describe("IconCache", () => {
  let cache: IconCache;

  beforeEach(() => {
    cache = new IconCache(5); // Small size for testing
  });

  describe("add and has", () => {
    it("should add and check for icons", () => {
      expect(cache.has("pod")).toBe(false);
      cache.add("pod");
      expect(cache.has("pod")).toBe(true);
    });

    it("should normalize icon names", () => {
      cache.add("POD");
      expect(cache.has("pod")).toBe(true);
      expect(cache.has("Pod")).toBe(true);
    });

    it("should trim whitespace", () => {
      cache.add("  pod  ");
      expect(cache.has("pod")).toBe(true);
    });
  });

  describe("remove", () => {
    it("should remove icons from cache", () => {
      cache.add("pod");
      expect(cache.has("pod")).toBe(true);

      const removed = cache.remove("pod");
      expect(removed).toBe(true);
      expect(cache.has("pod")).toBe(false);
    });

    it("should return false when removing non-existent icon", () => {
      const removed = cache.remove("nonexistent");
      expect(removed).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all icons", () => {
      cache.add("pod");
      cache.add("service");
      cache.add("deployment");

      expect(cache.has("pod")).toBe(true);
      expect(cache.has("service")).toBe(true);

      cache.clear();

      expect(cache.has("pod")).toBe(false);
      expect(cache.has("service")).toBe(false);
      expect(cache.has("deployment")).toBe(false);
    });
  });

  describe("maxSize enforcement", () => {
    it("should enforce max size by removing oldest entry", () => {
      // Add 5 items (max size)
      cache.add("icon1");
      cache.add("icon2");
      cache.add("icon3");
      cache.add("icon4");
      cache.add("icon5");

      expect(cache.has("icon1")).toBe(true);

      // Add 6th item, should remove icon1
      cache.add("icon6");

      expect(cache.has("icon1")).toBe(false);
      expect(cache.has("icon6")).toBe(true);
    });
  });

  describe("getStats", () => {
    it("should return correct stats", () => {
      cache.add("pod");
      cache.add("service");

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(5);
      expect(stats.failedIcons).toContain("pod");
      expect(stats.failedIcons).toContain("service");
    });

    it("should return empty stats for empty cache", () => {
      const stats = cache.getStats();

      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(5);
      expect(stats.failedIcons).toEqual([]);
    });
  });
});

describe("getIconCache singleton", () => {
  beforeEach(() => {
    resetIconCache();
  });

  it("should return same instance", () => {
    const cache1 = getIconCache();
    const cache2 = getIconCache();

    expect(cache1).toBe(cache2);
  });

  it("should persist data across calls", () => {
    const cache1 = getIconCache();
    cache1.add("pod");

    const cache2 = getIconCache();
    expect(cache2.has("pod")).toBe(true);
  });

  it("should reset cache", () => {
    const cache1 = getIconCache();
    cache1.add("pod");

    resetIconCache();

    const cache2 = getIconCache();
    expect(cache2.has("pod")).toBe(false);
  });
});

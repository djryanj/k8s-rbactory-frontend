// src/test/vitest.d.ts
/// <reference types="vitest/globals" />

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  interface Assertion<T = any>
    extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {
    // This comment satisfies TypeScript that the interface is intentional
    not: Assertion<T>;
  }

  interface AsymmetricMatchersContaining
    extends jest.Matchers<void, any>, TestingLibraryMatchers<any, void> {
    // Intentionally extending for asymmetric matcher support
  }
}

export {};

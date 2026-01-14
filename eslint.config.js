// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Global ignores - applies to all configs
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      ".vite/**",
      "*.config.js",
      "*.config.ts",
    ],
  },

  // Base config for all TypeScript files
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  },

  // Strict type checking for main source files (excluding tests)
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/__tests__/**",
      "src/test/**",
    ],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Stricter rules for production code
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },

  // Config files (vite.config.ts, etc.)
  {
    files: ["*.config.{ts,js,mjs,cjs}", "vite.config.ts", "vitest.config.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: "./tsconfig.node.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Unit test files - use tsconfig.test.json
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}",
      "src/test/**/*.{ts,tsx}",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
      parserOptions: {
        project: "./tsconfig.test.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Relaxed rules for tests
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "react-refresh/only-export-components": "off",
    },
  },

  // E2E test files
  {
    files: ["e2e/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: "./tsconfig.e2e.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // E2E tests have different needs
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "react-refresh/only-export-components": "off",
    },
  }
);

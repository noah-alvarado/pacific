import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import solid from "eslint-plugin-solid/configs/typescript";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    ...eslint.configs.recommended,
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ignores: ["**/*.css"],
  },
  ...tseslint.configs.strictTypeChecked.map((cfg) => ({
    ...cfg,
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ignores: ["**/*.css"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((cfg) => ({
    ...cfg,
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ignores: ["**/*.css"],
  })),
  {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */
    ...jsxA11y.flatConfigs.strict,
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ignores: ["**/*.css"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...solid,
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
      parser: tsParser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js", "e2e/relay/*.js"],
        },
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^node:"],
            ["^(react|solid-js|@?\\w)"],
            ["^src/", "^components/", "^constants/"],
            ["^\\.\\./"],
            ["^\\./"],
            ["^\\./?$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
    ignores: ["**/*.css"],
  },
  {
    files: [
      "**/*.test.{ts,tsx}",
      "src/test/**/*.{ts,tsx}",
      "e2e/**/*.{js,ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/require-await": "off",
    },
  },
  eslintConfigPrettier,
]);

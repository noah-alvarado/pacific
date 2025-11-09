import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import globals from "globals";
import solid from "eslint-plugin-solid/configs/typescript";
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import importPlugin from "eslint-plugin-import";

export default defineConfig([
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      parser: tsParser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js"],
        },
        project: ["./tsconfig.json"],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // extends: [importPlugin.flatConfigs.recommended],
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
      // "import/first": "error",
      // "import/newline-after-import": ["error", { count: 1 }],
      // "import/no-duplicates": "error",
    },
    ignores: ["**/*.css"],
  },
  eslintConfigPrettier,
]);

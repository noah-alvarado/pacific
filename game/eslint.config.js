import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid/configs/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig } from "eslint/config";
import * as tsParser from "@typescript-eslint/parser";


export default defineConfig([
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  jsxA11y.flatConfigs.strict,
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
          allowDefaultProject: ['*.js'],
        },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
]);

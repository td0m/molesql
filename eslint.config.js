// npm i -D eslint typescript-eslint eslint-config-prettier eslint-plugin-import eslint-plugin-unused-imports @html-eslint/eslint-plugin @html-eslint/parser
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";
import eslintHTML from "@html-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  {
    ignores: ["dist", "node_modules", "eslint.config.js", ".prettierrc.js"],
  },
  // standard ts config stuff
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // here is our custom config
  {
    files: ["src/**/*.ts", "src/*.ts"],
    plugins: {
      import: importPlugin, // sort imports
      "@html-eslint": eslintHTML, // format html tagged template literals
      "unused-imports": unusedImports, // auto remove unused imports
    },
    rules: {
      "no-console": "off",
      "unused-imports/no-unused-imports": "warn",

      // TypeScript rules
      "@typescript-eslint/consistent-type-imports": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_a",
          varsIgnorePattern: "^_a",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Import rules
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
        },
      ],
      // Specifies the @html-eslint rules to apply to Template Literal.
      "@html-eslint/no-inline-styles": 1,
      "@html-eslint/indent": ["warn", 2], // let prettier handle this
    },
  },
  prettier,
]);

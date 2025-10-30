// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  // all JS is CommonJS
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },

  // Node globals
  {
    languageOptions: {
      globals: globals.node,
    },
  },

  // Jest tests
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  // base recommended rules
  pluginJs.configs.recommended,
];

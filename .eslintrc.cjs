"use strict";

const path = require("path");

const cjsGlobals = ["__dirname", "__filename", "require", "module", "exports"];

module.exports = {
  root: true,
  plugins: [
    "import",
    "jest",
    "prettier",
    "@babel/development",
    "@babel/development-internal",
  ],
  extends: "@babel/internal",
  rules: {
    "prettier/prettier": "error",
    "import/no-extraneous-dependencies": "error",
  },
  env: {
    node: true,
  },
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      rules: {
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "no-dupe-class-members": "off",
        "@typescript-eslint/no-dupe-class-members": "error",
        "no-undef": "off",
        "no-redeclare": "off",
      },
    },
    {
      files: [
        "packages/*/src/**/*.{js,ts,cjs}",
        "codemods/*/src/**/*.{js,ts,cjs}",
        "eslint/*/src/**/*.{js,ts,cjs}",
      ],
      rules: {
        "@babel/development/no-undefined-identifier": "error",
        "@babel/development/no-deprecated-clone": "error",
        "guard-for-in": "error",
        "import/extensions": ["error", { json: "always", cjs: "always" }],
      },
      globals: { PACKAGE_JSON: "readonly" },
    },
    {
      files: [
        "packages/*/test/**/*.js",
        "codemods/*/test/**/*.js",
        "eslint/*/test/**/*.js",
        "packages/babel-helper-transform-fixture-test-runner/src/helpers.{ts,js}",
        "test/**/*.js",
      ],
      env: {
        jest: true,
      },
      extends: "plugin:jest/recommended",
      rules: {
        "jest/expect-expect": "off",
        "jest/no-identical-title": "off",
        "jest/no-standalone-expect": "off",
        "jest/no-test-callback": "off",
        "jest/valid-describe": "off",
        "import/extensions": ["error", { json: "always", cjs: "always" }],
      },
    },
    {
      files: [
        "packages/*/src/**/*.{js,ts}",
        "codemods/*/src/**/*.{js,ts}",
        "eslint/*/src/**/*.{js,ts}",
        "packages/*/test/**/*.js",
        "codemods/*/test/**/*.js",
        "eslint/*/test/**/*.js",
        "packages/babel-helper-transform-fixture-test-runner/src/helpers.{ts,js}",
        "test/**/*.js",
      ],
      excludedFiles: [
        // @babel/register is the require() hook, so it will always be CJS-based
        "packages/babel-register/**/*.{js,ts}",
      ],
      rules: {
        "no-restricted-globals": ["error", ...cjsGlobals],
      },
    },
    {
      files: ["packages/babel-plugin-*/src/index.{js,ts}"],
      excludedFiles: ["packages/babel-plugin-transform-regenerator/**/*.js"],
      rules: {
        "@babel/development/plugin-name": "error",
        eqeqeq: ["error", "always", { null: "ignore" }],
      },
    },
    {
      files: ["packages/babel-parser/src/**/*.{js,ts}"],
      rules: {
        "@babel/development-internal/dry-error-messages": [
          "error",
          {
            errorModule: path.resolve(
              __dirname,
              "packages/babel-parser/src/parser/error.js"
            ),
          },
        ],
        "@babel/development-internal/report-error-message-format": "error",
      },
    },
    {
      files: ["packages/babel-helpers/src/helpers/**.js"],
      rules: {
        "no-var": "off",
        "comma-dangle": "off",
        "no-func-assign": "off",
        "import/no-extraneous-dependencies": "off",
      },
    },
    {
      files: ["packages/babel-traverse/scripts/**/*.js"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { packageDir: "./packages/babel-traverse" },
        ],
      },
    },
    {
      files: ["eslint/babel-eslint-parser/src/**/*.js"],
      rules: {
        "no-restricted-imports": ["error", "@babel/core"],
      },
    },
    {
      files: ["packages/babel-plugin-transform-runtime/scripts/**/*.js"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { packageDir: "./packages/babel-plugin-transform-runtime" },
        ],
      },
    },
    {
      files: ["scripts/**/*.js"],
      rules: {
        "import/no-extraneous-dependencies": ["error", { packageDir: "." }],
      },
    },
  ],
};

const supportsESM = parseInt(process.versions.node) >= 12;

module.exports = {
  collectCoverageFrom: [
    "packages/*/src/**/*.{js,mjs,ts}",
    "codemods/*/src/**/*.{js,mjs,ts}",
    "eslint/*/src/**/*.{js,mjs,ts}",
  ],
  // The eslint/* packages use ESLint v6, which has dropped support for Node v6.
  // TODO: Remove this process.version check in Babel 8.
  testRegex: `./(packages|codemods${
    Number(process.versions.node.split(".")[0]) < 10 ? "" : "|eslint"
  })/[^/]+/test/.+\\.m?js$`,
  testPathIgnorePatterns: [
    "/node_modules/",
    "/test/fixtures/",
    "/test/debug-fixtures/",
    "/babel-parser/test/expressions/",
    "/test/tmp/",
    "/test/__data__/",
    "/test/helpers/",
    "<rootDir>/test/warning\\.js",
    "<rootDir>/build/",
    "_browser\\.js",
  ],
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/testSetupFile.js"],
  transformIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/packages/babel-standalone/babel(\\.min)?\\.js",
    "/test/(fixtures|tmp|__data__)/",
    "<rootDir>/(packages|codemods|eslint)/[^/]+/lib/",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/packages/babel-standalone/babel(\\.min)?\\.js",
    "/test/(fixtures|tmp|__data__)/",
  ],
  modulePathIgnorePatterns: [
    "/test/fixtures/",
    "/test/tmp/",
    "/test/__data__/",
    "<rootDir>/build/",
  ],
  resolver: supportsESM ? "./test/jestExportsMapResolver.cjs" : null,
  // We don't need module name mappers here as depedencies of workspace
  // package should be declared explicitly in the package.json
  // Yarn will generate correct file links so that Jest can resolve correctly
  moduleNameMapper: null,
};

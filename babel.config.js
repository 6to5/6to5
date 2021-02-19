"use strict";

const pathUtils = require("path");
const fs = require("fs");

function normalize(src) {
  return src.replace(/\//, pathUtils.sep);
}

module.exports = function (api) {
  const env = api.env();

  const includeCoverage = process.env.BABEL_COVERAGE === "true";

  const envOptsNoTargets = {
    loose: true,
    shippedProposals: true,
    modules: false,
  };
  const envOpts = Object.assign({}, envOptsNoTargets);

  let convertESM = true;
  let ignoreLib = true;
  let includeRegeneratorRuntime = false;
  let needsPolyfillsForOldNode = false;

  let transformRuntimeOptions;

  const nodeVersion = bool(process.env.BABEL_8_BREAKING) ? "12.17" : "6.9";
  // The vast majority of our src files are modules, but we use
  // unambiguous to keep things simple until we get around to renaming
  // the modules to be more easily distinguished from CommonJS
  const unambiguousSources = [
    "packages/*/src",
    "packages/*/test",
    "codemods/*/src",
    "codemods/*/test",
    "eslint/*/src",
    "eslint/*/test",
  ];

  switch (env) {
    // Configs used during bundling builds.
    case "standalone":
      includeRegeneratorRuntime = true;
      unambiguousSources.push("packages/babel-runtime/regenerator");
    // fall through
    case "rollup":
      convertESM = false;
      ignoreLib = false;
      // rollup-commonjs will converts node_modules to ESM
      unambiguousSources.push(
        "/**/node_modules",
        "packages/babel-preset-env/data",
        "packages/babel-compat-data"
      );
      if (env === "rollup") envOpts.targets = { node: nodeVersion };
      needsPolyfillsForOldNode = true;
      break;
    case "test-ci": // In test-ci environment, we build babel on latest node but test on minimum supported legacy versions
    case "production":
      // Config during builds before publish.
      envOpts.targets = {
        node: nodeVersion,
      };
      needsPolyfillsForOldNode = true;
      break;
    case "development":
      envOpts.debug = true;
      envOpts.targets = {
        node: "current",
      };
      break;
    case "test":
      envOpts.targets = {
        node: "current",
      };
      break;
  }

  if (process.env.STRIP_BABEL_8_FLAG && bool(process.env.BABEL_8_BREAKING)) {
    // Never apply polyfills when compiling for Babel 8
    needsPolyfillsForOldNode = false;
  }

  if (includeRegeneratorRuntime) {
    const babelRuntimePkgPath = require.resolve("@babel/runtime/package.json");

    transformRuntimeOptions = {
      helpers: false, // Helpers are handled by rollup when needed
      regenerator: true,
      version: require(babelRuntimePkgPath).version,
    };
  }

  const config = {
    // Our dependencies are all standard CommonJS, along with all sorts of
    // other random files in Babel's codebase, so we use script as the default,
    // and then mark actual modules as modules farther down.
    sourceType: "script",
    comments: false,
    ignore: [
      // These may not be strictly necessary with the newly-limited scope of
      // babelrc searching, but including them for now because we had them
      // in our .babelignore before.
      "packages/*/test/fixtures",
      ignoreLib ? "packages/*/lib" : null,
      "packages/babel-standalone/babel.js",
    ]
      .filter(Boolean)
      .map(normalize),
    presets: [
      [
        "@babel/preset-typescript",
        { onlyRemoveTypeImports: true, allowDeclareFields: true },
      ],
      ["@babel/env", envOpts],
      ["@babel/preset-flow", { allowDeclareFields: true }],
    ],
    plugins: [
      [
        "@babel/proposal-object-rest-spread",
        { useBuiltIns: true, loose: true },
      ],

      convertESM ? "@babel/proposal-export-namespace-from" : null,
      convertESM ? "@babel/transform-modules-commonjs" : null,

      pluginPackageJsonMacro,

      process.env.STRIP_BABEL_8_FLAG && [
        pluginToggleBabel8Breaking,
        { breaking: bool(process.env.BABEL_8_BREAKING) },
      ],
      needsPolyfillsForOldNode && pluginPolyfillsOldNode,
    ].filter(Boolean),
    overrides: [
      {
        test: [
          "packages/babel-parser",
          "packages/babel-helper-validator-identifier",
        ].map(normalize),
        plugins: [
          "babel-plugin-transform-charcodes",
          ["@babel/transform-for-of", { assumeArray: true }],
        ],
      },
      {
        test: ["./packages/babel-cli", "./packages/babel-core"].map(normalize),
        plugins: [
          // Explicitly use the lazy version of CommonJS modules.
          convertESM
            ? ["@babel/transform-modules-commonjs", { lazy: true }]
            : null,
        ].filter(Boolean),
      },
      {
        test: normalize("./packages/babel-polyfill"),
        presets: [["@babel/env", envOptsNoTargets]],
      },
      {
        test: unambiguousSources.map(normalize),
        sourceType: "unambiguous",
      },
      includeRegeneratorRuntime && {
        exclude: /regenerator-runtime/,
        plugins: [["@babel/transform-runtime", transformRuntimeOptions]],
      },
    ].filter(Boolean),
  };

  // we need to do this as long as we do not test everything from source
  if (includeCoverage) {
    config.auxiliaryCommentBefore = "istanbul ignore next";
    config.plugins.push("babel-plugin-istanbul");
  }

  return config;
};

// env vars from the cli are always strings, so !!ENV_VAR returns true for "false"
function bool(value) {
  return value && value !== "false" && value !== "0";
}

// A minimum semver GTE implementation
// Limitation:
// - it only supports comparing major and minor version, assuming Node.js will never ship
//   features in patch release so we will never need to compare a version with "1.2.3"
//
// @example
// semverGte("8.10", "8.9") // true
// semverGte("8.9", "8.9") // true
// semverGte("9.0", "8.9") // true
// semverGte("8.9", "8.10") // false
// TODO: figure out how to inject it to the `@babel/template` usage so we don't need to
// copy and paste it.
// `((v,w)=>(v=v.split("."),w=w.split("."),+v[0]>+w[0]||v[0]==w[0]&&+v[1]>=+w[1]))`;

// TODO(Babel 8) This polyfills are only needed for Node.js 6 and 8
/** @param {import("@babel/core")} api */
function pluginPolyfillsOldNode({ template, types: t }) {
  const polyfills = [
    {
      name: "require.resolve",
      necessary({ node, parent }) {
        return (
          t.isCallExpression(parent, { callee: node }) &&
          parent.arguments.length > 1
        );
      },
      supported({ parent: { arguments: args } }) {
        return (
          t.isObjectExpression(args[1]) &&
          args[1].properties.length === 1 &&
          t.isIdentifier(args[1].properties[0].key, { name: "paths" }) &&
          t.isArrayExpression(args[1].properties[0].value) &&
          args[1].properties[0].value.elements.length === 1
        );
      },
      // require.resolve's paths option has been introduced in Node.js 8.9
      // https://nodejs.org/api/modules.html#modules_require_resolve_request_options
      replacement: template({ syntacticPlaceholders: true })`
        ((v,w)=>(v=v.split("."),w=w.split("."),+v[0]>+w[0]||v[0]==w[0]&&+v[1]>=+w[1]))(process.versions.node, "8.9")
          ? require.resolve
          : (/* request */ r, { paths: [/* base */ b] }, M = require("module")) => {
              let /* filename */ f = M._findPath(r, M._nodeModulePaths(b).concat(b));
              if (f) return f;
              f = new Error(\`Cannot resolve module '\${r}'\`);
              f.code = "MODULE_NOT_FOUND";
              throw f;
            }
      `,
    },
    {
      // NOTE: This polyfills depends on the "make-dir" library. Any package
      // using fs.mkdirSync must have "make-dir" as a dependency.
      name: "fs.mkdirSync",
      necessary({ node, parent }) {
        return (
          t.isCallExpression(parent, { callee: node }) &&
          parent.arguments.length > 1
        );
      },
      supported({ parent: { arguments: args } }) {
        return (
          t.isObjectExpression(args[1]) &&
          args[1].properties.length === 1 &&
          t.isIdentifier(args[1].properties[0].key, { name: "recursive" }) &&
          t.isBooleanLiteral(args[1].properties[0].value, { value: true })
        );
      },
      // fs.mkdirSync's recursive option has been introduced in Node.js 10.12
      // https://nodejs.org/api/fs.html#fs_fs_mkdirsync_path_options
      replacement: template`
        ((v,w)=>(v=v.split("."),w=w.split("."),+v[0]>+w[0]||v[0]==w[0]&&+v[1]>=+w[1]))(process.versions.node, "10.12")
          ? fs.mkdirSync
          : require("make-dir").sync
      `,
    },
    {
      // NOTE: This polyfills depends on the "node-environment-flags"
      // library. Any package using process.allowedNodeEnvironmentFlags
      // must have "node-environment-flags" as a dependency.
      name: "process.allowedNodeEnvironmentFlags",
      necessary({ parent, node }) {
        // To avoid infinite replacement loops
        return !t.isLogicalExpression(parent, { operator: "||", left: node });
      },
      supported: () => true,
      // process.allowedNodeEnvironmentFlags has been introduced in Node.js 10.10
      // https://nodejs.org/api/process.html#process_process_allowednodeenvironmentflags
      replacement: template`
        process.allowedNodeEnvironmentFlags || require("node-environment-flags")
      `,
    },
  ];

  return {
    visitor: {
      MemberExpression(path) {
        for (const polyfill of polyfills) {
          if (!path.matchesPattern(polyfill.name)) continue;

          if (!polyfill.necessary(path)) return;
          if (!polyfill.supported(path)) {
            throw path.buildCodeFrameError(
              `This '${polyfill.name}' usage is not supported by the inline polyfill.`
            );
          }

          path.replaceWith(polyfill.replacement());

          break;
        }
      },
    },
  };
}

function pluginToggleBabel8Breaking({ types: t }, { breaking }) {
  return {
    visitor: {
      "IfStatement|ConditionalExpression"(path) {
        let test = path.get("test");
        let keepConsequent = breaking;

        if (test.isUnaryExpression({ operator: "!" })) {
          test = test.get("argument");
          keepConsequent = !keepConsequent;
        }

        // yarn-plugin-conditions inject bool(process.env.BABEL_8_BREAKING)
        // tests, to properly cast the env variable to a boolean.
        if (
          test.isCallExpression() &&
          test.get("callee").isIdentifier({ name: "bool" }) &&
          test.get("arguments").length === 1
        ) {
          test = test.get("arguments")[0];
        }

        if (!test.matchesPattern("process.env.BABEL_8_BREAKING")) return;

        path.replaceWith(
          keepConsequent
            ? path.node.consequent
            : path.node.alternate || t.emptyStatement()
        );
      },
      MemberExpression(path) {
        if (path.matchesPattern("process.env.BABEL_8_BREAKING")) {
          throw path.buildCodeFrameError("This check could not be stripped.");
        }
      },
    },
  };
}

function pluginPackageJsonMacro({ types: t }) {
  const fnName = "PACKAGE_JSON";

  return {
    visitor: {
      ReferencedIdentifier(path) {
        if (path.isIdentifier({ name: fnName })) {
          throw path.buildCodeFrameError(
            `"${fnName}" is only supported in member expressions.`
          );
        }
      },
      MemberExpression(path) {
        if (!path.get("object").isIdentifier({ name: fnName })) return;

        if (path.node.computed) {
          throw path.buildCodeFrameError(
            `"${fnName}" does not support computed properties.`
          );
        }
        const field = path.node.property.name;

        // TODO: When dropping old Node.js versions, use require.resolve
        // instead of looping through the folders hierarchy

        let pkg;
        for (let dir = pathUtils.dirname(this.filename); ; ) {
          try {
            pkg = fs.readFileSync(pathUtils.join(dir, "package.json"), "utf8");
            break;
          } catch (_) {}

          const prev = dir;
          dir = pathUtils.resolve(dir, "..");

          // We are in the root and didn't find a package.json file
          if (dir === prev) return;
        }

        const value = JSON.parse(pkg)[field];
        path.replaceWith(t.valueToNode(value));
      },
    },
  };
}

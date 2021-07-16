"use strict";

const fs = require("fs");
const { addElectronSupportFromChromium } = require("./chromium-to-electron");

const envs = require("../build/compat-table/environments");
const parseEnvsVersions = require("../build/compat-table/build-utils/parse-envs-versions");
const interpolateAllResults = require("../build/compat-table/build-utils/interpolate-all-results");
const compareVersions = require("../build/compat-table/build-utils/compare-versions");

const envsVersions = parseEnvsVersions(envs);

const compatSources = ["es5", "es6", "es2016plus", "esnext"].map(source => {
  const data = require(`../build/compat-table/data-${source}`);
  interpolateAllResults(data.tests, envs);
  return data;
});

// End of compat-table code adaptation

exports.environments = [
  "chrome",
  "opera",
  "edge",
  "firefox",
  "safari",
  "node",
  "ie",
  "android",
  "ios",
  "phantom",
  "samsung",
  "rhino",
];

const compatibilityTests = compatSources.flatMap(data =>
  data.tests.flatMap(test => {
    if (!test.subtests) return test;

    return test.subtests.map(subtest =>
      Object.assign({}, subtest, {
        name: test.name + " / " + subtest.name,
        group: test.name,
      })
    );
  })
);

exports.getLowestImplementedVersion = (
  { features },
  env,
  exclude = () => false
) => {
  const tests = compatibilityTests.filter(test => {
    // TODO (Babel 9): Use ||=, &&=
    let ok = features.includes(test.name);
    ok = ok || (test.group && features.includes(test.group));
    ok = ok || (features.length === 1 && test.name.startsWith(features[0]));
    ok = ok && !exclude(test.name);
    return ok;
  });

  const envTests = tests.map(({ res }) => {
    const versions = envsVersions[env];
    let i = versions.length - 1;

    // Find the last not-implemented version
    for (; i >= 0; i--) {
      const { id } = versions[i];
      // Babel assumes strict mode
      if (res[id] !== true && res[id] !== "strict") {
        break;
      }
    }

    return envsVersions[env][i + 1];
  });

  if (envTests.length === 0 || envTests.some(t => !t)) return null;

  const result = envTests.reduce((a, b) => {
    return compareVersions(a, b) > 0 ? a : b;
  });

  // NOTE(bng): A number of environments in compat-table changed to
  // include a trailing zero (node10 -> node10_0), so for now stripping
  // it to be consistent
  return result.version.join(".").replace(/\.0$/, "");
};

exports.generateData = (environments, features) => {
  const data = {};

  // eslint-disable-next-line prefer-const
  for (let [key, options] of Object.entries(features)) {
    if (!options.features) {
      options = {
        features: [options],
      };
    }

    const plugin = {};

    environments.forEach(env => {
      const version = exports.getLowestImplementedVersion(options, env);
      if (version) plugin[env] = version;
    });
    addElectronSupportFromChromium(plugin);

    data[key] = plugin;
  }

  return data;
};

exports.writeFile = function (data, dataPath, name) {
  const stringified = JSON.stringify(data, null, 2) + "\n";
  if (process.env.CHECK_COMPAT_DATA) {
    const currentData = fs.readFileSync(dataPath, "utf8");

    // Compare as JSON strings to also check keys ordering
    if (currentData !== stringified) {
      console.error(
        `The newly generated ${name} data does not match the current ` +
          "files. Re-run `make build-compat-data`."
      );

      return false;
    }
  } else {
    fs.writeFileSync(dataPath, stringified);
  }
  return true;
};

import { hasOwnDecorators } from "./decorators";

export const FEATURES = Object.freeze({
  //classes: 1 << 0,
  fields: 1 << 1,
  privateMethods: 1 << 2,
  decorators: 1 << 3,
  privateIn: 1 << 4,
});

const featuresSameLoose = new Map([
  [FEATURES.fields, "@babel/plugin-proposal-class-properties"],
  [FEATURES.privateMethods, "@babel/plugin-proposal-private-methods"],
  [
    FEATURES.privateIn,
    "@babel/plugin-proposal-private-private-property-in-object",
  ],
]);

// We can't use a symbol because this needs to always be the same, even if
// this package isn't deduped by npm. e.g.
//  - node_modules/
//    - @babel/plugin-class-features
//    - @babel/plugin-proposal-decorators
//      - node_modules
//        - @babel-plugin-class-features
const featuresKey = "@babel/plugin-class-features/featuresKey";
const looseKey = "@babel/plugin-class-features/looseKey";

// See https://github.com/babel/babel/issues/11622.
// Since preset-env sets loose for the fields and private methods plugins, it can
// cause conflicts with the loose mode set by an explicit plugin in the config.
// To solve this problem, we ignore preset-env's loose mode if another plugin
// explicitly sets it
// The code to handle this logic doesn't check that "low priority loose" is always
// the same. However, it is only set by the preset and not directly by users:
// unless someone _wants_ to break it, it shouldn't be a problem.
const looseLowPriorityKey =
  "@babel/plugin-class-features/looseLowPriorityKey/#__internal__@babel/preset-env__please-overwrite-loose-instead-of-throwing";

export function enableFeature(file, feature, loose) {
  // We can't blindly enable the feature because, if it was already set,
  // "loose" can't be changed, so that
  //   @babel/plugin-class-properties { loose: true }
  //   @babel/plugin-class-properties { loose: false }
  // is transformed in loose mode.
  // We only enabled the feature if it was previously disabled.
  if (!hasFeature(file, feature) || canIgnoreLoose(file, feature)) {
    file.set(featuresKey, file.get(featuresKey) | feature);
    if (
      loose ===
      "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error"
    ) {
      setLoose(file, feature, true);
      file.set(looseLowPriorityKey, file.get(looseLowPriorityKey) | feature);
    } else if (
      loose ===
      "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
    ) {
      setLoose(file, feature, false);
      file.set(looseLowPriorityKey, file.get(looseLowPriorityKey) | feature);
    } else {
      setLoose(file, feature, loose);
    }
  }

  let resolvedLoose: void | true | false;
  let higherPriorityPluginName: void | string;

  for (const [mask, name] of featuresSameLoose) {
    if (!hasFeature(file, mask)) continue;

    const loose = isLoose(file, mask);

    if (canIgnoreLoose(file, mask)) {
      continue;
    } else if (resolvedLoose === !loose) {
      let { filename } = file.opts;
      if (!filename || filename === "unknown") {
        filename = "[name of the input file]";
      }

      throw new Error(
        "'loose' mode configuration must be the same for @babel/plugin-proposal-class-properties, " +
          "@babel/plugin-proposal-private-methods and " +
          "@babel/plugin-proposal-private-property-in-object (when they are enabled)." +
          "\n\nIf you already set the same 'loose' mode for these plugins in your config, " +
          "it's possible that they are enabled multiple times with different options." +
          `\nYou can re-run Babel with the BABEL_SHOW_CONFIG_FOR=${filename}` +
          " environment variable to show the loaded configuration.",
      );
    } else {
      resolvedLoose = loose;
      higherPriorityPluginName = name;
    }
  }

  if (resolvedLoose !== undefined) {
    for (const [mask, name] of featuresSameLoose) {
      if (hasFeature(file, mask) && isLoose(file, mask) !== resolvedLoose) {
        setLoose(file, mask, resolvedLoose);

        let { filename } = file.opts;
        if (!filename || filename === "unknown") {
          filename = "[name of the input file]";
        }
        console.warn(
          `Though the "loose" option was set to "${!resolvedLoose}" in your @babel/preset-env ` +
            `config, it will not be used for ${name} since the "loose" mode option was set to ` +
            `"${resolvedLoose}" for ${higherPriorityPluginName}.\nThe "loose" option must be the ` +
            `same for @babel/plugin-proposal-class-properties, @babel/plugin-proposal-private-methods ` +
            `and @babel/plugin-proposal-private-property-in-object (when they are enabled): you can ` +
            `silence this warning by explicitly adding\n` +
            `\t["${name}", { "loose": ${resolvedLoose} }]\n` +
            `to the "plugins" section of your Babel config.` +
            `\nYou can re-run Babel with the BABEL_SHOW_CONFIG_FOR=${filename}` +
            ` environment variable to show the loaded configuration.`,
        );
      }
    }
  }
}

function hasFeature(file, feature) {
  return !!(file.get(featuresKey) & feature);
}

export function isLoose(file, feature) {
  return !!(file.get(looseKey) & feature);
}

function setLoose(file, feature, loose) {
  if (loose) file.set(looseKey, file.get(looseKey) | feature);
  else file.set(looseKey, file.get(looseKey) & ~feature);

  file.set(looseLowPriorityKey, file.get(looseLowPriorityKey) & ~feature);
}

function canIgnoreLoose(file, feature) {
  return !!(file.get(looseLowPriorityKey) & feature);
}

export function verifyUsedFeatures(path, file) {
  if (hasOwnDecorators(path.node)) {
    if (!hasFeature(file, FEATURES.decorators)) {
      throw path.buildCodeFrameError(
        "Decorators are not enabled." +
          "\nIf you are using " +
          '["@babel/plugin-proposal-decorators", { "legacy": true }], ' +
          'make sure it comes *before* "@babel/plugin-proposal-class-properties" ' +
          "and enable loose mode, like so:\n" +
          '\t["@babel/plugin-proposal-decorators", { "legacy": true }]\n' +
          '\t["@babel/plugin-proposal-class-properties", { "loose": true }]',
      );
    }

    if (path.isPrivate()) {
      throw path.buildCodeFrameError(
        `Private ${
          path.isClassMethod() ? "methods" : "fields"
        } in decorated classes are not supported yet.`,
      );
    }
  }

  // NOTE: We can't use path.isPrivateMethod() because it isn't supported in <7.2.0
  if (path.isPrivate() && path.isMethod()) {
    if (!hasFeature(file, FEATURES.privateMethods)) {
      throw path.buildCodeFrameError("Class private methods are not enabled.");
    }
  }

  if (
    path.isPrivateName() &&
    path.parentPath.isBinaryExpression({
      operator: "in",
      left: path.node,
    })
  ) {
    if (!hasFeature(file, FEATURES.privateIn)) {
      throw path.buildCodeFrameError(
        "Private property in checks are not enabled.",
      );
    }
  }

  if (path.isProperty()) {
    if (!hasFeature(file, FEATURES.fields)) {
      throw path.buildCodeFrameError("Class fields are not enabled.");
    }
  }
}

/* eslint-disable @babel/development/plugin-name */
import { createRegExpFeaturePlugin } from "@babel/helper-create-regexp-features-plugin";

export default function (core, options) {
  const { runtime = true } = options;
  if (typeof runtime !== "boolean") {
    throw new Error("The 'runtime' option must be boolean");
  }

  return createRegExpFeaturePlugin({
    name: "transform-named-capturing-groups-regex",
    feature: "namedCaptureGroups",
    options: { runtime },
  });
}

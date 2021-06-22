import { declare } from "@babel/helper-plugin-utils";

function removePlugin(plugins, name) {
  const indices = [];
  plugins.forEach((plugin, i) => {
    const n = Array.isArray(plugin) ? plugin[0] : plugin;

    if (n === name) {
      indices.unshift(i);
    }
  });

  for (const i of indices) {
    plugins.splice(i, 1);
  }
}

export default declare((api, { isTSX }) => {
  api.assertVersion(7);

  return {
    name: "syntax-typescript",

    manipulateOptions(opts, parserOpts) {
      const { plugins } = parserOpts;
      // If the Flow syntax plugin already ran, remove it since Typescript
      // takes priority.
      removePlugin(plugins, "flow");

      // If the JSX syntax plugin already ran, remove it because JSX handling
      // in TS depends on the extensions, and is purely dependent on 'isTSX'.
      removePlugin(plugins, "jsx");

      parserOpts.plugins.push("typescript", "classProperties");

      if (!process.env.BABEL_8_BREAKING) {
        // This is enabled by default since @babel/parser 7.1.5
        parserOpts.plugins.push("objectRestSpread");
      }

      if (isTSX) {
        parserOpts.plugins.push("jsx");
      }
    },
  };
});

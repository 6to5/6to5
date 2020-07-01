import { declare } from "@babel/helper-plugin-utils";
import transformReactJSX from "@babel/plugin-transform-react-jsx";
import transformReactJSXDevelopment from "@babel/plugin-transform-react-jsx-development";
import transformReactDisplayName from "@babel/plugin-transform-react-display-name";
import transformReactJSXSource from "@babel/plugin-transform-react-jsx-source";
import transformReactJSXSelf from "@babel/plugin-transform-react-jsx-self";
import transformReactPure from "@babel/plugin-transform-react-pure-annotations";
import normalizeOptions from "./normalize-options";

export default declare((api, opts) => {
  api.assertVersion(7);

  const {
    development,
    pragma,
    pragmaFrag,
    pure,
    throwIfNamespace,
    runtime,
    importSource,
  } = normalizeOptions(opts);

  const transformReactJSXPlugin =
    runtime === "automatic" && development
      ? transformReactJSXDevelopment
      : transformReactJSX;

  return {
    plugins: [
      [
        transformReactJSXPlugin,
        {
          importSource,
          pragma,
          pragmaFrag,
          runtime,
          throwIfNamespace,
          pure,
        },
      ],
      transformReactDisplayName,
      pure !== false && transformReactPure,

      development && runtime === "classic" && transformReactJSXSource,
      development && runtime === "classic" && transformReactJSXSelf,
    ].filter(Boolean),
  };
});

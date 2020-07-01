import { declare } from "@babel/helper-plugin-utils";
import transformFlowStripTypes from "@babel/plugin-transform-flow-strip-types";
import normalizeOptions from "./normalize-options";

export default declare((api, opts) => {
  const { all, allowDeclareFields, ignoreExtensions } = normalizeOptions(opts);
  api.assertVersion(7);

  const flowPlugin = [transformFlowStripTypes, { all, allowDeclareFields }];

  if (ignoreExtensions) {
    return { plugins: [flowPlugin] };
  }

  return {
    overrides: [
      {
        test: filename => filename == null || !/\.tsx?$/.test(filename),
        plugins: [flowPlugin],
      },
    ],
  };
});

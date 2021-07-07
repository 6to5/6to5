import { declare } from "@babel/helper-plugin-utils";
import convertFunctionParams from "./params";
import convertFunctionRest from "./rest";
export { convertFunctionParams };

export default declare((api, options) => {
  api.assertVersion(7);

  const ignoreFunctionLength =
    api.assumption("ignoreFunctionLength") ?? options.loose;
  const noNewArrows = api.assumption("noNewArrows");

  return {
    name: "transform-parameters",

    visitor: {
      Function(path) {
        if (
          path.isArrowFunctionExpression() &&
          path
            .get("params")
            .some(param => param.isRestElement() || param.isAssignmentPattern())
        ) {
          // default/rest visitors require access to `arguments`, so it cannot be an arrow
          path.arrowFunctionToExpression({ noNewArrows });
        }

        const convertedRest = convertFunctionRest(path);
        const convertedParams = convertFunctionParams(
          path,
          ignoreFunctionLength,
        );

        if (convertedRest || convertedParams) {
          // Manually reprocess this scope to ensure that the moved params are updated.
          path.scope.crawl();
        }
      },
    },
  };
});

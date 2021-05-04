/* eslint-disable @babel/development/plugin-name */

import { declare } from "@babel/helper-plugin-utils";
import { traverse } from "@babel/core";
import { isRequired } from "@babel/helper-compilation-targets";
import compatData from "@babel/compat-data/es";

import toPublicFields from "./transforms/target-public-fields";
import toPrivateFields from "./transforms/target-private-fields";
import privateOptionalChain from "./transforms/private-optional-chain";

export default declare((api, options) => {
  api.assertVersion(7);

  let visitor;

  if (options.targetSyntax === "classes") {
    if (options.compilePrivateOptional) {
      throw new Error(
        ".compilePrivateOptional can only be enabled when .targetSyntax is 'privateFields'",
      );
    }
    // TODO
  } else if (options.targetSyntax === "publicFields") {
    if (options.compilePrivateOptional) {
      throw new Error(
        ".compilePrivateOptional can only be enabled when .targetSyntax is 'privateFields'",
      );
    }
    visitor = toPublicFields(api);
  } else if (options.targetSyntax === "privateFields") {
    visitor = toPrivateFields(api);
    if (options.compilePrivateOptional) {
      visitor = traverse.visitors.merge([visitor, privateOptionalChain(api)]);
    }
  } else if (options.targetsSyntax == null) {
    const targets = api.targets();
    const supported = feat => !isRequired(feat, targets, { compatData });

    if (supported("private-class-fields")) {
      if (!supported("private-class-methods")) {
        visitor = toPrivateFields(api);
      }
      if (!supported("private-class-fields-optional-chaining")) {
        visitor = traverse.visitors.merge([visitor, privateOptionalChain(api)]);
      }
    } else {
      visitor = toPublicFields(api);
    }
  } else {
    throw new Error("Invalid");
  }

  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("classStaticBlock", "privateIn");
    },
    visitor,
  };
});

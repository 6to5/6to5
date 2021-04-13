import { declare } from "@babel/helper-plugin-utils";
import syntaxPipelineOperator from "@babel/plugin-syntax-pipeline-operator";
import minimalVisitor from "./minimalVisitor";
import hackVisitor from "./hackVisitor";
import fsharpVisitor from "./fsharpVisitor";
import smartVisitor from "./smartVisitor";

const visitorsPerProposal = {
  minimal: minimalVisitor,
  hack: hackVisitor,
  fsharp: fsharpVisitor,
  smart: smartVisitor,
};

export default declare((api, options) => {
  api.assertVersion(7);

  return {
    name: "proposal-pipeline-operator",
    inherits: syntaxPipelineOperator,
    visitor: visitorsPerProposal[options.proposal],
  };
});

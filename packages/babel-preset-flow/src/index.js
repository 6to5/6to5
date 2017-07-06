import transformFlowStripTypes from "babel-plugin-transform-flow-strip-types";

export default function() {
  return {
    plugins: [transformFlowStripTypes],
  };
}

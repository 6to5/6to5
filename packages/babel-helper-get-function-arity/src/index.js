import * as t from "babel-types";

export default function(node): number {
  const params: Array<Object> = node.params;
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    if (t.isAssignmentPattern(param) || t.isRestElement(param)) {
      return i;
    }
  }
  return params.length;
}

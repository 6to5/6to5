import nameFunction from "babel-helper-function-name";
import VanillaTransformer from "./vanilla";
import * as t from "babel-types";

export default class LooseClassTransformer extends VanillaTransformer {
  constructor() {
    super(...arguments);
    this.isLoose = true;
  }

  _processMethod(node, scope) {
    if (!node.decorators) {
      // use assignments instead of define properties for loose classes

      let classRef = this.classRef;
      if (!node.static) {
        classRef = t.memberExpression(classRef, t.identifier("prototype"));
      }
      const methodName = t.memberExpression(
        classRef,
        node.key,
        node.computed || t.isLiteral(node.key),
      );

      let func = t.functionExpression(
        null,
        node.params,
        node.body,
        node.generator,
        node.async,
      );
      func.returnType = node.returnType;
      const key = t.toComputedKey(node, node.key);
      if (t.isStringLiteral(key)) {
        func = nameFunction({
          node: func,
          id: key,
          scope,
        });
      }

      const expr = t.expressionStatement(
        t.assignmentExpression("=", methodName, func),
      );
      t.inheritsComments(expr, node);
      this.body.push(expr);
      return true;
    }
  }
}

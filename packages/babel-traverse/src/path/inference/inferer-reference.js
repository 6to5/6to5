import type NodePath from "../index";
import * as t from "babel-types";

export default function(node: Object) {
  if (!this.isReferenced()) return;

  // check if a binding exists of this value and if so then return a union type of all
  // possible types that the binding could be
  const binding = this.scope.getBinding(node.name);
  if (binding) {
    if (binding.identifier.typeAnnotation) {
      return binding.identifier.typeAnnotation;
    } else {
      return getTypeAnnotationBindingConstantViolations(this, node.name);
    }
  }

  // built-in values
  if (node.name === "undefined") {
    return t.voidTypeAnnotation();
  } else if (node.name === "NaN" || node.name === "Infinity") {
    return t.numberTypeAnnotation();
  } else if (node.name === "arguments") {
    // todo
  }
}

function getTypeAnnotationBindingConstantViolations(path, name) {
  const binding = path.scope.getBinding(name);

  const types = [];
  path.typeAnnotation = t.unionTypeAnnotation(types);

  const functionConstantViolations = [];
  let constantViolations = getConstantViolationsBefore(
    binding,
    path,
    functionConstantViolations,
  );

  const testType = getConditionalAnnotation(path, name);
  if (testType) {
    const testConstantViolations = getConstantViolationsBefore(
      binding,
      testType.ifStatement,
    );

    // remove constant violations observed before the IfStatement
    constantViolations = constantViolations.filter(
      path => testConstantViolations.indexOf(path) < 0,
    );

    // clear current types and add in observed test type
    types.push(testType.typeAnnotation);
  }

  if (constantViolations.length) {
    // pick one constant from each scope which will represent the last possible
    // control flow path that it could've taken/been
    /* This code is broken for the following problems:
     * It thinks that assignments can only happen in scopes.
     * What about conditionals, if statements without block,
     * or guarded assignments.
     * It also checks to see if one of the assignments is in the
     * same scope and uses that as the only "violation". However,
     * the binding is returned by `getConstantViolationsBefore` so we for
     * sure always going to return that as the only "violation".
    let rawConstantViolations = constantViolations.reverse();
    let visitedScopes = [];
    constantViolations = [];
    for (let violation of (rawConstantViolations: Array<NodePath>)) {
      let violationScope = violation.scope;
      if (visitedScopes.indexOf(violationScope) >= 0) continue;

      visitedScopes.push(violationScope);
      constantViolations.push(violation);

      if (violationScope === path.scope) {
        constantViolations = [violation];
        break;
      }
    }*/

    // add back on function constant violations since we can't track calls
    constantViolations = constantViolations.concat(functionConstantViolations);

    // push on inferred types of violated paths
    for (const violation of (constantViolations: Array<NodePath>)) {
      types.push(violation.getTypeAnnotation());
    }
  }

  if (types.length) {
    return t.createUnionTypeAnnotation(types);
  }
}

function getConstantViolationsBefore(binding, path, functions) {
  const violations = binding.constantViolations.slice();
  violations.unshift(binding.path);
  return violations.filter(violation => {
    violation = violation.resolve();
    const status = violation._guessExecutionStatusRelativeTo(path);
    if (functions && status === "function") functions.push(violation);
    return status === "before";
  });
}

function inferAnnotationFromBinaryExpression(name, path) {
  const operator = path.node.operator;

  const right = path.get("right").resolve();
  const left = path.get("left").resolve();

  let target;
  if (left.isIdentifier({ name })) {
    target = right;
  } else if (right.isIdentifier({ name })) {
    target = left;
  }
  if (target) {
    if (operator === "===") {
      return target.getTypeAnnotation();
    } else if (t.BOOLEAN_NUMBER_BINARY_OPERATORS.indexOf(operator) >= 0) {
      return t.numberTypeAnnotation();
    } else {
      return;
    }
  } else {
    if (operator !== "===") return;
  }

  //
  let typeofPath;
  let typePath;
  if (left.isUnaryExpression({ operator: "typeof" })) {
    typeofPath = left;
    typePath = right;
  } else if (right.isUnaryExpression({ operator: "typeof" })) {
    typeofPath = right;
    typePath = left;
  }
  if (!typePath && !typeofPath) return;

  // ensure that the type path is a Literal
  typePath = typePath.resolve();
  if (!typePath.isLiteral()) return;

  // and that it's a string so we can infer it
  const typeValue = typePath.node.value;
  if (typeof typeValue !== "string") return;

  // and that the argument of the typeof path references us!
  if (!typeofPath.get("argument").isIdentifier({ name })) return;

  // turn type value into a type annotation
  return t.createTypeAnnotationBasedOnTypeof(typePath.node.value);
}

function getParentConditionalPath(path) {
  let parentPath;
  while ((parentPath = path.parentPath)) {
    if (parentPath.isIfStatement() || parentPath.isConditionalExpression()) {
      if (path.key === "test") {
        return;
      } else {
        return parentPath;
      }
    } else {
      path = parentPath;
    }
  }
}

function getConditionalAnnotation(path, name) {
  const ifStatement = getParentConditionalPath(path);
  if (!ifStatement) return;

  const test = ifStatement.get("test");
  const paths = [test];
  const types = [];

  do {
    const path = paths.shift().resolve();

    if (path.isLogicalExpression()) {
      paths.push(path.get("left"));
      paths.push(path.get("right"));
    }

    if (path.isBinaryExpression()) {
      const type = inferAnnotationFromBinaryExpression(name, path);
      if (type) types.push(type);
    }
  } while (paths.length);

  if (types.length) {
    return {
      typeAnnotation: t.createUnionTypeAnnotation(types),
      ifStatement,
    };
  } else {
    return getConditionalAnnotation(ifStatement, name);
  }
}

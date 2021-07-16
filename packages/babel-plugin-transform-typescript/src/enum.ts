import assert from "assert";
import { template } from "@babel/core";
import type * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";

export default function transpileEnum(path, t) {
  const { node } = path;

  if (node.declare) {
    path.remove();
    return;
  }

  const name = node.id.name;
  const fill = enumFill(path, t, node.id);

  switch (path.parent.type) {
    case "BlockStatement":
    case "ExportNamedDeclaration":
    case "Program": {
      path.insertAfter(fill);
      if (seen(path.parentPath)) {
        path.remove();
      } else {
        const isGlobal = t.isProgram(path.parent); // && !path.parent.body.some(t.isModuleDeclaration);
        path.scope.registerDeclaration(
          path.replaceWith(makeVar(node.id, t, isGlobal ? "var" : "let"))[0],
        );
      }
      break;
    }

    default:
      throw new Error(`Unexpected enum parent '${path.parent.type}`);
  }

  function seen(parentPath: NodePath<t.Node>) {
    if (parentPath.isExportDeclaration()) {
      return seen(parentPath.parentPath);
    }

    if (parentPath.getData(name)) {
      return true;
    } else {
      parentPath.setData(name, true);
      return false;
    }
  }
}

function makeVar(id, t, kind) {
  return t.variableDeclaration(kind, [t.variableDeclarator(id)]);
}

const buildEnumWrapper = template(`
  (function (ID) {
    ASSIGNMENTS;
  })(ID || (ID = {}));
`);

const buildStringAssignment = template(`
  ENUM["NAME"] = VALUE;
`);

const buildNumericAssignment = template(`
  ENUM[ENUM["NAME"] = VALUE] = "NAME";
`);

const buildEnumMember = (isString, options) =>
  (isString ? buildStringAssignment : buildNumericAssignment)(options);

/**
 * Generates the statement that fills in the variable declared by the enum.
 * `(function (E) { ... assignments ... })(E || (E = {}));`
 */
function enumFill(path, t, id) {
  const x = translateEnumValues(path, t);
  const assignments = x.map(([memberName, memberValue]) =>
    buildEnumMember(t.isStringLiteral(memberValue), {
      ENUM: t.cloneNode(id),
      NAME: memberName,
      VALUE: memberValue,
    }),
  );

  return buildEnumWrapper({
    ID: t.cloneNode(id),
    ASSIGNMENTS: assignments,
  });
}

/**
 * Maps the name of an enum member to its value.
 * We keep track of the previous enum members so you can write code like:
 *   enum E {
 *     X = 1 << 0,
 *     Y = 1 << 1,
 *     Z = X | Y,
 *   }
 */
type PreviousEnumMembers = {
  [name: string]: number | string;
};

export function translateEnumValues(
  path: NodePath<t.TSEnumDeclaration>,
  t: typeof import("@babel/types"),
): Array<[name: string, value: t.Expression]> {
  const seen: PreviousEnumMembers = Object.create(null);
  // Start at -1 so the first enum member is its increment, 0.
  let prev: number | typeof undefined = -1;
  return path.node.members.map(member => {
    const name = t.isIdentifier(member.id) ? member.id.name : member.id.value;
    const initializer = member.initializer;
    let value: t.Expression;
    if (initializer) {
      const constValue = evaluate(initializer, seen);
      if (constValue !== undefined) {
        seen[name] = constValue;
        if (typeof constValue === "number") {
          value = t.numericLiteral(constValue);
          prev = constValue;
        } else {
          assert(typeof constValue === "string");
          value = t.stringLiteral(constValue);
          prev = undefined;
        }
      } else {
        value = initializer;
        prev = undefined;
      }
    } else {
      if (prev !== undefined) {
        prev++;
        value = t.numericLiteral(prev);
        seen[name] = prev;
      } else {
        throw path.buildCodeFrameError("Enum member must have initializer.");
      }
    }

    return [name, value];
  });
}

// Based on the TypeScript repository's `evalConstant` in `checker.ts`.
function evaluate(
  expr,
  seen: PreviousEnumMembers,
): number | string | typeof undefined {
  return evalConstant(expr);

  function evalConstant(expr): number | typeof undefined {
    switch (expr.type) {
      case "StringLiteral":
        return expr.value;
      case "UnaryExpression":
        return evalUnaryExpression(expr);
      case "BinaryExpression":
        return evalBinaryExpression(expr);
      case "NumericLiteral":
        return expr.value;
      case "ParenthesizedExpression":
        return evalConstant(expr.expression);
      case "Identifier":
        return seen[expr.name];
      case "TemplateLiteral":
        if (expr.quasis.length === 1) {
          return expr.quasis[0].value.cooked;
        }
      /* falls through */
      default:
        return undefined;
    }
  }

  function evalUnaryExpression({
    argument,
    operator,
  }): number | typeof undefined {
    const value = evalConstant(argument);
    if (value === undefined) {
      return undefined;
    }

    switch (operator) {
      case "+":
        return value;
      case "-":
        return -value;
      case "~":
        return ~value;
      default:
        return undefined;
    }
  }

  function evalBinaryExpression(expr): number | typeof undefined {
    const left = evalConstant(expr.left);
    if (left === undefined) {
      return undefined;
    }
    const right = evalConstant(expr.right);
    if (right === undefined) {
      return undefined;
    }

    switch (expr.operator) {
      case "|":
        return left | right;
      case "&":
        return left & right;
      case ">>":
        return left >> right;
      case ">>>":
        return left >>> right;
      case "<<":
        return left << right;
      case "^":
        return left ^ right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "%":
        return left % right;
      default:
        return undefined;
    }
  }
}

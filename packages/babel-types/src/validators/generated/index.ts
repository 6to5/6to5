/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'make build'
 */
import shallowEqual from "../../utils/shallowEqual";
import type * as t from "../..";

export function isArrayExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ArrayExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ArrayExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isAssignmentExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.AssignmentExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "AssignmentExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBinaryExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BinaryExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "BinaryExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isInterpreterDirective(
  node: object | null | undefined,
  opts?: object | null,
): node is t.InterpreterDirective {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "InterpreterDirective") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDirective(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Directive {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Directive") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDirectiveLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DirectiveLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DirectiveLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBlockStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BlockStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "BlockStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBreakStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BreakStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "BreakStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isCallExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.CallExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "CallExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isCatchClause(
  node: object | null | undefined,
  opts?: object | null,
): node is t.CatchClause {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "CatchClause") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isConditionalExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ConditionalExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ConditionalExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isContinueStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ContinueStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ContinueStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDebuggerStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DebuggerStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DebuggerStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDoWhileStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DoWhileStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DoWhileStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEmptyStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EmptyStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EmptyStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExpressionStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExpressionStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ExpressionStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFile(
  node: object | null | undefined,
  opts?: object | null,
): node is t.File {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "File") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isForInStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ForInStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ForInStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isForStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ForStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ForStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFunctionDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FunctionDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "FunctionDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFunctionExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FunctionExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "FunctionExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isIdentifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Identifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Identifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isIfStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.IfStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "IfStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isLabeledStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.LabeledStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "LabeledStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isStringLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.StringLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "StringLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNumericLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.NumericLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "NumericLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNullLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.NullLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "NullLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBooleanLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BooleanLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "BooleanLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isRegExpLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.RegExpLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "RegExpLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isLogicalExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.LogicalExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "LogicalExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isMemberExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.MemberExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "MemberExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNewExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.NewExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "NewExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isProgram(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Program {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Program") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectMethod(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectMethod {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectMethod") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectProperty {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isRestElement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.RestElement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "RestElement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isReturnStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ReturnStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ReturnStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isSequenceExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.SequenceExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "SequenceExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isParenthesizedExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ParenthesizedExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ParenthesizedExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isSwitchCase(
  node: object | null | undefined,
  opts?: object | null,
): node is t.SwitchCase {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "SwitchCase") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isSwitchStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.SwitchStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "SwitchStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isThisExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ThisExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ThisExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isThrowStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ThrowStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ThrowStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTryStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TryStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TryStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isUnaryExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.UnaryExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "UnaryExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isUpdateExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.UpdateExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "UpdateExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isVariableDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.VariableDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "VariableDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isVariableDeclarator(
  node: object | null | undefined,
  opts?: object | null,
): node is t.VariableDeclarator {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "VariableDeclarator") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isWhileStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.WhileStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "WhileStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isWithStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.WithStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "WithStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isAssignmentPattern(
  node: object | null | undefined,
  opts?: object | null,
): node is t.AssignmentPattern {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "AssignmentPattern") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isArrayPattern(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ArrayPattern {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ArrayPattern") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isArrowFunctionExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ArrowFunctionExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ArrowFunctionExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClassBody(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ClassBody {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ClassBody") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClassExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ClassExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ClassExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClassDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ClassDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ClassDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExportAllDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExportAllDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ExportAllDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExportDefaultDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExportDefaultDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ExportDefaultDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExportNamedDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExportNamedDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ExportNamedDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExportSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExportSpecifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ExportSpecifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isForOfStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ForOfStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ForOfStatement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isImportDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ImportDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ImportDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isImportDefaultSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ImportDefaultSpecifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ImportDefaultSpecifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isImportNamespaceSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ImportNamespaceSpecifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ImportNamespaceSpecifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isImportSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ImportSpecifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ImportSpecifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isMetaProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.MetaProperty {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "MetaProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClassMethod(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ClassMethod {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ClassMethod") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectPattern(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectPattern {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectPattern") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isSpreadElement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.SpreadElement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "SpreadElement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isSuper(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Super {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Super") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTaggedTemplateExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TaggedTemplateExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TaggedTemplateExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTemplateElement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TemplateElement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TemplateElement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTemplateLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TemplateLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TemplateLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isYieldExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.YieldExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "YieldExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isAwaitExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.AwaitExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "AwaitExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isImport(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Import {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Import") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBigIntLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BigIntLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "BigIntLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExportNamespaceSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExportNamespaceSpecifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ExportNamespaceSpecifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isOptionalMemberExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.OptionalMemberExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "OptionalMemberExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isOptionalCallExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.OptionalCallExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "OptionalCallExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClassProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ClassProperty {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ClassProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClassPrivateProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ClassPrivateProperty {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ClassPrivateProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClassPrivateMethod(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ClassPrivateMethod {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ClassPrivateMethod") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPrivateName(
  node: object | null | undefined,
  opts?: object | null,
): node is t.PrivateName {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "PrivateName") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isAnyTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.AnyTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "AnyTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isArrayTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ArrayTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ArrayTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBooleanTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BooleanTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "BooleanTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBooleanLiteralTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BooleanLiteralTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "BooleanLiteralTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNullLiteralTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.NullLiteralTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "NullLiteralTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClassImplements(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ClassImplements {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ClassImplements") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareClass(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareClass {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareClass") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareFunction(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareFunction {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareFunction") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareInterface(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareInterface {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareInterface") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareModule(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareModule {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareModule") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareModuleExports(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareModuleExports {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareModuleExports") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareTypeAlias(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareTypeAlias {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareTypeAlias") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareOpaqueType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareOpaqueType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareOpaqueType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareVariable(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareVariable {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareVariable") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareExportDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareExportDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareExportDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclareExportAllDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclareExportAllDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclareExportAllDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclaredPredicate(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DeclaredPredicate {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DeclaredPredicate") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExistsTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExistsTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ExistsTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFunctionTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FunctionTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "FunctionTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFunctionTypeParam(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FunctionTypeParam {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "FunctionTypeParam") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isGenericTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.GenericTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "GenericTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isInferredPredicate(
  node: object | null | undefined,
  opts?: object | null,
): node is t.InferredPredicate {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "InferredPredicate") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isInterfaceExtends(
  node: object | null | undefined,
  opts?: object | null,
): node is t.InterfaceExtends {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "InterfaceExtends") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isInterfaceDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.InterfaceDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "InterfaceDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isInterfaceTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.InterfaceTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "InterfaceTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isIntersectionTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.IntersectionTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "IntersectionTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isMixedTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.MixedTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "MixedTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEmptyTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EmptyTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EmptyTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNullableTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.NullableTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "NullableTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNumberLiteralTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.NumberLiteralTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "NumberLiteralTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNumberTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.NumberTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "NumberTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectTypeInternalSlot(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectTypeInternalSlot {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectTypeInternalSlot") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectTypeCallProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectTypeCallProperty {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectTypeCallProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectTypeIndexer(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectTypeIndexer {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectTypeIndexer") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectTypeProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectTypeProperty {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectTypeProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectTypeSpreadProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectTypeSpreadProperty {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ObjectTypeSpreadProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isOpaqueType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.OpaqueType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "OpaqueType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isQualifiedTypeIdentifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.QualifiedTypeIdentifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "QualifiedTypeIdentifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isStringLiteralTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.StringLiteralTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "StringLiteralTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isStringTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.StringTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "StringTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isSymbolTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.SymbolTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "SymbolTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isThisTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ThisTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ThisTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTupleTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TupleTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TupleTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTypeofTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TypeofTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TypeofTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTypeAlias(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TypeAlias {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TypeAlias") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTypeCastExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TypeCastExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TypeCastExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTypeParameter(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TypeParameter {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TypeParameter") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTypeParameterDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TypeParameterDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TypeParameterDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTypeParameterInstantiation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TypeParameterInstantiation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TypeParameterInstantiation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isUnionTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.UnionTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "UnionTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isVariance(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Variance {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Variance") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isVoidTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.VoidTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "VoidTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumBooleanBody(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumBooleanBody {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumBooleanBody") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumNumberBody(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumNumberBody {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumNumberBody") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumStringBody(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumStringBody {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumStringBody") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumSymbolBody(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumSymbolBody {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumSymbolBody") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumBooleanMember(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumBooleanMember {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumBooleanMember") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumNumberMember(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumNumberMember {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumNumberMember") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumStringMember(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumStringMember {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumStringMember") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumDefaultedMember(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumDefaultedMember {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "EnumDefaultedMember") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isIndexedAccessType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.IndexedAccessType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "IndexedAccessType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isOptionalIndexedAccessType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.OptionalIndexedAccessType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "OptionalIndexedAccessType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXAttribute(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXAttribute {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXAttribute") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXClosingElement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXClosingElement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXClosingElement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXElement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXElement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXElement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXEmptyExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXEmptyExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXEmptyExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXExpressionContainer(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXExpressionContainer {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXExpressionContainer") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXSpreadChild(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXSpreadChild {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXSpreadChild") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXIdentifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXIdentifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXIdentifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXMemberExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXMemberExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXMemberExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXNamespacedName(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXNamespacedName {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXNamespacedName") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXOpeningElement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXOpeningElement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXOpeningElement") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXSpreadAttribute(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXSpreadAttribute {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXSpreadAttribute") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXText(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXText {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXText") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXFragment(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXFragment {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXFragment") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXOpeningFragment(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXOpeningFragment {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXOpeningFragment") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSXClosingFragment(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSXClosingFragment {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "JSXClosingFragment") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNoop(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Noop {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Noop") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPlaceholder(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Placeholder {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Placeholder") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isV8IntrinsicIdentifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.V8IntrinsicIdentifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "V8IntrinsicIdentifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isArgumentPlaceholder(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ArgumentPlaceholder {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ArgumentPlaceholder") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBindExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BindExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "BindExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isImportAttribute(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ImportAttribute {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ImportAttribute") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDecorator(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Decorator {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "Decorator") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDoExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DoExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DoExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExportDefaultSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExportDefaultSpecifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ExportDefaultSpecifier") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isRecordExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.RecordExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "RecordExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTupleExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TupleExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TupleExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDecimalLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.DecimalLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "DecimalLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isStaticBlock(
  node: object | null | undefined,
  opts?: object | null,
): node is t.StaticBlock {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "StaticBlock") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isModuleExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ModuleExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "ModuleExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTopicReference(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TopicReference {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TopicReference") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPipelineTopicExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.PipelineTopicExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "PipelineTopicExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPipelineBareFunction(
  node: object | null | undefined,
  opts?: object | null,
): node is t.PipelineBareFunction {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "PipelineBareFunction") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPipelinePrimaryTopicReference(
  node: object | null | undefined,
  opts?: object | null,
): node is t.PipelinePrimaryTopicReference {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "PipelinePrimaryTopicReference") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSParameterProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSParameterProperty {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSParameterProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSDeclareFunction(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSDeclareFunction {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSDeclareFunction") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSDeclareMethod(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSDeclareMethod {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSDeclareMethod") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSQualifiedName(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSQualifiedName {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSQualifiedName") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSCallSignatureDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSCallSignatureDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSCallSignatureDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSConstructSignatureDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSConstructSignatureDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSConstructSignatureDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSPropertySignature(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSPropertySignature {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSPropertySignature") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSMethodSignature(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSMethodSignature {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSMethodSignature") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSIndexSignature(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSIndexSignature {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSIndexSignature") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSAnyKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSAnyKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSAnyKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSBooleanKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSBooleanKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSBooleanKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSBigIntKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSBigIntKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSBigIntKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSIntrinsicKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSIntrinsicKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSIntrinsicKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSNeverKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSNeverKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSNeverKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSNullKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSNullKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSNullKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSNumberKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSNumberKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSNumberKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSObjectKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSObjectKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSObjectKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSStringKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSStringKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSStringKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSSymbolKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSSymbolKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSSymbolKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSUndefinedKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSUndefinedKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSUndefinedKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSUnknownKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSUnknownKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSUnknownKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSVoidKeyword(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSVoidKeyword {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSVoidKeyword") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSThisType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSThisType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSThisType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSFunctionType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSFunctionType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSFunctionType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSConstructorType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSConstructorType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSConstructorType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeReference(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeReference {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeReference") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypePredicate(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypePredicate {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypePredicate") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeQuery(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeQuery {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeQuery") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeLiteral {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSArrayType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSArrayType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSArrayType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTupleType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTupleType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTupleType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSOptionalType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSOptionalType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSOptionalType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSRestType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSRestType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSRestType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSNamedTupleMember(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSNamedTupleMember {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSNamedTupleMember") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSUnionType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSUnionType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSUnionType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSIntersectionType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSIntersectionType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSIntersectionType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSConditionalType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSConditionalType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSConditionalType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSInferType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSInferType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSInferType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSParenthesizedType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSParenthesizedType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSParenthesizedType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeOperator(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeOperator {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeOperator") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSIndexedAccessType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSIndexedAccessType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSIndexedAccessType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSMappedType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSMappedType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSMappedType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSLiteralType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSLiteralType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSLiteralType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSExpressionWithTypeArguments(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSExpressionWithTypeArguments {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSExpressionWithTypeArguments") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSInterfaceDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSInterfaceDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSInterfaceDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSInterfaceBody(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSInterfaceBody {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSInterfaceBody") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeAliasDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeAliasDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeAliasDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSAsExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSAsExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSAsExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeAssertion(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeAssertion {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeAssertion") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSEnumDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSEnumDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSEnumDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSEnumMember(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSEnumMember {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSEnumMember") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSModuleDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSModuleDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSModuleDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSModuleBlock(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSModuleBlock {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSModuleBlock") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSImportType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSImportType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSImportType") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSImportEqualsDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSImportEqualsDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSImportEqualsDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSExternalModuleReference(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSExternalModuleReference {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSExternalModuleReference") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSNonNullExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSNonNullExpression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSNonNullExpression") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSExportAssignment(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSExportAssignment {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSExportAssignment") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSNamespaceExportDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSNamespaceExportDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSNamespaceExportDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeAnnotation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeParameterInstantiation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeParameterInstantiation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeParameterInstantiation") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeParameterDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeParameterDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeParameterDeclaration") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeParameter(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeParameter {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "TSTypeParameter") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExpression(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Expression {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ArrayExpression" === nodeType ||
    "AssignmentExpression" === nodeType ||
    "BinaryExpression" === nodeType ||
    "CallExpression" === nodeType ||
    "ConditionalExpression" === nodeType ||
    "FunctionExpression" === nodeType ||
    "Identifier" === nodeType ||
    "StringLiteral" === nodeType ||
    "NumericLiteral" === nodeType ||
    "NullLiteral" === nodeType ||
    "BooleanLiteral" === nodeType ||
    "RegExpLiteral" === nodeType ||
    "LogicalExpression" === nodeType ||
    "MemberExpression" === nodeType ||
    "NewExpression" === nodeType ||
    "ObjectExpression" === nodeType ||
    "SequenceExpression" === nodeType ||
    "ParenthesizedExpression" === nodeType ||
    "ThisExpression" === nodeType ||
    "UnaryExpression" === nodeType ||
    "UpdateExpression" === nodeType ||
    "ArrowFunctionExpression" === nodeType ||
    "ClassExpression" === nodeType ||
    "MetaProperty" === nodeType ||
    "Super" === nodeType ||
    "TaggedTemplateExpression" === nodeType ||
    "TemplateLiteral" === nodeType ||
    "YieldExpression" === nodeType ||
    "AwaitExpression" === nodeType ||
    "Import" === nodeType ||
    "BigIntLiteral" === nodeType ||
    "OptionalMemberExpression" === nodeType ||
    "OptionalCallExpression" === nodeType ||
    "TypeCastExpression" === nodeType ||
    "JSXElement" === nodeType ||
    "JSXFragment" === nodeType ||
    "BindExpression" === nodeType ||
    "DoExpression" === nodeType ||
    "RecordExpression" === nodeType ||
    "TupleExpression" === nodeType ||
    "DecimalLiteral" === nodeType ||
    "ModuleExpression" === nodeType ||
    "TopicReference" === nodeType ||
    "PipelineTopicExpression" === nodeType ||
    "PipelineBareFunction" === nodeType ||
    "PipelinePrimaryTopicReference" === nodeType ||
    "TSAsExpression" === nodeType ||
    "TSTypeAssertion" === nodeType ||
    "TSNonNullExpression" === nodeType ||
    (nodeType === "Placeholder" &&
      ("Expression" === (node as t.Placeholder).expectedNode ||
        "Identifier" === (node as t.Placeholder).expectedNode ||
        "StringLiteral" === (node as t.Placeholder).expectedNode))
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBinary(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Binary {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if ("BinaryExpression" === nodeType || "LogicalExpression" === nodeType) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isScopable(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Scopable {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "BlockStatement" === nodeType ||
    "CatchClause" === nodeType ||
    "DoWhileStatement" === nodeType ||
    "ForInStatement" === nodeType ||
    "ForStatement" === nodeType ||
    "FunctionDeclaration" === nodeType ||
    "FunctionExpression" === nodeType ||
    "Program" === nodeType ||
    "ObjectMethod" === nodeType ||
    "SwitchStatement" === nodeType ||
    "WhileStatement" === nodeType ||
    "ArrowFunctionExpression" === nodeType ||
    "ClassExpression" === nodeType ||
    "ClassDeclaration" === nodeType ||
    "ForOfStatement" === nodeType ||
    "ClassMethod" === nodeType ||
    "ClassPrivateMethod" === nodeType ||
    "StaticBlock" === nodeType ||
    "TSModuleBlock" === nodeType ||
    (nodeType === "Placeholder" &&
      "BlockStatement" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBlockParent(
  node: object | null | undefined,
  opts?: object | null,
): node is t.BlockParent {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "BlockStatement" === nodeType ||
    "CatchClause" === nodeType ||
    "DoWhileStatement" === nodeType ||
    "ForInStatement" === nodeType ||
    "ForStatement" === nodeType ||
    "FunctionDeclaration" === nodeType ||
    "FunctionExpression" === nodeType ||
    "Program" === nodeType ||
    "ObjectMethod" === nodeType ||
    "SwitchStatement" === nodeType ||
    "WhileStatement" === nodeType ||
    "ArrowFunctionExpression" === nodeType ||
    "ForOfStatement" === nodeType ||
    "ClassMethod" === nodeType ||
    "ClassPrivateMethod" === nodeType ||
    "StaticBlock" === nodeType ||
    "TSModuleBlock" === nodeType ||
    (nodeType === "Placeholder" &&
      "BlockStatement" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isBlock(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Block {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "BlockStatement" === nodeType ||
    "Program" === nodeType ||
    "TSModuleBlock" === nodeType ||
    (nodeType === "Placeholder" &&
      "BlockStatement" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Statement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "BlockStatement" === nodeType ||
    "BreakStatement" === nodeType ||
    "ContinueStatement" === nodeType ||
    "DebuggerStatement" === nodeType ||
    "DoWhileStatement" === nodeType ||
    "EmptyStatement" === nodeType ||
    "ExpressionStatement" === nodeType ||
    "ForInStatement" === nodeType ||
    "ForStatement" === nodeType ||
    "FunctionDeclaration" === nodeType ||
    "IfStatement" === nodeType ||
    "LabeledStatement" === nodeType ||
    "ReturnStatement" === nodeType ||
    "SwitchStatement" === nodeType ||
    "ThrowStatement" === nodeType ||
    "TryStatement" === nodeType ||
    "VariableDeclaration" === nodeType ||
    "WhileStatement" === nodeType ||
    "WithStatement" === nodeType ||
    "ClassDeclaration" === nodeType ||
    "ExportAllDeclaration" === nodeType ||
    "ExportDefaultDeclaration" === nodeType ||
    "ExportNamedDeclaration" === nodeType ||
    "ForOfStatement" === nodeType ||
    "ImportDeclaration" === nodeType ||
    "DeclareClass" === nodeType ||
    "DeclareFunction" === nodeType ||
    "DeclareInterface" === nodeType ||
    "DeclareModule" === nodeType ||
    "DeclareModuleExports" === nodeType ||
    "DeclareTypeAlias" === nodeType ||
    "DeclareOpaqueType" === nodeType ||
    "DeclareVariable" === nodeType ||
    "DeclareExportDeclaration" === nodeType ||
    "DeclareExportAllDeclaration" === nodeType ||
    "InterfaceDeclaration" === nodeType ||
    "OpaqueType" === nodeType ||
    "TypeAlias" === nodeType ||
    "EnumDeclaration" === nodeType ||
    "TSDeclareFunction" === nodeType ||
    "TSInterfaceDeclaration" === nodeType ||
    "TSTypeAliasDeclaration" === nodeType ||
    "TSEnumDeclaration" === nodeType ||
    "TSModuleDeclaration" === nodeType ||
    "TSImportEqualsDeclaration" === nodeType ||
    "TSExportAssignment" === nodeType ||
    "TSNamespaceExportDeclaration" === nodeType ||
    (nodeType === "Placeholder" &&
      ("Statement" === (node as t.Placeholder).expectedNode ||
        "Declaration" === (node as t.Placeholder).expectedNode ||
        "BlockStatement" === (node as t.Placeholder).expectedNode))
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTerminatorless(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Terminatorless {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "BreakStatement" === nodeType ||
    "ContinueStatement" === nodeType ||
    "ReturnStatement" === nodeType ||
    "ThrowStatement" === nodeType ||
    "YieldExpression" === nodeType ||
    "AwaitExpression" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isCompletionStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.CompletionStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "BreakStatement" === nodeType ||
    "ContinueStatement" === nodeType ||
    "ReturnStatement" === nodeType ||
    "ThrowStatement" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isConditional(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Conditional {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if ("ConditionalExpression" === nodeType || "IfStatement" === nodeType) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isLoop(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Loop {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "DoWhileStatement" === nodeType ||
    "ForInStatement" === nodeType ||
    "ForStatement" === nodeType ||
    "WhileStatement" === nodeType ||
    "ForOfStatement" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isWhile(
  node: object | null | undefined,
  opts?: object | null,
): node is t.While {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if ("DoWhileStatement" === nodeType || "WhileStatement" === nodeType) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExpressionWrapper(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExpressionWrapper {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ExpressionStatement" === nodeType ||
    "ParenthesizedExpression" === nodeType ||
    "TypeCastExpression" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFor(
  node: object | null | undefined,
  opts?: object | null,
): node is t.For {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ForInStatement" === nodeType ||
    "ForStatement" === nodeType ||
    "ForOfStatement" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isForXStatement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ForXStatement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if ("ForInStatement" === nodeType || "ForOfStatement" === nodeType) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFunction(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Function {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "FunctionDeclaration" === nodeType ||
    "FunctionExpression" === nodeType ||
    "ObjectMethod" === nodeType ||
    "ArrowFunctionExpression" === nodeType ||
    "ClassMethod" === nodeType ||
    "ClassPrivateMethod" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFunctionParent(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FunctionParent {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "FunctionDeclaration" === nodeType ||
    "FunctionExpression" === nodeType ||
    "ObjectMethod" === nodeType ||
    "ArrowFunctionExpression" === nodeType ||
    "ClassMethod" === nodeType ||
    "ClassPrivateMethod" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPureish(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Pureish {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "FunctionDeclaration" === nodeType ||
    "FunctionExpression" === nodeType ||
    "StringLiteral" === nodeType ||
    "NumericLiteral" === nodeType ||
    "NullLiteral" === nodeType ||
    "BooleanLiteral" === nodeType ||
    "RegExpLiteral" === nodeType ||
    "ArrowFunctionExpression" === nodeType ||
    "BigIntLiteral" === nodeType ||
    "DecimalLiteral" === nodeType ||
    (nodeType === "Placeholder" &&
      "StringLiteral" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Declaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "FunctionDeclaration" === nodeType ||
    "VariableDeclaration" === nodeType ||
    "ClassDeclaration" === nodeType ||
    "ExportAllDeclaration" === nodeType ||
    "ExportDefaultDeclaration" === nodeType ||
    "ExportNamedDeclaration" === nodeType ||
    "ImportDeclaration" === nodeType ||
    "DeclareClass" === nodeType ||
    "DeclareFunction" === nodeType ||
    "DeclareInterface" === nodeType ||
    "DeclareModule" === nodeType ||
    "DeclareModuleExports" === nodeType ||
    "DeclareTypeAlias" === nodeType ||
    "DeclareOpaqueType" === nodeType ||
    "DeclareVariable" === nodeType ||
    "DeclareExportDeclaration" === nodeType ||
    "DeclareExportAllDeclaration" === nodeType ||
    "InterfaceDeclaration" === nodeType ||
    "OpaqueType" === nodeType ||
    "TypeAlias" === nodeType ||
    "EnumDeclaration" === nodeType ||
    "TSDeclareFunction" === nodeType ||
    "TSInterfaceDeclaration" === nodeType ||
    "TSTypeAliasDeclaration" === nodeType ||
    "TSEnumDeclaration" === nodeType ||
    "TSModuleDeclaration" === nodeType ||
    (nodeType === "Placeholder" &&
      "Declaration" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPatternLike(
  node: object | null | undefined,
  opts?: object | null,
): node is t.PatternLike {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "Identifier" === nodeType ||
    "RestElement" === nodeType ||
    "AssignmentPattern" === nodeType ||
    "ArrayPattern" === nodeType ||
    "ObjectPattern" === nodeType ||
    (nodeType === "Placeholder" &&
      ("Pattern" === (node as t.Placeholder).expectedNode ||
        "Identifier" === (node as t.Placeholder).expectedNode))
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isLVal(
  node: object | null | undefined,
  opts?: object | null,
): node is t.LVal {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "Identifier" === nodeType ||
    "MemberExpression" === nodeType ||
    "RestElement" === nodeType ||
    "AssignmentPattern" === nodeType ||
    "ArrayPattern" === nodeType ||
    "ObjectPattern" === nodeType ||
    "TSParameterProperty" === nodeType ||
    (nodeType === "Placeholder" &&
      ("Pattern" === (node as t.Placeholder).expectedNode ||
        "Identifier" === (node as t.Placeholder).expectedNode))
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSEntityName(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSEntityName {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "Identifier" === nodeType ||
    "TSQualifiedName" === nodeType ||
    (nodeType === "Placeholder" &&
      "Identifier" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isLiteral(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Literal {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "StringLiteral" === nodeType ||
    "NumericLiteral" === nodeType ||
    "NullLiteral" === nodeType ||
    "BooleanLiteral" === nodeType ||
    "RegExpLiteral" === nodeType ||
    "TemplateLiteral" === nodeType ||
    "BigIntLiteral" === nodeType ||
    "DecimalLiteral" === nodeType ||
    (nodeType === "Placeholder" &&
      "StringLiteral" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isImmutable(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Immutable {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "StringLiteral" === nodeType ||
    "NumericLiteral" === nodeType ||
    "NullLiteral" === nodeType ||
    "BooleanLiteral" === nodeType ||
    "BigIntLiteral" === nodeType ||
    "JSXAttribute" === nodeType ||
    "JSXClosingElement" === nodeType ||
    "JSXElement" === nodeType ||
    "JSXExpressionContainer" === nodeType ||
    "JSXSpreadChild" === nodeType ||
    "JSXOpeningElement" === nodeType ||
    "JSXText" === nodeType ||
    "JSXFragment" === nodeType ||
    "JSXOpeningFragment" === nodeType ||
    "JSXClosingFragment" === nodeType ||
    "DecimalLiteral" === nodeType ||
    (nodeType === "Placeholder" &&
      "StringLiteral" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isUserWhitespacable(
  node: object | null | undefined,
  opts?: object | null,
): node is t.UserWhitespacable {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ObjectMethod" === nodeType ||
    "ObjectProperty" === nodeType ||
    "ObjectTypeInternalSlot" === nodeType ||
    "ObjectTypeCallProperty" === nodeType ||
    "ObjectTypeIndexer" === nodeType ||
    "ObjectTypeProperty" === nodeType ||
    "ObjectTypeSpreadProperty" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isMethod(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Method {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ObjectMethod" === nodeType ||
    "ClassMethod" === nodeType ||
    "ClassPrivateMethod" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isObjectMember(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ObjectMember {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if ("ObjectMethod" === nodeType || "ObjectProperty" === nodeType) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isProperty(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Property {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ObjectProperty" === nodeType ||
    "ClassProperty" === nodeType ||
    "ClassPrivateProperty" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isUnaryLike(
  node: object | null | undefined,
  opts?: object | null,
): node is t.UnaryLike {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if ("UnaryExpression" === nodeType || "SpreadElement" === nodeType) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPattern(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Pattern {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "AssignmentPattern" === nodeType ||
    "ArrayPattern" === nodeType ||
    "ObjectPattern" === nodeType ||
    (nodeType === "Placeholder" &&
      "Pattern" === (node as t.Placeholder).expectedNode)
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isClass(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Class {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if ("ClassExpression" === nodeType || "ClassDeclaration" === nodeType) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isModuleDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ModuleDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ExportAllDeclaration" === nodeType ||
    "ExportDefaultDeclaration" === nodeType ||
    "ExportNamedDeclaration" === nodeType ||
    "ImportDeclaration" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isExportDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ExportDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ExportAllDeclaration" === nodeType ||
    "ExportDefaultDeclaration" === nodeType ||
    "ExportNamedDeclaration" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isModuleSpecifier(
  node: object | null | undefined,
  opts?: object | null,
): node is t.ModuleSpecifier {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ExportSpecifier" === nodeType ||
    "ImportDefaultSpecifier" === nodeType ||
    "ImportNamespaceSpecifier" === nodeType ||
    "ImportSpecifier" === nodeType ||
    "ExportNamespaceSpecifier" === nodeType ||
    "ExportDefaultSpecifier" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isPrivate(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Private {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "ClassPrivateProperty" === nodeType ||
    "ClassPrivateMethod" === nodeType ||
    "PrivateName" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFlow(
  node: object | null | undefined,
  opts?: object | null,
): node is t.Flow {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "AnyTypeAnnotation" === nodeType ||
    "ArrayTypeAnnotation" === nodeType ||
    "BooleanTypeAnnotation" === nodeType ||
    "BooleanLiteralTypeAnnotation" === nodeType ||
    "NullLiteralTypeAnnotation" === nodeType ||
    "ClassImplements" === nodeType ||
    "DeclareClass" === nodeType ||
    "DeclareFunction" === nodeType ||
    "DeclareInterface" === nodeType ||
    "DeclareModule" === nodeType ||
    "DeclareModuleExports" === nodeType ||
    "DeclareTypeAlias" === nodeType ||
    "DeclareOpaqueType" === nodeType ||
    "DeclareVariable" === nodeType ||
    "DeclareExportDeclaration" === nodeType ||
    "DeclareExportAllDeclaration" === nodeType ||
    "DeclaredPredicate" === nodeType ||
    "ExistsTypeAnnotation" === nodeType ||
    "FunctionTypeAnnotation" === nodeType ||
    "FunctionTypeParam" === nodeType ||
    "GenericTypeAnnotation" === nodeType ||
    "InferredPredicate" === nodeType ||
    "InterfaceExtends" === nodeType ||
    "InterfaceDeclaration" === nodeType ||
    "InterfaceTypeAnnotation" === nodeType ||
    "IntersectionTypeAnnotation" === nodeType ||
    "MixedTypeAnnotation" === nodeType ||
    "EmptyTypeAnnotation" === nodeType ||
    "NullableTypeAnnotation" === nodeType ||
    "NumberLiteralTypeAnnotation" === nodeType ||
    "NumberTypeAnnotation" === nodeType ||
    "ObjectTypeAnnotation" === nodeType ||
    "ObjectTypeInternalSlot" === nodeType ||
    "ObjectTypeCallProperty" === nodeType ||
    "ObjectTypeIndexer" === nodeType ||
    "ObjectTypeProperty" === nodeType ||
    "ObjectTypeSpreadProperty" === nodeType ||
    "OpaqueType" === nodeType ||
    "QualifiedTypeIdentifier" === nodeType ||
    "StringLiteralTypeAnnotation" === nodeType ||
    "StringTypeAnnotation" === nodeType ||
    "SymbolTypeAnnotation" === nodeType ||
    "ThisTypeAnnotation" === nodeType ||
    "TupleTypeAnnotation" === nodeType ||
    "TypeofTypeAnnotation" === nodeType ||
    "TypeAlias" === nodeType ||
    "TypeAnnotation" === nodeType ||
    "TypeCastExpression" === nodeType ||
    "TypeParameter" === nodeType ||
    "TypeParameterDeclaration" === nodeType ||
    "TypeParameterInstantiation" === nodeType ||
    "UnionTypeAnnotation" === nodeType ||
    "Variance" === nodeType ||
    "VoidTypeAnnotation" === nodeType ||
    "IndexedAccessType" === nodeType ||
    "OptionalIndexedAccessType" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFlowType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FlowType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "AnyTypeAnnotation" === nodeType ||
    "ArrayTypeAnnotation" === nodeType ||
    "BooleanTypeAnnotation" === nodeType ||
    "BooleanLiteralTypeAnnotation" === nodeType ||
    "NullLiteralTypeAnnotation" === nodeType ||
    "ExistsTypeAnnotation" === nodeType ||
    "FunctionTypeAnnotation" === nodeType ||
    "GenericTypeAnnotation" === nodeType ||
    "InterfaceTypeAnnotation" === nodeType ||
    "IntersectionTypeAnnotation" === nodeType ||
    "MixedTypeAnnotation" === nodeType ||
    "EmptyTypeAnnotation" === nodeType ||
    "NullableTypeAnnotation" === nodeType ||
    "NumberLiteralTypeAnnotation" === nodeType ||
    "NumberTypeAnnotation" === nodeType ||
    "ObjectTypeAnnotation" === nodeType ||
    "StringLiteralTypeAnnotation" === nodeType ||
    "StringTypeAnnotation" === nodeType ||
    "SymbolTypeAnnotation" === nodeType ||
    "ThisTypeAnnotation" === nodeType ||
    "TupleTypeAnnotation" === nodeType ||
    "TypeofTypeAnnotation" === nodeType ||
    "UnionTypeAnnotation" === nodeType ||
    "VoidTypeAnnotation" === nodeType ||
    "IndexedAccessType" === nodeType ||
    "OptionalIndexedAccessType" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFlowBaseAnnotation(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FlowBaseAnnotation {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "AnyTypeAnnotation" === nodeType ||
    "BooleanTypeAnnotation" === nodeType ||
    "NullLiteralTypeAnnotation" === nodeType ||
    "MixedTypeAnnotation" === nodeType ||
    "EmptyTypeAnnotation" === nodeType ||
    "NumberTypeAnnotation" === nodeType ||
    "StringTypeAnnotation" === nodeType ||
    "SymbolTypeAnnotation" === nodeType ||
    "ThisTypeAnnotation" === nodeType ||
    "VoidTypeAnnotation" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFlowDeclaration(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FlowDeclaration {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "DeclareClass" === nodeType ||
    "DeclareFunction" === nodeType ||
    "DeclareInterface" === nodeType ||
    "DeclareModule" === nodeType ||
    "DeclareModuleExports" === nodeType ||
    "DeclareTypeAlias" === nodeType ||
    "DeclareOpaqueType" === nodeType ||
    "DeclareVariable" === nodeType ||
    "DeclareExportDeclaration" === nodeType ||
    "DeclareExportAllDeclaration" === nodeType ||
    "InterfaceDeclaration" === nodeType ||
    "OpaqueType" === nodeType ||
    "TypeAlias" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isFlowPredicate(
  node: object | null | undefined,
  opts?: object | null,
): node is t.FlowPredicate {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if ("DeclaredPredicate" === nodeType || "InferredPredicate" === nodeType) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumBody(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumBody {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "EnumBooleanBody" === nodeType ||
    "EnumNumberBody" === nodeType ||
    "EnumStringBody" === nodeType ||
    "EnumSymbolBody" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isEnumMember(
  node: object | null | undefined,
  opts?: object | null,
): node is t.EnumMember {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "EnumBooleanMember" === nodeType ||
    "EnumNumberMember" === nodeType ||
    "EnumStringMember" === nodeType ||
    "EnumDefaultedMember" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isJSX(
  node: object | null | undefined,
  opts?: object | null,
): node is t.JSX {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "JSXAttribute" === nodeType ||
    "JSXClosingElement" === nodeType ||
    "JSXElement" === nodeType ||
    "JSXEmptyExpression" === nodeType ||
    "JSXExpressionContainer" === nodeType ||
    "JSXSpreadChild" === nodeType ||
    "JSXIdentifier" === nodeType ||
    "JSXMemberExpression" === nodeType ||
    "JSXNamespacedName" === nodeType ||
    "JSXOpeningElement" === nodeType ||
    "JSXSpreadAttribute" === nodeType ||
    "JSXText" === nodeType ||
    "JSXFragment" === nodeType ||
    "JSXOpeningFragment" === nodeType ||
    "JSXClosingFragment" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSTypeElement(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSTypeElement {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "TSCallSignatureDeclaration" === nodeType ||
    "TSConstructSignatureDeclaration" === nodeType ||
    "TSPropertySignature" === nodeType ||
    "TSMethodSignature" === nodeType ||
    "TSIndexSignature" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "TSAnyKeyword" === nodeType ||
    "TSBooleanKeyword" === nodeType ||
    "TSBigIntKeyword" === nodeType ||
    "TSIntrinsicKeyword" === nodeType ||
    "TSNeverKeyword" === nodeType ||
    "TSNullKeyword" === nodeType ||
    "TSNumberKeyword" === nodeType ||
    "TSObjectKeyword" === nodeType ||
    "TSStringKeyword" === nodeType ||
    "TSSymbolKeyword" === nodeType ||
    "TSUndefinedKeyword" === nodeType ||
    "TSUnknownKeyword" === nodeType ||
    "TSVoidKeyword" === nodeType ||
    "TSThisType" === nodeType ||
    "TSFunctionType" === nodeType ||
    "TSConstructorType" === nodeType ||
    "TSTypeReference" === nodeType ||
    "TSTypePredicate" === nodeType ||
    "TSTypeQuery" === nodeType ||
    "TSTypeLiteral" === nodeType ||
    "TSArrayType" === nodeType ||
    "TSTupleType" === nodeType ||
    "TSOptionalType" === nodeType ||
    "TSRestType" === nodeType ||
    "TSUnionType" === nodeType ||
    "TSIntersectionType" === nodeType ||
    "TSConditionalType" === nodeType ||
    "TSInferType" === nodeType ||
    "TSParenthesizedType" === nodeType ||
    "TSTypeOperator" === nodeType ||
    "TSIndexedAccessType" === nodeType ||
    "TSMappedType" === nodeType ||
    "TSLiteralType" === nodeType ||
    "TSExpressionWithTypeArguments" === nodeType ||
    "TSImportType" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isTSBaseType(
  node: object | null | undefined,
  opts?: object | null,
): node is t.TSBaseType {
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (
    "TSAnyKeyword" === nodeType ||
    "TSBooleanKeyword" === nodeType ||
    "TSBigIntKeyword" === nodeType ||
    "TSIntrinsicKeyword" === nodeType ||
    "TSNeverKeyword" === nodeType ||
    "TSNullKeyword" === nodeType ||
    "TSNumberKeyword" === nodeType ||
    "TSObjectKeyword" === nodeType ||
    "TSStringKeyword" === nodeType ||
    "TSSymbolKeyword" === nodeType ||
    "TSUndefinedKeyword" === nodeType ||
    "TSUnknownKeyword" === nodeType ||
    "TSVoidKeyword" === nodeType ||
    "TSThisType" === nodeType ||
    "TSLiteralType" === nodeType
  ) {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isNumberLiteral(
  node: object | null | undefined,
  opts?: object | null,
): boolean {
  console.trace(
    "The node type NumberLiteral has been renamed to NumericLiteral",
  );
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "NumberLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isRegexLiteral(
  node: object | null | undefined,
  opts?: object | null,
): boolean {
  console.trace("The node type RegexLiteral has been renamed to RegExpLiteral");
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "RegexLiteral") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isRestProperty(
  node: object | null | undefined,
  opts?: object | null,
): boolean {
  console.trace("The node type RestProperty has been renamed to RestElement");
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "RestProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}
export function isSpreadProperty(
  node: object | null | undefined,
  opts?: object | null,
): boolean {
  console.trace(
    "The node type SpreadProperty has been renamed to SpreadElement",
  );
  if (!node) return false;

  const nodeType = (node as t.Node).type;
  if (nodeType === "SpreadProperty") {
    if (typeof opts === "undefined") {
      return true;
    } else {
      return shallowEqual(node, opts);
    }
  }

  return false;
}

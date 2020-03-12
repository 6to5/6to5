"use strict";

const t = require("../../");
const stringifyValidator = require("../utils/stringifyValidator");
const toFunctionName = require("../utils/toFunctionName");

const NODE_PREFIX = "BabelNode";

let globalDefs = `declare class ${NODE_PREFIX}Comment {
  value: string;
  start?: number;
  end?: number;
  loc?: ${NODE_PREFIX}SourceLocation;
}

declare class ${NODE_PREFIX}CommentBlock extends ${NODE_PREFIX}Comment {
  type: "CommentBlock";
}

declare class ${NODE_PREFIX}CommentLine extends ${NODE_PREFIX}Comment {
  type: "CommentLine";
}

declare class ${NODE_PREFIX}SourceLocation {
  start: {|
    line: number;
    column: number;
  |};

  end: {|
    line: number;
    column: number;
  |};
}

declare class ${NODE_PREFIX} {
  leadingComments?: Array<${NODE_PREFIX}Comment>;
  innerComments?: Array<${NODE_PREFIX}Comment>;
  trailingComments?: Array<${NODE_PREFIX}Comment>;
  start: ?number;
  end: ?number;
  loc: ?${NODE_PREFIX}SourceLocation;
}
`;

//

const functions = [];
const typeAliasLines = [];

for (const type in t.NODE_FIELDS) {
  const fields = t.NODE_FIELDS[type];

  const struct = ['type: "' + type + '";'];
  const args = [];
  const builderNames = t.BUILDER_KEYS[type];

  Object.keys(t.NODE_FIELDS[type])
    .sort((fieldA, fieldB) => {
      const indexA = t.BUILDER_KEYS[type].indexOf(fieldA);
      const indexB = t.BUILDER_KEYS[type].indexOf(fieldB);
      if (indexA === indexB) return fieldA < fieldB ? -1 : 1;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    })
    .forEach(fieldName => {
      const field = fields[fieldName];

      let typeAnnotation = "any";

      const validate = field.validate;
      if (validate) {
        typeAnnotation = stringifyValidator(validate, NODE_PREFIX);
      }

      if (type === "ClassDeclaration" && fieldName === "id") {
        typeAnnotation = "?BabelNodeIdentifier";
      } else if (type === "ObjectProperty" && fieldName === "key") {
        typeAnnotation =
          "BabelNodeExpression | BabelNodeIdentifier | BabelNodeLiteral";
      } else if (type === "MemberExpression" && fieldName === "property") {
        typeAnnotation = "BabelNodeExpression | BabelNodeIdentifier";
      }

      let suffix = "",
        functionSuffix = "";
      if (typeAnnotation) {
        const isOptional = field.optional || field.default != null;
        const isArray = typeAnnotation.startsWith("Array");
        suffix += isOptional && !isArray ? "?: ?" : ": ";
        functionSuffix += isOptional ? "?: ?" : ": ";

        suffix += typeAnnotation;
        functionSuffix += typeAnnotation.replace(/Array/g, "$ReadOnlyArray");
      }
      if (builderNames.includes(fieldName)) {
        args.push(t.toBindingIdentifierName(fieldName) + functionSuffix);
      }

      if (t.isValidIdentifier(fieldName)) {
        struct.push(fieldName + suffix + ";");
      }
    });

  globalDefs += `\ndeclare class ${NODE_PREFIX}${type} extends ${NODE_PREFIX} {
  ${struct.join("\n  ").trim()}
}\n`;

  // Flow chokes on super() and import() :/
  if (type !== "Super" && type !== "Import") {
    functions.push(
      `declare export function ${toFunctionName(type)}(${args.join(
        ", "
      )}): ${NODE_PREFIX}${type};`
    );
  } else {
    const functionName = toFunctionName(type);
    functions.push(
      `declare function _${functionName}(${args.join(
        ", "
      )}): ${NODE_PREFIX}${type};`,
      `declare export { _${functionName} as ${functionName} }`
    );
  }
}

for (let i = 0; i < t.TYPES.length; i++) {
  let decl = `declare export function is${t.TYPES[i]}(node: ?Object, opts?: ?Object): boolean`;

  if (t.NODE_FIELDS[t.TYPES[i]]) {
    decl += ` %checks (node instanceof ${NODE_PREFIX}${t.TYPES[i]})`;
  }

  functions.push(decl);
}

functions.push(
  // builders/
  // eslint-disable-next-line max-len
  `declare export function createTypeAnnotationBasedOnTypeof(type: 'string' | 'number' | 'undefined' | 'boolean' | 'function' | 'object' | 'symbol'): ${NODE_PREFIX}TypeAnnotation`,
  // eslint-disable-next-line max-len
  `declare export function createUnionTypeAnnotation(types: Array<${NODE_PREFIX}FlowType>): ${NODE_PREFIX}UnionTypeAnnotation`,
  // this smells like "internal API"
  // eslint-disable-next-line max-len
  `declare export function buildChildren(node: {| children: Array<${NODE_PREFIX}JSXText | ${NODE_PREFIX}JSXExpressionContainer | ${NODE_PREFIX}JSXSpreadChild | ${NODE_PREFIX}JSXElement | ${NODE_PREFIX}JSXFragment | ${NODE_PREFIX}JSXEmptyExpression> |}): Array<${NODE_PREFIX}JSXText | ${NODE_PREFIX}JSXExpressionContainer | ${NODE_PREFIX}JSXSpreadChild | ${NODE_PREFIX}JSXElement | ${NODE_PREFIX}JSXFragment>`,

  // clone/
  `declare export function clone<T: ${NODE_PREFIX}>(n: T): T;`,
  `declare export function cloneDeep<T: ${NODE_PREFIX}>(n: T): T;`,
  `declare export function cloneNode<T: ${NODE_PREFIX}>(n: T, deep?: boolean): T;`,
  `declare export function cloneWithoutLoc<T: ${NODE_PREFIX}>(n: T): T;`,

  // comments/
  `declare type CommentTypeShorthand = 'leading' | 'inner' | 'trailing';`,
  // eslint-disable-next-line max-len
  `declare export function addComment<T: BabelNode>(node: T, type: CommentTypeShorthand, content: string, line?: boolean): T;`,
  // eslint-disable-next-line max-len
  `declare export function addComments<T: BabelNode>(node: T, type: CommentTypeShorthand, comments: Array<BabelNodeComment>): T;`,
  `declare export function inheritInnerComments(node: BabelNode, parent: BabelNode): void`,
  `declare export function inheritLeadingComments(node: BabelNode, parent: BabelNode): void`,
  `declare export function inheritsComments(node: BabelNode, parent: BabelNode): void`,
  `declare export function inheritTrailingComments(node: BabelNode, parent: BabelNode): void`,
  `declare export function removeComments<T: BabelNode>(node: T): T;`,

  // converters/
  `declare export function ensureBlock(node: ${NODE_PREFIX}, key: string): ${NODE_PREFIX}BlockStatement;`,
  `declare export function toBindingIdentifierName(name?: ?string): string;`,
  // eslint-disable-next-line max-len
  `declare export function toBlock(node: ${NODE_PREFIX}Statement | ${NODE_PREFIX}Expression, parent?: ${NODE_PREFIX}Function | null): ${NODE_PREFIX}BlockStatement;`,
  // eslint-disable-next-line max-len
  `declare export function toComputedKey(node: ${NODE_PREFIX}Method | ${NODE_PREFIX}Property, key?: ${NODE_PREFIX}Expression | ${NODE_PREFIX}Identifier): ${NODE_PREFIX}Expression;`,
  // eslint-disable-next-line max-len
  `declare export function toExpression(node: ${NODE_PREFIX}FunctionDeclaration | ${NODE_PREFIX}FunctionExpression): ${NODE_PREFIX}FunctionExpression;`,
  `declare export function toExpression(node: ${NODE_PREFIX}ClassDeclaration | ${NODE_PREFIX}ClassExpression): ${NODE_PREFIX}ClassExpression;`,
  `declare export function toExpression(node: ${NODE_PREFIX}ExpressionStatement | ${NODE_PREFIX}Expression): ${NODE_PREFIX}Expression;`,

  `declare export function toIdentifier(name?: ?string): string`,
  // eslint-disable-next-line max-len
  `declare export function toKeyAlias(node: ${NODE_PREFIX}Method | ${NODE_PREFIX}Property, key?: ${NODE_PREFIX}): string;`,
  // toSequenceExpression relies on types that aren't declared in flow
  // eslint-disable-next-line max-len
  `declare export function toStatement(node: ${NODE_PREFIX}Statement | ${NODE_PREFIX}Class | ${NODE_PREFIX}Function | ${NODE_PREFIX}AssignmentExpression, ignore?: boolean): ${NODE_PREFIX}Statement | void`,
  `declare export function valueToNode(value: typeof undefined): ${NODE_PREFIX}Identifier`,
  `declare export function valueToNode(value: boolean): ${NODE_PREFIX}BooleanLiteral`,
  `declare export function valueToNode(value: null): ${NODE_PREFIX}NullLiteral`,
  `declare export function valueToNode(value: string): ${NODE_PREFIX}StringLiteral`,
  `declare export function valueToNode(value: number): ${NODE_PREFIX}NumericLiteral`,
  `declare export function valueToNode(value: RegExp): ${NODE_PREFIX}RegExpLiteral`,
  `declare export function valueToNode(value: $ReadOnlyArray<typeof undefined | boolean | null | string | number | RegExp | {[any]: any, ...}>): ${NODE_PREFIX}ArrayExpression`,
  `declare export function valueToNode(value: {[any]: any, ...}): ${NODE_PREFIX}ObjectExpression`,

  // modifications/
  // eslint-disable-next-line max-len
  `declare export function removeTypeDuplicates(types: Array<${NODE_PREFIX}FlowType>): Array<${NODE_PREFIX}FlowType>`,
  // eslint-disable-next-line max-len
  `declare export function appendToMemberExpression(member: ${NODE_PREFIX}MemberExpression, append: ${NODE_PREFIX}, computed?: boolean): ${NODE_PREFIX}MemberExpression`,
  // eslint-disable-next-line max-len
  `declare export function inherits<T: BabelNode>(child: T, parent: ${NODE_PREFIX} | null | void): T`,
  // eslint-disable-next-line max-len
  `declare export function prependToMemberExpression(member: ${NODE_PREFIX}MemberExpression, prepend: ${NODE_PREFIX}Expression): ${NODE_PREFIX}MemberExpression`,
  `declare export function removeProperties<T>(n: T, opts?: {| preserveComments?: boolean |}): void;`,
  `declare export function removePropertiesDeep<T>(n: T, opts?: {| preserveComments?: boolean |}): T;`,

  // retrievers/
  // eslint-disable-next-line max-len
  `declare export function getBindingIdentifiers(node: ${NODE_PREFIX}): { [key: string]: ${NODE_PREFIX}Identifier, ... }`,
  `declare export function getBindingIdentifiers(node: ${NODE_PREFIX}, duplicates: false, outerOnly?: boolean): { [key: string]: ${NODE_PREFIX}Identifier, ... }`,
  `declare export function getBindingIdentifiers(node: ${NODE_PREFIX}, duplicates: true, outerOnly?: boolean): { [key: string]: ${NODE_PREFIX}Identifier | Array<${NODE_PREFIX}Identifier>, ... }`,
  // eslint-disable-next-line max-len
  `declare export function getOuterBindingIdentifiers(node: BabelNode, duplicates?: boolean): { [key: string]: ${NODE_PREFIX}Identifier | Array<${NODE_PREFIX}Identifier>, ... }`,

  // traverse/
  `declare export type TraversalAncestors = Array<{|
    node: ${NODE_PREFIX},
    key: string,
    index?: number,
  |}>;
  declare export type TraversalHandler<T> = (${NODE_PREFIX}, TraversalAncestors, T) => void;
  declare export type TraversalHandlers<T> = {|
    enter?: TraversalHandler<T>,
    exit?: TraversalHandler<T>,
  |};`.replace(/(^|\n) {2}/g, "$1"),
  // eslint-disable-next-line
  `declare export function traverse<T>(n: ${NODE_PREFIX}, TraversalHandler<T> | TraversalHandlers<T>, state?: T): void;`,
  `declare export function traverseFast<T>(n: BabelNode, h: TraversalHandler<T>, state?: T): void;`,

  // utils/
  // cleanJSXElementLiteralChild is not exported
  // inherit is not exported
  `declare export function shallowEqual(actual: Object, expected: Object): boolean;`,

  // validators/
  // eslint-disable-next-line max-len
  `declare export function buildMatchMemberExpression(match: string, allowPartial?: boolean): (?${NODE_PREFIX}) => boolean;`,
  `declare export function is(type: string, n: ${NODE_PREFIX}, opts: Object): boolean;`,
  `declare export function isBinding(node: ${NODE_PREFIX}, parent: ${NODE_PREFIX}, grandparent?: ${NODE_PREFIX}): boolean;`,
  `declare export function isBlockScoped(node: ${NODE_PREFIX}): boolean;`,
  `declare export function isImmutable(node: ${NODE_PREFIX}): boolean;`,
  `declare export function isLet(node: ${NODE_PREFIX}): boolean;`,
  `declare export function isNode(node: ?Object): boolean;`,
  `declare export function isNodesEquivalent(a: any, b: any): boolean;`,
  `declare export function isPlaceholderType(placeholderType: string, targetType: string): boolean;`,
  `declare export function isReferenced(node: ${NODE_PREFIX}, parent: ${NODE_PREFIX}, grandparent?: ${NODE_PREFIX}): boolean;`,
  `declare export function isScope(node: ${NODE_PREFIX}, parent?: ${NODE_PREFIX}): boolean;`,
  `declare export function isSpecifierDefault(specifier: ${NODE_PREFIX}ModuleSpecifier): boolean;`,
  `declare export function isType(nodetype: ?string, targetType: string): boolean;`,
  `declare export function isValidES3Identifier(name: string): boolean;`,
  `declare export function isValidES3Identifier(name: string): boolean;`,
  `declare export function isValidIdentifier(name: string): boolean;`,
  `declare export function isVar(node: ${NODE_PREFIX}): boolean;`,
  // eslint-disable-next-line max-len
  `declare export function matchesPattern(node: ?${NODE_PREFIX}, match: string | Array<string>, allowPartial?: boolean): boolean;`,
  `declare export function validate(n: ${NODE_PREFIX}, key: string, value: mixed): void;`
);

for (const type in t.FLIPPED_ALIAS_KEYS) {
  const types = t.FLIPPED_ALIAS_KEYS[type];
  typeAliasLines.push(
    `${type} = ${types.map(type => `${NODE_PREFIX}${type}`).join(" | ")};`
  );
}

process.stdout.write(`// @flow strict-local
// NOTE: This file is autogenerated. Do not modify.
// See packages/babel-types/scripts/generators/flow.js for script used.\n

${globalDefs}
${typeAliasLines.map(v => `declare type ${NODE_PREFIX}${v}`).join("\n")}

declare module "@babel/types" {
  declare export {
    ${NODE_PREFIX} as Node,
    ${Object.keys(t.NODE_FIELDS)
      .map(v => `${NODE_PREFIX}${v} as ${v}`)
      .join(",\n    ")}
  };

  ${typeAliasLines.map(v => `declare export type ${v}`).join("\n  ")}

  ${functions
    .join("\n")
    .replace(/\n/g, "\n  ")
    .trim()}
}`);

const t = require("@babel/types");

const types = t.TYPES.filter(v => v !== "Class" && v !== "Function");

const code = `// @flow
declare module "@babel/traverse" {
  import type { Node,
                Function as BabelFunction,
                Class as BabelClass,
                ${types.join(",\n                ")} } from "@babel/types";

  declare type VariableDeclarationKind =
    | "var"
    | "let"
    | "const"
    | "module"
    | "hoisted";

  declare export interface Binding {
    block: Node;
    path: NodePath<
      | VariableDeclarator
      | ClassDeclaration
      | FunctionDeclaration
      | ModuleSpecifier
    >;
    referencePaths: Array<NodePath<Identifier>>;
    constantViolations: Array<
      NodePath<AssignmentExpression | UpdateExpression>
    >;
    identifier: Identifier;
    scope: Scope;
    kind: VariableDeclarationKind;
    referenced: boolean;
    references: number;
    constant: boolean;
    reference(NodePath<Identifier>): void;
    reassign(NodePath<AssignmentExpression | UpdateExpression>): void;
    dereference(): void;
  }

  declare export interface Scope {
    parent: Scope;
    path: NodePath<Node>;
    references: { [string]: boolean, ... };
    generateUidIdentifier(name?: string): Identifier;
    generateUid(name?: string): string;
    rename(oldName: string, newName?: string): void;

    setData(key: string, value: mixed): void;
    getData(key: string): ?any;
    removeData(key: string): void;

    getBinding(name: string): ?Binding;
    getOwnBinding(name: string): ?Binding;
    getBindingIdentifier(name: string): ?Identifier;
    getOwnBindingIdentifier(name: string): ?Identifier;
    hasOwnBinding(name: string): ?Binding;
    hasBinding(name: string, noGlobals?: boolean): boolean;
    parentHasBinding(name: string, noGlobals?: boolean): boolean;
    removeBinding(name: string): void;

    removeOwnBinding(string): boolean;
    removeBinding(string): boolean;
    registerDeclaration(path: NodePath<Declaration>): void;
    registerBinding(
      kind: VariableDeclarationKind,
      path: NodePath<VariableDeclaration | VariableDeclarator>
    ): void;
    bindings: {[name: string]: Binding, ...};
    getAllBindings(): {[name: string]: Binding, ...};
    getAllBindingsOfKind(...kinds: Array<string>): {[name: string]: Binding, ...};
    push(opts: {|
      id: LVal,
      init?: Expression | null,
      unique?: boolean,
      kind?: VariableDeclarationKind
    |}): void;

    addGlobal(node: Node): void;
    hasGlobal(name: string): boolean;
    hasReference(name: string): boolean;
    isPure(node: Node, constantsOnly?: boolean): boolean;

    crawl(): void;
    getProgramParent(): Scope;
    getFunctionParent(): Scope;
    getBlockParent(): Scope;
  }

  declare export interface NodePath<+T: Node> {
    node: T;
    scope: Scope;
    parent: Node;
    parentPath: NodePath<Node>;
    removed: boolean;
    key: string;
    container: ?NodePath<Node> | Array<NodePath<Node>>;
    get<U: NodePath<Node> | $ReadOnlyArray<NodePath<Node>>>(string): U;
    getStatementParent(): NodePath<Statement>;
    findParent(cb: (NodePath<Node>) => boolean): ?NodePath<Node>;
    find(cb: (NodePath<Node>) => boolean): ?NodePath<Node>;
    getFunctionParent(): NodePath<BabelFunction>;
    getAncestry(): Array<NodePath<Node>>;
    isAncestor(NodePath<Node>): boolean;
    isDescendant(NodePath<Node>): boolean;

    remove(): void;
    replaceWith<U: Node>(U): NodePath<U>;
    replaceWithMultiple<U: Node>(Array<U>): $ReadOnlyArray<NodePath<U>>;
    insertBefore<U: Node>(
      Array<U> | U
    ): $ReadOnlyArray<NodePath<U>>;
    insertAfter<U: Node>(
      Array<U> | U
    ): $ReadOnlyArray<NodePath<U>>;
    unshiftContainer<U: Node>(
      string,
      Array<U> | U
    ): $ReadOnlyArray<NodePath<U>>;
    pushContainer<U: Node>(
      string,
      Array<U> | U
    ): $ReadOnlyArray<NodePath<U>>;
    matchesPattern(
      match: string | Array<string>,
      allowPartial?: boolean
    ): boolean;

    getPrevSibling(): NodePath<Node>;
    getNextSibling(): NodePath<Node>;
    getAllNextSiblings(): $ReadOnlyArray<NodePath<Node>>;
    getAllPrevSiblings(): $ReadOnlyArray<NodePath<Node>>;

    getBindingIdentifiers(
      duplicates?: boolean
    ): { [string]: Identifier, ... };
    getOuterBindingIdentifiers(
      duplicates?: boolean
    ): { [string]: Identifier, ... };
    getBindingIdentifierPaths(
      duplicates?: boolean,
      outer?: boolean
    ): { [string]: NodePath<Identifier>, ... };
    getOuterBindingIdentifierPaths(
      duplicates?: boolean
    ): { [string]: NodePath<Identifier>, ... };

    evaluateTruthy(): ?boolean;
    evaluate(): {| confident: boolean, value: any |};

    arrowFunctionToExpression({|
      allowInsertArrow?: boolean,
      specCompliant?: boolean
    |}): void;
    ensureBlock(): BabelBlockStatement;

    addComment(type: string, content: string, line?: boolean): void;
    addComments(type: string, comments: Array<string>): void;

    setData(string, any): void;
    getData(string): any;

    isPure(): boolean;
    isGenerated(): boolean;
    isUser(): boolean;
    isVar(): boolean;
    isBlockScoped(): boolean;
    isReferenced(): boolean;
    isScope(): boolean;
    isBindingIdentifier(): boolean;
    isReferencedMemberExpression(): boolean;

    traverse<S>(visitor: Visitor<S>, state?: S): void;
    stop(): void;
    skip(): void;
    requeue(pathToQueue?: NodePath<Node>): void;

    ${types
      .map(v => `is${v.charAt(0).toUpperCase() + v.slice(1)}(): boolean;`)
      .join("\n    ")}
  }
  declare export default {|
    <S>(
      node: Node,
      visitor: Visitor<S>,
      scope?: Object,
      state?: S,
      parentPath?: Node
    ): void,
    cache: {|
      clear(): void,
      clearPath(): void,
      clearScope(): void
    |}
  |};

  declare type VisitorFunc<N: Node, S> = (NodePath<N>, S) => void;
  declare type SingleVisitor<N: Node, S> =
    | VisitorFunc<N, S>
    | {|
        enter?: VisitorFunc<N, S>,
        exit?: VisitorFunc<N, S>
      |};

  declare export type Visitor<S> = {|
    noScope?: boolean,
    blacklist?: Array<string>,
    shouldSkip?: (NodePath<Node>) => boolean,
    ReferencedIdentifier?: SingleVisitor<Identifier, S>,
    Function?: SingleVisitor<BabelFunction, S>,
    Class?: SingleVisitor<BabelClass, S>,
    ${types.map(v => `${v}?: SingleVisitor<${v}, S>,`).join("\n    ")}
  |};
}
`;

process.stdout.write(code);

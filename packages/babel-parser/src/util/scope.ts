// @flow
import {
  SCOPE_ARROW,
  SCOPE_DIRECT_SUPER,
  SCOPE_FUNCTION,
  SCOPE_SIMPLE_CATCH,
  SCOPE_SUPER,
  SCOPE_PROGRAM,
  SCOPE_VAR,
  SCOPE_CLASS,
  SCOPE_STATIC_BLOCK,
  BIND_SCOPE_FUNCTION,
  BIND_SCOPE_VAR,
  BIND_SCOPE_LEXICAL,
  BIND_KIND_VALUE,
  type ScopeFlags,
  type BindingTypes,
} from "./scopeflags";
import * as N from "../types";
import { Errors, type raiseFunction } from "../parser/error";

// Start an AST node, attaching a start offset.
export class Scope {
  flags: ScopeFlags;
  // A list of var-declared names in the current lexical scope
  var: string[] = [];
  // A list of lexically-declared names in the current lexical scope
  lexical: string[] = [];
  // A list of lexically-declared FunctionDeclaration names in the current lexical scope
  functions: string[] = [];

  constructor(flags: ScopeFlags) {
    this.flags = flags;
  }
}

// The functions in this module keep track of declared variables in the
// current scope in order to detect duplicate variable names.
export default class ScopeHandler<IScope: Scope = Scope> {
  scopeStack: Array<IScope> = [];
  declare raise: raiseFunction;
  declare inModule: boolean;
  undefinedExports: Map<string, number> = new Map();
  undefinedPrivateNames: Map<string, number> = new Map();

  constructor(raise: raiseFunction, inModule: boolean) {
    this.raise = raise;
    this.inModule = inModule;
  }

  get inFunction() {
    return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
  }
  get allowSuper() {
    return (this.currentThisScope().flags & SCOPE_SUPER) > 0;
  }
  get allowDirectSuper() {
    return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
  }
  get inClass() {
    return (this.currentThisScope().flags & SCOPE_CLASS) > 0;
  }
  get inStaticBlock() {
    return (this.currentThisScope().flags & SCOPE_STATIC_BLOCK) > 0;
  }
  get inNonArrowFunction() {
    return (this.currentThisScope().flags & SCOPE_FUNCTION) > 0;
  }
  get treatFunctionsAsVar() {
    return this.treatFunctionsAsVarInScope(this.currentScope());
  }

  createScope(flags: ScopeFlags): Scope {
    return new Scope(flags);
  }
  // This method will be overwritten by subclasses
  /*:: +createScope: (flags: ScopeFlags) => IScope; */

  enter(flags: ScopeFlags) {
    this.scopeStack.push(this.createScope(flags));
  }

  exit() {
    this.scopeStack.pop();
  }

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  treatFunctionsAsVarInScope(scope: IScope): boolean {
    return !!(
      scope.flags & SCOPE_FUNCTION ||
      (!this.inModule && scope.flags & SCOPE_PROGRAM)
    );
  }

  declareName(name: string, bindingType: BindingTypes, pos: number) {
    let scope = this.currentScope();
    if (bindingType & BIND_SCOPE_LEXICAL || bindingType & BIND_SCOPE_FUNCTION) {
      this.checkRedeclarationInScope(scope, name, bindingType, pos);

      if (bindingType & BIND_SCOPE_FUNCTION) {
        scope.functions.push(name);
      } else {
        scope.lexical.push(name);
      }

      if (bindingType & BIND_SCOPE_LEXICAL) {
        this.maybeExportDefined(scope, name);
      }
    } else if (bindingType & BIND_SCOPE_VAR) {
      for (let i = this.scopeStack.length - 1; i >= 0; --i) {
        scope = this.scopeStack[i];
        this.checkRedeclarationInScope(scope, name, bindingType, pos);
        scope.var.push(name);
        this.maybeExportDefined(scope, name);

        if (scope.flags & SCOPE_VAR) break;
      }
    }
    if (this.inModule && scope.flags & SCOPE_PROGRAM) {
      this.undefinedExports.delete(name);
    }
  }

  maybeExportDefined(scope: IScope, name: string) {
    if (this.inModule && scope.flags & SCOPE_PROGRAM) {
      this.undefinedExports.delete(name);
    }
  }

  checkRedeclarationInScope(
    scope: IScope,
    name: string,
    bindingType: BindingTypes,
    pos: number,
  ) {
    if (this.isRedeclaredInScope(scope, name, bindingType)) {
      this.raise(pos, Errors.VarRedeclaration, name);
    }
  }

  isRedeclaredInScope(
    scope: IScope,
    name: string,
    bindingType: BindingTypes,
  ): boolean {
    if (!(bindingType & BIND_KIND_VALUE)) return false;

    if (bindingType & BIND_SCOPE_LEXICAL) {
      return (
        scope.lexical.indexOf(name) > -1 ||
        scope.functions.indexOf(name) > -1 ||
        scope.var.indexOf(name) > -1
      );
    }

    if (bindingType & BIND_SCOPE_FUNCTION) {
      return (
        scope.lexical.indexOf(name) > -1 ||
        (!this.treatFunctionsAsVarInScope(scope) &&
          scope.var.indexOf(name) > -1)
      );
    }

    return (
      (scope.lexical.indexOf(name) > -1 &&
        !(scope.flags & SCOPE_SIMPLE_CATCH && scope.lexical[0] === name)) ||
      (!this.treatFunctionsAsVarInScope(scope) &&
        scope.functions.indexOf(name) > -1)
    );
  }

  checkLocalExport(id: N.Identifier) {
    if (
      this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
      this.scopeStack[0].var.indexOf(id.name) === -1 &&
      // In strict mode, scope.functions will always be empty.
      // Modules are strict by default, but the `scriptMode` option
      // can overwrite this behavior.
      this.scopeStack[0].functions.indexOf(id.name) === -1
    ) {
      this.undefinedExports.set(id.name, id.start);
    }
  }

  currentScope(): IScope {
    return this.scopeStack[this.scopeStack.length - 1];
  }

  // $FlowIgnore
  currentVarScope(): IScope {
    for (let i = this.scopeStack.length - 1; ; i--) {
      const scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR) {
        return scope;
      }
    }
  }

  // Could be useful for `arguments`, `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  // $FlowIgnore
  currentThisScope(): IScope {
    for (let i = this.scopeStack.length - 1; ; i--) {
      const scope = this.scopeStack[i];
      if (
        (scope.flags & SCOPE_VAR || scope.flags & SCOPE_CLASS) &&
        !(scope.flags & SCOPE_ARROW)
      ) {
        return scope;
      }
    }
  }
}

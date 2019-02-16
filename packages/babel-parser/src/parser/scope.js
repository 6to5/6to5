// @flow
import UtilParser from "./util";
import {
  SCOPE_ARROW,
  SCOPE_ASYNC,
  SCOPE_DIRECT_SUPER,
  SCOPE_FUNCTION,
  SCOPE_GENERATOR,
  SCOPE_SIMPLE_CATCH,
  SCOPE_SUPER,
  SCOPE_TOP,
  SCOPE_VAR,
  BIND_SIMPLE_CATCH,
  BIND_LEXICAL,
  BIND_FUNCTION,
  type ScopeFlags,
  type BindingTypes,
  SCOPE_CLASS,
} from "../util/scopeflags";

// Start an AST node, attaching a start offset.
class Scope {
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
export default class ScopeParser extends UtilParser {
  scopeStack: Array<Scope> = [];

  get inFunction() {
    return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
  }
  get inGenerator() {
    return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
  }
  get inAsync() {
    return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
  }
  get allowSuper() {
    return (this.currentThisScope().flags & SCOPE_SUPER) > 0;
  }
  get allowDirectSuper() {
    return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
  }
  get inNonArrowFunction() {
    return (this.currentThisScope().flags & SCOPE_FUNCTION) > 0;
  }
  get treatFunctionsAsVar() {
    return this.treatFunctionsAsVarInScope(this.currentScope());
  }

  enterScope(flags: ScopeFlags) {
    this.scopeStack.push(new Scope(flags));
  }

  exitScope() {
    this.scopeStack.pop();
  }

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  treatFunctionsAsVarInScope(scope: Scope): boolean {
    return !!(
      scope.flags & SCOPE_FUNCTION ||
      (!this.inModule && scope.flags & SCOPE_TOP)
    );
  }

  declareName(name: string, bindingType: ?BindingTypes, pos: number) {
    let redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      const scope = this.currentScope();
      redeclared =
        scope.lexical.indexOf(name) > -1 ||
        scope.functions.indexOf(name) > -1 ||
        scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      const scope = this.currentScope();
      scope.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      const scope = this.currentScope();
      if (this.treatFunctionsAsVar) {
        redeclared = scope.lexical.indexOf(name) > -1;
      } else {
        redeclared =
          scope.lexical.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      }
      scope.functions.push(name);
    } else {
      for (let i = this.scopeStack.length - 1; i >= 0; --i) {
        const scope = this.scopeStack[i];
        if (
          (scope.lexical.indexOf(name) > -1 &&
            !(scope.flags & SCOPE_SIMPLE_CATCH) &&
            scope.lexical[0] === name) ||
          (!this.treatFunctionsAsVarInScope(scope) &&
            scope.functions.indexOf(name) > -1)
        ) {
          redeclared = true;
          break;
        }
        scope.var.push(name);

        if (scope.flags & SCOPE_VAR) break;
      }
    }
    if (redeclared) {
      this.raise(pos, `Identifier '${name}' has already been declared`);
    }
  }

  currentScope(): Scope {
    return this.scopeStack[this.scopeStack.length - 1];
  }

  // $FlowIgnore
  currentVarScope(): Scope {
    for (let i = this.scopeStack.length - 1; ; i--) {
      const scope = this.scopeStack[i];
      if (scope.flags & SCOPE_VAR) {
        return scope;
      }
    }
  }

  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  // $FlowIgnore
  currentThisScope(): Scope {
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

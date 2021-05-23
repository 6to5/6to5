// @flow

import ScopeHandler, { Scope } from "../../util/scope";
import {
  BIND_KIND_TYPE,
  BIND_FLAGS_TS_ENUM,
  BIND_FLAGS_TS_CONST_ENUM,
  BIND_FLAGS_TS_EXPORT_ONLY,
  BIND_KIND_VALUE,
  BIND_FLAGS_CLASS,
  type ScopeFlags,
  type BindingTypes,
} from "../../util/scopeflags";
import * as N from "../../types";

class TypeScriptScope extends Scope {
  types: string[] = [];

  // enums (which are also in .types)
  enums: string[] = [];

  // const enums (which are also in .enums and .types)
  constEnums: string[] = [];

  // classes (which are also in .lexical) and interface (which are also in .types)
  classes: string[] = [];

  // namespaces and ambient functions (or classes) are too difficult to track,
  // especially without type analysis.
  // We need to track them anyway, to avoid "X is not defined" errors
  // when exporting them.
  exportOnlyBindings: string[] = [];
}

// See https://github.com/babel/babel/pull/9766#discussion_r268920730 for an
// explanation of how typescript handles scope.

export default class TypeScriptScopeHandler extends ScopeHandler<TypeScriptScope> {
  createScope(flags: ScopeFlags): TypeScriptScope {
    return new TypeScriptScope(flags);
  }

  declareName(name: string, bindingType: BindingTypes, pos: number) {
    const scope = this.currentScope();
    if (bindingType & BIND_FLAGS_TS_EXPORT_ONLY) {
      this.maybeExportDefined(scope, name);
      scope.exportOnlyBindings.push(name);
      return;
    }

    super.declareName(...arguments);

    if (bindingType & BIND_KIND_TYPE) {
      if (!(bindingType & BIND_KIND_VALUE)) {
        // "Value" bindings have already been registered by the superclass.
        this.checkRedeclarationInScope(scope, name, bindingType, pos);
        this.maybeExportDefined(scope, name);
      }
      scope.types.push(name);
    }
    if (bindingType & BIND_FLAGS_TS_ENUM) scope.enums.push(name);
    if (bindingType & BIND_FLAGS_TS_CONST_ENUM) scope.constEnums.push(name);
    if (bindingType & BIND_FLAGS_CLASS) scope.classes.push(name);
  }

  isRedeclaredInScope(
    scope: TypeScriptScope,
    name: string,
    bindingType: BindingTypes,
  ): boolean {
    if (scope.enums.indexOf(name) > -1) {
      if (bindingType & BIND_FLAGS_TS_ENUM) {
        // Enums can be merged with other enums if they are both
        //  const or both non-const.
        const isConst = !!(bindingType & BIND_FLAGS_TS_CONST_ENUM);
        const wasConst = scope.constEnums.indexOf(name) > -1;
        return isConst !== wasConst;
      }
      return true;
    }
    if (bindingType & BIND_FLAGS_CLASS && scope.classes.indexOf(name) > -1) {
      if (scope.lexical.indexOf(name) > -1) {
        // Classes can be merged with interfaces
        return !!(bindingType & BIND_KIND_VALUE);
      } else {
        // Interface can be merged with other classes or interfaces
        return false;
      }
    }
    if (bindingType & BIND_KIND_TYPE && scope.types.indexOf(name) > -1) {
      return true;
    }

    return super.isRedeclaredInScope(...arguments);
  }

  checkLocalExport(id: N.Identifier) {
    if (
      this.scopeStack[0].types.indexOf(id.name) === -1 &&
      this.scopeStack[0].exportOnlyBindings.indexOf(id.name) === -1
    ) {
      super.checkLocalExport(id);
    }
  }
}

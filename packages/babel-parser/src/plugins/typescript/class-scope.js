// @flow
import * as N from "../../types";
import ClassScopeHandler, { ClassScope } from "../../util/class-scope";
import { TSErrors } from ".";

class TypeScriptClassScope extends ClassScope {
  accessors: Map<string, ?N.Accessibility> = new Map();
}

export default class TypeScriptClassScopeHandler extends ClassScopeHandler<TypeScriptClassScope> {
  createScope(): TypeScriptClassScope {
    return new TypeScriptClassScope();
  }

  declareAccessor(accessor: N.ClassMethod) {
    if (accessor.key.type !== "Identifier") {
      // return for other key types e.g. CallExpression, MemberExpression
      return;
    }
    const key = accessor.key.name;

    const current = this.current();

    const oldAccessibilty = current.accessors.get(key);
    if (oldAccessibilty) {
      if (oldAccessibilty !== accessor.accessibility) {
        this.raise(
          accessor.start,
          /* eslint-disable-next-line @babel/development-internal/dry-error-messages */
          TSErrors.DifferentAccessorAccessibilityModifier,
        );
      }
    } else {
      current.accessors.set(key, accessor.accessibility);
    }
  }
}

// @flow

import {
  CLASS_ELEMENT_KIND_ACCESSOR,
  CLASS_ELEMENT_FLAG_STATIC,
  type ClassElementTypes,
} from "./scopeflags";
import { Errors, type raiseFunction } from "../parser/error";

export class ClassScope {
  // A list of private named declared in the current class
  privateNames: Set<string> = new Set();

  // A list of private getters of setters without their counterpart
  loneAccessors: Map<string, ClassElementTypes> = new Map();

  // A list of private names used before being defined, mapping to
  // their position.
  undefinedPrivateNames: Map<string, number> = new Map();
}

export default class ClassScopeHandler {
  stack: Array<ClassScope> = [];
  declare raise: raiseFunction;
  undefinedPrivateNames: Map<string, number> = new Map();

  constructor(raise: raiseFunction) {
    this.raise = raise;
  }

  current(): ClassScope {
    return this.stack[this.stack.length - 1];
  }

  enter() {
    this.stack.push(new ClassScope());
  }

  exit() {
    const oldClassScope = this.stack.pop();

    // Migrate the usage of not yet defined private names to the outer
    // class scope, or raise an error if we reached the top-level scope.

    const current = this.current();

    // Array.from is needed because this is compiled to an array-like for loop
    for (const [name, pos] of Array.from(oldClassScope.undefinedPrivateNames)) {
      if (current) {
        if (!current.undefinedPrivateNames.has(name)) {
          current.undefinedPrivateNames.set(name, pos);
        }
      } else {
        this.raise(pos, Errors.InvalidPrivateFieldResolution, name);
      }
    }
  }

  declarePrivateName(
    name: string,
    elementType: ClassElementTypes,
    pos: number,
  ) {
    const classScope = this.current();
    let redefined = classScope.privateNames.has(name);

    if (elementType & CLASS_ELEMENT_KIND_ACCESSOR) {
      const accessor = redefined && classScope.loneAccessors.get(name);
      if (accessor) {
        const oldStatic = accessor & CLASS_ELEMENT_FLAG_STATIC;
        const newStatic = elementType & CLASS_ELEMENT_FLAG_STATIC;

        const oldKind = accessor & CLASS_ELEMENT_KIND_ACCESSOR;
        const newKind = elementType & CLASS_ELEMENT_KIND_ACCESSOR;

        // The private name can be duplicated only if it is used by
        // two accessors with different kind (get and set), and if
        // they have the same placement (static or not).
        redefined = oldKind === newKind || oldStatic !== newStatic;

        if (!redefined) classScope.loneAccessors.delete(name);
      } else if (!redefined) {
        classScope.loneAccessors.set(name, elementType);
      }
    }

    if (redefined) {
      this.raise(pos, Errors.PrivateNameRedeclaration, name);
    }

    classScope.privateNames.add(name);
    classScope.undefinedPrivateNames.delete(name);
  }

  usePrivateName(name: string, pos: number) {
    let classScope;
    for (classScope of this.stack) {
      if (classScope.privateNames.has(name)) return;
    }

    if (classScope) {
      classScope.undefinedPrivateNames.set(name, pos);
    } else {
      // top-level
      this.raise(pos, Errors.InvalidPrivateFieldResolution, name);
    }
  }
}

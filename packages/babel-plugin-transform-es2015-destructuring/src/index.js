export default function({ types: t }) {
  /**
   * Test if a VariableDeclaration's declarations contains any Patterns.
   */

  function variableDeclarationHasPattern(node) {
    for (const declar of (node.declarations: Array)) {
      if (t.isPattern(declar.id)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Test if an ArrayPattern's elements contain any RestElements.
   */

  function hasRest(pattern) {
    for (const elem of (pattern.elements: Array)) {
      if (t.isRestElement(elem)) {
        return true;
      }
    }
    return false;
  }

  const arrayUnpackVisitor = {
    ReferencedIdentifier(path, state) {
      if (state.bindings[path.node.name]) {
        state.deopt = true;
        path.stop();
      }
    },
  };

  class DestructuringTransformer {
    constructor(opts) {
      this.blockHoist = opts.blockHoist;
      this.operator = opts.operator;
      this.arrays = {};
      this.nodes = opts.nodes || [];
      this.scope = opts.scope;
      this.file = opts.file;
      this.kind = opts.kind;
    }

    buildVariableAssignment(id, init) {
      let op = this.operator;
      if (t.isMemberExpression(id)) op = "=";

      let node;

      if (op) {
        node = t.expressionStatement(t.assignmentExpression(op, id, init));
      } else {
        node = t.variableDeclaration(this.kind, [
          t.variableDeclarator(id, init),
        ]);
      }

      node._blockHoist = this.blockHoist;

      return node;
    }

    buildVariableDeclaration(id, init) {
      const declar = t.variableDeclaration("var", [
        t.variableDeclarator(id, init),
      ]);
      declar._blockHoist = this.blockHoist;
      return declar;
    }

    push(id, init) {
      if (t.isObjectPattern(id)) {
        this.pushObjectPattern(id, init);
      } else if (t.isArrayPattern(id)) {
        this.pushArrayPattern(id, init);
      } else if (t.isAssignmentPattern(id)) {
        this.pushAssignmentPattern(id, init);
      } else {
        this.nodes.push(this.buildVariableAssignment(id, init));
      }
    }

    toArray(node, count) {
      if (
        this.file.opts.loose ||
        (t.isIdentifier(node) && this.arrays[node.name])
      ) {
        return node;
      } else {
        return this.scope.toArray(node, count);
      }
    }

    pushAssignmentPattern(pattern, valueRef) {
      // we need to assign the current value of the assignment to avoid evaluating
      // it more than once

      const tempValueRef = this.scope.generateUidIdentifierBasedOnNode(
        valueRef,
      );

      const declar = t.variableDeclaration("var", [
        t.variableDeclarator(tempValueRef, valueRef),
      ]);
      declar._blockHoist = this.blockHoist;
      this.nodes.push(declar);

      //

      const tempConditional = t.conditionalExpression(
        t.binaryExpression("===", tempValueRef, t.identifier("undefined")),
        pattern.right,
        tempValueRef,
      );

      const left = pattern.left;
      if (t.isPattern(left)) {
        const tempValueDefault = t.expressionStatement(
          t.assignmentExpression("=", tempValueRef, tempConditional),
        );
        tempValueDefault._blockHoist = this.blockHoist;

        this.nodes.push(tempValueDefault);
        this.push(left, tempValueRef);
      } else {
        this.nodes.push(this.buildVariableAssignment(left, tempConditional));
      }
    }

    pushObjectRest(pattern, objRef, spreadProp, spreadPropIndex) {
      // get all the keys that appear in this object before the current spread

      let keys = [];

      for (let i = 0; i < pattern.properties.length; i++) {
        const prop = pattern.properties[i];

        // we've exceeded the index of the spread property to all properties to the
        // right need to be ignored
        if (i >= spreadPropIndex) break;

        // ignore other spread properties
        if (t.isRestElement(prop)) continue;

        let key = prop.key;
        if (t.isIdentifier(key) && !prop.computed) {
          key = t.stringLiteral(prop.key.name);
        }
        keys.push(key);
      }

      keys = t.arrayExpression(keys);

      //

      const value = t.callExpression(
        this.file.addHelper("objectWithoutProperties"),
        [objRef, keys],
      );
      this.nodes.push(this.buildVariableAssignment(spreadProp.argument, value));
    }

    pushObjectProperty(prop, propRef) {
      if (t.isLiteral(prop.key)) prop.computed = true;

      const pattern = prop.value;
      const objRef = t.memberExpression(propRef, prop.key, prop.computed);

      if (t.isPattern(pattern)) {
        this.push(pattern, objRef);
      } else {
        this.nodes.push(this.buildVariableAssignment(pattern, objRef));
      }
    }

    pushObjectPattern(pattern, objRef) {
      // https://github.com/babel/babel/issues/681

      if (!pattern.properties.length) {
        this.nodes.push(
          t.expressionStatement(
            t.callExpression(this.file.addHelper("objectDestructuringEmpty"), [
              objRef,
            ]),
          ),
        );
      }

      // if we have more than one properties in this pattern and the objectRef is a
      // member expression then we need to assign it to a temporary variable so it's
      // only evaluated once

      if (pattern.properties.length > 1 && !this.scope.isStatic(objRef)) {
        const temp = this.scope.generateUidIdentifierBasedOnNode(objRef);
        this.nodes.push(this.buildVariableDeclaration(temp, objRef));
        objRef = temp;
      }

      //

      for (let i = 0; i < pattern.properties.length; i++) {
        const prop = pattern.properties[i];
        if (t.isRestElement(prop)) {
          this.pushObjectRest(pattern, objRef, prop, i);
        } else {
          this.pushObjectProperty(prop, objRef);
        }
      }
    }

    canUnpackArrayPattern(pattern, arr) {
      // not an array so there's no way we can deal with this
      if (!t.isArrayExpression(arr)) return false;

      // pattern has less elements than the array and doesn't have a rest so some
      // elements wont be evaluated
      if (pattern.elements.length > arr.elements.length) return;
      if (pattern.elements.length < arr.elements.length && !hasRest(pattern)) {
        return false;
      }

      for (const elem of (pattern.elements: Array)) {
        // deopt on holes
        if (!elem) return false;

        // deopt on member expressions as they may be included in the RHS
        if (t.isMemberExpression(elem)) return false;
      }

      for (const elem of (arr.elements: Array)) {
        // deopt on spread elements
        if (t.isSpreadElement(elem)) return false;

        // deopt call expressions as they might change values of LHS variables
        if (t.isCallExpression(elem)) return false;

        // deopt on member expressions as they may be getter/setters and have side-effects
        if (t.isMemberExpression(elem)) return false;
      }

      // deopt on reference to left side identifiers
      const bindings = t.getBindingIdentifiers(pattern);
      const state = { deopt: false, bindings };
      this.scope.traverse(arr, arrayUnpackVisitor, state);
      return !state.deopt;
    }

    pushUnpackedArrayPattern(pattern, arr) {
      for (let i = 0; i < pattern.elements.length; i++) {
        const elem = pattern.elements[i];
        if (t.isRestElement(elem)) {
          this.push(elem.argument, t.arrayExpression(arr.elements.slice(i)));
        } else {
          this.push(elem, arr.elements[i]);
        }
      }
    }

    pushArrayPattern(pattern, arrayRef) {
      if (!pattern.elements) return;

      // optimise basic array destructuring of an array expression
      //
      // we can't do this to a pattern of unequal size to it's right hand
      // array expression as then there will be values that wont be evaluated
      //
      // eg: let [a, b] = [1, 2];

      if (this.canUnpackArrayPattern(pattern, arrayRef)) {
        return this.pushUnpackedArrayPattern(pattern, arrayRef);
      }

      // if we have a rest then we need all the elements so don't tell
      // `scope.toArray` to only get a certain amount

      const count = !hasRest(pattern) && pattern.elements.length;

      // so we need to ensure that the `arrayRef` is an array, `scope.toArray` will
      // return a locally bound identifier if it's been inferred to be an array,
      // otherwise it'll be a call to a helper that will ensure it's one

      const toArray = this.toArray(arrayRef, count);

      if (t.isIdentifier(toArray)) {
        // we've been given an identifier so it must have been inferred to be an
        // array
        arrayRef = toArray;
      } else {
        arrayRef = this.scope.generateUidIdentifierBasedOnNode(arrayRef);
        this.arrays[arrayRef.name] = true;
        this.nodes.push(this.buildVariableDeclaration(arrayRef, toArray));
      }

      //

      for (let i = 0; i < pattern.elements.length; i++) {
        let elem = pattern.elements[i];

        // hole
        if (!elem) continue;

        let elemRef;

        if (t.isRestElement(elem)) {
          elemRef = this.toArray(arrayRef);
          elemRef = t.callExpression(
            t.memberExpression(elemRef, t.identifier("slice")),
            [t.numericLiteral(i)],
          );

          // set the element to the rest element argument since we've dealt with it
          // being a rest already
          elem = elem.argument;
        } else {
          elemRef = t.memberExpression(arrayRef, t.numericLiteral(i), true);
        }

        this.push(elem, elemRef);
      }
    }

    init(pattern, ref) {
      // trying to destructure a value that we can't evaluate more than once so we
      // need to save it to a variable

      if (!t.isArrayExpression(ref) && !t.isMemberExpression(ref)) {
        const memo = this.scope.maybeGenerateMemoised(ref, true);
        if (memo) {
          this.nodes.push(this.buildVariableDeclaration(memo, ref));
          ref = memo;
        }
      }

      //

      this.push(pattern, ref);

      return this.nodes;
    }
  }

  return {
    visitor: {
      ExportNamedDeclaration(path) {
        const declaration = path.get("declaration");
        if (!declaration.isVariableDeclaration()) return;
        if (!variableDeclarationHasPattern(declaration.node)) return;

        const specifiers = [];

        for (const name in path.getOuterBindingIdentifiers(path)) {
          const id = t.identifier(name);
          specifiers.push(t.exportSpecifier(id, id));
        }

        // Split the declaration and export list into two declarations so that the variable
        // declaration can be split up later without needing to worry about not being a
        // top-level statement.
        path.replaceWith(declaration.node);
        path.insertAfter(t.exportNamedDeclaration(null, specifiers));
      },

      ForXStatement(path, file) {
        const { node, scope } = path;
        const left = node.left;

        if (t.isPattern(left)) {
          // for ({ length: k } in { abc: 3 });

          const temp = scope.generateUidIdentifier("ref");

          node.left = t.variableDeclaration("var", [
            t.variableDeclarator(temp),
          ]);

          path.ensureBlock();

          node.body.body.unshift(
            t.variableDeclaration("var", [t.variableDeclarator(left, temp)]),
          );

          return;
        }

        if (!t.isVariableDeclaration(left)) return;

        const pattern = left.declarations[0].id;
        if (!t.isPattern(pattern)) return;

        const key = scope.generateUidIdentifier("ref");
        node.left = t.variableDeclaration(left.kind, [
          t.variableDeclarator(key, null),
        ]);

        const nodes = [];

        const destructuring = new DestructuringTransformer({
          kind: left.kind,
          file: file,
          scope: scope,
          nodes: nodes,
        });

        destructuring.init(pattern, key);

        path.ensureBlock();

        const block = node.body;
        block.body = nodes.concat(block.body);
      },

      CatchClause({ node, scope }, file) {
        const pattern = node.param;
        if (!t.isPattern(pattern)) return;

        const ref = scope.generateUidIdentifier("ref");
        node.param = ref;

        const nodes = [];

        const destructuring = new DestructuringTransformer({
          kind: "let",
          file: file,
          scope: scope,
          nodes: nodes,
        });
        destructuring.init(pattern, ref);

        node.body.body = nodes.concat(node.body.body);
      },

      AssignmentExpression(path, file) {
        const { node, scope } = path;
        if (!t.isPattern(node.left)) return;

        const nodes = [];

        const destructuring = new DestructuringTransformer({
          operator: node.operator,
          file: file,
          scope: scope,
          nodes: nodes,
        });

        let ref;
        if (
          path.isCompletionRecord() ||
          !path.parentPath.isExpressionStatement()
        ) {
          ref = scope.generateUidIdentifierBasedOnNode(node.right, "ref");

          nodes.push(
            t.variableDeclaration("var", [
              t.variableDeclarator(ref, node.right),
            ]),
          );

          if (t.isArrayExpression(node.right)) {
            destructuring.arrays[ref.name] = true;
          }
        }

        destructuring.init(node.left, ref || node.right);

        if (ref) {
          nodes.push(t.expressionStatement(ref));
        }

        path.replaceWithMultiple(nodes);
      },

      VariableDeclaration(path, file) {
        const { node, scope, parent } = path;
        if (t.isForXStatement(parent)) return;
        if (!parent || !path.container) return; // i don't know why this is necessary - TODO
        if (!variableDeclarationHasPattern(node)) return;

        const nodeKind = node.kind;
        const nodes = [];
        let declar;

        for (let i = 0; i < node.declarations.length; i++) {
          declar = node.declarations[i];

          const patternId = declar.init;
          const pattern = declar.id;

          const destructuring = new DestructuringTransformer({
            blockHoist: node._blockHoist,
            nodes: nodes,
            scope: scope,
            kind: node.kind,
            file: file,
          });

          if (t.isPattern(pattern)) {
            destructuring.init(pattern, patternId);

            if (+i !== node.declarations.length - 1) {
              // we aren't the last declarator so let's just make the
              // last transformed node inherit from us
              t.inherits(nodes[nodes.length - 1], declar);
            }
          } else {
            nodes.push(
              t.inherits(
                destructuring.buildVariableAssignment(declar.id, declar.init),
                declar,
              ),
            );
          }
        }

        const nodesOut = [];
        for (const node of nodes) {
          const tail = nodesOut[nodesOut.length - 1];
          if (
            tail &&
            t.isVariableDeclaration(tail) &&
            t.isVariableDeclaration(node)
          ) {
            // Create a single compound declarations
            tail.declarations.push(...node.declarations);
          } else {
            // Make sure the original node kind is used for each compound declaration
            node.kind = nodeKind;
            nodesOut.push(node);
          }
        }

        // Need to unmark the current binding to this var as a param, or other hoists
        // could be placed above this ref.
        // https://github.com/babel/babel/issues/4516
        for (const nodeOut of nodesOut) {
          if (!nodeOut.declarations) continue;
          for (const declaration of nodeOut.declarations) {
            const { name } = declaration.id;
            if (scope.bindings[name]) {
              scope.bindings[name].kind = nodeOut.kind;
            }
          }
        }

        if (nodesOut.length === 1) {
          path.replaceWith(nodesOut[0]);
        } else {
          path.replaceWithMultiple(nodesOut);
        }
      },
    },
  };
}

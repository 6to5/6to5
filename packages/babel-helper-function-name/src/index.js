import getFunctionArity from "babel-helper-get-function-arity";
import template from "babel-template";
import * as t from "babel-types";

const buildPropertyMethodAssignmentWrapper = template(`
  (function (FUNCTION_KEY) {
    function FUNCTION_ID() {
      return FUNCTION_KEY.apply(this, arguments);
    }

    FUNCTION_ID.toString = function () {
      return FUNCTION_KEY.toString();
    }

    return FUNCTION_ID;
  })(FUNCTION)
`);

const buildGeneratorPropertyMethodAssignmentWrapper = template(`
  (function (FUNCTION_KEY) {
    function* FUNCTION_ID() {
      return yield* FUNCTION_KEY.apply(this, arguments);
    }

    FUNCTION_ID.toString = function () {
      return FUNCTION_KEY.toString();
    };

    return FUNCTION_ID;
  })(FUNCTION)
`);

const visitor = {
  "ReferencedIdentifier|BindingIdentifier"(path, state) {
    // check if this node matches our function id
    if (path.node.name !== state.name) return;

    // check that we don't have a local variable declared as that removes the need
    // for the wrapper
    const localDeclar = path.scope.getBindingIdentifier(state.name);
    if (localDeclar !== state.outerDeclar) return;

    state.selfReference = true;
    path.stop();
  },
};

function wrap(state, method, id, scope) {
  if (state.selfReference) {
    if (scope.hasBinding(id.name) && !scope.hasGlobal(id.name)) {
      // we can just munge the local binding
      scope.rename(id.name);
    } else {
      // we don't currently support wrapping class expressions
      if (!t.isFunction(method)) return;

      // need to add a wrapper since we can't change the references
      let build = buildPropertyMethodAssignmentWrapper;
      if (method.generator) {
        build = buildGeneratorPropertyMethodAssignmentWrapper;
      }
      const template = build({
        FUNCTION: method,
        FUNCTION_ID: id,
        FUNCTION_KEY: scope.generateUidIdentifier(id.name),
      }).expression;
      template.callee._skipModulesRemap = true;

      // shim in dummy params to retain function arity, if you try to read the
      // source then you'll get the original since it's proxied so it's all good
      const params = template.callee.body.body[0].params;
      for (let i = 0, len = getFunctionArity(method); i < len; i++) {
        params.push(scope.generateUidIdentifier("x"));
      }

      return template;
    }
  }

  method.id = id;
  scope.getProgramParent().references[id.name] = true;
}

function visit(node, name, scope) {
  const state = {
    selfAssignment: false,
    selfReference: false,
    outerDeclar: scope.getBindingIdentifier(name),
    references: [],
    name: name,
  };

  // check to see if we have a local binding of the id we're setting inside of
  // the function, this is important as there are caveats associated

  const binding = scope.getOwnBinding(name);

  if (binding) {
    if (binding.kind === "param") {
      // safari will blow up in strict mode with code like:
      //
      //   let t = function t(t) {};
      //
      // with the error:
      //
      //   Cannot declare a parameter named 't' as it shadows the name of a
      //   strict mode function.
      //
      // this isn't to the spec and they've invented this behaviour which is
      // **extremely** annoying so we avoid setting the name if it has a param
      // with the same id
      state.selfReference = true;
    } else {
      // otherwise it's defined somewhere in scope like:
      //
      //   let t = function () {
      //     let t = 2;
      //   };
      //
      // so we can safely just set the id and move along as it shadows the
      // bound function id
    }
  } else if (state.outerDeclar || scope.hasGlobal(name)) {
    scope.traverse(node, visitor, state);
  }

  return state;
}

export default function({ node, parent, scope, id }) {
  // has an `id` so we don't need to infer one
  if (node.id) return;

  if (
    (t.isObjectProperty(parent) ||
      t.isObjectMethod(parent, { kind: "method" })) &&
    (!parent.computed || t.isLiteral(parent.key))
  ) {
    // { foo() {} };
    id = parent.key;
  } else if (t.isVariableDeclarator(parent)) {
    // let foo = function () {};
    id = parent.id;

    if (t.isIdentifier(id)) {
      const binding = scope.parent.getBinding(id.name);
      if (
        binding &&
        binding.constant &&
        scope.getBinding(id.name) === binding
      ) {
        // always going to reference this method
        node.id = id;
        node.id[t.NOT_LOCAL_BINDING] = true;
        return;
      }
    }
  } else if (t.isAssignmentExpression(parent)) {
    // foo = function () {};
    id = parent.left;
  } else if (!id) {
    return;
  }

  let name;
  if (id && t.isLiteral(id)) {
    name = id.value;
  } else if (id && t.isIdentifier(id)) {
    name = id.name;
  } else {
    return;
  }

  name = t.toBindingIdentifierName(name);
  id = t.identifier(name);

  // The id shouldn't be considered a local binding to the function because
  // we are simply trying to set the function name and not actually create
  // a local binding.
  id[t.NOT_LOCAL_BINDING] = true;

  const state = visit(node, name, scope);
  return wrap(state, node, id, scope) || node;
}

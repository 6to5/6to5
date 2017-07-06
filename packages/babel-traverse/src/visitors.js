import * as virtualTypes from "./path/lib/virtual-types";
import * as messages from "babel-messages";
import * as t from "babel-types";
import clone from "lodash/clone";

/**
 * explode() will take a visitor object with all of the various shorthands
 * that we support, and validates & normalizes it into a common format, ready
 * to be used in traversal
 *
 * The various shorthands are:
 * * `Identifier() { ... }` -> `Identifier: { enter() { ... } }`
 * * `"Identifier|NumericLiteral": { ... }` -> `Identifier: { ... }, NumericLiteral: { ... }`
 * * Aliases in `babel-types`: e.g. `Property: { ... }` -> `ObjectProperty: { ... }, ClassProperty: { ... }`
 *
 * Other normalizations are:
 * * Visitors of virtual types are wrapped, so that they are only visited when
 *   their dynamic check passes
 * * `enter` and `exit` functions are wrapped in arrays, to ease merging of
 *   visitors
 */
export function explode(visitor) {
  if (visitor._exploded) return visitor;
  visitor._exploded = true;

  // normalise pipes
  for (const nodeType in visitor) {
    if (shouldIgnoreKey(nodeType)) continue;

    const parts: Array<string> = nodeType.split("|");
    if (parts.length === 1) continue;

    const fns = visitor[nodeType];
    delete visitor[nodeType];

    for (const part of parts) {
      visitor[part] = fns;
    }
  }

  // verify data structure
  verify(visitor);

  // make sure there's no __esModule type since this is because we're using loose mode
  // and it sets __esModule to be enumerable on all modules :(
  delete visitor.__esModule;

  // ensure visitors are objects
  ensureEntranceObjects(visitor);

  // ensure enter/exit callbacks are arrays
  ensureCallbackArrays(visitor);

  // add type wrappers
  for (const nodeType of (Object.keys(visitor): Array)) {
    if (shouldIgnoreKey(nodeType)) continue;

    const wrapper = virtualTypes[nodeType];
    if (!wrapper) continue;

    // wrap all the functions
    const fns = visitor[nodeType];
    for (const type in fns) {
      fns[type] = wrapCheck(wrapper, fns[type]);
    }

    // clear it from the visitor
    delete visitor[nodeType];

    if (wrapper.types) {
      for (const type of (wrapper.types: Array<string>)) {
        // merge the visitor if necessary or just put it back in
        if (visitor[type]) {
          mergePair(visitor[type], fns);
        } else {
          visitor[type] = fns;
        }
      }
    } else {
      mergePair(visitor, fns);
    }
  }

  // add aliases
  for (const nodeType in visitor) {
    if (shouldIgnoreKey(nodeType)) continue;

    const fns = visitor[nodeType];

    let aliases: ?Array<string> = t.FLIPPED_ALIAS_KEYS[nodeType];

    const deprecratedKey = t.DEPRECATED_KEYS[nodeType];
    if (deprecratedKey) {
      console.trace(
        `Visitor defined for ${nodeType} but it has been renamed to ${deprecratedKey}`,
      );
      aliases = [deprecratedKey];
    }

    if (!aliases) continue;

    // clear it from the visitor
    delete visitor[nodeType];

    for (const alias of aliases) {
      const existing = visitor[alias];
      if (existing) {
        mergePair(existing, fns);
      } else {
        visitor[alias] = clone(fns);
      }
    }
  }

  for (const nodeType in visitor) {
    if (shouldIgnoreKey(nodeType)) continue;

    ensureCallbackArrays(visitor[nodeType]);
  }

  return visitor;
}

export function verify(visitor) {
  if (visitor._verified) return;

  if (typeof visitor === "function") {
    throw new Error(messages.get("traverseVerifyRootFunction"));
  }

  for (const nodeType in visitor) {
    if (nodeType === "enter" || nodeType === "exit") {
      validateVisitorMethods(nodeType, visitor[nodeType]);
    }

    if (shouldIgnoreKey(nodeType)) continue;

    if (t.TYPES.indexOf(nodeType) < 0) {
      throw new Error(messages.get("traverseVerifyNodeType", nodeType));
    }

    const visitors = visitor[nodeType];
    if (typeof visitors === "object") {
      for (const visitorKey in visitors) {
        if (visitorKey === "enter" || visitorKey === "exit") {
          // verify that it just contains functions
          validateVisitorMethods(
            `${nodeType}.${visitorKey}`,
            visitors[visitorKey],
          );
        } else {
          throw new Error(
            messages.get("traverseVerifyVisitorProperty", nodeType, visitorKey),
          );
        }
      }
    }
  }

  visitor._verified = true;
}

function validateVisitorMethods(path, val) {
  const fns = [].concat(val);
  for (const fn of fns) {
    if (typeof fn !== "function") {
      throw new TypeError(
        `Non-function found defined in ${path} with type ${typeof fn}`,
      );
    }
  }
}

export function merge(
  visitors: Array,
  states: Array = [],
  wrapper?: ?Function,
) {
  const rootVisitor = {};

  for (let i = 0; i < visitors.length; i++) {
    const visitor = visitors[i];
    const state = states[i];

    explode(visitor);

    for (const type in visitor) {
      let visitorType = visitor[type];

      // if we have state or wrapper then overload the callbacks to take it
      if (state || wrapper) {
        visitorType = wrapWithStateOrWrapper(visitorType, state, wrapper);
      }

      const nodeVisitor = (rootVisitor[type] = rootVisitor[type] || {});
      mergePair(nodeVisitor, visitorType);
    }
  }

  return rootVisitor;
}

function wrapWithStateOrWrapper(oldVisitor, state, wrapper: ?Function) {
  const newVisitor = {};

  for (const key in oldVisitor) {
    let fns = oldVisitor[key];

    // not an enter/exit array of callbacks
    if (!Array.isArray(fns)) continue;

    fns = fns.map(function(fn) {
      let newFn = fn;

      if (state) {
        newFn = function(path) {
          return fn.call(state, path, state);
        };
      }

      if (wrapper) {
        newFn = wrapper(state.key, key, newFn);
      }

      return newFn;
    });

    newVisitor[key] = fns;
  }

  return newVisitor;
}

function ensureEntranceObjects(obj) {
  for (const key in obj) {
    if (shouldIgnoreKey(key)) continue;

    const fns = obj[key];
    if (typeof fns === "function") {
      obj[key] = { enter: fns };
    }
  }
}

function ensureCallbackArrays(obj) {
  if (obj.enter && !Array.isArray(obj.enter)) obj.enter = [obj.enter];
  if (obj.exit && !Array.isArray(obj.exit)) obj.exit = [obj.exit];
}

function wrapCheck(wrapper, fn) {
  const newFn = function(path) {
    if (wrapper.checkPath(path)) {
      return fn.apply(this, arguments);
    }
  };
  newFn.toString = () => fn.toString();
  return newFn;
}

function shouldIgnoreKey(key) {
  // internal/hidden key
  if (key[0] === "_") return true;

  // ignore function keys
  if (key === "enter" || key === "exit" || key === "shouldSkip") return true;

  // ignore other options
  if (key === "blacklist" || key === "noScope" || key === "skipKeys") {
    return true;
  }

  return false;
}

function mergePair(dest, src) {
  for (const key in src) {
    dest[key] = [].concat(dest[key] || [], src[key]);
  }
}

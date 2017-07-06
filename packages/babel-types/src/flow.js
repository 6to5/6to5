import * as t from "./index";

/**
 * Takes an array of `types` and flattens them, removing duplicates and
 * returns a `UnionTypeAnnotation` node containg them.
 */

export function createUnionTypeAnnotation(types: Array<Object>) {
  const flattened = removeTypeDuplicates(types);

  if (flattened.length === 1) {
    return flattened[0];
  } else {
    return t.unionTypeAnnotation(flattened);
  }
}

/**
 * Dedupe type annotations.
 */

export function removeTypeDuplicates(nodes: Array<Object>): Array<Object> {
  const generics = {};
  const bases = {};

  // store union type groups to circular references
  const typeGroups = [];

  const types = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;

    // detect duplicates
    if (types.indexOf(node) >= 0) {
      continue;
    }

    // this type matches anything
    if (t.isAnyTypeAnnotation(node)) {
      return [node];
    }

    //
    if (t.isFlowBaseAnnotation(node)) {
      bases[node.type] = node;
      continue;
    }

    //
    if (t.isUnionTypeAnnotation(node)) {
      if (typeGroups.indexOf(node.types) < 0) {
        nodes = nodes.concat(node.types);
        typeGroups.push(node.types);
      }
      continue;
    }

    // find a matching generic type and merge and deduplicate the type parameters
    if (t.isGenericTypeAnnotation(node)) {
      const name = node.id.name;

      if (generics[name]) {
        let existing = generics[name];
        if (existing.typeParameters) {
          if (node.typeParameters) {
            existing.typeParameters.params = removeTypeDuplicates(
              existing.typeParameters.params.concat(node.typeParameters.params),
            );
          }
        } else {
          existing = node.typeParameters;
        }
      } else {
        generics[name] = node;
      }

      continue;
    }

    types.push(node);
  }

  // add back in bases
  for (const type in bases) {
    types.push(bases[type]);
  }

  // add back in generics
  for (const name in generics) {
    types.push(generics[name]);
  }

  return types;
}

/**
 * Create a type anotation based on typeof expression.
 */

export function createTypeAnnotationBasedOnTypeof(type: string) {
  if (type === "string") {
    return t.stringTypeAnnotation();
  } else if (type === "number") {
    return t.numberTypeAnnotation();
  } else if (type === "undefined") {
    return t.voidTypeAnnotation();
  } else if (type === "boolean") {
    return t.booleanTypeAnnotation();
  } else if (type === "function") {
    return t.genericTypeAnnotation(t.identifier("Function"));
  } else if (type === "object") {
    return t.genericTypeAnnotation(t.identifier("Object"));
  } else if (type === "symbol") {
    return t.genericTypeAnnotation(t.identifier("Symbol"));
  } else {
    throw new Error("Invalid typeof value");
  }
}

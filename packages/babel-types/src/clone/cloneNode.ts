import { NODE_FIELDS } from "../definitions";
import type * as t from "..";
import { isFile, isIdentifier } from "../validators/generated";

const has = Function.call.bind(Object.prototype.hasOwnProperty);

// This function will never be called for comments, only for real nodes.
function cloneIfNode(obj, deep, withoutLoc) {
  if (obj && typeof obj.type === "string") {
    return cloneNode(obj, deep, withoutLoc);
  }

  return obj;
}

function cloneIfNodeOrArray(obj, deep, withoutLoc) {
  if (Array.isArray(obj)) {
    return obj.map(node => cloneIfNode(node, deep, withoutLoc));
  }
  return cloneIfNode(obj, deep, withoutLoc);
}

/**
 * Create a clone of a `node` including only properties belonging to the node.
 * If the second parameter is `false`, cloneNode performs a shallow clone.
 * If the third parameter is true, the cloned nodes exclude location properties.
 */
export default function cloneNode<T extends t.Node>(
  node: T,
  deep: boolean = true,
  withoutLoc: boolean = false,
): T {
  if (!node) return node;

  const { type } = node;
  const newNode: any = { type: node.type };

  // Special-case identifiers since they are the most cloned nodes.
  if (isIdentifier(node)) {
    newNode.name = node.name;

    if (has(node, "optional")) {
      newNode.optional = node.optional;
    }
    if (has(node, "decorators")) {
      newNode.decorators = node.decorators;
    }

    if (has(node, "typeAnnotation")) {
      newNode.typeAnnotation = deep
        ? cloneIfNodeOrArray(node.typeAnnotation, true, withoutLoc)
        : node.typeAnnotation;
    }
  } else if (!has(NODE_FIELDS, type)) {
    throw new Error(`Unknown node type: "${type}"`);
  } else {
    for (const field of Object.keys(NODE_FIELDS[type])) {
      if (has(node, field)) {
        if (deep) {
          newNode[field] =
            isFile(node) && field === "comments"
              ? maybeCloneComments(node.comments, deep, withoutLoc)
              : cloneIfNodeOrArray(node[field], true, withoutLoc);
        } else {
          newNode[field] = node[field];
        }
      }
    }
  }

  if (has(node, "loc")) {
    if (withoutLoc) {
      newNode.loc = null;
    } else {
      newNode.loc = node.loc;
    }
  }
  if (has(node, "leadingComments")) {
    newNode.leadingComments = maybeCloneComments(
      node.leadingComments,
      deep,
      withoutLoc,
    );
  }
  if (has(node, "innerComments")) {
    newNode.innerComments = maybeCloneComments(
      node.innerComments,
      deep,
      withoutLoc,
    );
  }
  if (has(node, "trailingComments")) {
    newNode.trailingComments = maybeCloneComments(
      node.trailingComments,
      deep,
      withoutLoc,
    );
  }
  if (has(node, "extra")) {
    newNode.extra = {
      ...node.extra,
    };
  }

  return newNode;
}

function maybeCloneComments<T extends t.Comment>(
  comments: ReadonlyArray<T> | null,
  deep: boolean,
  withoutLoc: boolean,
): ReadonlyArray<T> | null {
  if (!comments || !deep) {
    return comments;
  }
  return comments.map(({ type, value, loc }) => {
    if (withoutLoc) {
      return { type, value, loc: null } as T;
    }
    return { type, value, loc } as T;
  });
}

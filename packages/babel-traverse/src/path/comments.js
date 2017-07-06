// This file contains methods responsible for dealing with comments.

/**
 * Share comments amongst siblings.
 */

export function shareCommentsWithSiblings() {
  // NOTE: this assumes numbered keys
  if (typeof this.key === "string") return;

  const node = this.node;
  if (!node) return;

  const trailing = node.trailingComments;
  const leading = node.leadingComments;
  if (!trailing && !leading) return;

  const prev = this.getSibling(this.key - 1);
  const next = this.getSibling(this.key + 1);
  const hasPrev = Boolean(prev.node);
  const hasNext = Boolean(next.node);
  if (hasPrev && hasNext) {
  } else if (hasPrev) {
    prev.addComments("trailing", trailing);
  } else if (hasNext) {
    next.addComments("leading", leading);
  }
}

export function addComment(type, content, line?) {
  this.addComments(type, [
    {
      type: line ? "CommentLine" : "CommentBlock",
      value: content,
    },
  ]);
}

/**
 * Give node `comments` of the specified `type`.
 */

export function addComments(type: string, comments: Array) {
  if (!comments) return;

  const node = this.node;
  if (!node) return;

  const key = `${type}Comments`;

  if (node[key]) {
    if (type === "leading") {
      node[key] = comments.concat(node[key]);
    } else {
      node[key] = node[key].concat(comments);
    }
  } else {
    node[key] = comments;
  }
}

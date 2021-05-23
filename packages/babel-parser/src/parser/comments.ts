// @flow

/**
 * Based on the comment attachment algorithm used in espree and estraverse.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import BaseParser from "./base";
import type { Comment, Node } from "../types";

function last<T>(stack: $ReadOnlyArray<T>): T {
  return stack[stack.length - 1];
}

export default class CommentsParser extends BaseParser {
  addComment(comment: Comment): void {
    if (this.filename) comment.loc.filename = this.filename;
    this.state.trailingComments.push(comment);
    this.state.leadingComments.push(comment);
  }

  adjustCommentsAfterTrailingComma(
    node: Node,
    elements: (Node | null)[],
    // When the current node is followed by a token which hasn't a respective AST node, we
    // need to take all the trailing comments to prevent them from being attached to an
    // unrelated node. e.g. in
    //     var { x } /* cmt */ = { y }
    // we don't want /* cmt */ to be attached to { y }.
    // On the other hand, in
    //     fn(x) [new line] /* cmt */ [new line] y
    // /* cmt */ is both a trailing comment of fn(x) and a leading comment of y
    takeAllComments?: boolean,
  ) {
    if (this.state.leadingComments.length === 0) {
      return;
    }

    let lastElement = null;
    let i = elements.length;
    while (lastElement === null && i > 0) {
      lastElement = elements[--i];
    }
    if (lastElement === null) {
      return;
    }

    for (let j = 0; j < this.state.leadingComments.length; j++) {
      if (
        this.state.leadingComments[j].end < this.state.commentPreviousNode.end
      ) {
        this.state.leadingComments.splice(j, 1);
        j--;
      }
    }

    const newTrailingComments = [];
    for (let i = 0; i < this.state.leadingComments.length; i++) {
      const leadingComment = this.state.leadingComments[i];
      if (leadingComment.end < node.end) {
        newTrailingComments.push(leadingComment);

        // Perf: we don't need to splice if we are going to reset the array anyway
        if (!takeAllComments) {
          this.state.leadingComments.splice(i, 1);
          i--;
        }
      } else {
        if (node.trailingComments === undefined) {
          node.trailingComments = [];
        }
        node.trailingComments.push(leadingComment);
      }
    }
    if (takeAllComments) this.state.leadingComments = [];

    if (newTrailingComments.length > 0) {
      lastElement.trailingComments = newTrailingComments;
    } else if (lastElement.trailingComments !== undefined) {
      lastElement.trailingComments = [];
    }
  }

  processComment(node: Node): void {
    if (node.type === "Program" && node.body.length > 0) return;

    const stack = this.state.commentStack;

    let firstChild, lastChild, trailingComments, i, j;

    if (this.state.trailingComments.length > 0) {
      // If the first comment in trailingComments comes after the
      // current node, then we're good - all comments in the array will
      // come after the node and so it's safe to add them as official
      // trailingComments.
      if (this.state.trailingComments[0].start >= node.end) {
        trailingComments = this.state.trailingComments;
        this.state.trailingComments = [];
      } else {
        // Otherwise, if the first comment doesn't come after the
        // current node, that means we have a mix of leading and trailing
        // comments in the array and that leadingComments contains the
        // same items as trailingComments. Reset trailingComments to
        // zero items and we'll handle this by evaluating leadingComments
        // later.
        this.state.trailingComments.length = 0;
      }
    } else if (stack.length > 0) {
      const lastInStack = last(stack);
      if (
        lastInStack.trailingComments &&
        lastInStack.trailingComments[0].start >= node.end
      ) {
        trailingComments = lastInStack.trailingComments;
        delete lastInStack.trailingComments;
      }
    }

    // Eating the stack.
    if (stack.length > 0 && last(stack).start >= node.start) {
      firstChild = stack.pop();
    }

    while (stack.length > 0 && last(stack).start >= node.start) {
      lastChild = stack.pop();
    }

    if (!lastChild && firstChild) lastChild = firstChild;

    // Adjust comments that follow a trailing comma on the last element in a
    // comma separated list of nodes to be the trailing comments on the last
    // element
    if (firstChild) {
      switch (node.type) {
        case "ObjectExpression":
          this.adjustCommentsAfterTrailingComma(node, node.properties);
          break;
        case "ObjectPattern":
          this.adjustCommentsAfterTrailingComma(node, node.properties, true);
          break;
        case "CallExpression":
          this.adjustCommentsAfterTrailingComma(node, node.arguments);
          break;
        case "ArrayExpression":
          this.adjustCommentsAfterTrailingComma(node, node.elements);
          break;
        case "ArrayPattern":
          this.adjustCommentsAfterTrailingComma(node, node.elements, true);
          break;
      }
    } else if (
      this.state.commentPreviousNode &&
      ((this.state.commentPreviousNode.type === "ImportSpecifier" &&
        node.type !== "ImportSpecifier") ||
        (this.state.commentPreviousNode.type === "ExportSpecifier" &&
          node.type !== "ExportSpecifier"))
    ) {
      this.adjustCommentsAfterTrailingComma(node, [
        this.state.commentPreviousNode,
      ]);
    }

    if (lastChild) {
      if (lastChild.leadingComments) {
        if (
          lastChild !== node &&
          lastChild.leadingComments.length > 0 &&
          last(lastChild.leadingComments).end <= node.start
        ) {
          node.leadingComments = lastChild.leadingComments;
          delete lastChild.leadingComments;
        } else {
          // A leading comment for an anonymous class had been stolen by its first ClassMethod,
          // so this takes back the leading comment.
          // See also: https://github.com/eslint/espree/issues/158
          for (i = lastChild.leadingComments.length - 2; i >= 0; --i) {
            if (lastChild.leadingComments[i].end <= node.start) {
              node.leadingComments = lastChild.leadingComments.splice(0, i + 1);
              break;
            }
          }
        }
      }
    } else if (this.state.leadingComments.length > 0) {
      if (last(this.state.leadingComments).end <= node.start) {
        if (this.state.commentPreviousNode) {
          for (j = 0; j < this.state.leadingComments.length; j++) {
            if (
              this.state.leadingComments[j].end <
              this.state.commentPreviousNode.end
            ) {
              this.state.leadingComments.splice(j, 1);
              j--;
            }
          }
        }
        if (this.state.leadingComments.length > 0) {
          node.leadingComments = this.state.leadingComments;
          this.state.leadingComments = [];
        }
      } else {
        // https://github.com/eslint/espree/issues/2
        //
        // In special cases, such as return (without a value) and
        // debugger, all comments will end up as leadingComments and
        // will otherwise be eliminated. This step runs when the
        // commentStack is empty and there are comments left
        // in leadingComments.
        //
        // This loop figures out the stopping point between the actual
        // leading and trailing comments by finding the location of the
        // first comment that comes after the given node.
        for (i = 0; i < this.state.leadingComments.length; i++) {
          if (this.state.leadingComments[i].end > node.start) {
            break;
          }
        }

        // Split the array based on the location of the first comment
        // that comes after the node. Keep in mind that this could
        // result in an empty array, and if so, the array must be
        // deleted.
        const leadingComments = this.state.leadingComments.slice(0, i);

        if (leadingComments.length) {
          node.leadingComments = leadingComments;
        }

        // Similarly, trailing comments are attached later. The variable
        // must be reset to null if there are no trailing comments.
        trailingComments = this.state.leadingComments.slice(i);
        if (trailingComments.length === 0) {
          trailingComments = null;
        }
      }
    }

    this.state.commentPreviousNode = node;

    if (trailingComments) {
      if (
        trailingComments.length &&
        trailingComments[0].start >= node.start &&
        last(trailingComments).end <= node.end
      ) {
        node.innerComments = trailingComments;
      } else {
        // TrailingComments maybe contain innerComments
        const firstTrailingCommentIndex = trailingComments.findIndex(
          comment => comment.end >= node.end,
        );

        if (firstTrailingCommentIndex > 0) {
          node.innerComments = trailingComments.slice(
            0,
            firstTrailingCommentIndex,
          );
          node.trailingComments = trailingComments.slice(
            firstTrailingCommentIndex,
          );
        } else {
          node.trailingComments = trailingComments;
        }
      }
    }

    stack.push(node);
  }
}

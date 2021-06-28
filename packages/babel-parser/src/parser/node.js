// @flow

import type Parser from "./index";
import UtilParser from "./util";
import { SourceLocation, type Position } from "../util/location";
import type { Comment, Node as NodeType, NodeBase } from "../types";

// Start an AST node, attaching a start offset.

class Node implements NodeBase {
  constructor(parser: Parser, pos: number, loc: Position) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    this.loc = new SourceLocation(loc);
    if (parser?.options.ranges) this.range = [pos, 0];
    if (parser?.filename) this.loc.filename = parser.filename;
  }

  type: string;
  start: number;
  end: number;
  loc: SourceLocation;
  range: [number, number];
  leadingComments: Array<Comment>;
  trailingComments: Array<Comment>;
  innerComments: Array<Comment>;
  extra: { [key: string]: any };

  __clone(): this {
    // $FlowIgnore
    const newNode: any = new Node();
    const keys = Object.keys(this);
    for (let i = 0, length = keys.length; i < length; i++) {
      const key = keys[i];
      // Do not clone comments that are already attached to the node
      if (
        key !== "leadingComments" &&
        key !== "trailingComments" &&
        key !== "innerComments"
      ) {
        // $FlowIgnore
        newNode[key] = this[key];
      }
    }

    return newNode;
  }
}

export class NodeUtils extends UtilParser {
  startNode<T: NodeType>(): T {
    // $FlowIgnore
    return new Node(this, this.state.start, this.state.startLoc);
  }

  startNodeAt<T: NodeType>(pos: number, loc: Position): T {
    // $FlowIgnore
    return new Node(this, pos, loc);
  }

  /** Start a new node with a previous node's location. */
  startNodeAtNode<T: NodeType>(type: NodeType): T {
    return this.startNodeAt(type.start, type.loc.start);
  }

  // Finish an AST node, adding `type` and `end` properties.

  finishNode<T: NodeType>(node: T, type: string): T {
    return this.finishNodeAt(
      node,
      type,
      this.state.lastTokEnd,
      this.state.lastTokEndLoc,
    );
  }

  // Finish node at given position

  finishNodeAt<T: NodeType>(
    node: T,
    type: string,
    pos: number,
    loc: Position,
  ): T {
    if (process.env.NODE_ENV !== "production" && node.end > 0) {
      throw new Error(
        "Do not call finishNode*() twice on the same node." +
          " Instead use resetEndLocation() or change type directly.",
      );
    }
    node.type = type;
    node.end = pos;
    node.loc.end = loc;
    if (this.options.ranges) node.range[1] = pos;
    this.processComment(node);
    return node;
  }

  resetStartLocation(node: NodeBase, start: number, startLoc: Position): void {
    node.start = start;
    node.loc.start = startLoc;
    if (this.options.ranges) node.range[0] = start;
  }

  resetEndLocation(
    node: NodeBase,
    end?: number = this.state.lastTokEnd,
    endLoc?: Position = this.state.lastTokEndLoc,
  ): void {
    node.end = end;
    node.loc.end = endLoc;
    if (this.options.ranges) node.range[1] = end;
  }

  /**
   * Reset the start location of node to the start location of locationNode
   */
  resetStartLocationFromNode(node: NodeBase, locationNode: NodeBase): void {
    this.resetStartLocation(node, locationNode.start, locationNode.loc.start);
  }
}

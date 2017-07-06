import NodePath from "./path";
import * as t from "babel-types";

const testing = process.env.NODE_ENV === "test";

export default class TraversalContext {
  constructor(scope, opts, state, parentPath) {
    this.parentPath = parentPath;
    this.scope = scope;
    this.state = state;
    this.opts = opts;
  }

  parentPath: NodePath;
  scope;
  state;
  opts;
  queue: ?Array<NodePath> = null;

  /**
   * This method does a simple check to determine whether or not we really need to attempt
   * visit a node. This will prevent us from constructing a NodePath.
   */

  shouldVisit(node): boolean {
    const opts = this.opts;
    if (opts.enter || opts.exit) return true;

    // check if we have a visitor for this node
    if (opts[node.type]) return true;

    // check if we're going to traverse into this node
    const keys: ?Array<string> = t.VISITOR_KEYS[node.type];
    if (!keys || !keys.length) return false;

    // we need to traverse into this node so ensure that it has children to traverse into!
    for (const key of keys) {
      if (node[key]) return true;
    }

    return false;
  }

  create(node, obj, key, listKey): NodePath {
    return NodePath.get({
      parentPath: this.parentPath,
      parent: node,
      container: obj,
      key: key,
      listKey,
    });
  }

  maybeQueue(path, notPriority?: boolean) {
    if (this.trap) {
      throw new Error("Infinite cycle detected");
    }

    if (this.queue) {
      if (notPriority) {
        this.queue.push(path);
      } else {
        this.priorityQueue.push(path);
      }
    }
  }

  visitMultiple(container, parent, listKey) {
    // nothing to traverse!
    if (container.length === 0) return false;

    const queue = [];

    // build up initial queue
    for (let key = 0; key < container.length; key++) {
      const node = container[key];
      if (node && this.shouldVisit(node)) {
        queue.push(this.create(parent, container, key, listKey));
      }
    }

    return this.visitQueue(queue);
  }

  visitSingle(node, key): boolean {
    if (this.shouldVisit(node[key])) {
      return this.visitQueue([this.create(node, node, key)]);
    } else {
      return false;
    }
  }

  visitQueue(queue: Array<NodePath>) {
    // set queue
    this.queue = queue;
    this.priorityQueue = [];

    const visited = [];
    let stop = false;

    // visit the queue
    for (const path of queue) {
      path.resync();

      if (
        path.contexts.length === 0 ||
        path.contexts[path.contexts.length - 1] !== this
      ) {
        // The context might already have been pushed when this path was inserted and queued.
        // If we always re-pushed here, we could get duplicates and risk leaving contexts
        // on the stack after the traversal has completed, which could break things.
        path.pushContext(this);
      }

      // this path no longer belongs to the tree
      if (path.key === null) continue;

      if (testing && queue.length >= 10_000) {
        this.trap = true;
      }

      // ensure we don't visit the same node twice
      if (visited.indexOf(path.node) >= 0) continue;
      visited.push(path.node);

      if (path.visit()) {
        stop = true;
        break;
      }

      if (this.priorityQueue.length) {
        stop = this.visitQueue(this.priorityQueue);
        this.priorityQueue = [];
        this.queue = queue;
        if (stop) break;
      }
    }

    // clear queue
    for (const path of queue) {
      path.popContext();
    }

    // clear queue
    this.queue = null;

    return stop;
  }

  visit(node, key) {
    const nodes = node[key];
    if (!nodes) return false;

    if (Array.isArray(nodes)) {
      return this.visitMultiple(nodes, node, key);
    } else {
      return this.visitSingle(node, key);
    }
  }
}

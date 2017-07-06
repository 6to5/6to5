// This file contains methods responsible for removing a node.

import { hooks } from "./lib/removal-hooks";

export function remove() {
  this._assertUnremoved();

  this.resync();

  if (this._callRemovalHooks()) {
    this._markRemoved();
    return;
  }

  this.shareCommentsWithSiblings();
  this._remove();
  this._markRemoved();
}

export function _callRemovalHooks() {
  for (const fn of (hooks: Array<Function>)) {
    if (fn(this, this.parentPath)) return true;
  }
}

export function _remove() {
  if (Array.isArray(this.container)) {
    this.container.splice(this.key, 1);
    this.updateSiblingKeys(this.key, -1);
  } else {
    this._replaceWith(null);
  }
}

export function _markRemoved() {
  this.shouldSkip = true;
  this.removed = true;
  this.node = null;
}

export function _assertUnremoved() {
  if (this.removed) {
    throw this.buildCodeFrameError(
      "NodePath has been removed so is read-only.",
    );
  }
}

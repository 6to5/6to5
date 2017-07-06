export let path = new WeakMap();
export let scope = new WeakMap();

export function clear() {
  clearPath();
  clearScope();
}

export function clearPath() {
  path = new WeakMap();
}

export function clearScope() {
  scope = new WeakMap();
}

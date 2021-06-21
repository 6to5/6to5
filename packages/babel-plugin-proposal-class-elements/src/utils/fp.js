export function map(fn) {
  return list => list.map(fn);
}

export function mapFilter(fn) {
  return list => list.map(fn).filter(Boolean);
}

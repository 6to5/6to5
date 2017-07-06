import nameFunction from "babel-helper-function-name";
import has from "lodash/has";
import * as t from "babel-types";

function toKind(node: Object) {
  if (t.isClassMethod(node) || t.isObjectMethod(node)) {
    if (node.kind === "get" || node.kind === "set") {
      return node.kind;
    }
  }

  return "value";
}

export function push(
  mutatorMap: Object,
  node: Object,
  kind: string,
  file,
  scope?,
): Object {
  const alias = t.toKeyAlias(node);

  //

  let map = {};
  if (has(mutatorMap, alias)) map = mutatorMap[alias];
  mutatorMap[alias] = map;

  //

  map._inherits = map._inherits || [];
  map._inherits.push(node);

  map._key = node.key;

  if (node.computed) {
    map._computed = true;
  }

  if (node.decorators) {
    const decorators = (map.decorators =
      map.decorators || t.arrayExpression([]));
    decorators.elements = decorators.elements.concat(
      node.decorators.map(dec => dec.expression).reverse(),
    );
  }

  if (map.value || map.initializer) {
    throw file.buildCodeFrameError(node, "Key conflict with sibling node");
  }

  let key, value;

  // save the key so we can possibly do function name inferences
  if (
    t.isObjectProperty(node) ||
    t.isObjectMethod(node) ||
    t.isClassMethod(node)
  ) {
    key = t.toComputedKey(node, node.key);
  }

  if (t.isObjectProperty(node) || t.isClassProperty(node)) {
    value = node.value;
  } else if (t.isObjectMethod(node) || t.isClassMethod(node)) {
    value = t.functionExpression(
      null,
      node.params,
      node.body,
      node.generator,
      node.async,
    );
    value.returnType = node.returnType;
  }

  const inheritedKind = toKind(node);
  if (!kind || inheritedKind !== "value") {
    kind = inheritedKind;
  }

  // infer function name
  if (
    scope &&
    t.isStringLiteral(key) &&
    (kind === "value" || kind === "initializer") &&
    t.isFunctionExpression(value)
  ) {
    value = nameFunction({ id: key, node: value, scope });
  }

  if (value) {
    t.inheritsComments(value, node);
    map[kind] = value;
  }

  return map;
}

export function hasComputed(mutatorMap: Object): boolean {
  for (const key in mutatorMap) {
    if (mutatorMap[key]._computed) {
      return true;
    }
  }
  return false;
}

export function toComputedObjectFromClass(obj: Object): Object {
  const objExpr = t.arrayExpression([]);

  for (let i = 0; i < obj.properties.length; i++) {
    const prop = obj.properties[i];
    const val = prop.value;
    val.properties.unshift(
      t.objectProperty(t.identifier("key"), t.toComputedKey(prop)),
    );
    objExpr.elements.push(val);
  }

  return objExpr;
}

export function toClassObject(mutatorMap: Object): Object {
  const objExpr = t.objectExpression([]);

  Object.keys(mutatorMap).forEach(function(mutatorMapKey) {
    const map = mutatorMap[mutatorMapKey];
    const mapNode = t.objectExpression([]);

    const propNode = t.objectProperty(map._key, mapNode, map._computed);

    Object.keys(map).forEach(function(key) {
      let node = map[key];
      if (key[0] === "_") return;

      const inheritNode = node;
      if (t.isClassMethod(node) || t.isClassProperty(node)) node = node.value;

      const prop = t.objectProperty(t.identifier(key), node);
      t.inheritsComments(prop, inheritNode);
      t.removeComments(inheritNode);

      mapNode.properties.push(prop);
    });

    objExpr.properties.push(propNode);
  });

  return objExpr;
}

export function toDefineObject(mutatorMap: Object): Object {
  Object.keys(mutatorMap).forEach(function(key) {
    const map = mutatorMap[key];
    if (map.value) map.writable = t.booleanLiteral(true);
    map.configurable = t.booleanLiteral(true);
    map.enumerable = t.booleanLiteral(true);
  });

  return toClassObject(mutatorMap);
}

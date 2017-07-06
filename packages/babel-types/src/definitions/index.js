import * as t from "../index";

export const VISITOR_KEYS = {};
export const ALIAS_KEYS = {};
export const NODE_FIELDS = {};
export const BUILDER_KEYS = {};
export const DEPRECATED_KEYS = {};

function getType(val) {
  if (Array.isArray(val)) {
    return "array";
  } else if (val === null) {
    return "null";
  } else if (val === undefined) {
    return "undefined";
  } else {
    return typeof val;
  }
}

export function assertEach(callback: Function): Function {
  function validator(node, key, val) {
    if (!Array.isArray(val)) return;

    for (let i = 0; i < val.length; i++) {
      callback(node, `${key}[${i}]`, val[i]);
    }
  }
  validator.each = callback;
  return validator;
}

export function assertOneOf(...vals): Function {
  function validate(node, key, val) {
    if (vals.indexOf(val) < 0) {
      throw new TypeError(
        `Property ${key} expected value to be one of ${JSON.stringify(
          vals,
        )} but got ${JSON.stringify(val)}`,
      );
    }
  }

  validate.oneOf = vals;

  return validate;
}

export function assertNodeType(...types: Array<string>): Function {
  function validate(node, key, val) {
    let valid = false;

    for (const type of types) {
      if (t.is(type, val)) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      throw new TypeError(
        `Property ${key} of ${node.type} expected node to be of a type ${JSON.stringify(
          types,
        )} ` + `but instead got ${JSON.stringify(val && val.type)}`,
      );
    }
  }

  validate.oneOfNodeTypes = types;

  return validate;
}

export function assertNodeOrValueType(...types: Array<string>): Function {
  function validate(node, key, val) {
    let valid = false;

    for (const type of types) {
      if (getType(val) === type || t.is(type, val)) {
        valid = true;
        break;
      }
    }

    if (!valid) {
      throw new TypeError(
        `Property ${key} of ${node.type} expected node to be of a type ${JSON.stringify(
          types,
        )} ` + `but instead got ${JSON.stringify(val && val.type)}`,
      );
    }
  }

  validate.oneOfNodeOrValueTypes = types;

  return validate;
}

export function assertValueType(type: string): Function {
  function validate(node, key, val) {
    const valid = getType(val) === type;

    if (!valid) {
      throw new TypeError(
        `Property ${key} expected type of ${type} but got ${getType(val)}`,
      );
    }
  }

  validate.type = type;

  return validate;
}

export function chain(...fns: Array<Function>): Function {
  function validate(...args) {
    for (const fn of fns) {
      fn(...args);
    }
  }
  validate.chainOf = fns;
  return validate;
}

export default function defineType(
  type: string,
  opts: {
    fields?: Object,
    visitor?: Array<string>,
    aliases?: Array<string>,
    builder?: Array<string>,
    inherits?: string,
    deprecatedAlias?: string,
  } = {},
) {
  const inherits = (opts.inherits && store[opts.inherits]) || {};

  opts.fields = opts.fields || inherits.fields || {};
  opts.visitor = opts.visitor || inherits.visitor || [];
  opts.aliases = opts.aliases || inherits.aliases || [];
  opts.builder = opts.builder || inherits.builder || opts.visitor || [];

  if (opts.deprecatedAlias) {
    DEPRECATED_KEYS[opts.deprecatedAlias] = type;
  }

  // ensure all field keys are represented in `fields`
  for (const key of (opts.visitor.concat(opts.builder): Array<string>)) {
    opts.fields[key] = opts.fields[key] || {};
  }

  for (const key in opts.fields) {
    const field = opts.fields[key];

    if (opts.builder.indexOf(key) === -1) {
      field.optional = true;
    }
    if (field.default === undefined) {
      field.default = null;
    } else if (!field.validate) {
      field.validate = assertValueType(getType(field.default));
    }
  }

  VISITOR_KEYS[type] = opts.visitor;
  BUILDER_KEYS[type] = opts.builder;
  NODE_FIELDS[type] = opts.fields;
  ALIAS_KEYS[type] = opts.aliases;

  store[type] = opts;
}

const store = {};

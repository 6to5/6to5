// WARNING: Plugin ordering is important. Don't reorder this file
// without checking that it doesn't break anything.

const es5 = {
  "transform-member-expression-literals":
    "Object/array literal extensions / Reserved words as property names",
  "transform-property-literals":
    "Object/array literal extensions / Reserved words as property names",
  "transform-reserved-words": "Miscellaneous / Unreserved words",
};

// https://github.com/babel/babel/issues/11278
// transform-parameters should run before object-rest-spread
const es2015Parameter = {
  "transform-parameters": {
    features: [
      "default function parameters",
      "rest parameters",
      "destructuring, parameters / aliased defaults, arrow function",
      "destructuring, parameters / shorthand defaults, arrow function",
    ],
  },
};

const es2015 = {
  "transform-template-literals": {
    features: ["template literals"],
  },
  "transform-literals": {
    features: ["Unicode code point escapes"],
  },
  "transform-function-name": {
    features: ['function "name" property'],
  },
  "transform-arrow-functions": {
    features: [
      "arrow functions / 0 parameters",
      "arrow functions / 1 parameter, no brackets",
      "arrow functions / multiple parameters",
      'arrow functions / lexical "this" binding',
      'arrow functions / "this" unchanged by call or apply',
      "arrow functions / can't be bound, can be curried",
      'arrow functions / lexical "arguments" binding',
      "arrow functions / no line break between params and <code>=></code>",
      "arrow functions / correct precedence",
      'arrow functions / no "prototype" property',
    ],
  },
  "transform-block-scoped-functions": {
    features: ["block-level function declaration"],
  },
  "transform-classes": {
    features: [
      "class",
      "super",
      'arrow functions / lexical "super" binding in constructors',
      'arrow functions / lexical "super" binding in methods',
    ],
  },
  "transform-object-super": {
    features: ["super"],
  },
  "transform-shorthand-properties": {
    features: ["object literal extensions / shorthand properties"],
  },
  "transform-duplicate-keys": {
    features: ["miscellaneous / duplicate property names in strict mode"],
  },
  "transform-computed-properties": {
    features: ["object literal extensions / computed properties"],
  },
  "transform-for-of": {
    features: ["for..of loops"],
  },
  "transform-sticky-regex": {
    features: [
      'RegExp "y" and "u" flags / "y" flag, lastIndex',
      'RegExp "y" and "u" flags / "y" flag',
    ],
  },
  "transform-unicode-escapes": "Unicode code point escapes",
  "transform-unicode-regex": {
    features: [
      'RegExp "y" and "u" flags / "u" flag, case folding',
      'RegExp "y" and "u" flags / "u" flag, Unicode code point escapes',
      'RegExp "y" and "u" flags / "u" flag, non-BMP Unicode characters',
      'RegExp "y" and "u" flags / "u" flag',
    ],
  },
  "transform-spread": {
    features: [
      "spread syntax for iterable objects",
      // We need to compile classes when spread is not supported, because
      // we cannot compile super(...args) without also rewriting the
      // "super" handling. There is a bugfix that makes it better.
      "class",
      "super",
    ],
  },
  "transform-destructuring": {
    features: ["destructuring, assignment", "destructuring, declarations"],
  },
  "transform-block-scoping": {
    features: ["const", "let"],
  },
  "transform-typeof-symbol": {
    features: ["Symbol / typeof support"],
  },
  "transform-new-target": {
    features: ["new.target", 'arrow functions / lexical "new.target" binding'],
  },
  "transform-regenerator": {
    features: ["generators"],
  },
};

const es2016 = {
  "transform-exponentiation-operator": {
    features: ["exponentiation (**) operator"],
  },
};

const es2017 = {
  "transform-async-to-generator": {
    features: ["async functions"],
  },
};

const es2018 = {
  "proposal-async-generator-functions": "Asynchronous Iterators",
  "proposal-object-rest-spread": "object rest/spread properties",

  "transform-dotall-regex": "s (dotAll) flag for regular expressions",
  "proposal-unicode-property-regex": "RegExp Unicode Property Escapes",
  "transform-named-capturing-groups-regex": "RegExp named capture groups",
};

const es2019 = {
  "proposal-json-strings": "JSON superset",
  "proposal-optional-catch-binding": "optional catch binding",
};

const es2020 = {
  "proposal-nullish-coalescing-operator": "nullish coalescing operator (??)",
  "proposal-optional-chaining": "optional chaining operator (?.)",
};

const es2021 = {
  "proposal-numeric-separator": "numeric separator",
  "proposal-logical-assignment-operators": "Logical Assignment",
};

const shippedProposal = {
  "proposal-class-static-block": "Class static initialization blocks",
  "proposal-private-property-in-object":
    "Ergonomic brand checks for private fields",
  "proposal-class-properties": {
    features: [
      "static class fields",
      "instance class fields, public instance class fields",
      "instance class fields, private instance class fields basic support",
      "instance class fields, computed instance class fields",
    ],
  },
  "proposal-private-methods": "private class methods",
};

// Run plugins for modern features first
module.exports = Object.assign(
  {},
  shippedProposal,
  es2021,
  es2020,
  es2019,
  es2015Parameter,
  es2018,
  es2017,
  es2016,
  es2015,
  es5
);

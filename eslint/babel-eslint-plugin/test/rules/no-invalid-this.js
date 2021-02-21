import cloneDeep from "lodash/cloneDeep";
import rule from "../../src/rules/no-invalid-this";
import RuleTester from "../../../babel-eslint-shared-fixtures/utils/RuleTester";

/**
 * A constant value for modules environment.
 * This modifies pattern object to make modules.
 * @param {Object} pattern - A pattern object to modify.
 * @returns {void}
 */
function MODULE(pattern) {
  pattern.parserOptions.sourceType = "module";
}

/**
 * A constant value for non strict mode environment.
 * @returns {void}
 */
function SCRIPT(pattern) {
  pattern.parserOptions.sourceType = "script";
}

/**
 * A constant value for strict mode environment.
 * This modifies pattern object to make strict mode.
 * @param {Object} pattern - A pattern object to modify.
 * @returns {void}
 */
function USE_STRICT(pattern) {
  pattern.code = '"use strict"; ' + pattern.code;
}

/**
 * A constant value for implied strict mode.
 * This modifies pattern object to impose strict mode.
 * @param {Object} pattern - A pattern object to modify.
 * @returns {void}
 */
function IMPLIED_STRICT(pattern) {
  pattern.parserOptions.ecmaFeatures = pattern.parserOptions.ecmaFeatures || {};
  pattern.parserOptions.ecmaFeatures.impliedStrict = true;
}

/**
 * Extracts patterns each condition for a specified type. The type is `valid` or `invalid`.
 * @param {Object[]} patterns - Original patterns.
 * @param {string} type - One of `"valid"` or `"invalid"`.
 * @returns {Object[]} Test patterns.
 */
function extractPatterns(patterns, type) {
  // Clone and apply the pattern environment.
  const patternsList = patterns.map(pattern =>
    pattern[type].map(applyCondition => {
      const thisPattern = cloneDeep(pattern);

      if (type === "valid" && Array.isArray(applyCondition)) {
        throw new Error(
          "The apply condition can only be an array for invalid cases.",
        );
      }

      if (type === "invalid") {
        let numErrors = 1;

        if (Array.isArray(applyCondition)) {
          [applyCondition, numErrors] = applyCondition;
        }

        thisPattern.errors = Array(numErrors).fill({
          messageId: "unexpectedThis",
        });
      }

      applyCondition(thisPattern);

      delete thisPattern.invalid;
      delete thisPattern.valid;

      return thisPattern;
    }),
  );

  // Flatten.
  return Array.prototype.concat.apply([], patternsList);
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const patterns = [
  {
    code: "class A { a = this.b; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
    invalid: [],
  },
  {
    code: "class A { a = () => { return this.b; }; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
    invalid: [],
  },
  {
    code: "class A { a = () => this.b; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
    invalid: [],
  },
  {
    code: "class A { [this] = b; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [],
    invalid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
  },
  {
    code: "class A { [this.a] = b; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [],
    invalid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
  },
  {
    code: "class A { [`${this.a}b`] = c; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [],
    invalid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
  },
  {
    code: "class A { [this.a] = () => { return b; }; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [],
    invalid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
  },
  {
    code: "class A { [this.a] = () => b; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [],
    invalid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
  },
  {
    code: "class A { bFactory = () => class B { [this.b] = () => c; }; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [],
    invalid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
  },

  {
    code: "class A { [this.a] = () => class B { [this.b] = () => c; }; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [],
    invalid: [
      [MODULE, 2],
      [SCRIPT, 2],
      [USE_STRICT, 2],
      [IMPLIED_STRICT, 2],
    ],
  },
  {
    code: "class A { #a = this.b; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
    invalid: [],
  },
  {
    code: "class A { #a() { return this.b; }; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
    invalid: [],
  },
  {
    code: "class A { #a = () => { return this.b; }; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
    invalid: [],
  },
  {
    code: "class A { #a = () => this.b; }",
    parserOptions: { ecmaVersion: 2020 },
    valid: [MODULE, SCRIPT, USE_STRICT, IMPLIED_STRICT],
    invalid: [],
  },
];

const ruleTester = new RuleTester();
ruleTester.run("@babel/no-invalid-this", rule, {
  valid: extractPatterns(patterns, "valid"),
  invalid: extractPatterns(patterns, "invalid"),
});

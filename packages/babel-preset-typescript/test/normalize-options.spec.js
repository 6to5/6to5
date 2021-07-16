import normalizeOptions from "../src/normalize-options";
describe("normalize options", () => {
  (process.env.BABEL_8_BREAKING ? describe : describe.skip)("Babel 8", () => {
    it("should throw on unknown options", () => {
      expect(() => normalizeOptions({ allowNamespace: true })).toThrowError(
        "@babel/preset-typescript: 'allowNamespace' is not a valid top-level option.\n- Did you mean 'allowNamespaces'?",
      );
    });
    it.each([
      "allExtensions",
      "allowNamespaces",
      "isTSX",
      "onlyRemoveTypeImports",
      "optimizeConstEnums",
    ])("should throw when `%p` is not a boolean", optionName => {
      expect(() => normalizeOptions({ [optionName]: 0 })).toThrow(
        `@babel/preset-typescript: '${optionName}' option must be a boolean.`,
      );
    });
    it.each(["jsxPragma", "jsxPragmaFrag"])(
      "should throw when `%p` is not a string",
      optionName => {
        expect(() => normalizeOptions({ [optionName]: 0 })).toThrow(
          `@babel/preset-typescript: '${optionName}' option must be a string.`,
        );
      },
    );
    it("should not throw when options is not defined", () => {
      expect(() => normalizeOptions()).not.toThrowError();
    });
    it("default values", () => {
      expect(normalizeOptions({})).toMatchInlineSnapshot(`
        Object {
          "allExtensions": false,
          "allowNamespaces": true,
          "isTSX": false,
          "jsxPragma": "React",
          "jsxPragmaFrag": "React.Fragment",
          "onlyRemoveTypeImports": true,
          "optimizeConstEnums": false,
        }
      `);
    });
  });
  (process.env.BABEL_8_BREAKING ? describe.skip : describe)("Babel 7", () => {
    it("should not throw on unknown options", () => {
      expect(() =>
        normalizeOptions({ allowNamespace: true }),
      ).not.toThrowError();
    });
    it.each(["allowDeclareFields", "allowNamespaces", "onlyRemoveTypeImports"])(
      "should not throw when `%p` is not a boolean",
      optionName => {
        expect(() => normalizeOptions({ [optionName]: 0 })).not.toThrowError();
      },
    );
    it.each(["jsxPragma"])(
      "should throw when `%p` is not a string",
      optionName => {
        expect(() => normalizeOptions({ [optionName]: 0 })).not.toThrowError();
      },
    );
    it.each(["allExtensions", "isTSX", "optimizeConstEnums"])(
      "should throw when `%p` is not a boolean",
      optionName => {
        expect(() => normalizeOptions({ [optionName]: 0 })).toThrow(
          `@babel/preset-typescript: '${optionName}' option must be a boolean.`,
        );
      },
    );
    it.each(["jsxPragmaFrag"])(
      "should throw when `%p` is not a string",
      optionName => {
        expect(() => normalizeOptions({ [optionName]: 0 })).toThrow(
          `@babel/preset-typescript: '${optionName}' option must be a string.`,
        );
      },
    );
    it("default values", () => {
      expect(normalizeOptions({})).toMatchInlineSnapshot(`
        Object {
          "allExtensions": false,
          "allowNamespaces": true,
          "isTSX": false,
          "jsxPragma": undefined,
          "jsxPragmaFrag": "React.Fragment",
          "onlyRemoveTypeImports": undefined,
          "optimizeConstEnums": false,
        }
      `);
    });
  });
});

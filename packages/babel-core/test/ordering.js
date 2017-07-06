import * as babel from "../lib/index";
import assert from "assert";
import path from "path";

const decoratorsPlugin = require.resolve(
  "../../babel-plugin-transform-class-properties",
);
const classPropertiesPlugin = require.resolve(
  "../../babel-plugin-transform-decorators",
);
const functionBindPlugin = require.resolve(
  "../../babel-plugin-transform-function-bind",
);

describe("plugin ordering", function() {
  it("reorders for class properties and decorators", function() {
    const code = `
      function myDecorator() {}

      class Person{
        @myDecorator
        age = 43;

        constructor() {
          console.log(this.age);
        }
      }
    `;

    const res1 = babel.transform(code, {
      plugins: [decoratorsPlugin, classPropertiesPlugin],
    });

    const res2 = babel.transform(code, {
      plugins: [classPropertiesPlugin, decoratorsPlugin],
    });

    assert.equal(res1.code, res2.code);
  });
});

describe("plugin ordering with unordered plugin", function() {
  it("reorders correctly with an unordered plugin", function() {
    const code = `
      function myDecorator() {}

      class Person{
        @myDecorator
        age = 43;

        constructor() {
          Promise.resolve(this.age).then(::console.log);
        }
      }
    `;

    const res1 = babel.transform(code, {
      plugins: [decoratorsPlugin, classPropertiesPlugin, functionBindPlugin],
    });

    const res2 = babel.transform(code, {
      plugins: [functionBindPlugin, classPropertiesPlugin, decoratorsPlugin],
    });

    assert.equal(res1.code, res2.code);
  });
});

it("complex plugin and preset ordering", function() {
  function pushPlugin(name) {
    return {
      name: name,
      visitor: {
        Program(path) {
          path.pushContainer(
            "body",
            babel.types.expressionStatement(babel.types.identifier(name)),
          );
        },
      },
    };
  }

  function pushPreset(name) {
    return { plugins: [pushPlugin(name)] };
  }

  const result = babel.transform("", {
    filename: path.join(
      __dirname,
      "fixtures",
      "config",
      "complex-plugin-config",
      "file.js",
    ),
    presets: [pushPreset("argone"), pushPreset("argtwo")],
    env: {
      development: {
        presets: [pushPreset("argthree"), pushPreset("argfour")],
        env: {
          development: {
            presets: [pushPreset("argfive"), pushPreset("argsix")],
          },
        },
      },
    },
  });

  assert.equal(
    result.code,
    [
      "argsix;",
      "argfive;",
      "argfour;",
      "argthree;",
      "argtwo;",
      "argone;",
      "one;",
      "two;",
      "three;",
      "four;",
      "five;",
      "six;",
      "seven;",
      "eight;",
      "nine;",
      "ten;",
      "eleven;",
      "twelve;",
      "thirteen;",
      "fourteen;",
      "fifteen;",
      "sixteen;",
      "seventeen;",
      "eighteen;",
      "nineteen;",
      "twenty;",
    ].join("\n"),
  );
});

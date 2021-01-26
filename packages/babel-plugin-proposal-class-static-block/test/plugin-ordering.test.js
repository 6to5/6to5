import * as babel from "@babel/core";
import proposalClassStaticBlock from "..";

describe("plugin ordering", () => {
  it("should throw when @babel/plugin-proposal-class-static-block is after class features plugin", () => {
    const source = `class Foo {
  static {
    this.foo = Foo.bar;
  }
  static bar = 42;
}
`;
    expect(() => {
      babel.transformSync(source, {
        filename: "example.js",
        highlightCode: false,
        configFile: false,
        babelrc: false,
        plugins: [
          "@babel/plugin-proposal-class-properties",
          proposalClassStaticBlock,
        ],
      });
    })
      .toThrow(`Incorrect plugin order, \`@babel/plugin-proposal-class-static-block\` should be placed before class features plugins
{
  "plugins": [
    "@babel/plugin-proposal-class-static-block",
    "@babel/plugin-proposal-private-property-in-object",
    "@babel/plugin-proposal-private-methods",
    "@babel/plugin-proposal-class-properties",
  ]
}
  1 | class Foo {
> 2 |   static {
    |   ^
  3 |     this.foo = Foo.bar;
  4 |   }
  5 |   static bar = 42;`);
  });
});

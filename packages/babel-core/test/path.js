import { transform } from "../lib/index";
import Plugin from "../lib/config/plugin";
import chai from "chai";

describe("traversal path", function() {
  it("replaceWithSourceString", function() {
    const expectCode = "function foo() {}";

    const actualCode = transform(expectCode, {
      plugins: [
        new Plugin({
          visitor: {
            FunctionDeclaration: function(path) {
              path.replaceWithSourceString("console.whatever()");
            },
          },
        }),
      ],
    }).code;

    chai.expect(actualCode).to.be.equal("console.whatever();");
  });

  it("replaceWith (arrow expression body to block statement body)", function() {
    const expectCode = "var fn = () => true;";

    const actualCode = transform(expectCode, {
      plugins: [
        new Plugin({
          visitor: {
            ArrowFunctionExpression: function(path) {
              path.get("body").replaceWith({
                type: "BlockStatement",
                body: [
                  {
                    type: "ReturnStatement",
                    argument: {
                      type: "BooleanLiteral",
                      value: true,
                    },
                  },
                ],
              });
            },
          },
        }),
      ],
    }).code;

    chai.expect(actualCode).to.be.equal("var fn = () => {\n  return true;\n};");
  });

  it("replaceWith (arrow block statement body to expression body)", function() {
    const expectCode = "var fn = () => { return true; }";

    const actualCode = transform(expectCode, {
      plugins: [
        new Plugin({
          visitor: {
            ArrowFunctionExpression: function(path) {
              path.get("body").replaceWith({
                type: "BooleanLiteral",
                value: true,
              });
            },
          },
        }),
      ],
    }).code;

    chai.expect(actualCode).to.be.equal("var fn = () => true;");
  });

  it("replaceWith (for-in left expression to variable declaration)", function() {
    const expectCode = "for (KEY in right);";

    const actualCode = transform(expectCode, {
      plugins: [
        new Plugin({
          visitor: {
            ForInStatement: function(path) {
              path.get("left").replaceWith({
                type: "VariableDeclaration",
                kind: "var",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: {
                      type: "Identifier",
                      name: "KEY",
                    },
                  },
                ],
              });
            },
          },
        }),
      ],
    }).code;

    chai.expect(actualCode).to.be.equal("for (var KEY in right);");
  });

  it("replaceWith (for-in left variable declaration to expression)", function() {
    const expectCode = "for (var KEY in right);";

    const actualCode = transform(expectCode, {
      plugins: [
        new Plugin({
          visitor: {
            ForInStatement: function(path) {
              path.get("left").replaceWith({
                type: "Identifier",
                name: "KEY",
              });
            },
          },
        }),
      ],
    }).code;

    chai.expect(actualCode).to.be.equal("for (KEY in right);");
  });

  it("replaceWith (for-loop left expression to variable declaration)", function() {
    const expectCode = "for (KEY;;);";

    const actualCode = transform(expectCode, {
      plugins: [
        new Plugin({
          visitor: {
            ForStatement: function(path) {
              path.get("init").replaceWith({
                type: "VariableDeclaration",
                kind: "var",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: {
                      type: "Identifier",
                      name: "KEY",
                    },
                  },
                ],
              });
            },
          },
        }),
      ],
    }).code;

    chai.expect(actualCode).to.be.equal("for (var KEY;;);");
  });

  it("replaceWith (for-loop left variable declaration to expression)", function() {
    const expectCode = "for (var KEY;;);";

    const actualCode = transform(expectCode, {
      plugins: [
        new Plugin({
          visitor: {
            ForStatement: function(path) {
              path.get("init").replaceWith({
                type: "Identifier",
                name: "KEY",
              });
            },
          },
        }),
      ],
    }).code;

    chai.expect(actualCode).to.be.equal("for (KEY;;);");
  });
});

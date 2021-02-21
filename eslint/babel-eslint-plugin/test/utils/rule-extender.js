import RuleTester from "../../../babel-eslint-shared-fixtures/utils/RuleTester";
import ruleExtender from "../../src/utils/rule-extender";

function createExampleRule() {
  return {
    meta: {
      type: "example",
      fixable: false,
      schema: [
        {
          enum: ["option1", "option2", "option3"],
        },
      ],
      docs: {
        url: "eslint-rule-example.com",
      },
      messages: {
        friendlySuggestion: "Here's a friendly suggestion!",
      },
    },
    create(context) {
      return {
        ThisExpression(node) {
          if (node.parent && node.parent.type === "MemberExpression") {
            context.report({
              node,
              messageId: "friendlySuggestion",
            });
          }
        },
      };
    },
  };
}

describe("ruleExtender", () => {
  let rule;

  beforeEach(() => {
    rule = createExampleRule();
  });

  it("should throw an error when no rule to extend is given", () => {
    expect(() => ruleExtender()).toThrow(new Error("No rule to extend found."));
  });

  it("should throw an error when no options are given", () => {
    expect(() => ruleExtender(rule)).toThrow(
      new Error("No rule extension options supplied."),
    );
  });

  describe("options", () => {
    describe("metaOverrides", () => {
      describe("meta.type", () => {
        it("should override the original value when given", () => {
          const type = "another example";
          expect(
            ruleExtender(rule, { metaOverrides: { type } }).meta.type,
          ).toEqual(type);
        });

        it("should not override the original value when not given", () => {
          expect(
            ruleExtender(rule, { metaOverrides: { fixable: false } }).meta.type,
          ).toEqual("example");
        });

        it("should set to undefined when not set in the original rule or overrides", () => {
          delete rule.meta.type;
          expect(
            ruleExtender(rule, { metaOverrides: { fixable: false } }).meta.type,
          ).toBeUndefined();
        });
      });

      describe("meta.fixable", () => {
        it("should override the original value when given", () => {
          expect(
            ruleExtender(rule, { metaOverrides: { fixable: true } }).meta
              .fixable,
          ).toEqual(true);
        });

        it("should not override the original value when not given", () => {
          expect(
            ruleExtender(rule, {
              metaOverrides: { example: "another example" },
            }).meta.fixable,
          ).toEqual(rule.meta.fixable);
        });

        it("should default to false when not set in the original rule or in overrides", () => {
          delete rule.meta.fixable;
          expect(
            ruleExtender(rule, {
              metaOverrides: { example: "another example" },
            }).meta.fixable,
          ).toEqual(false);
        });
      });

      describe("meta.schema", () => {
        it("should override the original value when given", () => {
          const schema = [
            {
              enum: ["option1", "option2", "option3"],
            },
            {
              anyOf: [
                {
                  enum: ["option 4"],
                },
                {
                  type: "object",
                  properties: {
                    whoaMoreOptions: {
                      type: "boolean",
                    },
                  },
                  additionalProperties: false,
                },
              ],
            },
          ];
          expect(
            ruleExtender(rule, { metaOverrides: { schema } }).meta.schema,
          ).toStrictEqual(schema);
        });

        it("should not override the original value when not given", () => {
          expect(
            ruleExtender(rule, {
              metaOverrides: { example: "another example" },
            }).meta.schema,
          ).toStrictEqual(rule.meta.schema);
        });

        it("should default to empty array when not set in the original rule or in overrides", () => {
          delete rule.meta.schema;
          expect(
            ruleExtender(rule, {
              metaOverrides: { example: "another example" },
            }).meta.schema,
          ).toStrictEqual([]);
        });
      });

      describe("meta.docs", () => {
        it("should merge the value with the original value when given", () => {
          const docs = {
            anotherUrl: "extended-eslint-rule-example.com",
          };
          const expectedValue = { ...rule.meta.docs, ...docs };

          expect(
            ruleExtender(rule, {
              metaOverrides: {
                docs,
              },
            }).meta.docs,
          ).toStrictEqual(expectedValue);
        });

        it("should not alter the original value when not given", () => {
          expect(
            ruleExtender(rule, {
              metaOverrides: { example: "another example" },
            }).meta.docs,
          ).toStrictEqual(rule.meta.docs);
        });

        it("should default to empty object when not set in the original rule or in overrides", () => {
          delete rule.meta.docs;
          expect(
            ruleExtender(rule, {
              metaOverrides: { example: "another example" },
            }).meta.docs,
          ).toStrictEqual({});
        });
      });

      describe("meta.messages", () => {
        it("should merge the value with the original value when given", () => {
          const messages = {
            anEvenFriendlierSuggestion:
              "Here's an even FRIENDLIER suggestion! :D",
          };
          const expectedValue = { ...rule.meta.messages, ...messages };
          expect(
            ruleExtender(rule, {
              metaOverrides: {
                messages,
              },
            }).meta.messages,
          ).toStrictEqual(expectedValue);
        });

        it("should not alter the original value when not given", () => {
          expect(
            ruleExtender(rule, {
              metaOverrides: { example: "another example" },
            }).meta.messages,
          ).toStrictEqual(rule.meta.messages);
        });

        it("should default to empty object when not set in the original rule or in overrides", () => {
          delete rule.meta.messages;
          expect(
            ruleExtender(rule, {
              metaOverrides: { example: "another example" },
            }).meta.messages,
          ).toStrictEqual({});
        });
      });
    });

    // These tests can't be placed in an `it()` because RuleTester creates
    // tests using Jest's `it()` and they shouldn't be nested.
    describe("createAdditionalVisitors", () => {
      describe("should add additional visitors to the rule", () => {
        const extendedRule = ruleExtender(createExampleRule(), {
          metaOverrides: {
            messages: {
              anAdditionalSuggestion: "One more thought!",
            },
          },
          createAdditionalVisitors(context) {
            return {
              ArrowFunctionExpression(node) {
                context.report({ node, messageId: "anAdditionalSuggestion" });
              },
            };
          },
        });

        new RuleTester().run("@babel/example-eslint-rule", extendedRule, {
          valid: ["this"],
          invalid: [
            {
              code: "this.a = () => {}",
              errors: [
                { type: "ThisExpression", messageId: "friendlySuggestion" },
                {
                  type: "ArrowFunctionExpression",
                  messageId: "anAdditionalSuggestion",
                },
              ],
            },
          ],
        });
      });

      describe("should not overwrite any existings visitors with the same selector", () => {
        const extendedRule = ruleExtender(createExampleRule(), {
          metaOverrides: {
            messages: {
              anAdditionalSuggestion: "One more thought!",
            },
          },
          createAdditionalVisitors(context) {
            return {
              ThisExpression(node) {
                if (node.parent.type === "CallExpression") {
                  context.report({ node, messageId: "anAdditionalSuggestion" });
                }
              },
            };
          },
        });

        new RuleTester().run("@babel/example-eslint-rule", extendedRule, {
          valid: ["this"],
          invalid: [
            {
              code: "this.a = b",
              errors: [
                { type: "ThisExpression", messageId: "friendlySuggestion" },
              ],
            },
            {
              code: "fn.apply(this, 'arg')",
              errors: [
                {
                  type: "ThisExpression",
                  messageId: "anAdditionalSuggestion",
                },
              ],
            },
          ],
        });
      });

      describe("both existing and additional visitors should have access to the context object", () => {
        const rule = createExampleRule();
        rule.create = function (context) {
          const sourceCode = context.getSourceCode();

          return {
            ThisExpression(node) {
              if (node.parent && node.parent.type === "MemberExpression") {
                const previousToken = sourceCode.getTokenBefore(node.parent, {
                  includeComments: true,
                });

                if (
                  previousToken &&
                  previousToken.type === "Block" &&
                  previousToken.value.trim() === "I'm not supposed to be here!"
                ) {
                  context.report({
                    node,
                    messageId: "friendlySuggestion",
                  });
                }
              }
            },
          };
        };

        const extendedRule = ruleExtender(rule, {
          metaOverrides: {
            messages: {
              anAdditionalSuggestion: "One more thought!",
            },
          },
          createAdditionalVisitors(context) {
            const sourceCode = context.getSourceCode();

            return {
              ThisExpression(node) {
                if (node.parent.type === "CallExpression") {
                  const previousToken = sourceCode.getTokenBefore(node.parent, {
                    includeComments: true,
                  });
                  if (
                    previousToken &&
                    previousToken.type === "Block" &&
                    previousToken.value.trim() ===
                      "I'm not supposed to be here either!"
                  ) {
                    context.report({
                      node,
                      messageId: "anAdditionalSuggestion",
                    });
                  }
                }
              },
            };
          },
        });

        new RuleTester().run("@babel/example-eslint-rule", extendedRule, {
          valid: ["this.a = b", "fn.apply(this, 'arg')"],
          invalid: [
            {
              code: "/* I'm not supposed to be here! */ this.a = b",
              errors: [
                { type: "ThisExpression", messageId: "friendlySuggestion" },
              ],
            },
            {
              code:
                "/* I'm not supposed to be here either! */ fn.apply(this, 'arg')",
              errors: [
                { type: "ThisExpression", messageId: "anAdditionalSuggestion" },
              ],
            },
          ],
        });
      });
    });

    describe("reportOverrides", () => {
      describe("should not report errors when the function returns false", () => {
        const extendedRule = ruleExtender(createExampleRule(), {
          reportOverrides(meta) {
            return meta.node.type !== "ThisExpression";
          },
        });

        new RuleTester().run("@babel/example-eslint-rule", extendedRule, {
          valid: ["this", "this.a = b", "fn.apply(this, 'arg')"],
          invalid: [],
        });
      });

      describe("should report the original error when the function returns true", () => {
        const extendedRule = ruleExtender(createExampleRule(), {
          reportOverrides(meta) {
            return meta.node.type === "ThisExpression";
          },
        });

        new RuleTester().run("@babel/example-eslint-rule", extendedRule, {
          valid: ["this", "fn.apply(this, 'arg')"],
          invalid: [
            {
              code: "this.a = b",
              errors: [
                { type: "ThisExpression", messageId: "friendlySuggestion" },
              ],
            },
          ],
        });
      });

      describe("should report the original error when the function returns true", () => {
        const extendedRule = ruleExtender(createExampleRule(), {
          reportOverrides(meta) {
            return meta.node.type === "ThisExpression";
          },
        });

        new RuleTester().run("@babel/example-eslint-rule", extendedRule, {
          valid: ["this", "fn.apply(this, 'arg')"],
          invalid: [
            {
              code: "this.a = b",
              errors: [
                { type: "ThisExpression", messageId: "friendlySuggestion" },
              ],
            },
          ],
        });
      });

      describe("should report with alternative metadata if returned by the function", () => {
        const extendedRule = ruleExtender(createExampleRule(), {
          metaOverrides: {
            messages: {
              parentMessage: "I'm reporting something about the parent node.",
            },
          },
          reportOverrides(meta) {
            if (meta.node.type === "ThisExpression") {
              meta.node = meta.node.parent;
              meta.messageId = "parentMessage";
              return meta;
            }

            return true;
          },
        });

        new RuleTester().run("@babel/example-eslint-rule", extendedRule, {
          valid: ["this", "fn.apply(this, 'arg')"],
          invalid: [
            {
              code: "this.a = b",
              errors: [
                { type: "MemberExpression", messageId: "parentMessage" },
              ],
            },
          ],
        });
      });

      describe("should be able to access the context object", () => {
        const extendedRule = ruleExtender(createExampleRule(), {
          reportOverrides(meta, context) {
            const sourceCode = context.getSourceCode();

            if (meta.node.type === "ThisExpression") {
              const previousToken = sourceCode.getTokenBefore(
                meta.node.parent,
                {
                  includeComments: true,
                },
              );

              if (
                previousToken &&
                previousToken.type === "Block" &&
                previousToken.value.trim() === "I'm not supposed to be here!"
              ) {
                return true;
              }
            }

            return false;
          },
        });

        new RuleTester().run("@babel/example-eslint-rule", extendedRule, {
          valid: ["this", "this.a = b", "fn.apply(this, 'arg')"],
          invalid: [
            {
              code: "/* I'm not supposed to be here! */ this.a = b",
              errors: [
                { type: "ThisExpression", messageId: "friendlySuggestion" },
              ],
            },
          ],
        });
      });
    });
  });
});

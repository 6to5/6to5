import traverse from "../lib";
import { parse } from "@babel/parser";

describe("regression #12570", () => {
  it("nested #traverse", () => {
    const ast = parse(
      `import { Foo } from './Foo'; import { Bar } from './Bar'`,
      { sourceType: "module" },
    );
    let enterCount = 0;
    let exitCount = 0;

    traverse(ast, {
      Program(path) {
        path.traverse({
          ImportDeclaration: {
            enter(path) {
              enterCount++;
              if (path.node.source.value === "./Bar") {
                path.parentPath.get(path.listKey);
              }
            },
            exit() {
              exitCount++;
            },
          },
        });
      },
    });
    expect(enterCount).toBe(2);
    expect(exitCount).toBe(2);
  });
});

import traverse from "../lib";
import { parse } from "@babel/parser";

describe("regressions", function () {
  // https://github.com/babel/babel/issues/12570
  describe(`#12750`, function () {
    it(`path.parentPath.get(path.listKey) in nested traversal doesn't clobber exit visitor`, function () {
      const code = `
      import { Foo } from './Foo'
      import { Bar } from './Bar'
      `;

      const ast = parse(code, {
        sourceType: "module",
      });

      const exited = [];

      traverse(ast, {
        Program(path) {
          path.traverse({
            ImportDeclaration: {
              enter(path) {
                if (path.node.source.value === "./Bar") {
                  path.parentPath.get(path.listKey);
                }
              },
              exit(path) {
                exited.push(path.node.source.value);
              },
            },
          });
        },
      });

      expect(exited).toEqual(["./Foo", "./Bar"]);
    });
    it(`path.parentPath.get(path.listKey) in unrelated traversal doesn't clobber exit visitor`, function () {
      const code = `
      import { Foo } from './Foo'
      import { Bar } from './Bar'
      `;

      const ast = parse(code, {
        sourceType: "module",
      });

      const exited = [];

      traverse(ast, {
        Program(path) {
          traverse(path.node, {
            ImportDeclaration: {
              enter(path) {
                if (path.node.source.value === "./Bar") {
                  path.parentPath.get(path.listKey);
                }
              },
              exit(path) {
                exited.push(path.node.source.value);
              },
            },
          });
        },
      });

      expect(exited).toEqual(["./Foo", "./Bar"]);
    });
  });
});

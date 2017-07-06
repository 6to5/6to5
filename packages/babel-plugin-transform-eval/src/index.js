export default function({ parse, traverse }) {
  return {
    visitor: {
      CallExpression(path) {
        if (
          path.get("callee").isIdentifier({ name: "eval" }) &&
          path.node.arguments.length === 1
        ) {
          const evaluate = path.get("arguments")[0].evaluate();
          if (!evaluate.confident) return;

          const code = evaluate.value;
          if (typeof code !== "string") return;

          const ast = parse(code);
          traverse.removeProperties(ast);
          return ast.program;
        }
      },
    },
  };
}

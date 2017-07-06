import { basename, extname } from "path";
import template from "babel-template";
import transformCommonjs from "babel-plugin-transform-es2015-modules-commonjs";

const buildDefine = template(`
  define(MODULE_NAME, [SOURCES], FACTORY);
`);

const buildFactory = template(`
  (function (PARAMS) {
    BODY;
  })
`);

export default function({ types: t }) {
  function isValidRequireCall(path) {
    if (!path.isCallExpression()) return false;
    if (!path.get("callee").isIdentifier({ name: "require" })) return false;
    if (path.scope.getBinding("require")) return false;

    const args = path.get("arguments");
    if (args.length !== 1) return false;

    const arg = args[0];
    if (!arg.isStringLiteral()) return false;

    return true;
  }

  function buildParamsAndSource(sourcesFound) {
    const params = [];
    const sources = [];

    let hasSeenNonBareRequire = false;
    for (let i = sourcesFound.length - 1; i > -1; i--) {
      const source = sourcesFound[i];

      sources.unshift(source[1]);

      // bare import at end, no need for param
      if (!hasSeenNonBareRequire && source[2] === true) {
        continue;
      }

      hasSeenNonBareRequire = true;
      params.unshift(source[0]);
    }

    return [params, sources];
  }

  const amdVisitor = {
    ReferencedIdentifier({ node, scope }) {
      if (node.name === "exports" && !scope.getBinding("exports")) {
        this.hasExports = true;
      }

      if (node.name === "module" && !scope.getBinding("module")) {
        this.hasModule = true;
      }
    },

    CallExpression(path) {
      if (!isValidRequireCall(path)) return;
      const source = path.node.arguments[0];
      const ref = path.scope.generateUidIdentifier(
        basename(source.value, extname(source.value)),
      );
      this.sources.push([ref, source, true]);
      path.remove();
    },

    VariableDeclarator(path) {
      const id = path.get("id");
      if (!id.isIdentifier()) return;

      const init = path.get("init");
      if (!isValidRequireCall(init)) return;

      const source = init.node.arguments[0];
      this.sourceNames[source.value] = true;
      this.sources.push([id.node, source]);

      path.remove();
    },
  };

  return {
    inherits: transformCommonjs,

    pre() {
      // source strings
      this.sources = [];
      this.sourceNames = Object.create(null);

      this.hasExports = false;
      this.hasModule = false;
    },

    visitor: {
      Program: {
        exit(path) {
          if (this.ran) return;
          this.ran = true;

          path.traverse(amdVisitor, this);

          const [params, sources] = buildParamsAndSource(this.sources);

          let moduleName = this.getModuleName();
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          if (this.hasExports) {
            sources.unshift(t.stringLiteral("exports"));
            params.unshift(t.identifier("exports"));
          }

          if (this.hasModule) {
            sources.unshift(t.stringLiteral("module"));
            params.unshift(t.identifier("module"));
          }

          const { node } = path;
          const factory = buildFactory({
            PARAMS: params,
            BODY: node.body,
          });
          factory.expression.body.directives = node.directives;
          node.directives = [];

          node.body = [
            buildDefine({
              MODULE_NAME: moduleName,
              SOURCES: sources,
              FACTORY: factory,
            }),
          ];
        },
      },
    },
  };
}

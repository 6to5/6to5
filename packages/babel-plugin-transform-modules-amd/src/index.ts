import { declare } from "@babel/helper-plugin-utils";
import {
  isModule,
  rewriteModuleStatementsAndPrepareHeader,
  hasExports,
  isSideEffectImport,
  buildNamespaceInitStatements,
  ensureStatementsHoisted,
  wrapInterop,
  getModuleName,
} from "@babel/helper-module-transforms";
import { template, types as t } from "@babel/core";
import { getImportSource } from "babel-plugin-dynamic-import-node/utils";

const buildWrapper = template(`
  define(MODULE_NAME, AMD_ARGUMENTS, function(IMPORT_NAMES) {
  })
`);

const buildAnonymousWrapper = template(`
  define(["require"], function(REQUIRE) {
  })
`);

function injectWrapper(path, wrapper) {
  const { body, directives } = path.node;
  path.node.directives = [];
  path.node.body = [];
  const amdWrapper = path.pushContainer("body", wrapper)[0];
  const amdFactory = amdWrapper
    .get("expression.arguments")
    .filter(arg => arg.isFunctionExpression())[0]
    .get("body");
  amdFactory.pushContainer("directives", directives);
  amdFactory.pushContainer("body", body);
}

export default declare((api, options) => {
  api.assertVersion(7);

  const { allowTopLevelThis, strict, strictMode, importInterop, noInterop } =
    options;

  const constantReexports =
    api.assumption("constantReexports") ?? options.loose;
  const enumerableModuleMeta =
    api.assumption("enumerableModuleMeta") ?? options.loose;

  return {
    name: "transform-modules-amd",

    pre() {
      this.file.set("@babel/plugin-transform-modules-*", "amd");
    },

    visitor: {
      CallExpression(path, state) {
        if (!this.file.has("@babel/plugin-proposal-dynamic-import")) return;
        if (!path.get("callee").isImport()) return;

        let { requireId, resolveId, rejectId } = state;
        if (!requireId) {
          requireId = path.scope.generateUidIdentifier("require");
          state.requireId = requireId;
        }
        if (!resolveId || !rejectId) {
          resolveId = path.scope.generateUidIdentifier("resolve");
          rejectId = path.scope.generateUidIdentifier("reject");
          state.resolveId = resolveId;
          state.rejectId = rejectId;
        }

        let result = t.identifier("imported");
        if (!noInterop) result = wrapInterop(path, result, "namespace");

        path.replaceWith(
          template.expression.ast`
            new Promise((${resolveId}, ${rejectId}) =>
              ${requireId}(
                [${getImportSource(t, path.node)}],
                imported => ${t.cloneNode(resolveId)}(${result}),
                ${t.cloneNode(rejectId)}
              )
            )`,
        );
      },

      Program: {
        exit(path, { requireId }) {
          if (!isModule(path)) {
            if (requireId) {
              injectWrapper(
                path,
                buildAnonymousWrapper({ REQUIRE: t.cloneNode(requireId) }),
              );
            }
            return;
          }

          const amdArgs = [];
          const importNames = [];
          if (requireId) {
            amdArgs.push(t.stringLiteral("require"));
            importNames.push(t.cloneNode(requireId));
          }

          let moduleName = getModuleName(this.file.opts, options);
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          const { meta, headers } = rewriteModuleStatementsAndPrepareHeader(
            path,
            {
              enumerableModuleMeta,
              constantReexports,
              strict,
              strictMode,
              allowTopLevelThis,
              importInterop,
              noInterop,
            },
          );

          if (hasExports(meta)) {
            amdArgs.push(t.stringLiteral("exports"));

            importNames.push(t.identifier(meta.exportName));
          }

          for (const [source, metadata] of meta.source) {
            amdArgs.push(t.stringLiteral(source));
            importNames.push(t.identifier(metadata.name));

            if (!isSideEffectImport(metadata)) {
              const interop = wrapInterop(
                path,
                t.identifier(metadata.name),
                metadata.interop,
              );
              if (interop) {
                const header = t.expressionStatement(
                  t.assignmentExpression(
                    "=",
                    t.identifier(metadata.name),
                    interop,
                  ),
                );
                header.loc = metadata.loc;
                headers.push(header);
              }
            }

            headers.push(
              ...buildNamespaceInitStatements(
                meta,
                metadata,
                constantReexports,
              ),
            );
          }

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);

          injectWrapper(
            path,
            buildWrapper({
              MODULE_NAME: moduleName,

              AMD_ARGUMENTS: t.arrayExpression(amdArgs),
              IMPORT_NAMES: importNames,
            }),
          );
        },
      },
    },
  };
});

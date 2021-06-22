import { declare } from "@babel/helper-plugin-utils";
import hoistVariables from "@babel/helper-hoist-variables";
import { template, types as t } from "@babel/core";
import { getImportSource } from "babel-plugin-dynamic-import-node/utils";
import { rewriteThis, getModuleName } from "@babel/helper-module-transforms";
import { isIdentifierName } from "@babel/helper-validator-identifier";

const buildTemplate = template(`
  SYSTEM_REGISTER(MODULE_NAME, SOURCES, function (EXPORT_IDENTIFIER, CONTEXT_IDENTIFIER) {
    "use strict";
    BEFORE_BODY;
    return {
      setters: SETTERS,
      execute: EXECUTE,
    };
  });
`);

const buildExportAll = template(`
  for (var KEY in TARGET) {
    if (KEY !== "default" && KEY !== "__esModule") EXPORT_OBJ[KEY] = TARGET[KEY];
  }
`);

const MISSING_PLUGIN_WARNING = `\
WARNING: Dynamic import() transformation must be enabled using the
         @babel/plugin-proposal-dynamic-import plugin. Babel 8 will
         no longer transform import() without using that plugin.
`;

const MISSING_PLUGIN_ERROR = `\
ERROR: Dynamic import() transformation must be enabled using the
       @babel/plugin-proposal-dynamic-import plugin. Babel 8
       no longer transforms import() without using that plugin.
`;

//todo: use getExportSpecifierName in `helper-module-transforms` when this library is refactored to NodePath usage.

export function getExportSpecifierName(
  node: Node,
  stringSpecifiers: Set<string>,
): string {
  if (node.type === "Identifier") {
    return node.name;
  } else if (node.type === "StringLiteral") {
    const stringValue = node.value;
    // add specifier value to `stringSpecifiers` only when it can not be converted to an identifier name
    // i.e In `import { "foo" as bar }`
    // we do not consider `"foo"` to be a `stringSpecifier` because we can treat it as
    // `import { foo as bar }`
    // This helps minimize the size of `stringSpecifiers` and reduce overhead of checking valid identifier names
    // when building transpiled code from metadata
    if (!isIdentifierName(stringValue)) {
      stringSpecifiers.add(stringValue);
    }
    return stringValue;
  } else {
    throw new Error(
      `Expected export specifier to be either Identifier or StringLiteral, got ${node.type}`,
    );
  }
}

type PluginState = {|
  contextIdent: string,

  // List of names that should only be printed as string literals.
  // i.e. `import { "any unicode" as foo } from "some-module"`
  // `stringSpecifiers` is Set(1) ["any unicode"]
  // In most cases `stringSpecifiers` is an empty Set
  stringSpecifiers: Set<string>,
|};

function constructExportCall(
  path,
  exportIdent,
  exportNames,
  exportValues,
  exportStarTarget,
  stringSpecifiers: Set<string>,
) {
  const statements = [];
  if (!exportStarTarget) {
    if (exportNames.length === 1) {
      statements.push(
        t.expressionStatement(
          t.callExpression(exportIdent, [
            t.stringLiteral(exportNames[0]),
            exportValues[0],
          ]),
        ),
      );
    } else {
      const objectProperties = [];
      for (let i = 0; i < exportNames.length; i++) {
        const exportName = exportNames[i];
        const exportValue = exportValues[i];
        objectProperties.push(
          t.objectProperty(
            stringSpecifiers.has(exportName)
              ? t.stringLiteral(exportName)
              : t.identifier(exportName),
            exportValue,
          ),
        );
      }
      statements.push(
        t.expressionStatement(
          t.callExpression(exportIdent, [t.objectExpression(objectProperties)]),
        ),
      );
    }
  } else {
    const exportObj = path.scope.generateUid("exportObj");

    statements.push(
      t.variableDeclaration("var", [
        t.variableDeclarator(t.identifier(exportObj), t.objectExpression([])),
      ]),
    );

    statements.push(
      buildExportAll({
        KEY: path.scope.generateUidIdentifier("key"),
        EXPORT_OBJ: t.identifier(exportObj),
        TARGET: exportStarTarget,
      }),
    );

    for (let i = 0; i < exportNames.length; i++) {
      const exportName = exportNames[i];
      const exportValue = exportValues[i];

      statements.push(
        t.expressionStatement(
          t.assignmentExpression(
            "=",
            t.memberExpression(
              t.identifier(exportObj),
              t.identifier(exportName),
            ),
            exportValue,
          ),
        ),
      );
    }

    statements.push(
      t.expressionStatement(
        t.callExpression(exportIdent, [t.identifier(exportObj)]),
      ),
    );
  }
  return statements;
}

export default declare((api, options) => {
  api.assertVersion(7);

  const { systemGlobal = "System", allowTopLevelThis = false } = options;
  const IGNORE_REASSIGNMENT_SYMBOL = Symbol();

  const reassignmentVisitor = {
    "AssignmentExpression|UpdateExpression"(path) {
      if (path.node[IGNORE_REASSIGNMENT_SYMBOL]) return;
      path.node[IGNORE_REASSIGNMENT_SYMBOL] = true;

      const arg = path.get(path.isAssignmentExpression() ? "left" : "argument");

      if (arg.isObjectPattern() || arg.isArrayPattern()) {
        const exprs = [path.node];
        for (const name of Object.keys(arg.getBindingIdentifiers())) {
          if (this.scope.getBinding(name) !== path.scope.getBinding(name)) {
            return;
          }
          const exportedNames = this.exports[name];
          if (!exportedNames) return;
          for (const exportedName of exportedNames) {
            exprs.push(
              this.buildCall(exportedName, t.identifier(name)).expression,
            );
          }
        }
        path.replaceWith(t.sequenceExpression(exprs));
        return;
      }

      if (!arg.isIdentifier()) return;

      const name = arg.node.name;

      // redeclared in this scope
      if (this.scope.getBinding(name) !== path.scope.getBinding(name)) return;

      const exportedNames = this.exports[name];
      if (!exportedNames) return;

      let node = path.node;

      // if it is a non-prefix update expression (x++ etc)
      // then we must replace with the expression (_export('x', x + 1), x++)
      // in order to ensure the same update expression value
      const isPostUpdateExpression = path.isUpdateExpression({ prefix: false });
      if (isPostUpdateExpression) {
        node = t.binaryExpression(
          node.operator[0],
          t.unaryExpression("+", t.cloneNode(node.argument)),
          t.numericLiteral(1),
        );
      }

      for (const exportedName of exportedNames) {
        node = this.buildCall(exportedName, node).expression;
      }

      if (isPostUpdateExpression) {
        node = t.sequenceExpression([node, path.node]);
      }

      path.replaceWith(node);
    },
  };

  return {
    name: "transform-modules-systemjs",

    pre() {
      this.file.set("@babel/plugin-transform-modules-*", "systemjs");
    },

    visitor: {
      CallExpression(path, state: PluginState) {
        if (t.isImport(path.node.callee)) {
          if (!this.file.has("@babel/plugin-proposal-dynamic-import")) {
            if (process.env.BABEL_8_BREAKING) {
              throw new Error(MISSING_PLUGIN_ERROR);
            } else {
              console.warn(MISSING_PLUGIN_WARNING);
            }
          }

          path.replaceWith(
            t.callExpression(
              t.memberExpression(
                t.identifier(state.contextIdent),
                t.identifier("import"),
              ),
              [getImportSource(t, path.node)],
            ),
          );
        }
      },

      MetaProperty(path, state: PluginState) {
        if (
          path.node.meta.name === "import" &&
          path.node.property.name === "meta"
        ) {
          path.replaceWith(
            t.memberExpression(
              t.identifier(state.contextIdent),
              t.identifier("meta"),
            ),
          );
        }
      },

      ReferencedIdentifier(path, state) {
        if (
          path.node.name === "__moduleName" &&
          !path.scope.hasBinding("__moduleName")
        ) {
          path.replaceWith(
            t.memberExpression(
              t.identifier(state.contextIdent),
              t.identifier("id"),
            ),
          );
        }
      },

      Program: {
        enter(path, state) {
          state.contextIdent = path.scope.generateUid("context");
          state.stringSpecifiers = new Set();
          if (!allowTopLevelThis) {
            rewriteThis(path);
          }
        },
        exit(path, state: PluginState) {
          const scope = path.scope;
          const exportIdent = scope.generateUid("export");
          const { contextIdent, stringSpecifiers } = state;

          const exportMap = Object.create(null);
          const modules = [];

          let beforeBody = [];
          const setters = [];
          const sources = [];
          const variableIds = [];
          const removedPaths = [];

          function addExportName(key, val) {
            exportMap[key] = exportMap[key] || [];
            exportMap[key].push(val);
          }

          function pushModule(source, key, specifiers) {
            let module;
            modules.forEach(function (m) {
              if (m.key === source) {
                module = m;
              }
            });
            if (!module) {
              modules.push(
                (module = { key: source, imports: [], exports: [] }),
              );
            }
            module[key] = module[key].concat(specifiers);
          }

          function buildExportCall(name, val) {
            return t.expressionStatement(
              t.callExpression(t.identifier(exportIdent), [
                t.stringLiteral(name),
                val,
              ]),
            );
          }

          const exportNames = [];
          const exportValues = [];

          const body: Array<Object> = path.get("body");

          for (const path of body) {
            if (path.isFunctionDeclaration()) {
              beforeBody.push(path.node);
              removedPaths.push(path);
            } else if (path.isClassDeclaration()) {
              variableIds.push(t.cloneNode(path.node.id));
              path.replaceWith(
                t.expressionStatement(
                  t.assignmentExpression(
                    "=",
                    t.cloneNode(path.node.id),
                    t.toExpression(path.node),
                  ),
                ),
              );
            } else if (path.isImportDeclaration()) {
              const source = path.node.source.value;
              pushModule(source, "imports", path.node.specifiers);
              for (const name of Object.keys(path.getBindingIdentifiers())) {
                scope.removeBinding(name);
                variableIds.push(t.identifier(name));
              }
              path.remove();
            } else if (path.isExportAllDeclaration()) {
              pushModule(path.node.source.value, "exports", path.node);
              path.remove();
            } else if (path.isExportDefaultDeclaration()) {
              const declar = path.get("declaration");
              const id = declar.node.id;
              if (declar.isClassDeclaration()) {
                if (id) {
                  exportNames.push("default");
                  exportValues.push(scope.buildUndefinedNode());
                  variableIds.push(t.cloneNode(id));
                  addExportName(id.name, "default");
                  path.replaceWith(
                    t.expressionStatement(
                      t.assignmentExpression(
                        "=",
                        t.cloneNode(id),
                        t.toExpression(declar.node),
                      ),
                    ),
                  );
                } else {
                  exportNames.push("default");
                  exportValues.push(t.toExpression(declar.node));
                  removedPaths.push(path);
                }
              } else if (declar.isFunctionDeclaration()) {
                if (id) {
                  beforeBody.push(declar.node);
                  exportNames.push("default");
                  exportValues.push(t.cloneNode(id));
                  addExportName(id.name, "default");
                } else {
                  exportNames.push("default");
                  exportValues.push(t.toExpression(declar.node));
                }
                removedPaths.push(path);
              } else {
                path.replaceWith(buildExportCall("default", declar.node));
              }
            } else if (path.isExportNamedDeclaration()) {
              const declar = path.get("declaration");

              if (declar.node) {
                path.replaceWith(declar);

                if (path.isFunction()) {
                  const node = declar.node;
                  const name = node.id.name;
                  addExportName(name, name);
                  beforeBody.push(node);
                  exportNames.push(name);
                  exportValues.push(t.cloneNode(node.id));
                  removedPaths.push(path);
                } else if (path.isClass()) {
                  const name = declar.node.id.name;
                  exportNames.push(name);
                  exportValues.push(scope.buildUndefinedNode());
                  variableIds.push(t.cloneNode(declar.node.id));
                  path.replaceWith(
                    t.expressionStatement(
                      t.assignmentExpression(
                        "=",
                        t.cloneNode(declar.node.id),
                        t.toExpression(declar.node),
                      ),
                    ),
                  );
                  addExportName(name, name);
                } else {
                  for (const name of Object.keys(
                    declar.getBindingIdentifiers(),
                  )) {
                    addExportName(name, name);
                  }
                }
              } else {
                const specifiers = path.node.specifiers;
                if (specifiers?.length) {
                  if (path.node.source) {
                    pushModule(path.node.source.value, "exports", specifiers);
                    path.remove();
                  } else {
                    const nodes = [];

                    for (const specifier of specifiers) {
                      const { local, exported } = specifier;
                      const binding = scope.getBinding(local.name);
                      const exportedName = getExportSpecifierName(
                        exported,
                        stringSpecifiers,
                      );
                      // hoisted function export
                      if (
                        binding &&
                        t.isFunctionDeclaration(binding.path.node)
                      ) {
                        exportNames.push(exportedName);
                        exportValues.push(t.cloneNode(local));
                      }
                      // only globals also exported this way
                      else if (!binding) {
                        nodes.push(buildExportCall(exportedName, local));
                      }
                      addExportName(local.name, exportedName);
                    }

                    path.replaceWithMultiple(nodes);
                  }
                } else {
                  path.remove();
                }
              }
            }
          }

          modules.forEach(function (specifiers) {
            let setterBody = [];
            const target = scope.generateUid(specifiers.key);

            for (let specifier of specifiers.imports) {
              if (t.isImportNamespaceSpecifier(specifier)) {
                setterBody.push(
                  t.expressionStatement(
                    t.assignmentExpression(
                      "=",
                      specifier.local,
                      t.identifier(target),
                    ),
                  ),
                );
              } else if (t.isImportDefaultSpecifier(specifier)) {
                specifier = t.importSpecifier(
                  specifier.local,
                  t.identifier("default"),
                );
              }

              if (t.isImportSpecifier(specifier)) {
                const { imported } = specifier;
                setterBody.push(
                  t.expressionStatement(
                    t.assignmentExpression(
                      "=",
                      specifier.local,
                      t.memberExpression(
                        t.identifier(target),
                        specifier.imported,
                        /* computed */ imported.type === "StringLiteral",
                      ),
                    ),
                  ),
                );
              }
            }

            if (specifiers.exports.length) {
              const exportNames = [];
              const exportValues = [];
              let hasExportStar = false;

              for (const node of specifiers.exports) {
                if (t.isExportAllDeclaration(node)) {
                  hasExportStar = true;
                } else if (t.isExportSpecifier(node)) {
                  const exportedName = getExportSpecifierName(
                    node.exported,
                    stringSpecifiers,
                  );
                  exportNames.push(exportedName);
                  exportValues.push(
                    t.memberExpression(
                      t.identifier(target),
                      node.local,
                      t.isStringLiteral(node.local),
                    ),
                  );
                } else {
                  // todo
                }
              }

              setterBody = setterBody.concat(
                constructExportCall(
                  path,
                  t.identifier(exportIdent),
                  exportNames,
                  exportValues,
                  hasExportStar ? t.identifier(target) : null,
                  stringSpecifiers,
                ),
              );
            }

            sources.push(t.stringLiteral(specifiers.key));
            setters.push(
              t.functionExpression(
                null,
                [t.identifier(target)],
                t.blockStatement(setterBody),
              ),
            );
          });

          let moduleName = getModuleName(this.file.opts, options);
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          hoistVariables(
            path,
            (id, name, hasInit) => {
              variableIds.push(id);
              if (!hasInit && name in exportMap) {
                for (const exported of exportMap[name]) {
                  exportNames.push(exported);
                  exportValues.push(scope.buildUndefinedNode());
                }
              }
            },
            null,
          );

          if (variableIds.length) {
            beforeBody.unshift(
              t.variableDeclaration(
                "var",
                variableIds.map(id => t.variableDeclarator(id)),
              ),
            );
          }

          if (exportNames.length) {
            beforeBody = beforeBody.concat(
              constructExportCall(
                path,
                t.identifier(exportIdent),
                exportNames,
                exportValues,
                null,
                stringSpecifiers,
              ),
            );
          }

          path.traverse(reassignmentVisitor, {
            exports: exportMap,
            buildCall: buildExportCall,
            scope,
          });

          for (const path of removedPaths) {
            path.remove();
          }

          let hasTLA = false;
          path.traverse({
            AwaitExpression(path) {
              hasTLA = true;
              path.stop();
            },
            Function(path) {
              path.skip();
            },
            noScope: true,
          });

          path.node.body = [
            buildTemplate({
              SYSTEM_REGISTER: t.memberExpression(
                t.identifier(systemGlobal),
                t.identifier("register"),
              ),
              BEFORE_BODY: beforeBody,
              MODULE_NAME: moduleName,
              SETTERS: t.arrayExpression(setters),
              EXECUTE: t.functionExpression(
                null,
                [],
                t.blockStatement(path.node.body),
                false,
                hasTLA,
              ),
              SOURCES: t.arrayExpression(sources),
              EXPORT_IDENTIFIER: t.identifier(exportIdent),
              CONTEXT_IDENTIFIER: t.identifier(contextIdent),
            }),
          ];
        },
      },
    },
  };
});

import { declare } from "@babel/helper-plugin-utils";
import syntaxTypeScript from "@babel/plugin-syntax-typescript";
import { types as t, template } from "@babel/core";
import { injectInitialization } from "@babel/helper-create-class-features-plugin";

import transpileEnum from "./enum";
import transpileNamespace from "./namespace";
import type { NodePath } from "@babel/traverse";

function isInType(path) {
  switch (path.parent.type) {
    case "TSTypeReference":
    case "TSQualifiedName":
    case "TSExpressionWithTypeArguments":
    case "TSTypeQuery":
      return true;
    case "ExportSpecifier":
      return path.parentPath.parent.exportKind === "type";
    default:
      return false;
  }
}

const GLOBAL_TYPES = new WeakMap();
// Track programs which contain imports/exports of values, so that we can include
// empty exports for programs that do not, but were parsed as modules. This allows
// tools to infer unamibiguously that results are ESM.
const NEEDS_EXPLICIT_ESM = new WeakMap();
const PARSED_PARAMS = new WeakSet();

function isGlobalType(path, name) {
  const program = path.find(path => path.isProgram()).node;
  if (path.scope.hasOwnBinding(name)) return false;
  if (GLOBAL_TYPES.get(program).has(name)) return true;

  console.warn(
    `The exported identifier "${name}" is not declared in Babel's scope tracker\n` +
      `as a JavaScript value binding, and "@babel/plugin-transform-typescript"\n` +
      `never encountered it as a TypeScript type declaration.\n` +
      `It will be treated as a JavaScript value.\n\n` +
      `This problem is likely caused by another plugin injecting\n` +
      `"${name}" without registering it in the scope tracker. If you are the author\n` +
      ` of that plugin, please use "scope.registerDeclaration(declarationPath)".`,
  );

  return false;
}

function registerGlobalType(programScope, name) {
  GLOBAL_TYPES.get(programScope.path.node).add(name);
}

export default declare((api, opts) => {
  api.assertVersion(7);

  const JSX_PRAGMA_REGEX = /\*?\s*@jsx((?:Frag)?)\s+([^\s]+)/;

  const {
    allowNamespaces = true,
    jsxPragma = "React.createElement",
    jsxPragmaFrag = "React.Fragment",
    onlyRemoveTypeImports = false,
  } = opts;

  if (!process.env.BABEL_8_BREAKING) {
    // eslint-disable-next-line no-var
    var { allowDeclareFields = false } = opts;
  }

  const classMemberVisitors = {
    field(path) {
      const { node } = path;

      if (!process.env.BABEL_8_BREAKING) {
        if (!allowDeclareFields && node.declare) {
          throw path.buildCodeFrameError(
            `The 'declare' modifier is only allowed when the 'allowDeclareFields' option of ` +
              `@babel/plugin-transform-typescript or @babel/preset-typescript is enabled.`,
          );
        }
      }
      if (node.declare) {
        if (node.value) {
          throw path.buildCodeFrameError(
            `Fields with the 'declare' modifier cannot be initialized here, but only in the constructor`,
          );
        }
        if (!node.decorators) {
          path.remove();
        }
      } else if (node.definite) {
        if (node.value) {
          throw path.buildCodeFrameError(
            `Definitely assigned fields cannot be initialized here, but only in the constructor`,
          );
        }
        if (!process.env.BABEL_8_BREAKING) {
          // keep the definitely assigned fields only when `allowDeclareFields` (equivalent of
          // Typescript's `useDefineForClassFields`) is true
          if (!allowDeclareFields && !node.decorators) {
            path.remove();
          }
        }
      } else if (!process.env.BABEL_8_BREAKING) {
        if (
          !allowDeclareFields &&
          !node.value &&
          !node.decorators &&
          !t.isClassPrivateProperty(node)
        ) {
          path.remove();
        }
      }

      if (node.accessibility) node.accessibility = null;
      if (node.abstract) node.abstract = null;
      if (node.readonly) node.readonly = null;
      if (node.optional) node.optional = null;
      if (node.typeAnnotation) node.typeAnnotation = null;
      if (node.definite) node.definite = null;
      if (node.declare) node.declare = null;
      if (node.override) node.override = null;
    },
    method({ node }) {
      if (node.accessibility) node.accessibility = null;
      if (node.abstract) node.abstract = null;
      if (node.optional) node.optional = null;
      if (node.override) node.override = null;

      // Rest handled by Function visitor
    },
    constructor(path, classPath) {
      if (path.node.accessibility) path.node.accessibility = null;
      // Collects parameter properties so that we can add an assignment
      // for each of them in the constructor body
      //
      // We use a WeakSet to ensure an assignment for a parameter
      // property is only added once. This is necessary for cases like
      // using `transform-classes`, which causes this visitor to run
      // twice.
      const parameterProperties = [];
      for (const param of path.node.params) {
        if (
          param.type === "TSParameterProperty" &&
          !PARSED_PARAMS.has(param.parameter)
        ) {
          PARSED_PARAMS.add(param.parameter);
          parameterProperties.push(param.parameter);
        }
      }

      if (parameterProperties.length) {
        const assigns = parameterProperties.map(p => {
          let id;
          if (t.isIdentifier(p)) {
            id = p;
          } else if (t.isAssignmentPattern(p) && t.isIdentifier(p.left)) {
            id = p.left;
          } else {
            throw path.buildCodeFrameError(
              "Parameter properties can not be destructuring patterns.",
            );
          }

          return template.statement.ast`
              this.${t.cloneNode(id)} = ${t.cloneNode(id)}`;
        });

        injectInitialization(classPath, path, assigns);
      }
    },
  };

  return {
    name: "transform-typescript",
    inherits: syntaxTypeScript,

    visitor: {
      //"Pattern" alias doesn't include Identifier or RestElement.
      Pattern: visitPattern,
      Identifier: visitPattern,
      RestElement: visitPattern,

      Program: {
        enter(path, state) {
          const { file } = state;
          let fileJsxPragma = null;
          let fileJsxPragmaFrag = null;

          if (!GLOBAL_TYPES.has(path.node)) {
            GLOBAL_TYPES.set(path.node, new Set());
          }

          if (file.ast.comments) {
            for (const comment of file.ast.comments) {
              const jsxMatches = JSX_PRAGMA_REGEX.exec(comment.value);
              if (jsxMatches) {
                if (jsxMatches[1]) {
                  // isFragment
                  fileJsxPragmaFrag = jsxMatches[2];
                } else {
                  fileJsxPragma = jsxMatches[2];
                }
              }
            }
          }

          let pragmaImportName = fileJsxPragma || jsxPragma;
          if (pragmaImportName) {
            [pragmaImportName] = pragmaImportName.split(".");
          }

          let pragmaFragImportName = fileJsxPragmaFrag || jsxPragmaFrag;
          if (pragmaFragImportName) {
            [pragmaFragImportName] = pragmaFragImportName.split(".");
          }

          // remove type imports
          for (let stmt of path.get("body")) {
            if (stmt.isImportDeclaration()) {
              if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
                NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
              }

              if (stmt.node.importKind === "type") {
                stmt.remove();
                continue;
              }

              // If onlyRemoveTypeImports is `true`, only remove type-only imports
              // and exports introduced in TypeScript 3.8.
              if (onlyRemoveTypeImports) {
                NEEDS_EXPLICIT_ESM.set(path.node, false);
              } else {
                // Note: this will allow both `import { } from "m"` and `import "m";`.
                // In TypeScript, the former would be elided.
                if (stmt.node.specifiers.length === 0) {
                  NEEDS_EXPLICIT_ESM.set(path.node, false);
                  continue;
                }

                let allElided = true;
                const importsToRemove: NodePath<t.Node>[] = [];

                for (const specifier of stmt.node.specifiers) {
                  const binding = stmt.scope.getBinding(specifier.local.name);

                  // The binding may not exist if the import node was explicitly
                  // injected by another plugin. Currently core does not do a good job
                  // of keeping scope bindings synchronized with the AST. For now we
                  // just bail if there is no binding, since chances are good that if
                  // the import statement was injected then it wasn't a typescript type
                  // import anyway.
                  if (
                    binding &&
                    isImportTypeOnly({
                      binding,
                      programPath: path,
                      pragmaImportName,
                      pragmaFragImportName,
                    })
                  ) {
                    importsToRemove.push(binding.path);
                  } else {
                    allElided = false;
                    NEEDS_EXPLICIT_ESM.set(path.node, false);
                  }
                }

                if (allElided) {
                  stmt.remove();
                } else {
                  for (const importPath of importsToRemove) {
                    importPath.remove();
                  }
                }
              }

              continue;
            }

            if (stmt.isExportDeclaration()) {
              stmt = stmt.get("declaration");
            }

            if (stmt.isVariableDeclaration({ declare: true })) {
              for (const name of Object.keys(stmt.getBindingIdentifiers())) {
                registerGlobalType(path.scope, name);
              }
            } else if (
              stmt.isTSTypeAliasDeclaration() ||
              stmt.isTSDeclareFunction() ||
              stmt.isTSInterfaceDeclaration() ||
              stmt.isClassDeclaration({ declare: true }) ||
              stmt.isTSEnumDeclaration({ declare: true }) ||
              (stmt.isTSModuleDeclaration({ declare: true }) &&
                stmt.get("id").isIdentifier())
            ) {
              registerGlobalType(path.scope, stmt.node.id.name);
            }
          }
        },
        exit(path) {
          if (
            path.node.sourceType === "module" &&
            NEEDS_EXPLICIT_ESM.get(path.node)
          ) {
            // If there are no remaining value exports, this file can no longer
            // be inferred to be ESM. Leave behind an empty export declaration
            // so it can be.
            path.pushContainer("body", t.exportNamedDeclaration());
          }
        },
      },

      ExportNamedDeclaration(path, state) {
        if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
          NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
        }

        if (path.node.exportKind === "type") {
          path.remove();
          return;
        }

        // remove export declaration if it's exporting only types
        // This logic is needed when exportKind is "value", because
        // currently the "type" keyword is optional.
        // TODO:
        // Also, currently @babel/parser sets exportKind to "value" for
        //   export interface A {}
        //   etc.
        if (
          !path.node.source &&
          path.node.specifiers.length > 0 &&
          path.node.specifiers.every(({ local }) =>
            isGlobalType(path, local.name),
          )
        ) {
          path.remove();
          return;
        }

        NEEDS_EXPLICIT_ESM.set(state.file.ast.program, false);
      },

      ExportSpecifier(path) {
        // remove type exports
        if (!path.parent.source && isGlobalType(path, path.node.local.name)) {
          path.remove();
        }
      },

      ExportDefaultDeclaration(path, state) {
        if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
          NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
        }

        // remove whole declaration if it's exporting a TS type
        if (
          t.isIdentifier(path.node.declaration) &&
          isGlobalType(path, path.node.declaration.name)
        ) {
          path.remove();

          return;
        }

        NEEDS_EXPLICIT_ESM.set(state.file.ast.program, false);
      },

      TSDeclareFunction(path) {
        path.remove();
      },

      TSDeclareMethod(path) {
        path.remove();
      },

      VariableDeclaration(path) {
        if (path.node.declare) {
          path.remove();
        }
      },

      VariableDeclarator({ node }) {
        if (node.definite) node.definite = null;
      },

      TSIndexSignature(path) {
        path.remove();
      },

      ClassDeclaration(path) {
        const { node } = path;
        if (node.declare) {
          path.remove();
          return;
        }
      },

      Class(path) {
        const { node } = path;

        if (node.typeParameters) node.typeParameters = null;
        if (node.superTypeParameters) node.superTypeParameters = null;
        if (node.implements) node.implements = null;
        if (node.abstract) node.abstract = null;

        // Similar to the logic in `transform-flow-strip-types`, we need to
        // handle `TSParameterProperty` and `ClassProperty` here because the
        // class transform would transform the class, causing more specific
        // visitors to not run.
        path.get("body.body").forEach(child => {
          if (child.isClassMethod() || child.isClassPrivateMethod()) {
            if (child.node.kind === "constructor") {
              classMemberVisitors.constructor(child, path);
            } else {
              classMemberVisitors.method(child);
            }
          } else if (
            child.isClassProperty() ||
            child.isClassPrivateProperty()
          ) {
            classMemberVisitors.field(child);
          }
        });
      },

      Function(path) {
        const { node, scope } = path;
        if (node.typeParameters) node.typeParameters = null;
        if (node.returnType) node.returnType = null;

        const params = node.params;
        if (params.length > 0 && t.isIdentifier(params[0], { name: "this" })) {
          params.shift();
        }

        // We replace `TSParameterProperty` here so that transforms that
        // rely on a `Function` visitor to deal with arguments, like
        // `transform-parameters`, work properly.
        const paramsPath = path.get("params");
        for (const p of paramsPath) {
          if (p.type === "TSParameterProperty") {
            p.replaceWith(p.get("parameter"));
            scope.registerBinding("param", p);
          }
        }
      },

      TSModuleDeclaration(path) {
        transpileNamespace(path, t, allowNamespaces);
      },

      TSInterfaceDeclaration(path) {
        path.remove();
      },

      TSTypeAliasDeclaration(path) {
        path.remove();
      },

      TSEnumDeclaration(path) {
        transpileEnum(path, t);
      },

      TSImportEqualsDeclaration(path: NodePath<t.TSImportEqualsDeclaration>) {
        if (t.isTSExternalModuleReference(path.node.moduleReference)) {
          // import alias = require('foo');
          throw path.buildCodeFrameError(
            `\`import ${path.node.id.name} = require('${path.node.moduleReference.expression.value}')\` ` +
              "is not supported by @babel/plugin-transform-typescript\n" +
              "Please consider using " +
              `\`import ${path.node.id.name} from '${path.node.moduleReference.expression.value}';\` alongside ` +
              "Typescript's --allowSyntheticDefaultImports option.",
          );
        }

        // import alias = Namespace;
        path.replaceWith(
          t.variableDeclaration("var", [
            t.variableDeclarator(
              path.node.id,
              entityNameToExpr(path.node.moduleReference),
            ),
          ]),
        );
      },

      TSExportAssignment(path) {
        throw path.buildCodeFrameError(
          "`export =` is not supported by @babel/plugin-transform-typescript\n" +
            "Please consider using `export <value>;`.",
        );
      },

      TSTypeAssertion(path) {
        path.replaceWith(path.node.expression);
      },

      TSAsExpression(path) {
        let { node } = path;
        do {
          node = node.expression;
        } while (t.isTSAsExpression(node));
        path.replaceWith(node);
      },

      TSNonNullExpression(path) {
        path.replaceWith(path.node.expression);
      },

      CallExpression(path) {
        path.node.typeParameters = null;
      },

      OptionalCallExpression(path) {
        path.node.typeParameters = null;
      },

      NewExpression(path) {
        path.node.typeParameters = null;
      },

      JSXOpeningElement(path) {
        path.node.typeParameters = null;
      },

      TaggedTemplateExpression(path) {
        path.node.typeParameters = null;
      },
    },
  };

  function entityNameToExpr(node: t.TSEntityName): t.Expression {
    if (t.isTSQualifiedName(node)) {
      return t.memberExpression(entityNameToExpr(node.left), node.right);
    }

    return node;
  }

  function visitPattern({ node }) {
    if (node.typeAnnotation) node.typeAnnotation = null;
    if (t.isIdentifier(node) && node.optional) node.optional = null;
    // 'access' and 'readonly' are only for parameter properties, so constructor visitor will handle them.
  }

  function isImportTypeOnly({
    binding,
    programPath,
    pragmaImportName,
    pragmaFragImportName,
  }) {
    for (const path of binding.referencePaths) {
      if (!isInType(path)) {
        return false;
      }
    }

    if (
      binding.identifier.name !== pragmaImportName &&
      binding.identifier.name !== pragmaFragImportName
    ) {
      return true;
    }

    // "React" or the JSX pragma is referenced as a value if there are any JSX elements/fragments in the code.
    let sourceFileHasJsx = false;
    programPath.traverse({
      "JSXElement|JSXFragment"(path) {
        sourceFileHasJsx = true;
        path.stop();
      },
    });
    return !sourceFileHasJsx;
  }
});

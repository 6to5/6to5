import assert from "assert";
import * as t from "@babel/types";
import template from "@babel/template";
import simplifyAccess from "@babel/helper-simple-access";

import type { ModuleMetadata } from "./";

function isSameBinding(scope1, scope2, name) {
  const binding = scope1.getBinding(name);
  // TODO: In Babel 8, check if the next code can be uncommented
  // https://github.com/babel/babel/pull/10628#discussion_r342282695
  return /* !!binding && */ binding === scope2.getBinding(name);
}

export default function rewriteLiveReferences(
  programPath: NodePath,
  metadata: ModuleMetadata,
) {
  const imported = new Map();
  const exported = new Map();
  const requeueInParent = path => {
    // Manualy re-queue `exports.default =` expressions so that the ES3
    // transform has an opportunity to convert them. Ideally this would
    // happen automatically from the replaceWith above. See #4140 for
    // more info.
    programPath.requeue(path);
  };

  for (const [source, data] of metadata.source) {
    for (const [localName, importName] of data.imports) {
      imported.set(localName, [source, importName, null]);
    }
    for (const localName of data.importsNamespace) {
      imported.set(localName, [source, null, localName]);
    }
  }

  for (const [local, data] of metadata.local) {
    let exportMeta = exported.get(local);
    if (!exportMeta) {
      exportMeta = [];
      exported.set(local, exportMeta);
    }

    exportMeta.push(...data.names);
  }

  // Rewrite initialization of bindings to update exports.
  programPath.traverse(rewriteBindingInitVisitor, {
    metadata,
    requeueInParent,
    scope: programPath.scope,
    exported, // local name => exported name list
  });

  simplifyAccess(
    programPath,
    // NOTE(logan): The 'Array.from' calls are to make this code with in loose mode.
    new Set([...Array.from(imported.keys()), ...Array.from(exported.keys())]),
  );

  // Rewrite reads/writes from imports and exports to have the correct behavior.
  programPath.traverse(rewriteReferencesVisitor, {
    seen: new WeakSet(),
    metadata,
    requeueInParent,
    scope: programPath.scope,
    imported, // local / import
    exported, // local name => exported name list
    buildImportReference: ([source, importName, localName], identNode) => {
      const meta = metadata.source.get(source);

      if (localName) {
        if (meta.lazy) identNode = t.callExpression(identNode, []);
        return identNode;
      }

      let namespace = t.identifier(meta.name);
      if (meta.lazy) namespace = t.callExpression(namespace, []);

      return t.memberExpression(namespace, t.identifier(importName));
    },
  });
}

/**
 * A visitor to inject export update statements during binding initialization.
 */
const rewriteBindingInitVisitor = {
  ClassProperty(path) {
    path.skip();
  },
  Function(path) {
    path.skip();
  },
  ClassDeclaration(path) {
    const { requeueInParent, exported, metadata } = this;

    const { id } = path.node;
    if (!id) throw new Error("Expected class to have a name");
    const localName = id.name;

    const exportNames = exported.get(localName) || [];
    if (exportNames.length > 0) {
      const statement = t.expressionStatement(
        buildBindingExportAssignmentExpression(
          metadata,
          exportNames,
          t.identifier(localName),
        ),
      );
      statement._blockHoist = path.node._blockHoist;

      requeueInParent(path.insertAfter(statement)[0]);
    }
  },
  VariableDeclaration(path) {
    const { requeueInParent, exported, metadata } = this;

    Object.keys(path.getOuterBindingIdentifiers()).forEach(localName => {
      const exportNames = exported.get(localName) || [];

      if (exportNames.length > 0) {
        const statement = t.expressionStatement(
          buildBindingExportAssignmentExpression(
            metadata,
            exportNames,
            t.identifier(localName),
          ),
        );
        statement._blockHoist = path.node._blockHoist;

        requeueInParent(path.insertAfter(statement)[0]);
      }
    });
  },
};

const buildBindingExportAssignmentExpression = (
  metadata,
  exportNames,
  localExpr,
) => {
  return (exportNames || []).reduce((expr, exportName) => {
    // class Foo {} export { Foo, Foo as Bar };
    // as
    // class Foo {} exports.Foo = exports.Bar = Foo;
    return t.assignmentExpression(
      "=",
      t.memberExpression(
        t.identifier(metadata.exportName),
        t.identifier(exportName),
      ),
      expr,
    );
  }, localExpr);
};

const buildImportThrow = localName => {
  return template.expression.ast`
    (function() {
      throw new Error('"' + '${localName}' + '" is read-only.');
    })()
  `;
};

const rewriteReferencesVisitor = {
  ReferencedIdentifier(path) {
    const {
      seen,
      buildImportReference,
      scope,
      imported,
      requeueInParent,
    } = this;
    if (seen.has(path.node)) return;
    seen.add(path.node);

    const localName = path.node.name;

    // redeclared in this scope
    if (!isSameBinding(scope, path.scope, localName)) return;

    const importData = imported.get(localName);
    if (importData) {
      const ref = buildImportReference(importData, path.node);

      // Preserve the binding location so that sourcemaps are nicer.
      ref.loc = path.node.loc;

      if (
        path.parentPath.isCallExpression({ callee: path.node }) &&
        t.isMemberExpression(ref)
      ) {
        path.replaceWith(t.sequenceExpression([t.numericLiteral(0), ref]));
      } else if (path.isJSXIdentifier() && t.isMemberExpression(ref)) {
        const { object, property } = ref;
        path.replaceWith(
          t.JSXMemberExpression(
            t.JSXIdentifier(object.name),
            t.JSXIdentifier(property.name),
          ),
        );
      } else {
        path.replaceWith(ref);
      }

      requeueInParent(path);

      // The path could have been replaced with an identifier that would
      // otherwise be re-visited, so we skip processing its children.
      path.skip();
    }
  },

  AssignmentExpression: {
    exit(path) {
      const {
        scope,
        seen,
        imported,
        exported,
        requeueInParent,
        buildImportReference,
      } = this;

      if (seen.has(path.node)) return;
      seen.add(path.node);

      const left = path.get("left");

      // No change needed
      if (left.isMemberExpression()) return;

      if (left.isIdentifier()) {
        // Simple update-assign foo += 1; export { foo };
        // =>   exports.foo =  (foo += 1);
        const localName = left.node.name;

        // redeclared in this scope
        if (!isSameBinding(scope, path.scope, localName)) return;

        const exportedNames = exported.get(localName);
        const importData = imported.get(localName);
        if (exportedNames?.length > 0 || importData) {
          assert(path.node.operator === "=", "Path was not simplified");

          const assignment = path.node;

          if (importData) {
            assignment.left = buildImportReference(importData, assignment.left);

            assignment.right = t.sequenceExpression([
              assignment.right,
              buildImportThrow(localName),
            ]);
          }

          path.replaceWith(
            buildBindingExportAssignmentExpression(
              this.metadata,
              exportedNames,
              assignment,
            ),
          );
          requeueInParent(path);
        }
      } else {
        const ids = left.getOuterBindingIdentifiers();
        const programScopeIds = Object.keys(ids).filter(localName =>
          isSameBinding(scope, path.scope, localName),
        );
        const id = programScopeIds.find(localName => imported.has(localName));

        if (id) {
          path.node.right = t.sequenceExpression([
            path.node.right,
            buildImportThrow(id),
          ]);
        }

        // Complex ({a, b, c} = {}); export { a, c };
        // =>   ({a, b, c} = {}), (exports.a = a, exports.c = c);
        const items = [];
        programScopeIds.forEach(localName => {
          const exportedNames = exported.get(localName) || [];
          if (exportedNames.length > 0) {
            items.push(
              buildBindingExportAssignmentExpression(
                this.metadata,
                exportedNames,
                t.identifier(localName),
              ),
            );
          }
        });

        if (items.length > 0) {
          let node = t.sequenceExpression(items);
          if (path.parentPath.isExpressionStatement()) {
            node = t.expressionStatement(node);
            node._blockHoist = path.parentPath.node._blockHoist;
          }

          const statement = path.insertAfter(node)[0];
          requeueInParent(statement);
        }
      }
    },
  },
};

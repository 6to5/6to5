import assert from "assert";
import * as t from "@babel/types";
import template from "@babel/template";
import chunk from "lodash/chunk";

import { isModule } from "@babel/helper-module-imports";

import rewriteThis from "./rewrite-this";
import rewriteLiveReferences from "./rewrite-live-references";
import normalizeAndLoadModuleMetadata, {
  hasExports,
  isSideEffectImport,
  removeExportDeclarations,
  removeImportDeclarations,
} from "./normalize-and-load-metadata";

export { hasExports, isSideEffectImport, isModule };

/**
 * Perform all of the generic ES6 module rewriting needed to handle initial
 * module processing. This function will rewrite the majority of the given
 * program to reference the modules described by the returned metadata,
 * and returns a list of statements for use when initializing the module.
 */
export function rewriteModuleStatementsAndPrepareHeader(
  path: NodePath,
  {
    exportName,
    strict,
    allowTopLevelThis,
    strictMode,
    loose,
    noInterop,
    lazy,
    esNamespaceOnly,
  },
) {
  assert(isModule(path), "Cannot process module statements in a script");
  path.node.sourceType = "script";

  const meta = normalizeAndLoadModuleMetadata(path, exportName, {
    noInterop,
    loose,
    lazy,
    esNamespaceOnly,
  });

  if (!allowTopLevelThis) {
    rewriteThis(path);
  }

  removeExportDeclarations(path);
  rewriteLiveReferences(path, meta);
  removeImportDeclarations(path);

  if (strictMode !== false) {
    const hasStrict = path.node.directives.some(directive => {
      return directive.value.value === "use strict";
    });
    if (!hasStrict) {
      path.unshiftContainer(
        "directives",
        t.directive(t.directiveLiteral("use strict")),
      );
    }
  }

  const headers = [];
  if (hasExports(meta) && !strict) {
    headers.push(buildESModuleHeader(meta, loose /* enumerable */));
  }

  const nameList = buildExportNameListDeclaration(path, meta);

  if (nameList) {
    meta.exportNameListName = nameList.name;
    headers.push(nameList.statement);
  }

  // Create all of the statically known named exports.
  headers.push(...buildExportInitializationStatements(path, meta, loose));

  return { meta, headers };
}

/**
 * Flag a set of statements as hoisted above all else so that module init
 * statements all run before user code.
 */
export function ensureStatementsHoisted(statements) {
  // Force all of the header fields to be at the top of the file.
  statements.forEach(header => {
    header._blockHoist = 3;
  });
}

/**
 * Given an expression for a standard import object, like "require('foo')",
 * wrap it in a call to the interop helpers based on the type.
 */
export function wrapInterop(
  programPath: NodePath,
  expr: Node,
  type: InteropType,
): Node {
  if (type === "none") {
    return null;
  }

  let helper;
  if (type === "default") {
    helper = "interopRequireDefault";
  } else if (type === "namespace") {
    helper = "interopRequireWildcard";
  } else {
    throw new Error(`Unknown interop: ${type}`);
  }

  return t.callExpression(programPath.hub.addHelper(helper), [expr]);
}

/**
 * Create the runtime initialization statements for a given requested source.
 * These will initialize all of the runtime import/export logic that
 * can't be handled statically by the statements created by
 * buildExportInitializationStatements().
 */
export function buildNamespaceInitStatements(
  metadata: ModuleMetadata,
  sourceMetadata: SourceModuleMetadata,
  loose: boolean = false,
) {
  const statements = [];

  let srcNamespace = t.identifier(sourceMetadata.name);
  if (sourceMetadata.lazy) srcNamespace = t.callExpression(srcNamespace, []);

  for (const localName of sourceMetadata.importsNamespace) {
    if (localName === sourceMetadata.name) continue;

    // Create and assign binding to namespace object
    statements.push(
      template.statement`var NAME = SOURCE;`({
        NAME: localName,
        SOURCE: t.cloneNode(srcNamespace),
      }),
    );
  }
  if (loose) {
    statements.push(...buildReexportsFromMeta(metadata, sourceMetadata, loose));
  }
  for (const exportName of sourceMetadata.reexportNamespace) {
    // Assign export to namespace object.
    statements.push(
      (sourceMetadata.lazy
        ? template.statement`
            Object.defineProperty(EXPORTS, "NAME", {
              enumerable: true,
              get: function() {
                return NAMESPACE;
              }
            });
          `
        : template.statement`EXPORTS.NAME = NAMESPACE;`)({
        EXPORTS: metadata.exportName,
        NAME: exportName,
        NAMESPACE: t.cloneNode(srcNamespace),
      }),
    );
  }
  if (sourceMetadata.reexportAll) {
    const statement = buildNamespaceReexport(
      metadata,
      t.cloneNode(srcNamespace),
      loose,
    );
    statement.loc = sourceMetadata.reexportAll.loc;

    // Iterate props creating getter for each prop.
    statements.push(statement);
  }
  return statements;
}

const getTemplateForReexport = loose => {
  return loose
    ? template.statement`EXPORTS.EXPORT_NAME = NAMESPACE.IMPORT_NAME;`
    : template`
      Object.defineProperty(EXPORTS, "EXPORT_NAME", {
        enumerable: true,
        get: function() {
          return NAMESPACE.IMPORT_NAME;
        },
      });
    `;
};

const buildReexportsFromMeta = (meta, metadata, loose) => {
  const namespace = metadata.lazy
    ? t.callExpression(t.identifier(metadata.name), [])
    : t.identifier(metadata.name);

  const templateForCurrentMode = getTemplateForReexport(loose);
  return Array.from(metadata.reexports, ([exportName, importName]) =>
    templateForCurrentMode({
      EXPORTS: meta.exportName,
      EXPORT_NAME: exportName,
      NAMESPACE: t.cloneNode(namespace),
      IMPORT_NAME: importName,
    }),
  );
};

/**
 * Build an "__esModule" header statement setting the property on a given object.
 */
function buildESModuleHeader(
  metadata: ModuleMetadata,
  enumerable: boolean = false,
) {
  return (enumerable
    ? template.statement`
        EXPORTS.__esModule = true;
      `
    : template.statement`
        Object.defineProperty(EXPORTS, "__esModule", {
          value: true,
        });
      `)({ EXPORTS: metadata.exportName });
}

/**
 * Create a re-export initialization loop for a specific imported namespace.
 */
function buildNamespaceReexport(metadata, namespace, loose) {
  return (loose
    ? template.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;

          EXPORTS[key] = NAMESPACE[key];
        });
      `
    : template.statement`
        Object.keys(NAMESPACE).forEach(function(key) {
          if (key === "default" || key === "__esModule") return;
          VERIFY_NAME_LIST;

          Object.defineProperty(EXPORTS, key, {
            enumerable: true,
            get: function() {
              return NAMESPACE[key];
            },
          });
        });
    `)({
    NAMESPACE: namespace,
    EXPORTS: metadata.exportName,
    VERIFY_NAME_LIST: metadata.exportNameListName
      ? template`
            if (Object.prototype.hasOwnProperty.call(EXPORTS_LIST, key)) return;
          `({ EXPORTS_LIST: metadata.exportNameListName })
      : null,
  });
}

/**
 * Build a statement declaring a variable that contains all of the exported
 * variable names in an object so they can easily be referenced from an
 * export * from statement to check for conflicts.
 */
function buildExportNameListDeclaration(
  programPath: NodePath,
  metadata: ModuleMetadata,
) {
  const exportedVars = Object.create(null);
  for (const data of metadata.local.values()) {
    for (const name of data.names) {
      exportedVars[name] = true;
    }
  }

  let hasReexport = false;
  for (const data of metadata.source.values()) {
    for (const exportName of data.reexports.keys()) {
      exportedVars[exportName] = true;
    }
    for (const exportName of data.reexportNamespace) {
      exportedVars[exportName] = true;
    }

    hasReexport = hasReexport || data.reexportAll;
  }

  if (!hasReexport || Object.keys(exportedVars).length === 0) return null;

  const name = programPath.scope.generateUidIdentifier("exportNames");

  delete exportedVars.default;

  return {
    name: name.name,
    statement: t.variableDeclaration("var", [
      t.variableDeclarator(name, t.valueToNode(exportedVars)),
    ]),
  };
}

/**
 * Create a set of statements that will initialize all of the statically-known
 * export names with their expected values.
 */
function buildExportInitializationStatements(
  programPath: NodePath,
  metadata: ModuleMetadata,
  loose: boolean = false,
) {
  const initStatements = [];

  const exportNames = [];
  for (const [localName, data] of metadata.local) {
    if (data.kind === "import") {
      // No-open since these are explicitly set with the "reexports" block.
    } else if (data.kind === "hoisted") {
      initStatements.push(
        buildInitStatement(metadata, data.names, t.identifier(localName)),
      );
    } else {
      exportNames.push(...data.names);
    }
  }

  for (const data of metadata.source.values()) {
    if (!loose) {
      initStatements.push(...buildReexportsFromMeta(metadata, data, loose));
    }
    for (const exportName of data.reexportNamespace) {
      exportNames.push(exportName);
    }
  }

  initStatements.push(
    ...chunk(exportNames, 100).map(members => {
      return buildInitStatement(
        metadata,
        members,
        programPath.scope.buildUndefinedNode(),
      );
    }),
  );

  return initStatements;
}

/**
 * Given a set of export names, create a set of nested assignments to
 * initialize them all to a given expression.
 */
function buildInitStatement(metadata, exportNames, initExpr) {
  return t.expressionStatement(
    exportNames.reduce(
      (acc, exportName) =>
        template.expression`EXPORTS.NAME = VALUE`({
          EXPORTS: metadata.exportName,
          NAME: exportName,
          VALUE: acc,
        }),
      initExpr,
    ),
  );
}

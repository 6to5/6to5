import path from "path";

const REL_PATH_REGEX = /^\.{1,2}/;

function isRelativePath(filePath) {
  return REL_PATH_REGEX.test(filePath);
}

function resolveAbsolutePath(currentFilePath, moduleToResolve) {
  return isRelativePath(moduleToResolve)
    ? path.resolve(path.dirname(currentFilePath), moduleToResolve)
    : moduleToResolve;
}

function isSourceErrorModule(currentFilePath, targetModulePath, src) {
  for (const srcPath of [src, `${src}.js`, `${src}/index`, `${src}/index.js`]) {
    if (
      path.normalize(resolveAbsolutePath(currentFilePath, targetModulePath)) ===
      path.normalize(resolveAbsolutePath(currentFilePath, srcPath))
    ) {
      return true;
    }
  }

  return false;
}

function isCurrentFileErrorModule(currentFilePath, errorModule) {
  return currentFilePath === errorModule;
}

function findIdNode(node) {
  if (node.type === "Identifier") {
    return node;
  }

  if (node.type === "MemberExpression" && node.object.type === "Identifier") {
    return node.object;
  }

  return null;
}

function findIdNodes(node) {
  if (node.type === "ConditionalExpression") {
    const consequent = findIdNode(node.consequent);
    const alternate = findIdNode(node.alternate);

    if (consequent && alternate) {
      return [consequent, alternate];
    }
  }

  const idNode = findIdNode(node);

  if (idNode) {
    return [idNode];
  }

  return null;
}

function findReference(node, scope) {
  let currentScope = scope;

  while (currentScope) {
    const ref = currentScope.set.get(node.name);

    if (ref) {
      return ref;
    }

    currentScope = currentScope.upper;
  }

  return null;
}

function referencesImportedBinding(node, scope, bindings) {
  const ref = findReference(node, scope);

  if (ref) {
    const topLevelDef = ref.defs[0];

    if (topLevelDef.type === "ImportBinding") {
      const defNode = topLevelDef.node;

      for (const spec of bindings) {
        if (
          spec.loc.start === defNode.loc.start &&
          spec.loc.end === defNode.loc.end
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "enforce @babel/parser's error messages to be consolidated in one module",
    },
    schema: [
      {
        type: "object",
        properties: {
          errorModule: { type: "string" },
        },
        additionalProperties: false,
        required: ["errorModule"],
      },
    ],
    messages: {
      mustBeImported: 'Error messages must be imported from "{{errorModule}}".',
    },
  },
  create({ options, report, getFilename, getScope }) {
    const [{ errorModule = "" } = {}] = options;
    const filename = getFilename();
    const importedBindings = new Set();

    if (
      // Do not run check if errorModule config option is not given.
      !errorModule.length ||
      // Do not check the target error module file.
      isCurrentFileErrorModule(filename, errorModule)
    ) {
      return {};
    }

    return {
      // Check imports up front so that we don't have to check them for every ThrowStatement.
      ImportDeclaration(node) {
        if (isSourceErrorModule(filename, errorModule, node.source.value)) {
          for (const spec of node.specifiers) {
            importedBindings.add(spec);
          }
        }
      },
      "CallExpression[callee.type='MemberExpression'][callee.object.type='ThisExpression'][callee.property.name='raise'][arguments.length>=2]"(
        node,
      ) {
        const [, errorMsgNode] = node.arguments;
        const nodesToCheck = findIdNodes(errorMsgNode);

        if (
          Array.isArray(nodesToCheck) &&
          nodesToCheck.every(node =>
            referencesImportedBinding(node, getScope(), importedBindings),
          )
        ) {
          return;
        }

        report({
          node: errorMsgNode,
          messageId: "mustBeImported",
          data: { errorModule },
        });
      },
    };
  },
};

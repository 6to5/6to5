import { types as t } from "@babel/core";
import nameFunction from "@babel/helper-function-name";
import splitExportDeclaration from "@babel/helper-split-export-declaration";
import {
  buildPrivateNamesNodes,
  buildPrivateNamesMap,
  transformPrivateNamesUsage,
  buildFieldsInitNodes,
} from "./fields";
import {
  hasOwnDecorators,
  buildDecoratedClass,
  hasDecorators,
} from "./decorators";
import { injectInitialization, extractComputedKeys } from "./misc";
import {
  enableFeature,
  verifyUsedFeatures,
  FEATURES,
  isLoose,
} from "./features";

export { FEATURES, enableFeature, injectInitialization };

// Note: Versions are represented as an integer. e.g. 7.1.5 is represented
//       as 70000100005. This method is easier than using a semver-parsing
//       package, but it breaks if we release x.y.z where x, y or z are
//       greater than 99_999.
const version = PACKAGE_JSON.version
  .split(".")
  .reduce((v, x) => v * 1e5 + +x, 0);
const versionKey = "@babel/plugin-class-features/version";

export function createClassFeaturePlugin({
  name,
  feature,
  loose,
  manipulateOptions,
  // TODO(Babel 8): Remove the default value
  api = { assumption: () => {} },
}) {
  const setPublicClassFields = api.assumption("setPublicClassFields");
  const privateFieldsAsProperties = api.assumption("privateFieldsAsProperties");
  const constantSuper = api.assumption("constantSuper");
  const noDocumentAll = api.assumption("noDocumentAll");

  if (loose === true) {
    const explicit = [];

    if (setPublicClassFields !== undefined) {
      explicit.push(`"setPublicClassFields"`);
    }
    if (privateFieldsAsProperties !== undefined) {
      explicit.push(`"privateFieldsAsProperties"`);
    }
    if (explicit.length !== 0) {
      console.warn(
        `[${name}]: You are using the "loose: true" option and you are` +
          ` explicitly setting a value for the ${explicit.join(" and ")}` +
          ` assumption${explicit.length > 1 ? "s" : ""}. The "loose" option` +
          ` can cause incompatibilities with the other class features` +
          ` plugins, so it's recommended that you replace it with the` +
          ` following top-level option:\n` +
          `\t"assumptions": {\n` +
          `\t\t"setPublicClassFields": true,\n` +
          `\t\t"privateFieldsAsProperties": true\n` +
          `\t}`,
      );
    }
  }

  return {
    name,
    manipulateOptions,

    pre() {
      enableFeature(this.file, feature, loose);

      if (!this.file.get(versionKey) || this.file.get(versionKey) < version) {
        this.file.set(versionKey, version);
      }
    },

    visitor: {
      Class(path, state) {
        if (this.file.get(versionKey) !== version) return;

        verifyUsedFeatures(path, this.file);

        const loose = isLoose(this.file, feature);

        let constructor;
        let isDecorated = hasOwnDecorators(path.node);
        const props = [];
        const elements = [];
        const computedPaths = [];
        const privateNames = new Set();
        const body = path.get("body");

        for (const path of body.get("body")) {
          verifyUsedFeatures(path, this.file);

          if (path.node.computed) {
            computedPaths.push(path);
          }

          if (path.isPrivate()) {
            const { name } = path.node.key.id;
            const getName = `get ${name}`;
            const setName = `set ${name}`;

            if (path.node.kind === "get") {
              if (
                privateNames.has(getName) ||
                (privateNames.has(name) && !privateNames.has(setName))
              ) {
                throw path.buildCodeFrameError("Duplicate private field");
              }

              privateNames.add(getName).add(name);
            } else if (path.node.kind === "set") {
              if (
                privateNames.has(setName) ||
                (privateNames.has(name) && !privateNames.has(getName))
              ) {
                throw path.buildCodeFrameError("Duplicate private field");
              }

              privateNames.add(setName).add(name);
            } else {
              if (
                (privateNames.has(name) &&
                  !privateNames.has(getName) &&
                  !privateNames.has(setName)) ||
                (privateNames.has(name) &&
                  (privateNames.has(getName) || privateNames.has(setName)))
              ) {
                throw path.buildCodeFrameError("Duplicate private field");
              }

              privateNames.add(name);
            }
          }

          if (path.isClassMethod({ kind: "constructor" })) {
            constructor = path;
          } else {
            elements.push(path);
            if (path.isProperty() || path.isPrivate()) {
              props.push(path);
            }
          }

          if (!isDecorated) isDecorated = hasOwnDecorators(path.node);

          if (path.isStaticBlock?.()) {
            throw path.buildCodeFrameError(`Incorrect plugin order, \`@babel/plugin-proposal-class-static-block\` should be placed before class features plugins
{
  "plugins": [
    "@babel/plugin-proposal-class-static-block",
    "@babel/plugin-proposal-private-property-in-object",
    "@babel/plugin-proposal-private-methods",
    "@babel/plugin-proposal-class-properties",
  ]
}`);
          }
        }

        if (!props.length && !isDecorated) return;

        let ref;

        if (path.isClassExpression() || !path.node.id) {
          nameFunction(path);
          ref = path.scope.generateUidIdentifier("class");
        } else {
          ref = t.cloneNode(path.node.id);
        }

        // NODE: These three functions don't support decorators yet,
        //       but verifyUsedFeatures throws if there are both
        //       decorators and private fields.
        const privateNamesMap = buildPrivateNamesMap(props);
        const privateNamesNodes = buildPrivateNamesNodes(
          privateNamesMap,
          privateFieldsAsProperties ?? loose,
          state,
        );

        transformPrivateNamesUsage(
          ref,
          path,
          privateNamesMap,
          {
            privateFieldsAsProperties: privateFieldsAsProperties ?? loose,
            noDocumentAll,
          },
          state,
        );

        let keysNodes, staticNodes, pureStaticNodes, instanceNodes, wrapClass;

        if (isDecorated) {
          staticNodes = pureStaticNodes = keysNodes = [];
          ({ instanceNodes, wrapClass } = buildDecoratedClass(
            ref,
            path,
            elements,
            this.file,
          ));
        } else {
          keysNodes = extractComputedKeys(ref, path, computedPaths, this.file);
          ({
            staticNodes,
            pureStaticNodes,
            instanceNodes,
            wrapClass,
          } = buildFieldsInitNodes(
            ref,
            path.node.superClass,
            props,
            privateNamesMap,
            state,
            setPublicClassFields ?? loose,
            privateFieldsAsProperties ?? loose,
            constantSuper ?? loose,
          ));
        }

        if (instanceNodes.length > 0) {
          injectInitialization(
            path,
            constructor,
            instanceNodes,
            (referenceVisitor, state) => {
              if (isDecorated) return;
              for (const prop of props) {
                if (prop.node.static) continue;
                prop.traverse(referenceVisitor, state);
              }
            },
          );
        }

        path = wrapClass(path);
        path.insertBefore([...privateNamesNodes, ...keysNodes]);
        if (staticNodes.length > 0) {
          path.insertAfter(staticNodes);
        }
        if (pureStaticNodes.length > 0) {
          path
            .find(parent => parent.isStatement() || parent.isDeclaration())
            .insertAfter(pureStaticNodes);
        }
      },

      PrivateName(path) {
        if (
          this.file.get(versionKey) !== version ||
          path.parentPath.isPrivate({ key: path.node })
        ) {
          return;
        }

        throw path.buildCodeFrameError(`Unknown PrivateName "${path}"`);
      },

      ExportDefaultDeclaration(path) {
        if (this.file.get(versionKey) !== version) return;

        const decl = path.get("declaration");

        if (decl.isClassDeclaration() && hasDecorators(decl.node)) {
          if (decl.node.id) {
            // export default class Foo {}
            //   -->
            // class Foo {} export { Foo as default }
            splitExportDeclaration(path);
          } else {
            // Annyms class declarations can be
            // transformed as if they were expressions
            decl.node.type = "ClassExpression";
          }
        }
      },
    },
  };
}

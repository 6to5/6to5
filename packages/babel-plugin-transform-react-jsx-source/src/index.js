/**
 * This adds {fileName, lineNumber} annotations to React component definitions
 * and to jsx tag literals.
 *
 *
 * == JSX Literals ==
 *
 * <sometag />
 *
 * becomes:
 *
 * var __jsxFileName = 'this/file.js';
 * <sometag __source={{fileName: __jsxFileName, lineNumber: 10}}/>
 */
import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

const TRACE_ID = "__source";
const FILE_NAME_VAR = "_jsxFileName";

export default declare(api => {
  api.assertVersion(7);

  function makeTrace(fileNameIdentifier, lineNumber, colNumber, toLineNumber) {
    const fileLineLiteral =
      lineNumber != null ? t.numericLiteral(lineNumber) : t.nullLiteral();
    const fileColLiteral =
      colNumber != null ? t.numericLiteral(colNumber) : t.nullLiteral();
    const fileToLineLiteral =
      toLineNumber != null ? t.numericLiteral(toLineNumber) : t.nullLiteral();
    const fileNameProperty = t.objectProperty(
      t.identifier("fileName"),
      fileNameIdentifier,
    );
    const lineNumberProperty = t.objectProperty(
      t.identifier("lineNumber"),
      fileLineLiteral,
    );
    const colNumberProperty = t.objectProperty(
      t.identifier("colNumber"),
      fileColLiteral,
    );
    const toLineNumberProperty = t.objectProperty(
      t.identifier("toLineNumber"),
      fileToLineLiteral,
    );
    return t.objectExpression([
      fileNameProperty,
      lineNumberProperty,
      colNumberProperty,
      toLineNumberProperty,
    ]);
  }

  const visitor = {
    JSXOpeningElement(path, state) {
      const id = t.jsxIdentifier(TRACE_ID);
      const location = path.container.openingElement.loc;
      const closingLocation = path.container.closingElement
        ? path.container.closingElement.loc
        : location;
      if (!location) {
        // the element was generated and doesn't have location information
        return;
      }

      const attributes = path.container.openingElement.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const name = attributes[i].name;
        if (name && name.name === TRACE_ID) {
          // The __source attribute already exists
          return;
        }
      }

      if (!state.fileNameIdentifier) {
        const fileName = state.filename || "";

        const fileNameIdentifier = path.scope.generateUidIdentifier(
          FILE_NAME_VAR,
        );
        const scope = path.hub.getScope();
        if (scope) {
          scope.push({
            id: fileNameIdentifier,
            init: t.stringLiteral(fileName),
          });
        }
        state.fileNameIdentifier = fileNameIdentifier;
      }

      const trace = makeTrace(
        state.fileNameIdentifier,
        location.start.line,
        location.start.column,
        closingLocation.start.line,
      );
      attributes.push(t.jsxAttribute(id, t.jsxExpressionContainer(trace)));
    },
  };

  return {
    name: "transform-react-jsx-source",
    visitor,
  };
});

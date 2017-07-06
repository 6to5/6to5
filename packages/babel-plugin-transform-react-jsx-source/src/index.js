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

const TRACE_ID = "__source";
const FILE_NAME_VAR = "_jsxFileName";

export default function({ types: t }) {
  function makeTrace(fileNameIdentifier, lineNumber) {
    const fileLineLiteral =
      lineNumber != null ? t.numericLiteral(lineNumber) : t.nullLiteral();
    const fileNameProperty = t.objectProperty(
      t.identifier("fileName"),
      fileNameIdentifier,
    );
    const lineNumberProperty = t.objectProperty(
      t.identifier("lineNumber"),
      fileLineLiteral,
    );
    return t.objectExpression([fileNameProperty, lineNumberProperty]);
  }

  const visitor = {
    JSXOpeningElement(path, state) {
      const id = t.jSXIdentifier(TRACE_ID);
      const location = path.container.openingElement.loc;
      if (!location) {
        // the element was generated and doesn't have location information
        return;
      }

      const attributes = path.container.openingElement.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const name = attributes[i].name;
        if (name && name.name === TRACE_ID) {
          // The __source attibute already exists
          return;
        }
      }

      if (!state.fileNameIdentifier) {
        const fileName = state.file.opts.filename;

        const fileNameIdentifier = path.scope.generateUidIdentifier(
          FILE_NAME_VAR,
        );
        path.hub.file.scope.push({
          id: fileNameIdentifier,
          init: t.stringLiteral(fileName),
        });
        state.fileNameIdentifier = fileNameIdentifier;
      }

      const trace = makeTrace(state.fileNameIdentifier, location.start.line);
      attributes.push(t.jSXAttribute(id, t.jSXExpressionContainer(trace)));
    },
  };

  return {
    visitor,
  };
}

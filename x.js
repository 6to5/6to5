const BUNDLE_PATH =
  __dirname +
  "/../parcel/packages/core/integration-tests/test/integration/sourcemap-existing/sum.js";
const MAP_PATH =
  __dirname +
  "/../parcel/packages/core/integration-tests/test/integration/sourcemap-existing/sum.map";

const fs = require("fs");
const convertSourceMap = require("convert-source-map");
const { parse } = require("@babel/parser");

const BUNDLE = fs.readFileSync(BUNDLE_PATH, "utf8");
const MAP = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));

const ast = parse(BUNDLE, { inputSourceMap: MAP });

// Should be:
//
// SourceLocation {
//   start: Position { line: 1, column: 27 },
//   end: Position { line: 1, column: 31 },
//   filename: 'sum.coffee',
//   identifierName: null
// }
console.log(
  ast.program.body[0].expression.callee.object.body.body[0].expression.right
    .callee.body.body[0].argument.body.body[0].argument.loc
);

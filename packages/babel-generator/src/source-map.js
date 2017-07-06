import sourceMap from "source-map";

/**
 * Build a sourcemap.
 */

export default class SourceMap {
  constructor(opts, code) {
    this._cachedMap = null;
    this._code = code;
    this._opts = opts;
    this._rawMappings = [];
  }

  /**
   * Get the sourcemap.
   */

  get() {
    if (!this._cachedMap) {
      const map = (this._cachedMap = new sourceMap.SourceMapGenerator({
        file: this._opts.sourceMapTarget,
        sourceRoot: this._opts.sourceRoot,
      }));

      const code = this._code;
      if (typeof code === "string") {
        map.setSourceContent(this._opts.sourceFileName, code);
      } else if (typeof code === "object") {
        Object.keys(code).forEach(sourceFileName => {
          map.setSourceContent(sourceFileName, code[sourceFileName]);
        });
      }

      this._rawMappings.forEach(map.addMapping, map);
    }

    return this._cachedMap.toJSON();
  }

  getRawMappings() {
    return this._rawMappings.slice();
  }

  /**
   * Mark the current generated position with a source position. May also be passed null line/column
   * values to insert a mapping to nothing.
   */

  mark(
    generatedLine: number,
    generatedColumn: number,
    line: number,
    column: number,
    identifierName: ?string,
    filename: ?string,
  ) {
    // Adding an empty mapping at the start of a generated line just clutters the map.
    if (this._lastGenLine !== generatedLine && line === null) return;

    // If this mapping points to the same source location as the last one, we can ignore it since
    // the previous one covers it.
    if (
      this._lastGenLine === generatedLine &&
      this._lastSourceLine === line &&
      this._lastSourceColumn === column
    ) {
      return;
    }

    this._cachedMap = null;
    this._lastGenLine = generatedLine;
    this._lastSourceLine = line;
    this._lastSourceColumn = column;

    // We are deliberately not using the `source-map` library here to allow
    // callers to use these mappings without any overhead
    this._rawMappings.push({
      // undefined to allow for more compact json serialization
      name: identifierName || undefined,
      generated: {
        line: generatedLine,
        column: generatedColumn,
      },
      source: line == null ? undefined : filename || this._opts.sourceFileName,
      original:
        line == null
          ? undefined
          : {
              line: line,
              column: column,
            },
    });
  }
}

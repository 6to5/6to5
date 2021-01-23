import SourceMap from "./source-map";
import Printer, { type Format } from "./printer";

/**
 * Babel's code generator, turns an ast into code, maintaining sourcemaps,
 * user preferences, and valid output.
 */

class Generator extends Printer {
  constructor(ast, opts = {}, code) {
    const format = normalizeOptions(code, opts);
    const map = opts.sourceMaps ? new SourceMap(opts, code) : null;
    super(format, map);

    this.ast = ast;
  }

  ast: Object;

  /**
   * Generate code and sourcemap from ast.
   *
   * Appends comments that weren't attached to any node to the end of the generated output.
   */

  generate() {
    return super.generate(this.ast);
  }
}

/**
 * Normalize generator options, setting defaults.
 *
 * - Detects code indentation.
 * - If `opts.compact = "auto"` and the code is over 500KB, `compact` will be set to `true`.
 */

function normalizeOptions(code, opts): Format {
  const format = {
    auxiliaryCommentBefore: opts.auxiliaryCommentBefore,
    auxiliaryCommentAfter: opts.auxiliaryCommentAfter,
    shouldPrintComment: opts.shouldPrintComment,
    retainLines: opts.retainLines,
    retainFunctionParens: opts.retainFunctionParens,
    comments: opts.comments == null || opts.comments,
    compact: opts.compact,
    minified: opts.minified,
    concise: opts.concise,
    indent: {
      adjustMultilineComment: true,
      style: "  ",
      base: 0,
    },
    decoratorsBeforeExport: !!opts.decoratorsBeforeExport,
    jsescOption: {
      quotes: "double",
      wrap: true,
      minimal: true,
      ...opts.jsescOption,
    },
    recordAndTupleSyntaxType: opts.recordAndTupleSyntaxType,
  };

  if (!process.env.BABEL_8_BREAKING) {
    format.jsonCompatibleStrings = opts.jsonCompatibleStrings;
    delete format.jsescOption.minimal;
  }

  if (format.minified) {
    format.compact = true;

    format.shouldPrintComment =
      format.shouldPrintComment || (() => format.comments);
  } else {
    format.shouldPrintComment =
      format.shouldPrintComment ||
      (value =>
        format.comments ||
        value.indexOf("@license") >= 0 ||
        value.indexOf("@preserve") >= 0);
  }

  if (format.compact === "auto") {
    format.compact = code.length > 500_000; // 500KB

    if (format.compact) {
      console.error(
        "[BABEL] Note: The code generator has deoptimised the styling of " +
          `${opts.filename} as it exceeds the max of ${"500KB"}.`,
      );
    }
  }

  if (format.compact) {
    format.indent.adjustMultilineComment = false;
  }

  return format;
}

/**
 * We originally exported the Generator class above, but to make it extra clear that it is a private API,
 * we have moved that to an internal class instance and simplified the interface to the two public methods
 * that we wish to support.
 */

export class CodeGenerator {
  constructor(ast, opts, code) {
    this._generator = new Generator(ast, opts, code);
  }
  generate() {
    return this._generator.generate();
  }
}

function generator(ast: Object, opts: Object, code: string): Object {
  const gen = new Generator(ast, opts, code);
  return gen.generate();
}

export default generator;
export { generator };

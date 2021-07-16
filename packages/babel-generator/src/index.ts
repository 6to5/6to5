import SourceMap from "./source-map";
import Printer from "./printer";
import type * as t from "@babel/types";

import type { Format } from "./printer";

/**
 * Babel's code generator, turns an ast into code, maintaining sourcemaps,
 * user preferences, and valid output.
 */

class Generator extends Printer {
  constructor(ast: t.Node, opts: { sourceMaps?: boolean } = {}, code) {
    const format = normalizeOptions(code, opts);
    const map = opts.sourceMaps ? new SourceMap(opts, code) : null;
    super(format, map);

    this.ast = ast;
  }

  ast: t.Node;

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
  const format: Format = {
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
      minimal: process.env.BABEL_8_BREAKING ? true : false,
      ...opts.jsescOption,
    },
    recordAndTupleSyntaxType: opts.recordAndTupleSyntaxType,
    topicToken: opts.topicToken,
  };

  if (!process.env.BABEL_8_BREAKING) {
    format.jsonCompatibleStrings = opts.jsonCompatibleStrings;
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

export interface GeneratorOptions {
  /**
   * Optional string to add as a block comment at the start of the output file.
   */
  auxiliaryCommentBefore?: string;

  /**
   * Optional string to add as a block comment at the end of the output file.
   */
  auxiliaryCommentAfter?: string;

  /**
   * Function that takes a comment (as a string) and returns true if the comment should be included in the output.
   * By default, comments are included if `opts.comments` is `true` or if `opts.minifed` is `false` and the comment
   * contains `@preserve` or `@license`.
   */
  shouldPrintComment?(comment: string): boolean;

  /**
   * Attempt to use the same line numbers in the output code as in the source code (helps preserve stack traces).
   * Defaults to `false`.
   */
  retainLines?: boolean;

  /**
   * Retain parens around function expressions (could be used to change engine parsing behavior)
   * Defaults to `false`.
   */
  retainFunctionParens?: boolean;

  /**
   * Should comments be included in output? Defaults to `true`.
   */
  comments?: boolean;

  /**
   * Set to true to avoid adding whitespace for formatting. Defaults to the value of `opts.minified`.
   */
  compact?: boolean | "auto";

  /**
   * Should the output be minified. Defaults to `false`.
   */
  minified?: boolean;

  /**
   * Set to true to reduce whitespace (but not as much as opts.compact). Defaults to `false`.
   */
  concise?: boolean;

  /**
   * Used in warning messages
   */
  filename?: string;

  /**
   * Enable generating source maps. Defaults to `false`.
   */
  sourceMaps?: boolean;

  /**
   * A root for all relative URLs in the source map.
   */
  sourceRoot?: string;

  /**
   * The filename for the source code (i.e. the code in the `code` argument).
   * This will only be used if `code` is a string.
   */
  sourceFileName?: string;

  /**
   * Set to true to run jsesc with "json": true to print "\u00A9" vs. "©";
   */
  jsonCompatibleStrings?: boolean;

  /**
   * Set to true to enable support for experimental decorators syntax before module exports.
   * Defaults to `false`.
   */
  decoratorsBeforeExport?: boolean;

  /**
   * Options for outputting jsesc representation.
   */
  jsescOption?: {
    /**
     * The type of quote to use in the output. If omitted, autodetects based on `ast.tokens`.
     */
    quotes?: "single" | "double";

    /**
     * When enabled, the output is a valid JavaScript string literal wrapped in quotes. The type of quotes can be specified through the quotes setting.
     * Defaults to `true`.
     */
    wrap?: boolean;
  };

  /**
   * For use with the Hack-style pipe operator.
   * Changes what token is used for pipe bodies’ topic references.
   */
  topicToken?: "#";
}

export interface GeneratorResult {
  code: string;
  map: {
    version: number;
    sources: string[];
    names: string[];
    sourceRoot?: string;
    sourcesContent?: string[];
    mappings: string;
    file: string;
  } | null;
}

/**
 * We originally exported the Generator class above, but to make it extra clear that it is a private API,
 * we have moved that to an internal class instance and simplified the interface to the two public methods
 * that we wish to support.
 */

export class CodeGenerator {
  private _generator: Generator;
  constructor(ast: t.Node, opts?: GeneratorOptions, code?: string) {
    this._generator = new Generator(ast, opts, code);
  }
  generate(): GeneratorResult {
    return this._generator.generate();
  }
}

/**
 * Turns an AST into code, maintaining sourcemaps, user preferences, and valid output.
 * @param ast - the abstract syntax tree from which to generate output code.
 * @param opts - used for specifying options for code generation.
 * @param code - the original source code, used for source maps.
 * @returns - an object containing the output code and source map.
 */
export default function generate(
  ast: t.Node,
  opts?: GeneratorOptions,
  code?: string | { [filename: string]: string },
): any {
  const gen = new Generator(ast, opts, code);
  return gen.generate();
}

import jsTokens, { matchToToken } from "js-tokens";
import esutils from "esutils";
import Chalk from "chalk";

let deprecationWarningShown = false;

type Location = {
  column: number,
  line: number,
};

type NodeLocation = {
  end: Location,
  start: Location,
};

/**
 * Chalk styles for token types.
 */

function getDefs(chalk) {
  return {
    keyword: chalk.cyan,
    capitalized: chalk.yellow,
    jsx_tag: chalk.yellow,
    punctuator: chalk.yellow,
    // bracket:  intentionally omitted.
    number: chalk.magenta,
    string: chalk.green,
    regex: chalk.magenta,
    comment: chalk.grey,
    invalid: chalk.white.bgRed.bold,
    gutter: chalk.grey,
    marker: chalk.red.bold,
  };
}

/**
 * RegExp to test for newlines in terminal.
 */

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

/**
 * RegExp to test for what seems to be a JSX tag name.
 */

const JSX_TAG = /^[a-z][\w-]*$/i;

/**
 * RegExp to test for the three types of brackets.
 */

const BRACKET = /^[()\[\]{}]$/;

/**
 * Get the type of token, specifying punctuator type.
 */

function getTokenType(match) {
  const [offset, text] = match.slice(-2);
  const token = matchToToken(match);

  if (token.type === "name") {
    if (esutils.keyword.isReservedWordES6(token.value)) {
      return "keyword";
    }

    if (
      JSX_TAG.test(token.value) &&
      (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")
    ) {
      return "jsx_tag";
    }

    if (token.value[0] !== token.value[0].toLowerCase()) {
      return "capitalized";
    }
  }

  if (token.type === "punctuator" && BRACKET.test(token.value)) {
    return "bracket";
  }

  return token.type;
}

/**
 * Highlight `text`.
 */

function highlight(defs: Object, text: string) {
  return text.replace(jsTokens, function(...args) {
    const type = getTokenType(args);
    const colorize = defs[type];
    if (colorize) {
      return args[0].split(NEWLINE).map(str => colorize(str)).join("\n");
    } else {
      return args[0];
    }
  });
}

/**
 * Extract what lines should be marked and highlighted.
 */

function getMarkerLines(
  loc: NodeLocation,
  source: Array<string>,
  opts: Object,
): { start: number, end: number, markerLines: Object } {
  const startLoc: Location = Object.assign(
    {},
    { column: 0, line: -1 },
    loc.start,
  );
  const endLoc: Location = Object.assign({}, startLoc, loc.end);
  const linesAbove = opts.linesAbove || 2;
  const linesBelow = opts.linesBelow || 3;

  const startLine = startLoc.line;
  const startColumn = startLoc.column;
  const endLine = endLoc.line;
  const endColumn = endLoc.column;

  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);

  if (startLine === -1) {
    start = 0;
  }

  if (endLine === -1) {
    end = source.length;
  }

  const lineDiff = endLine - startLine;
  const markerLines = {};

  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;

      if (!startColumn) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1].length;

        markerLines[lineNumber] = [startColumn, sourceLength - startColumn];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endColumn];
      } else {
        const sourceLength = source[lineNumber - i].length;

        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    if (startColumn === endColumn) {
      if (startColumn) {
        markerLines[startLine] = [startColumn, 0];
      } else {
        markerLines[startLine] = true;
      }
    } else {
      markerLines[startLine] = [startColumn, endColumn - startColumn];
    }
  }

  return { start, end, markerLines };
}

export function codeFrameColumns(
  rawLines: string,
  loc: NodeLocation,
  opts: Object = {},
): string {
  const highlighted =
    (opts.highlightCode && Chalk.supportsColor) || opts.forceColor;
  let chalk = Chalk;
  if (opts.forceColor) {
    chalk = new Chalk.constructor({ enabled: true });
  }
  const maybeHighlight = (chalkFn, string) => {
    return highlighted ? chalkFn(string) : string;
  };
  const defs = getDefs(chalk);
  if (highlighted) rawLines = highlight(defs, rawLines);

  const lines = rawLines.split(NEWLINE);
  const { start, end, markerLines } = getMarkerLines(loc, lines, opts);

  const numberMaxWidth = String(end).length;

  const frame = lines
    .slice(start, end)
    .map((line, index) => {
      const number = start + 1 + index;
      const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
      const gutter = ` ${paddedNumber} | `;
      const hasMarker = markerLines[number];
      if (hasMarker) {
        let markerLine = "";
        if (Array.isArray(hasMarker)) {
          const markerSpacing = line
            .slice(0, Math.max(hasMarker[0] - 1, 0))
            .replace(/[^\t]/g, " ");
          const numberOfMarkers = hasMarker[1] || 1;

          markerLine = [
            "\n ",
            maybeHighlight(defs.gutter, gutter.replace(/\d/g, " ")),
            markerSpacing,
            maybeHighlight(defs.marker, "^").repeat(numberOfMarkers),
          ].join("");
        }
        return [
          maybeHighlight(defs.marker, ">"),
          maybeHighlight(defs.gutter, gutter),
          line,
          markerLine,
        ].join("");
      } else {
        return ` ${maybeHighlight(defs.gutter, gutter)}${line}`;
      }
    })
    .join("\n");

  if (highlighted) {
    return chalk.reset(frame);
  } else {
    return frame;
  }
}

/**
 * Create a code frame, adding line numbers, code highlighting, and pointing to a given position.
 */

export default function(
  rawLines: string,
  lineNumber: number,
  colNumber: ?number,
  opts: Object = {},
): string {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;

    const deprecationError = new Error(
      "Passing lineNumber and colNumber is deprecated to babel-code-frame. Please use `codeFrameColumns`.",
    );
    deprecationError.name = "DeprecationWarning";

    if (process.emitWarning) {
      process.emitWarning(deprecationError);
    } else {
      console.warn(deprecationError);
    }
  }

  colNumber = Math.max(colNumber, 0);

  const location: NodeLocation = {
    start: { column: colNumber, line: lineNumber },
  };

  return codeFrameColumns(rawLines, location, opts);
}

// @flow
import path from "path";

const sep = `\\${path.sep}`;
const endSep = `(?:${sep}|$)`;

const substitution = `[^${sep}]+`;

const starPat = `(?:${substitution}${sep})`;
const starPatLast = `(?:${substitution}${endSep})`;

const starStarPat = `${starPat}*?`;
const starStarPatLast = `${starPat}*?${starPatLast}?`;

function escapeRegExp(string) {
  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

/**
 * Implement basic pattern matching that will allow users to do the simple
 * tests with * and **. If users want full complex pattern matching, then can
 * always use regex matching, or function validation.
 */
export default function pathToPattern(
  pattern: string,
  dirname: string,
  matchPrefix: boolean = true,
): RegExp {
  const parts = path.resolve(dirname, pattern).split(path.sep);

  return new RegExp(
    [
      "^",
      ...parts.map((part, i) => {
        const last = i === parts.length - 1;

        // ** matches 0 or more path parts.
        if (part === "**") return last ? starStarPatLast : starStarPat;

        // * matches 1 path part.
        if (part === "*") return last ? starPatLast : starPat;

        // *.ext matches a wildcard with an extension.
        if (part.indexOf("*.") === 0) {
          return (
            substitution + escapeRegExp(part.slice(1)) + (last ? endSep : sep)
          );
        }

        // Otherwise match the pattern text.
        return escapeRegExp(part) + (last ? endSep : sep);
      }),
      matchPrefix ? "" : "$",
    ].join(""),
  );
}

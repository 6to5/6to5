/* eslint max-len: 0 */

// @flow

import * as charCodes from "charcodes";

export {
  isIdentifierStart,
  isIdentifierChar,
  isReservedWord,
  isStrictBindOnlyReservedWord,
  isStrictBindReservedWord,
  isStrictReservedWord,
  isKeyword,
} from "@babel/helper-validator-identifier";

export const keywordRelationalOperator = /^in(stanceof)?$/;

// Test whether a current state character code and next character code is @

export function isIteratorStart(current: number, next: number): boolean {
  return current === charCodes.atSign && next === charCodes.atSign;
}

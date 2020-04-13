/* eslint sort-keys: "error" */
import { getLineInfo } from "../util/location";
import type { Position } from "../util/location";
import CommentsParser from "./comments";
import { ErrorCodes } from "./error-codes";

import type { ErrorCode } from "./error-codes";

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

type ErrorContext = {
  pos: number;
  loc: Position;
  missingPlugin?: Array<string>;
  code?: string;
  reasonCode?: String;
};

export type ParsingError = SyntaxError & ErrorContext;

export type ErrorTemplate = {
  code: ErrorCode;
  template: string;
  reasonCode: string;
};
export type ErrorTemplates = {
  [key: string]: ErrorTemplate;
};

export function makeErrorTemplates(
  messages: {
    [key: string]: string;
  },
  code: ErrorCode,
): ErrorTemplates {
  const templates: ErrorTemplates = {};
  Object.keys(messages).forEach(reasonCode => {
    templates[reasonCode] = Object.freeze({
      code,
      reasonCode,
      template: messages[reasonCode],
    });
  });
  return Object.freeze(templates);
}

export { ErrorCodes };
export {
  ErrorMessages as Errors,
  SourceTypeModuleErrorMessages as SourceTypeModuleErrors,
} from "./error-message";

export type raiseFunction = (b: number, a: ErrorTemplate) => void;

export default abstract class ParserError extends CommentsParser {
  // Forward-declaration: defined in tokenizer/index.js
  abstract isLookahead: boolean;

  getLocationForPosition(pos: number): Position {
    let loc;
    if (pos === this.state.start) loc = this.state.startLoc;
    else if (pos === this.state.lastTokStart) loc = this.state.lastTokStartLoc;
    else if (pos === this.state.end) loc = this.state.endLoc;
    else if (pos === this.state.lastTokEnd) loc = this.state.lastTokEndLoc;
    else loc = getLineInfo(this.input, pos);

    return loc;
  }

  raise(
    pos: number,
    { code, reasonCode, template }: ErrorTemplate,
    ...params: any
  ): Error | never {
    // @ts-expect-error todo(flow->ts) data has unexpected shape
    return this.raiseWithData(pos, { code, reasonCode }, template, ...params);
  }

  /**
   * Raise a parsing error on given position pos. If errorRecovery is true,
   * it will first search current errors and overwrite the error thrown on the exact
   * position before with the new error message. If errorRecovery is false, it
   * fallbacks to `raise`.
   *
   * @param {number} pos
   * @param {string} errorTemplate
   * @param {...any} params
   * @returns {(Error | empty)}
   * @memberof ParserError
   */
  raiseOverwrite(
    pos: number,
    { code, template }: ErrorTemplate,
    ...params: any
  ): Error | never {
    const loc = this.getLocationForPosition(pos);
    const message =
      template.replace(/%(\d+)/g, (_, i: number) => params[i]) +
      ` (${loc.line}:${loc.column})`;
    if (this.options.errorRecovery) {
      const errors = this.state.errors;
      for (let i = errors.length - 1; i >= 0; i--) {
        const error = errors[i];
        if (error.pos === pos) {
          return Object.assign(error, { message });
        } else if (error.pos < pos) {
          break;
        }
      }
    }
    return this._raise({ code, loc, pos }, message);
  }

  raiseWithData(
    pos: number,
    data:
      | {
          missingPlugin?: Array<string>;
          code?: string;
        }
      | undefined
      | null,
    errorTemplate: string,
    ...params: any
  ): Error | never {
    const loc = this.getLocationForPosition(pos);
    const message =
      errorTemplate.replace(/%(\d+)/g, (_, i: number) => params[i]) +
      ` (${loc.line}:${loc.column})`;
    return this._raise(Object.assign({ loc, pos } as any, data), message);
  }

  _raise(errorContext: ErrorContext, message: string): Error | never {
    // @ts-ignore todo($FlowIgnore) looks like no longer needed workaround for flow
    const err: SyntaxError & ErrorContext = new SyntaxError(message);
    Object.assign(err, errorContext);
    if (this.options.errorRecovery) {
      if (!this.isLookahead) this.state.errors.push(err);
      return err;
    } else {
      throw err;
    }
  }
}

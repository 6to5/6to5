// @flow

import gensync from "gensync";

import loadConfig, { type InputOptions } from "./config";
import parser from "./parser";
import type { ParseResult } from "./parser";
import normalizeOptions from "./transformation/normalize-opts";

import { beginHiddenCallStack } from "./errors/rewrite-stack-trace";

type FileParseCallback = {
  (Error, null): any,
  (null, ParseResult | null): any,
};

type Parse = {
  (code: string, callback: FileParseCallback): void,
  (code: string, opts: ?InputOptions, callback: FileParseCallback): void,

  // Here for backward-compatibility. Ideally use ".parseSync" if you want
  // a synchronous API.
  (code: string, opts: ?InputOptions): ParseResult | null,
};

const parseRunner = gensync<[string, ?InputOptions], ParseResult | null>(
  function* parse(code, opts) {
    const config = yield* loadConfig(opts);

    if (config === null) {
      return null;
    }

    return yield* parser(config.passes, normalizeOptions(config), code);
  },
);

export const parse: Parse = (function parse(code, opts, callback) {
  if (typeof opts === "function") {
    callback = opts;
    opts = undefined;
  }

  // For backward-compat with Babel 7's early betas, we allow sync parsing when
  // no callback is given. Will be dropped in some future Babel major version.
  if (callback === undefined) return parseSync(code, opts);

  beginHiddenCallStack(parseRunner.errback)(code, opts, callback);
}: Function);

export function parseSync(...args) {
  return beginHiddenCallStack(parseRunner.sync)(...args);
}

export function parseAsync(...args) {
  return beginHiddenCallStack(parseRunner.async)(...args);
}

// @flow

import gensync from "gensync";

import loadConfig, { type InputOptions } from "./config";
import parser from "./parser";
import type { ParseResult } from "./parser";
import normalizeOptions from "./transformation/normalize-opts";

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

  if (callback === undefined) {
    const message =
      "Starting from Babel 8.0.0, the 'parse' function expects a callback. If you need to call it synchronously, please use 'parseSync'.";
    if (process.env.BABEL_8_BREAKING) {
      throw new Error(message);
    } else {
      console.warn(message);
      return parseRunner.sync(code, opts);
    }
  }

  parseRunner.errback(code, opts, callback);
}: Function);

export const parseSync = parseRunner.sync;
export const parseAsync = parseRunner.async;

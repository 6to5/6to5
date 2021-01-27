// @flow

import gensync from "gensync";

import loadConfig, { type InputOptions, type ResolvedConfig } from "./config";
import {
  run,
  type FileResult,
  type FileResultCallback,
} from "./transformation";

type Transform = {
  (code: string, callback: FileResultCallback): void,
  (code: string, opts: ?InputOptions, callback: FileResultCallback): void,

  // Here for backward-compatibility. Ideally use ".transformSync" if you want
  // a synchronous API.
  (code: string, opts: ?InputOptions): FileResult | null,
};

const transformRunner = gensync<[string, ?InputOptions], FileResult | null>(
  function* transform(code, opts) {
    const config: ResolvedConfig | null = yield* loadConfig(opts);
    if (config === null) return null;

    return yield* run(config, code);
  },
);

export const transform: Transform = (function transform(code, opts, callback) {
  if (typeof opts === "function") {
    callback = opts;
    opts = undefined;
  }

  if (callback === undefined) {
    const message =
      "Starting from Babel 8.0.0, the 'transform' function expects a callback. If you need to call it synchronously, please use 'transformSync'.";
    if (process.env.BABEL_8_BREAKING) {
      throw new Error(message);
    } else {
      console.warn(message);
      return transformRunner.sync(code, opts);
    }
  }

  transformRunner.errback(code, opts, callback);
}: Function);

export const transformSync = transformRunner.sync;
export const transformAsync = transformRunner.async;

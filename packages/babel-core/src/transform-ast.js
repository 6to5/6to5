// @flow

import gensync from "gensync";

import loadConfig, { type InputOptions, type ResolvedConfig } from "./config";
import {
  run,
  type FileResult,
  type FileResultCallback,
} from "./transformation";

type AstRoot = BabelNodeFile | BabelNodeProgram;

type TransformFromAst = {
  (ast: AstRoot, code: string, callback: FileResultCallback): void,
  (
    ast: AstRoot,
    code: string,
    opts: ?InputOptions,
    callback: FileResultCallback,
  ): void,

  // Here for backward-compatibility. Ideally use ".transformSync" if you want
  // a synchronous API.
  (ast: AstRoot, code: string, opts: ?InputOptions): FileResult | null,
};

const transformFromAstRunner = gensync<
  [AstRoot, string, ?InputOptions],
  FileResult | null,
>(function* (ast, code, opts) {
  const config: ResolvedConfig | null = yield* loadConfig(opts);
  if (config === null) return null;

  if (!ast) throw new Error("No AST given");

  return yield* run(config, code, ast);
});

export const transformFromAst: TransformFromAst = (function transformFromAst(
  ast,
  code,
  opts,
  callback,
) {
  if (typeof opts === "function") {
    callback = opts;
    opts = undefined;
  }

  if (callback === undefined) {
    throw new Error(
      "Starting from Babel 8.0.0, the 'transformFromAst' function expects a callback. If you need to call it synchronously, please use 'transformFromAstSync",
    );
  }

  transformFromAstRunner.errback(ast, code, opts, callback);
}: Function);

export const transformFromAstSync = transformFromAstRunner.sync;
export const transformFromAstAsync = transformFromAstRunner.async;

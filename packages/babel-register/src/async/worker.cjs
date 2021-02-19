"use strict";

const path = require("path");
const { parentPort } = require("worker_threads");

const babelP = import("@babel/core");

let signal, port;

const loadedOptions = new Map();
let nextLoadedOptionsId = 0n;

function assertInitialized() {
  if (!signal) {
    throw new Error("@babel/register worker has not been initialized yet.");
  }
}

const handlers = {
  init(message) {
    if (signal) {
      throw new Error("@babel/register worker has already been initialized.");
    }

    ({ signal, port } = message);

    return { type: "initialized" };
  },
  async loadOptions(message) {
    assertInitialized();

    const { default: babel } = await babelP;

    const opts = await babel.loadOptionsAsync({
      // sourceRoot can be overwritten
      sourceRoot: path.dirname(message.filename) + path.sep,
      ...message.opts,
      filename: message.filename,
    });

    if (!opts) return { type: "ignored" };

    let cacheKey = `${JSON.stringify(opts)}:${babel.version}`;

    const env = babel.getEnv(false);
    if (env) cacheKey += `:${env}`;

    const optionsId = nextLoadedOptionsId++;
    loadedOptions.set(optionsId, opts);

    return { type: "cacheKey", cacheKey, optionsId };
  },
  async compile(message) {
    assertInitialized();

    const { default: babel } = await babelP;

    const { code, optionsId } = message;
    if (!loadedOptions.has(optionsId)) {
      throw new Error(`Unkwown options id: ${optionsId}`);
    }

    const opts = loadedOptions.get(optionsId);
    loadedOptions.delete(optionsId);

    const result = await babel.transformAsync(code, {
      ...opts,
      sourceMaps: opts.sourceMaps === undefined ? "both" : opts.sourceMaps,
      ast: false,
    });

    return { type: "result", code: result.code, map: result.map };
  },
  __default__(message) {
    throw new Error("Unknown message: " + message.type);
  },
};

parentPort.addListener("message", async message => {
  try {
    const handler = handlers[message.type] || handlers.__default__;
    const result = await handler(message);
    send(result);
  } catch (error) {
    send({ type: "error", error });
  }
});

function send(message) {
  port.postMessage(message);
  // Change the value of signal[0] to 1
  Atomics.store(signal, 0, 1);
  // This will unlock the main thread when we notify it
  Atomics.notify(signal, 0);
}

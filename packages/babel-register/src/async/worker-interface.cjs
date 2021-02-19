"use strict";

const [major, minor] = process.versions.node.split(".");
if (
  +major < 12 ||
  (+major === 12 && +minor < 17) ||
  (+major === 13 && +minor < 2)
) {
  throw new Error("@babel/runtime/async requires Node.js ^12.17 || >= 13.2");
}

const {
  Worker,
  MessageChannel,
  receiveMessageOnPort,
  SHARE_ENV,
} = require("worker_threads");
const assert = require("assert");

let worker;
let signal;
let channel;

function messageSync(message, transfer) {
  Atomics.store(signal, 0, 0);
  worker.postMessage(message, transfer);
  Atomics.wait(signal, 0, 0);

  const response = receiveMessageOnPort(channel.port2).message;
  if (response.type === "error") throw response.error;
  return response;
}

function init() {
  worker = new Worker(__dirname + "/worker.cjs", { env: SHARE_ENV });
  signal = new Int32Array(new SharedArrayBuffer(4));
  channel = new MessageChannel();

  messageSync({ type: "init", signal, port: channel.port1 }, [channel.port1]);

  worker.unref();
  channel.port2.unref();
}

exports.loadOptions = function message(filename, opts) {
  if (!worker) init();

  const result = messageSync({ type: "loadOptions", filename, opts });

  if (result.type === "ignored") return null;
  assert.strictEqual(result.type, "cacheKey");

  return { cacheKey: result.cacheKey, optionsId: result.optionsId };
};

exports.compile = function message(code, optionsId) {
  if (!worker) init();

  const result = messageSync({
    type: "compile",
    optionsId,
    // code could be a buffer
    code: code.toString(),
  });

  assert.strictEqual(result.type, "result");

  return { code: result.code, map: result.map };
};

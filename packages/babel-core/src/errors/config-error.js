import { injcectVirtualStackFrame, expectedError } from "./rewrite-stack-trace";

export default class ConfigError extends Error {
  constructor(message, filename) {
    super(message);
    expectedError(this);
    if (filename) injcectVirtualStackFrame(this, filename);
  }
}

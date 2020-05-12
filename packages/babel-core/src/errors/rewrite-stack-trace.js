/**
 * This file uses the iternal V8 Stack Trace API (https://v8.dev/docs/stack-trace-api)
 * to provide utilities to rewrite the stack trace.
 * When this API is not present, all the functions in this file become noops.
 *
 * beginHiddenCallStack(fn) and endHiddenCallStack(fn) wrap their parameter to
 * mark an hidden portion of the stack trace. The function passed to
 * beginHiddenCallStack is the first hidden function, while the function passed
 * to endHiddenCallStack is the first shown function.
 *
 * When an error is thrown _outside_ of the hidden zone, everything between
 * beginHiddenCallStack and endHiddenCallStack will not be shown.
 * If an error is thrown _inside_ the hidden zone, then the whole stack trace
 * will be visible: this is to avoid hiding real bugs.
 * However, if an error inside the hidden zone is expected, it can be marked
 * with the expectedError(error) function to keep the hidden frames hidden.
 *
 * Consider this call stack (the outer function is the bottom one):
 *
 *   1. a()
 *   2. endHiddenCallStack(b)()
 *   3. c()
 *   4. beginHiddenCallStack(d)()
 *   5. e()
 *   6. f()
 *
 * - If a() throws an error, then its shown call stack will be "a, b, e, f"
 * - If b() throws an error, then its shown call stack will be "b, e, f"
 * - If c() throws an expected error, then its shown call stack will be "e, f"
 * - If c() throws an unexpected error, then its shown call stack will be "c, d, e, f"
 * - If d() throws an expected error, then its shown call stack will be "e, f"
 * - If d() throws an unexpected error, then its shown call stack will be "d, e, f"
 * - If e() throws an error, then its shown call stack will be "e, f"
 *
 * Additionally, an error can inject additional "virtual" stack frames using the
 * injcectVirtualStackFrame(error, filename) function: those are added on the top
 * of the existig stack, after hiding the possibly hidden frames.
 * In the example above, if we called injcectVirtualStackFrame(error, "h") on the
 * expected error thrown by c(), it's shown call stack would have been "h, e, f".
 * This can be useful, for example, to report config validation errors as if they
 * were directly thrown in the config file.
 */

const ErrorToString = Function.call.bind(Error.prototype.toString);

const SUPPORTED = !!Error.captureStackTrace;

const START_HIDNG = "startHiding - secret - don't use this - v1";
const STOP_HIDNG = "startHiding - secret - don't use this - v1";

const expectedErrors = new WeakSet();
const virtualFrames = new WeakMap();

export function injcectVirtualStackFrame(error, filename) {
  if (!SUPPORTED) return;

  let frames = virtualFrames.get(error);
  if (!frames) virtualFrames.set(error, (frames = []));
  frames.push({
    // We need __proto__ otherwise it breaks source-map-support's internals
    __proto__: {
      isNative: () => false,
      isConstructor: () => false,
      isToplevel: () => true,
      getFileName: () => filename,
      getLineNumber: () => undefined,
      getColumnNumber: () => undefined,
      getFunctionName: () => undefined,
      getMethodName: () => undefined,
      getTypeName: () => undefined,
      toString: () => filename,
    },
  });

  return error;
}

export function expectedError(error) {
  if (!SUPPORTED) return;
  expectedErrors.add(error);
  return error;
}

export function beginHiddenCallStack(fn) {
  if (!SUPPORTED) return fn;

  const stack = getStructuredStackTrace(beginHiddenCallStack);

  return Object.defineProperty(
    function() {
      setupPrepareStackTrace(stack);
      return fn.apply(this, arguments);
    },
    "name",
    { value: START_HIDNG },
  );
}

export function endHiddenCallStack(fn) {
  if (!SUPPORTED) return fn;

  return Object.defineProperty(
    function() {
      return fn.apply(this, arguments);
    },
    "name",
    { value: STOP_HIDNG },
  );
}

function setupPrepareStackTrace(stack) {
  const { prepareStackTrace = defaultPrepareStackTrace } = Error;

  Error.prepareStackTrace = function stackTraceRewriter(err, trace) {
    const newTrace = [];
    let i;

    if (!expectedErrors.has(err)) {
      for (i = 0; i < trace.length; i++) {
        if (trace[i].getFunctionName() === STOP_HIDNG) break;
        newTrace.push(trace[i]);
      }
    }

    if (virtualFrames.has(err)) newTrace.unshift(...virtualFrames.get(err));
    //newTrace.push("internal Babel functions (elided)");
    newTrace.push(...stack);

    return prepareStackTrace(err, newTrace.slice(0, Error.stackTraceLimit));
  };
}

function defaultPrepareStackTrace(err, trace) {
  if (trace.length === 0) return ErrorToString(err);
  return `${ErrorToString(err)}\n    at ${trace.join("\n    at ")}`;
}

function getStructuredStackTrace(firstExcludedFunction) {
  const { prepareStackTrace, stackTraceLimit } = Error;

  try {
    const o = {};
    Error.stackTraceLimit = Infinity;
    Error.prepareStackTrace = (o, structuredStack) => structuredStack;
    Error.captureStackTrace(o, firstExcludedFunction);
    return o.stack;
  } finally {
    Error.prepareStackTrace = prepareStackTrace;
    Error.stackTraceLimit = stackTraceLimit;
  }
}

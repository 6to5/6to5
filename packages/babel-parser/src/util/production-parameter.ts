// @flow
export const PARAM = 0b0000, // Initial Parameter flags
  PARAM_YIELD = 0b0001, // track [Yield] production parameter
  PARAM_AWAIT = 0b0010, // track [Await] production parameter
  PARAM_RETURN = 0b0100, // track [Return] production parameter
  PARAM_IN = 0b1000; // track [In] production parameter

// ProductionParameterHandler is a stack fashioned production parameter tracker
// https://tc39.es/ecma262/#sec-grammar-notation
// The tracked parameters are defined above.
//
// Whenever [+Await]/[+Yield] appears in the right-hand sides of a production,
// we must enter a new tracking stack. For example when parsing
//
// AsyncFunctionDeclaration [Yield, Await]:
//   async [no LineTerminator here] function BindingIdentifier[?Yield, ?Await]
//     ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
//
// we must follow such process:
//
// 1. parse async keyword
// 2. parse function keyword
// 3. parse bindingIdentifier <= inherit current parameters: [?Await]
// 4. enter new stack with (PARAM_AWAIT)
// 5. parse formal parameters <= must have [Await] parameter [+Await]
// 6. parse function body
// 7. exit current stack

export type ParamKind =
  | typeof PARAM
  | typeof PARAM_AWAIT
  | typeof PARAM_IN
  | typeof PARAM_RETURN
  | typeof PARAM_YIELD;

export default class ProductionParameterHandler {
  stacks: Array<ParamKind> = [];
  enter(flags: ParamKind) {
    this.stacks.push(flags);
  }

  exit() {
    this.stacks.pop();
  }

  currentFlags(): ParamKind {
    return this.stacks[this.stacks.length - 1];
  }

  get hasAwait(): boolean {
    return (this.currentFlags() & PARAM_AWAIT) > 0;
  }

  get hasYield(): boolean {
    return (this.currentFlags() & PARAM_YIELD) > 0;
  }

  get hasReturn(): boolean {
    return (this.currentFlags() & PARAM_RETURN) > 0;
  }

  get hasIn(): boolean {
    return (this.currentFlags() & PARAM_IN) > 0;
  }
}

export function functionFlags(
  isAsync: boolean,
  isGenerator: boolean,
): ParamKind {
  return (isAsync ? PARAM_AWAIT : 0) | (isGenerator ? PARAM_YIELD : 0);
}

/**
 * This tiny wrapper file checks for known node flags and appends them
 * when found, before invoking the "real" _babel-node(1) executable.
 */

import getV8Flags from "v8flags";
import path from "path";
import child_process from "child_process";
import { fileURLToPath } from "url";

let args = [
  path.join(path.dirname(fileURLToPath(import.meta.url)), "_babel-node"),
];

let babelArgs = process.argv.slice(2);
let userArgs;

// separate node arguments from script arguments
const argSeparator = babelArgs.indexOf("--");
if (argSeparator > -1) {
  userArgs = babelArgs.slice(argSeparator); // including the  --
  babelArgs = babelArgs.slice(0, argSeparator);
}

/**
 * Replace dashes with underscores in the v8Flag name
 * Also ensure that if the arg contains a value (e.g. --arg=true)
 * that only the flag is returned.
 */
function getNormalizedV8Flag(arg) {
  // v8 uses the "no" prefix to negate boolean flags (e.g. --nolazy),
  // but they are not listed by v8flags
  const matches = arg.match(/--(?:no)?(.+)/);

  if (matches) {
    return `--${matches[1].replace(/-/g, "_")}`;
  }

  return arg;
}

// These are aliases for node options defined by babel-node.
const aliases = new Map([
  ["-d", "--debug"],
  ["-gc", "--expose-gc"],
]);

getV8Flags(async function (err, v8Flags) {
  for (let i = 0; i < babelArgs.length; i++) {
    const arg = babelArgs[i];
    const flag = arg.split("=")[0];

    if (flag === "-r" || flag === "--require") {
      args.push(flag);
      args.push(babelArgs[++i]);
    } else if (aliases.has(flag)) {
      args.unshift(aliases.get(flag));
    } else if (
      flag === "debug" || // node debug foo.js
      flag === "inspect" ||
      v8Flags.indexOf(getNormalizedV8Flag(flag)) >= 0 ||
      process.allowedNodeEnvironmentFlags.has(flag)
    ) {
      args.unshift(arg);
    } else {
      args.push(arg);
    }
  }

  // append arguments passed after --
  if (argSeparator > -1) {
    args = args.concat(userArgs);
  }

  try {
    const { default: kexec } = await import("kexec");
    kexec(process.argv[0], args);
  } catch (err) {
    if (
      err.code !== "ERR_MODULE_NOT_FOUND" &&
      err.code !== "MODULE_NOT_FOUND" &&
      err.code !== "UNDECLARED_DEPENDENCY"
    ) {
      throw err;
    }

    // passthrough IPC only if babel-node itself has an IPC channel
    const shouldPassthroughIPC = process.send !== undefined;
    const proc = child_process.spawn(process.argv[0], args, {
      stdio: shouldPassthroughIPC
        ? ["inherit", "inherit", "inherit", "ipc"]
        : "inherit",
    });
    proc.on("exit", function (code, signal) {
      process.on("exit", function () {
        if (signal) {
          process.kill(process.pid, signal);
        } else {
          process.exitCode = code;
        }
      });
    });
    if (shouldPassthroughIPC) {
      proc.on("message", message => process.send(message));
    }
    process.on("SIGINT", () => proc.kill("SIGINT"));
  }
});

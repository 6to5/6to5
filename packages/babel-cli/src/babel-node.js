/**
 * This tiny wrapper file checks for known node flags and appends them
 * when found, before invoking the "real" _babel-node(1) executable.
 */

import getV8Flags from "v8flags";
import path from "path";

let args = [path.join(__dirname, "_babel-node")];

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
  const matches = arg.match(/--(.+)/);

  if (matches) {
    return `--${matches[1].replace(/-/g, "_")}`;
  }

  return arg;
}

getV8Flags(function(err, v8Flags) {
  babelArgs.forEach(function(arg) {
    const flag = arg.split("=")[0];

    switch (flag) {
      case "-d":
        args.unshift("--debug");
        break;

      case "debug":
      case "--debug":
      case "--debug-brk":
      case "--inspect":
      case "--inspect-brk":
        args.unshift(arg);
        break;

      case "-gc":
        args.unshift("--expose-gc");
        break;

      case "--nolazy":
        args.unshift(flag);
        break;

      default:
        if (
          v8Flags.indexOf(getNormalizedV8Flag(flag)) >= 0 ||
          arg.indexOf("--trace") === 0
        ) {
          args.unshift(arg);
        } else {
          args.push(arg);
        }
        break;
    }
  });

  // append arguments passed after --
  if (argSeparator > -1) {
    args = args.concat(userArgs);
  }

  try {
    const kexec = require("kexec");
    kexec(process.argv[0], args);
  } catch (err) {
    if (err.code !== "MODULE_NOT_FOUND") throw err;

    const child_process = require("child_process");
    const proc = child_process.spawn(process.argv[0], args, {
      stdio: "inherit",
    });
    proc.on("exit", function(code, signal) {
      process.on("exit", function() {
        if (signal) {
          process.kill(process.pid, signal);
        } else {
          process.exit(code);
        }
      });
    });

    process.on("SIGINT", () => {
      proc.kill("SIGINT");
      process.exit(1);
    });
  }
});

import commander from "commander";
import Module from "module";
import { inspect } from "util";
import path from "path";
import repl from "repl";
import * as babel from "babel-core";
import vm from "vm";
import "babel-polyfill";
import register from "babel-register";

import pkg from "../package.json";

const program = new commander.Command("babel-node");

function collect(value, previousValue): Array<string> {
  // If the user passed the option with no value, like "babel-node file.js --presets", do nothing.
  if (typeof value !== "string") return previousValue;

  const values = value.split(",");

  return previousValue ? previousValue.concat(values) : values;
}

/* eslint-disable max-len */
program.option("-e, --eval [script]", "Evaluate script");
program.option("-p, --print [code]", "Evaluate script and print result");
program.option(
  "-o, --only [globs]",
  "A comma-separated list of glob patterns to compile",
  collect,
);
program.option(
  "-i, --ignore [globs]",
  "A comma-separated list of glob patterns to skip compiling",
  collect,
);
program.option(
  "-x, --extensions [extensions]",
  "List of extensions to hook into [.es6,.js,.es,.jsx,.mjs]",
  collect,
);
program.option("-w, --plugins [string]", "", collect);
program.option("-b, --presets [string]", "", collect);
/* eslint-enable max-len */

program.version(pkg.version);
program.usage("[options] [ -e script | script.js ] [arguments]");
program.parse(process.argv);

//

register({
  extensions: program.extensions,
  ignore: program.ignore,
  only: program.only,
  plugins: program.plugins,
  presets: program.presets,
});

//

const replPlugin = ({ types: t }) => ({
  visitor: {
    ModuleDeclaration(path) {
      throw path.buildCodeFrameError("Modules aren't supported in the REPL");
    },

    VariableDeclaration(path) {
      if (path.node.kind !== "var") {
        throw path.buildCodeFrameError(
          "Only `var` variables are supported in the REPL",
        );
      }
    },

    Program(path) {
      if (path.get("body").some(child => child.isExpressionStatement())) return;

      // If the executed code doesn't evaluate to a value,
      // prevent implicit strict mode from printing 'use strict'.
      path.pushContainer(
        "body",
        t.expressionStatement(t.identifier("undefined")),
      );
    },
  },
});

//

const _eval = function(code, filename) {
  code = code.trim();
  if (!code) return undefined;

  code = babel.transform(code, {
    filename: filename,
    presets: program.presets,
    plugins: (program.plugins || []).concat([replPlugin]),
  }).code;

  return vm.runInThisContext(code, {
    filename: filename,
  });
};

if (program.eval || program.print) {
  let code = program.eval;
  if (!code || code === true) code = program.print;

  global.__filename = "[eval]";
  global.__dirname = process.cwd();

  const module = new Module(global.__filename);
  module.filename = global.__filename;
  module.paths = Module._nodeModulePaths(global.__dirname);

  global.exports = module.exports;
  global.module = module;
  global.require = module.require.bind(module);

  const result = _eval(code, global.__filename);
  if (program.print) {
    const output = typeof result === "string" ? result : inspect(result);
    process.stdout.write(output + "\n");
  }
} else {
  if (program.args.length) {
    // slice all arguments up to the first filename since they're babel args that we handle
    let args = process.argv.slice(2);

    let i = 0;
    let ignoreNext = false;
    args.some(function(arg, i2) {
      if (ignoreNext) {
        ignoreNext = false;
        return;
      }

      if (arg[0] === "-") {
        const parsedArg = program[arg.slice(2)];
        if (parsedArg && parsedArg !== true) {
          ignoreNext = true;
        }
      } else {
        i = i2;
        return true;
      }
    });
    args = args.slice(i);

    // make the filename absolute
    const filename = args[0];
    if (!path.isAbsolute(filename)) {
      args[0] = path.join(process.cwd(), filename);
    }

    // add back on node and concat the sliced args
    process.argv = ["node"].concat(args);
    process.execArgv.unshift(__filename);

    Module.runMain();
  } else {
    replStart();
  }
}

function replStart() {
  repl.start({
    prompt: "> ",
    input: process.stdin,
    output: process.stdout,
    eval: replEval,
    useGlobal: true,
  });
}

function replEval(code, context, filename, callback) {
  let err;
  let result;

  try {
    if (code[0] === "(" && code[code.length - 1] === ")") {
      code = code.slice(1, -1); // remove "(" and ")"
    }

    result = _eval(code, filename);
  } catch (e) {
    err = e;
  }

  callback(err, result);
}

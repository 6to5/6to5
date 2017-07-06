#!/usr/bin/env node

import fs from "fs";
import commander from "commander";
import { version } from "babel-core";
import uniq from "lodash/uniq";
import glob from "glob";

import dirCommand from "./dir";
import fileCommand from "./file";

import pkg from "../../package.json";

function booleanify(val: any): boolean | any {
  if (val === "true" || val == 1) {
    return true;
  }

  if (val === "false" || val == 0 || !val) {
    return false;
  }

  return val;
}

function collect(value, previousValue): Array<string> {
  // If the user passed the option with no value, like "babel file.js --presets", do nothing.
  if (typeof value !== "string") return previousValue;

  const values = value.split(",");

  return previousValue ? previousValue.concat(values) : values;
}

/* eslint-disable max-len */
// Standard Babel input configs.
commander.option(
  "-f, --filename [filename]",
  "filename to use when reading from stdin - this will be used in source-maps, errors etc",
);
commander.option(
  "--presets [list]",
  "comma-separated list of preset names",
  collect,
);
commander.option(
  "--plugins [list]",
  "comma-separated list of plugin names",
  collect,
);

// Basic file input configuration.
commander.option("--source-type [script|module]", "");
commander.option(
  "--no-babelrc",
  "Whether or not to look up .babelrc and .babelignore files",
);
commander.option(
  "--ignore [list]",
  "list of glob paths to **not** compile",
  collect,
);
commander.option(
  "--only [list]",
  "list of glob paths to **only** compile",
  collect,
);

// Misc babel config.
commander.option(
  "--no-highlight-code",
  "enable/disable ANSI syntax highlighting of code frames (on by default)",
);

// General output formatting.
commander.option(
  "--no-comments",
  "write comments to generated output (true by default)",
);
commander.option(
  "--retain-lines",
  "retain line numbers - will result in really ugly code",
);
commander.option(
  "--compact [true|false|auto]",
  "do not include superfluous whitespace characters and line terminators",
  booleanify,
);
commander.option("--minified", "save as much bytes when printing [true|false]");
commander.option(
  "--auxiliary-comment-before [string]",
  "print a comment before any injected non-user code",
);
commander.option(
  "--auxiliary-comment-after [string]",
  "print a comment after any injected non-user code",
);

// General soucemap formatting.
commander.option("-s, --source-maps [true|false|inline|both]", "", booleanify);
commander.option(
  "--source-map-target [string]",
  "set `file` on returned source map",
);
commander.option(
  "--source-file-name [string]",
  "set `sources[0]` on returned source map",
);
commander.option(
  "--source-root [filename]",
  "the root from which all sources are relative",
);

// Config params for certain module output formats.
commander.option(
  "--module-root [filename]",
  "optional prefix for the AMD module formatter that will be prepend to the filename on module definitions",
);
commander.option("-M, --module-ids", "insert an explicit id for modules");
commander.option(
  "--module-id [string]",
  "specify a custom name for module ids",
);

// "babel" command specific arguments that are not passed to babel-core.
commander.option(
  "-x, --extensions [extensions]",
  "List of extensions to compile when a directory has been input [.es6,.js,.es,.jsx,.mjs]",
  collect,
);
commander.option("-w, --watch", "Recompile files on changes");
commander.option(
  "--skip-initial-build",
  "Do not compile files before watching",
);
commander.option(
  "-o, --out-file [out]",
  "Compile all input files into a single file",
);
commander.option(
  "-d, --out-dir [out]",
  "Compile an input directory of modules into an output directory",
);
commander.option(
  "-D, --copy-files",
  "When compiling a directory copy over non-compilable files",
);
commander.option("-q, --quiet", "Don't log anything");
/* eslint-enable max-len */

commander.version(pkg.version + " (babel-core " + version + ")");
commander.usage("[options] <files ...>");
commander.parse(process.argv);

//

const errors = [];

let filenames = commander.args.reduce(function(globbed, input) {
  let files = glob.sync(input);
  if (!files.length) files = [input];
  return globbed.concat(files);
}, []);

filenames = uniq(filenames);

filenames.forEach(function(filename) {
  if (!fs.existsSync(filename)) {
    errors.push(filename + " doesn't exist");
  }
});

if (commander.outDir && !filenames.length) {
  errors.push("filenames required for --out-dir");
}

if (commander.outFile && commander.outDir) {
  errors.push("cannot have --out-file and --out-dir");
}

if (commander.watch) {
  if (!commander.outFile && !commander.outDir) {
    errors.push("--watch requires --out-file or --out-dir");
  }

  if (!filenames.length) {
    errors.push("--watch requires filenames");
  }
}

if (commander.skipInitialBuild && !commander.watch) {
  errors.push("--skip-initial-build requires --watch");
}

if (errors.length) {
  console.error(errors.join(". "));
  process.exit(2);
}

//

const opts = commander.opts();

// Delete options that are specific to babel-cli and shouldn't be passed to babel-core.
delete opts.version;
delete opts.extensions;
delete opts.watch;
delete opts.skipInitialBuild;
delete opts.outFile;
delete opts.outDir;
delete opts.copyFiles;
delete opts.quiet;

// Commander will default the "--no-" arguments to true, but we want to leave them undefined so that
// babel-core can handle the default-assignment logic on its own.
if (opts.babelrc === true) opts.babelrc = undefined;
if (opts.comments === true) opts.comments = undefined;
if (opts.highlightCode === true) opts.highlightCode = undefined;

const fn = commander.outDir ? dirCommand : fileCommand;
fn(commander, filenames, opts);

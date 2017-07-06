/* global BabelFileResult, BabelParserOptions, BabelFileMetadata */

import getHelper from "babel-helpers";
import * as metadataVisitor from "./metadata";
import convertSourceMap from "convert-source-map";
import PluginPass from "../plugin-pass";
import { NodePath, Hub, Scope } from "babel-traverse";
import sourceMap from "source-map";
import generate from "babel-generator";
import { codeFrameColumns } from "babel-code-frame";
import traverse from "babel-traverse";
import Store from "../store";
import { parse } from "babylon";
import * as t from "babel-types";
import buildDebug from "debug";

import loadConfig, { type ResolvedConfig } from "../../config";

import blockHoistPlugin from "../internal-plugins/block-hoist";

const babelDebug = buildDebug("babel:file");

export function debug(opts: Object, msg: string) {
  babelDebug(`${opts.filename || "unknown"}: ${msg}`);
}

const shebangRegex = /^#!.*/;

let INTERNAL_PLUGINS;

const errorVisitor = {
  enter(path, state) {
    const loc = path.node.loc;
    if (loc) {
      state.loc = loc;
      path.stop();
    }
  },
};

export default class File extends Store {
  constructor({ options, plugins }: ResolvedConfig) {
    if (!INTERNAL_PLUGINS) {
      // Lazy-init the internal plugin to remove the init-time circular dependency between plugins being
      // passed babel-core's export object, which loads this file, and this 'loadConfig' loading plugins.
      INTERNAL_PLUGINS = loadConfig({
        babelrc: false,
        plugins: [blockHoistPlugin],
      }).plugins;
    }

    super();

    this.plugins = plugins;
    this.opts = options;

    this.parserOpts = {
      sourceType: this.opts.sourceType,
      sourceFileName: this.opts.filename,
      plugins: [],
    };

    for (const [plugin] of plugins) {
      if (plugin.manipulateOptions) {
        plugin.manipulateOptions(this.opts, this.parserOpts, this);
      }
    }

    this.metadata = {
      usedHelpers: [],
      marked: [],
      modules: {
        imports: [],
        exports: {
          exported: [],
          specifiers: [],
        },
      },
    };

    this.dynamicImportTypes = {};
    this.dynamicImportIds = {};
    this.dynamicImports = [];
    this.declarations = {};
    this.usedHelpers = {};

    this.path = null;
    this.ast = {};

    this.code = "";
    this.shebang = "";

    this.hub = new Hub(this);
  }

  static helpers: Array<string>;

  plugins: Array<[Plugin, Object]>;
  parserOpts: BabelParserOptions;
  opts: Object;
  dynamicImportTypes: Object;
  dynamicImportIds: Object;
  dynamicImports: Array<Object>;
  declarations: Object;
  usedHelpers: Object;
  path: NodePath;
  ast: Object;
  scope: Scope;
  metadata: BabelFileMetadata;
  hub: Hub;
  code: string;
  shebang: string;

  getMetadata() {
    let has = false;
    for (const node of (this.ast.program.body: Array<Object>)) {
      if (t.isModuleDeclaration(node)) {
        has = true;
        break;
      }
    }
    if (has) {
      this.path.traverse(metadataVisitor, this);
    }
  }

  getModuleName(): ?string {
    const opts = this.opts;
    if (!opts.moduleIds) {
      return null;
    }

    // moduleId is n/a if a `getModuleId()` is provided
    if (opts.moduleId != null && !opts.getModuleId) {
      return opts.moduleId;
    }

    let filenameRelative = opts.filenameRelative;
    let moduleName = "";

    if (opts.moduleRoot != null) {
      moduleName = opts.moduleRoot + "/";
    }

    if (!opts.filenameRelative) {
      return moduleName + opts.filename.replace(/^\//, "");
    }

    if (opts.sourceRoot != null) {
      // remove sourceRoot from filename
      const sourceRootRegEx = new RegExp("^" + opts.sourceRoot + "/?");
      filenameRelative = filenameRelative.replace(sourceRootRegEx, "");
    }

    // remove extension
    filenameRelative = filenameRelative.replace(/\.(\w*?)$/, "");

    moduleName += filenameRelative;

    // normalize path separators
    moduleName = moduleName.replace(/\\/g, "/");

    if (opts.getModuleId) {
      // If return is falsy, assume they want us to use our generated default name
      return opts.getModuleId(moduleName) || moduleName;
    } else {
      return moduleName;
    }
  }

  resolveModuleSource(source: string): string {
    const resolveModuleSource = this.opts.resolveModuleSource;
    if (resolveModuleSource) {
      source = resolveModuleSource(source, this.opts.filename);
    }
    return source;
  }

  addImport(
    source: string,
    imported: string,
    name?: string = imported,
  ): Object {
    const alias = `${source}:${imported}`;
    let id = this.dynamicImportIds[alias];

    if (!id) {
      source = this.resolveModuleSource(source);
      id = this.dynamicImportIds[alias] = this.scope.generateUidIdentifier(
        name,
      );

      const specifiers = [];

      if (imported === "*") {
        specifiers.push(t.importNamespaceSpecifier(id));
      } else if (imported === "default") {
        specifiers.push(t.importDefaultSpecifier(id));
      } else {
        specifiers.push(t.importSpecifier(id, t.identifier(imported)));
      }

      const declar = t.importDeclaration(specifiers, t.stringLiteral(source));
      declar._blockHoist = 3;

      this.path.unshiftContainer("body", declar);
    }

    return id;
  }

  addHelper(name: string): Object {
    const declar = this.declarations[name];
    if (declar) return declar;

    if (!this.usedHelpers[name]) {
      this.metadata.usedHelpers.push(name);
      this.usedHelpers[name] = true;
    }

    const generator = this.get("helperGenerator");
    const runtime = this.get("helpersNamespace");
    if (generator) {
      const res = generator(name);
      if (res) return res;
    } else if (runtime) {
      return t.memberExpression(runtime, t.identifier(name));
    }

    const ref = getHelper(name);
    const uid = (this.declarations[name] = this.scope.generateUidIdentifier(
      name,
    ));

    if (t.isFunctionExpression(ref) && !ref.id) {
      ref.body._compact = true;
      ref._generated = true;
      ref.id = uid;
      ref.type = "FunctionDeclaration";
      this.path.unshiftContainer("body", ref);
    } else {
      ref._compact = true;
      this.scope.push({
        id: uid,
        init: ref,
        unique: true,
      });
    }

    return uid;
  }

  addTemplateObject(
    helperName: string,
    strings: Array<Object>,
    raw: Object,
  ): Object {
    // Generate a unique name based on the string literals so we dedupe
    // identical strings used in the program.
    const stringIds = raw.elements.map(function(string) {
      return string.value;
    });
    const name = `${helperName}_${raw.elements.length}_${stringIds.join(",")}`;

    const declar = this.declarations[name];
    if (declar) return declar;

    const uid = (this.declarations[name] = this.scope.generateUidIdentifier(
      "templateObject",
    ));

    const helperId = this.addHelper(helperName);
    const init = t.callExpression(helperId, [strings, raw]);
    init._compact = true;
    this.scope.push({
      id: uid,
      init: init,
      _blockHoist: 1.9, // This ensures that we don't fail if not using function expression helpers
    });
    return uid;
  }

  buildCodeFrameError(
    node: Object,
    msg: string,
    Error: typeof Error = SyntaxError,
  ): Error {
    const loc = node && (node.loc || node._loc);

    const err = new Error(msg);

    if (loc) {
      err.loc = loc.start;
    } else {
      traverse(node, errorVisitor, this.scope, err);

      err.message +=
        " (This is an error on an internal node. Probably an internal error";

      if (err.loc) {
        err.message += ". Location has been estimated.";
      }

      err.message += ")";
    }

    return err;
  }

  mergeSourceMap(map: Object) {
    const inputMap = this.opts.inputSourceMap;

    if (inputMap) {
      const inputMapConsumer = new sourceMap.SourceMapConsumer(inputMap);
      const outputMapConsumer = new sourceMap.SourceMapConsumer(map);

      const mergedGenerator = new sourceMap.SourceMapGenerator({
        file: inputMapConsumer.file,
        sourceRoot: inputMapConsumer.sourceRoot,
      });

      // This assumes the output map always has a single source, since Babel always compiles a
      // single source file to a single output file.
      const source = outputMapConsumer.sources[0];

      inputMapConsumer.eachMapping(function(mapping) {
        const generatedPosition = outputMapConsumer.generatedPositionFor({
          line: mapping.generatedLine,
          column: mapping.generatedColumn,
          source: source,
        });
        if (generatedPosition.column != null) {
          mergedGenerator.addMapping({
            source: mapping.source,

            original:
              mapping.source == null
                ? null
                : {
                    line: mapping.originalLine,
                    column: mapping.originalColumn,
                  },

            generated: generatedPosition,
          });
        }
      });

      const mergedMap = mergedGenerator.toJSON();
      inputMap.mappings = mergedMap.mappings;
      return inputMap;
    } else {
      return map;
    }
  }

  parse(code: string) {
    let parseCode = parse;
    let parserOpts = this.opts.parserOpts;

    if (parserOpts) {
      parserOpts = Object.assign({}, this.parserOpts, parserOpts);

      if (parserOpts.parser) {
        parseCode = parserOpts.parser;

        parserOpts.parser = {
          parse(source) {
            return parse(source, parserOpts);
          },
        };
      }
    }

    debug(this.opts, "Parse start");
    const ast = parseCode(code, parserOpts || this.parserOpts);
    debug(this.opts, "Parse stop");
    return ast;
  }

  _addAst(ast) {
    this.path = NodePath.get({
      hub: this.hub,
      parentPath: null,
      parent: ast,
      container: ast,
      key: "program",
    }).setContext();
    this.scope = this.path.scope;
    this.ast = ast;
    this.getMetadata();
  }

  addAst(ast) {
    debug(this.opts, "Start set AST");
    this._addAst(ast);
    debug(this.opts, "End set AST");
  }

  transform(): BabelFileResult {
    const pluginPairs = this.plugins;
    const passPairs = [];
    const passes = [];
    const visitors = [];

    for (const [plugin, pluginOpts] of pluginPairs.concat(INTERNAL_PLUGINS)) {
      const pass = new PluginPass(this, plugin.key, pluginOpts);

      passPairs.push([plugin, pass]);
      passes.push(pass);
      visitors.push(plugin.visitor);
    }

    for (const [plugin, pass] of passPairs) {
      const fn = plugin.pre;
      if (fn) fn.call(pass, this);
    }

    debug(this.opts, "Start transform traverse");

    // merge all plugin visitors into a single visitor
    const visitor = traverse.visitors.merge(
      visitors,
      passes,
      this.opts.wrapPluginVisitorMethod,
    );
    traverse(this.ast, visitor, this.scope);

    debug(this.opts, "End transform traverse");

    for (const [plugin, pass] of passPairs) {
      const fn = plugin.post;
      if (fn) fn.call(pass, this);
    }

    return this.generate();
  }

  wrap(code: string, callback: Function): BabelFileResult {
    code = code + "";

    try {
      return callback();
    } catch (err) {
      if (err._babel) {
        throw err;
      } else {
        err._babel = true;
      }

      let message = (err.message = `${this.opts.filename}: ${err.message}`);

      const loc = err.loc;
      if (loc) {
        const location = {
          start: {
            line: loc.line,
            column: loc.column + 1,
          },
        };
        err.codeFrame = codeFrameColumns(code, location, this.opts);
        message += "\n" + err.codeFrame;
      }

      if (process.browser) {
        // chrome has it's own pretty stringifier which doesn't use the stack property
        // https://github.com/babel/babel/issues/2175
        err.message = message;
      }

      if (err.stack) {
        const newStack = err.stack.replace(err.message, message);
        err.stack = newStack;
      }

      throw err;
    }
  }

  addCode(code: string) {
    code = (code || "") + "";
    code = this.parseInputSourceMap(code);
    this.code = code;
  }

  parseCode() {
    this.parseShebang();
    const ast = this.parse(this.code);
    this.addAst(ast);
  }

  parseInputSourceMap(code: string): string {
    const opts = this.opts;

    if (opts.inputSourceMap !== false) {
      const inputMap = convertSourceMap.fromSource(code);
      if (inputMap) {
        opts.inputSourceMap = inputMap.toObject();
        code = convertSourceMap.removeComments(code);
      }
    }

    return code;
  }

  parseShebang() {
    const shebangMatch = shebangRegex.exec(this.code);
    if (shebangMatch) {
      this.shebang = shebangMatch[0];
      this.code = this.code.replace(shebangRegex, "");
    }
  }

  makeResult({ code, map, ast, ignored }: BabelFileResult): BabelFileResult {
    const result = {
      metadata: null,
      options: this.opts,
      ignored: !!ignored,
      code: null,
      ast: null,
      map: map || null,
    };

    if (this.opts.code) {
      result.code = code;
    }

    if (this.opts.ast) {
      result.ast = ast;
    }

    if (this.opts.metadata) {
      result.metadata = this.metadata;
    }

    return result;
  }

  generate(): BabelFileResult {
    const opts = this.opts;
    const ast = this.ast;

    const result: BabelFileResult = { ast };
    if (!opts.code) return this.makeResult(result);

    let gen = generate;
    if (opts.generatorOpts && opts.generatorOpts.generator) {
      gen = opts.generatorOpts.generator;
    }

    debug(this.opts, "Generation start");

    const _result = gen(
      ast,
      opts.generatorOpts ? Object.assign(opts, opts.generatorOpts) : opts,
      this.code,
    );
    result.code = _result.code;
    result.map = _result.map;

    debug(this.opts, "Generation end");

    if (this.shebang) {
      // add back shebang
      result.code = `${this.shebang}\n${result.code}`;
    }

    if (result.map) {
      result.map = this.mergeSourceMap(result.map);
    }

    if (opts.sourceMaps === "inline" || opts.sourceMaps === "both") {
      result.code += "\n" + convertSourceMap.fromObject(result.map).toComment();
    }

    if (opts.sourceMaps === "inline") {
      result.map = null;
    }

    return this.makeResult(result);
  }
}

export { File };

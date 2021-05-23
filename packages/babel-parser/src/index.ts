// @flow

import { type Options } from "./options";
import {
  hasPlugin,
  validatePlugins,
  mixinPluginNames,
  mixinPlugins,
  type PluginList,
} from "./plugin-utils";
import Parser from "./parser";

import { types as tokTypes } from "./tokenizer/types";
import "./tokenizer/context";

import type { Expression, File } from "./types";

export function parse(input: string, options?: Options): File {
  if (options?.sourceType === "unambiguous") {
    options = {
      ...options,
    };
    try {
      options.sourceType = "module";
      const parser = getParser(options, input);
      const ast = parser.parse();

      if (parser.sawUnambiguousESM) {
        return ast;
      }

      if (parser.ambiguousScriptDifferentAst) {
        // Top level await introduces code which can be both a valid script and
        // a valid module, but which produces different ASTs:
        //    await
        //    0
        // can be parsed either as an AwaitExpression, or as two ExpressionStatements.
        try {
          options.sourceType = "script";
          return getParser(options, input).parse();
        } catch {}
      } else {
        // This is both a valid module and a valid script, but
        // we parse it as a script by default
        ast.program.sourceType = "script";
      }

      return ast;
    } catch (moduleError) {
      try {
        options.sourceType = "script";
        return getParser(options, input).parse();
      } catch {}

      throw moduleError;
    }
  } else {
    return getParser(options, input).parse();
  }
}

export function parseExpression(input: string, options?: Options): Expression {
  const parser = getParser(options, input);
  if (parser.options.strictMode) {
    parser.state.strict = true;
  }
  return parser.getExpression();
}

export { tokTypes };

function getParser(options: ?Options, input: string): Parser {
  let cls = Parser;
  if (options?.plugins) {
    validatePlugins(options.plugins);
    cls = getParserClass(options.plugins);
  }

  return new cls(options, input);
}

const parserClassCache: { [key: string]: Class<Parser> } = {};

/** Get a Parser class with plugins applied. */
function getParserClass(pluginsFromOptions: PluginList): Class<Parser> {
  const pluginList = mixinPluginNames.filter(name =>
    hasPlugin(pluginsFromOptions, name),
  );

  const key = pluginList.join("/");
  let cls = parserClassCache[key];
  if (!cls) {
    cls = Parser;
    for (const plugin of pluginList) {
      cls = mixinPlugins[plugin](cls);
    }
    parserClassCache[key] = cls;
  }
  return cls;
}

// @flow

import type Parser from "./parser";

export type Plugin = string | [string, Object];

export type PluginList = $ReadOnlyArray<Plugin>;

export type MixinPlugin = (superClass: Class<Parser>) => Class<Parser>;

export function hasPlugin(plugins: PluginList, name: string): boolean {
  return plugins.some(plugin => {
    if (Array.isArray(plugin)) {
      return plugin[0] === name;
    } else {
      return plugin === name;
    }
  });
}

export function getPluginOption(
  plugins: PluginList,
  name: string,
  option: string,
) {
  const plugin = plugins.find(plugin => {
    if (Array.isArray(plugin)) {
      return plugin[0] === name;
    } else {
      return plugin === name;
    }
  });

  if (plugin && Array.isArray(plugin)) {
    return plugin[1][option];
  }

  return null;
}

const PIPELINE_PROPOSALS = ["minimal", "fsharp", "hack", "smart"];
const TOPIC_TOKENS = ["%", "#"];
const RECORD_AND_TUPLE_SYNTAX_TYPES = ["hash", "bar"];

export function validatePlugins(plugins: PluginList) {
  if (hasPlugin(plugins, "decorators")) {
    if (hasPlugin(plugins, "decorators-legacy")) {
      throw new Error(
        "Cannot use the decorators and decorators-legacy plugin together",
      );
    }

    const decoratorsBeforeExport = getPluginOption(
      plugins,
      "decorators",
      "decoratorsBeforeExport",
    );
    if (decoratorsBeforeExport == null) {
      throw new Error(
        "The 'decorators' plugin requires a 'decoratorsBeforeExport' option," +
          " whose value must be a boolean. If you are migrating from" +
          " Babylon/Babel 6 or want to use the old decorators proposal, you" +
          " should use the 'decorators-legacy' plugin instead of 'decorators'.",
      );
    } else if (typeof decoratorsBeforeExport !== "boolean") {
      throw new Error("'decoratorsBeforeExport' must be a boolean.");
    }
  }

  if (hasPlugin(plugins, "flow") && hasPlugin(plugins, "typescript")) {
    throw new Error("Cannot combine flow and typescript plugins.");
  }

  if (hasPlugin(plugins, "placeholders") && hasPlugin(plugins, "v8intrinsic")) {
    throw new Error("Cannot combine placeholders and v8intrinsic plugins.");
  }

  if (hasPlugin(plugins, "pipelineOperator")) {
    const proposal = getPluginOption(plugins, "pipelineOperator", "proposal");

    if (!PIPELINE_PROPOSALS.includes(proposal)) {
      const proposalList = PIPELINE_PROPOSALS.map(p => `"${p}"`).join(", ");
      throw new Error(
        `"pipelineOperator" requires "proposal" option whose value must be one of: ${proposalList}.`,
      );
    }

    const tupleSyntaxIsHash =
      hasPlugin(plugins, "recordAndTuple") &&
      getPluginOption(plugins, "recordAndTuple", "syntaxType") === "hash";

    if (proposal === "hack") {
      if (hasPlugin(plugins, "placeholders")) {
        throw new Error(
          "Cannot combine placeholders plugin and Hack-style pipes.",
        );
      }

      if (hasPlugin(plugins, "v8intrinsic")) {
        throw new Error(
          "Cannot combine v8intrinsic plugin and Hack-style pipes.",
        );
      }

      const topicToken = getPluginOption(
        plugins,
        "pipelineOperator",
        "topicToken",
      );

      if (!TOPIC_TOKENS.includes(topicToken)) {
        const tokenList = TOPIC_TOKENS.map(t => `"${t}"`).join(", ");

        throw new Error(
          `"pipelineOperator" in "proposal": "hack" mode also requires a "topicToken" option whose value must be one of: ${tokenList}.`,
        );
      }

      if (topicToken === "#" && tupleSyntaxIsHash) {
        throw new Error(
          'Plugin conflict between `["pipelineOperator", { proposal: "hack", topicToken: "#" }]` and `["recordAndtuple", { syntaxType: "hash"}]`.',
        );
      }
    } else if (proposal === "smart" && tupleSyntaxIsHash) {
      throw new Error(
        'Plugin conflict between `["pipelineOperator", { proposal: "smart" }]` and `["recordAndtuple", { syntaxType: "hash"}]`.',
      );
    }
  }

  if (hasPlugin(plugins, "moduleAttributes")) {
    if (process.env.BABEL_8_BREAKING) {
      throw new Error(
        "`moduleAttributes` has been removed in Babel 8, please use `importAssertions` parser plugin, or `@babel/plugin-syntax-import-assertions`.",
      );
    } else {
      if (hasPlugin(plugins, "importAssertions")) {
        throw new Error(
          "Cannot combine importAssertions and moduleAttributes plugins.",
        );
      }
      const moduleAttributesVerionPluginOption = getPluginOption(
        plugins,
        "moduleAttributes",
        "version",
      );
      if (moduleAttributesVerionPluginOption !== "may-2020") {
        throw new Error(
          "The 'moduleAttributes' plugin requires a 'version' option," +
            " representing the last proposal update. Currently, the" +
            " only supported value is 'may-2020'.",
        );
      }
    }
  }

  if (
    hasPlugin(plugins, "recordAndTuple") &&
    !RECORD_AND_TUPLE_SYNTAX_TYPES.includes(
      getPluginOption(plugins, "recordAndTuple", "syntaxType"),
    )
  ) {
    throw new Error(
      "'recordAndTuple' requires 'syntaxType' option whose value should be one of: " +
        RECORD_AND_TUPLE_SYNTAX_TYPES.map(p => `'${p}'`).join(", "),
    );
  }

  if (
    hasPlugin(plugins, "asyncDoExpressions") &&
    !hasPlugin(plugins, "doExpressions")
  ) {
    const error = new Error(
      "'asyncDoExpressions' requires 'doExpressions', please add 'doExpressions' to parser plugins.",
    );
    // $FlowIgnore
    error.missingPlugins = "doExpressions"; // so @babel/core can provide better error message
    throw error;
  }
}

// These plugins are defined using a mixin which extends the parser class.

import estree from "./plugins/estree";
import flow from "./plugins/flow";
import jsx from "./plugins/jsx";
import typescript from "./plugins/typescript";
import placeholders from "./plugins/placeholders";
import v8intrinsic from "./plugins/v8intrinsic";

// NOTE: order is important. estree must come first; placeholders must come last.
export const mixinPlugins: { [name: string]: MixinPlugin } = {
  estree,
  jsx,
  flow,
  typescript,
  v8intrinsic,
  placeholders,
};

export const mixinPluginNames: $ReadOnlyArray<string> =
  Object.keys(mixinPlugins);

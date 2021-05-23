// @flow

import type { Options } from "../options";
import type State from "../tokenizer/state";
import type { PluginsMap } from "./index";
import type ScopeHandler from "../util/scope";
import type ExpressionScopeHandler from "../util/expression-scope";
import type ClassScopeHandler from "../util/class-scope";
import type ProductionParameterHandler from "../util/production-parameter";

export default class BaseParser {
  // Properties set by constructor in index.js
  declare options: Options;
  declare inModule: boolean;
  declare scope: ScopeHandler<*>;
  declare classScope: ClassScopeHandler;
  declare prodParam: ProductionParameterHandler;
  declare expressionScope: ExpressionScopeHandler;
  declare plugins: PluginsMap;
  declare filename: ?string;
  sawUnambiguousESM: boolean = false;
  ambiguousScriptDifferentAst: boolean = false;

  // Initialized by Tokenizer
  declare state: State;
  // input and length are not in state as they are constant and we do
  // not want to ever copy them, which happens if state gets cloned
  declare input: string;
  declare length: number;

  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  getPluginOption(plugin: string, name: string) {
    // $FlowIssue
    if (this.hasPlugin(plugin)) return this.plugins.get(plugin)[name];
  }
}

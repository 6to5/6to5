import includes from "lodash/includes";
import runner from "babel-helper-transform-fixture-test-runner";

runner(
  `${__dirname}/fixtures/traceur`,
  "traceur",
  {
    ignoreSuites: [
      // weird environmental issue make these hard to test
      "Modules",

      // uses the old async generator proposal
      "AsyncGenerators",
    ],

    ignoreTasks: [
      // Node 0.10 doesn't like these due to either V8 bugs or lack of core-js functionality
      "Symbol/Object",
      "Symbol/ObjectModel",
      "Symbol/GetOwnPropertySymbols",

      // TODO
      "Yield/GeneratorSend",
      "Yield/BreakForOf",
      "Yield/GeneratorThrow",
      "Yield/ObjectModel",
      "Yield/ReturnGenerator",

      // yield as an identifier
      "Yield/YieldIdentifier",
      "Syntax/StrictKeywords",
      "Syntax/IsValidSimpleAssignmentTarget",

      // TODO: core-js fails these
      "Collections/Map",
      "Collections/Set",
      "ArrayExtras/From",
      "ArrayExtras/FindIndex",
      "ArrayExtras/Find",
      "StringExtras/Includes",
      "StringExtras/EndsWith",

      // this tests pollutes Object.prototype which messes things up
      "StringExtras/StartsWith",

      // babel has no way to check these :( TODO: add to caveats
      "TemplateLiterals/TemplateObjectCaching.module",

      // babel does function/class name inference which these tests don't take into consideration
      "Classes/ClassNameBinding",
      "PropertyMethodAssignment/PropertyMethodAssignment",

      // TODO: investigate
      "Classes/ExtendStrange",
      "Math/fround.module",

      // these are the responsibility of core-js
      "Spread/Type",
      "Spread/NoIterator",
      "Destructuring/Rest",
      "Destructuring/Empty",

      // babel doesn't like non-closing comments :)
      "Syntax/NoNewLineHereEndOfFile",

      // TODO
      "Classes/PrototypeDescriptor",

      // Babel assumes that all code transformed is a module so this isn't necessary
      "Strict",
      "Syntax/UseStrictEscapeSequence",
      "Syntax/UseStrictLineContinuation",
      "ObjectInitializerShorthand/StrictKeyword",

      // experimental es7 - the spec hasn't been finalized yet
      // these both fail because of filters between blocks
      "ArrayComprehension/Simple",
      "GeneratorComprehension/Simple",

      // TODO
      "Syntax/StrictKeywordsInPattern",
    ],
  },
  {},
  function(opts, task) {
    if (includes(task.exec.loc, "module.js")) {
      opts.plugins.push("transform-es2015-modules-commonjs");
    } else {
      opts.sourceType = "script";
    }
  },
);

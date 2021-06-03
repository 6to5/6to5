"use strict";

const babelP = import("./lib/index.js");

proxy("createConfigItem");
proxy("loadPartialConfig");
proxy("loadOptions");
proxy("transform");
proxy("transformFile");
proxy("transformFromAst");
proxy("parse");

function proxy(name) {
  exports[`${name}Sync`] = () => {
    throw new Error(
      "Only async methods are supported when using `require()` to load `@babel/core`."
    );
  };
  exports[`${name}Async`] = (...args) =>
    babelP.then(babel => babel[`${name}Async`](...args));
  exports[name] = (...args) => {
    const cb = args.pop();
    babelP.then(babel => babel[name](...args, cb), cb);
  };
}

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of the React source tree.
 */

const scriptTypes = ["text/jsx", "text/babel"];

let headEl;
let inlineScriptCount = 0;

/**
 * Actually transform the code.
 */
function transformCode(transformFn, script) {
  let source;
  if (script.url != null) {
    source = script.url;
  } else {
    source = "Inline Babel script";
    inlineScriptCount++;
    if (inlineScriptCount > 1) {
      source += " (" + inlineScriptCount + ")";
    }
  }

  return transformFn(script.content, buildBabelOptions(script, source)).code;
}

/**
 * Builds the Babel options for transforming the specified script, using some
 * sensible default presets and plugins if none were explicitly provided.
 */
function buildBabelOptions(script, filename) {
  let presets = script.presets;
  if (!presets) {
    if (script.type === "module") {
      presets = [
        "react",
        [
          "env",
          {
            targets: {
              esmodules: true,
            },
            modules: false,
          },
        ],
      ];
    } else {
      presets = ["react", "env"];
    }
  }

  return {
    filename,
    presets,
    plugins: script.plugins || [
      "proposal-class-properties",
      "proposal-object-rest-spread",
      "transform-flow-strip-types",
    ],
    sourceMaps: "inline",
    sourceFilename: filename,
  };
}

/**
 * Appends a script element at the end of the <head> with the content of code,
 * after transforming it.
 */
function run(transformFn, script) {
  const scriptEl = document.createElement("script");
  if (script.type) {
    scriptEl.setAttribute("type", script.type);
  }
  scriptEl.text = transformCode(transformFn, script);
  headEl.appendChild(scriptEl);
}

/**
 * Load script from the provided url and pass the content to the callback.
 */
function load(url, successCallback, errorCallback) {
  const xhr = new XMLHttpRequest();

  // async, however scripts will be executed in the order they are in the
  // DOM to mirror normal script loading.
  xhr.open("GET", url, true);
  if ("overrideMimeType" in xhr) {
    xhr.overrideMimeType("text/plain");
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 0 || xhr.status === 200) {
        successCallback(xhr.responseText);
      } else {
        errorCallback();
        throw new Error("Could not load " + url);
      }
    }
  };
  return xhr.send(null);
}

/**
 * Converts a comma-separated data attribute string into an array of values. If
 * the string is empty, returns an empty array. If the string is not defined,
 * returns null.
 */
function getPluginsOrPresetsFromScript(script, attributeName) {
  const rawValue = script.getAttribute(attributeName);
  if (rawValue === "") {
    // Empty string means to not load ANY presets or plugins
    return [];
  }
  if (!rawValue) {
    // Any other falsy value (null, undefined) means we're not overriding this
    // setting, and should use the default.
    return null;
  }
  return rawValue.split(",").map(item => item.trim());
}

/**
 * Loop over provided script tags and get the content, via innerHTML if an
 * inline script, or by using XHR. Transforms are applied if needed. The scripts
 * are executed in the order they are found on the page.
 */
function loadScripts(transformFn, scripts) {
  const result = [];
  const count = scripts.length;

  function check() {
    let script, i;

    for (i = 0; i < count; i++) {
      script = result[i];

      if (script.loaded && !script.executed) {
        script.executed = true;
        run(transformFn, script);
      } else if (!script.loaded && !script.error && !script.async) {
        break;
      }
    }
  }

  scripts.forEach((script, i) => {
    const scriptData = {
      // script.async is always true for non-JavaScript script tags
      async: script.hasAttribute("async"),
      type: script.getAttribute("data-type"),
      error: false,
      executed: false,
      plugins: getPluginsOrPresetsFromScript(script, "data-plugins"),
      presets: getPluginsOrPresetsFromScript(script, "data-presets"),
    };

    if (script.src) {
      result[i] = {
        ...scriptData,
        content: null,
        loaded: false,
        url: script.src,
      };

      load(
        script.src,
        content => {
          result[i].loaded = true;
          result[i].content = content;
          check();
        },
        () => {
          result[i].error = true;
          check();
        },
      );
    } else {
      result[i] = {
        ...scriptData,
        content: script.innerHTML,
        loaded: true,
        url: script.getAttribute("data-module") || null,
      };
    }
  });

  check();
}

/**
 * Run script tags with type="text/jsx".
 * @param {Array} scriptTags specify script tags to run, run all in the <head> if not given
 */
export function runScripts(transformFn, scripts) {
  headEl = document.getElementsByTagName("head")[0];
  if (!scripts) {
    scripts = document.getElementsByTagName("script");
  }

  // Array.prototype.slice cannot be used on NodeList on IE8
  const jsxScripts = [];
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts.item(i);
    // Support the old type="text/jsx;harmony=true"
    const type = script.type.split(";")[0];
    if (scriptTypes.indexOf(type) !== -1) {
      jsxScripts.push(script);
    }
  }

  if (jsxScripts.length === 0) {
    return;
  }

  console.warn(
    "You are using the in-browser Babel transformer. Be sure to precompile " +
      "your scripts for production - https://babeljs.io/docs/setup/",
  );

  loadScripts(transformFn, jsxScripts);
}

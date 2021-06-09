import { isAsync, waitFor } from "../../gensync-utils/async";
import type { Handler } from "gensync";
import path from "path";
import { pathToFileURL } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export default function* loadCjsOrMjsDefault(
  filepath: string,
  asyncError: string,
  // TODO(Babel 8): Remove this
  fallbackToTranspiledModule: boolean = false,
): Handler<unknown> {
  switch (guessJSModuleType(filepath)) {
    case "cjs":
      return loadCjsDefault(filepath, fallbackToTranspiledModule);
    case "unknown":
      try {
        return loadCjsDefault(filepath, fallbackToTranspiledModule);
      } catch (e) {
        if (e.code !== "ERR_REQUIRE_ESM") throw e;
      }
    // fall through
    case "mjs":
      if (yield* isAsync()) {
        return yield* waitFor(loadMjsDefault(filepath));
      }
      throw new Error(asyncError);
  }
}

function guessJSModuleType(filename: string): "cjs" | "mjs" | "unknown" {
  switch (path.extname(filename)) {
    case ".cjs":
      return "cjs";
    case ".mjs":
      return "mjs";
    default:
      return "unknown";
  }
}

function loadCjsDefault(filepath: string, fallbackToTranspiledModule: boolean) {
  const module = require(filepath) as any;
  return module?.__esModule
    ? // TODO (Babel 8): Remove "module" and "undefined" fallback
      module.default || (fallbackToTranspiledModule ? module : undefined)
    : module;
}

async function loadMjsDefault(filepath: string) {
  // import() expects URLs, not file paths.
  // https://github.com/nodejs/node/issues/31710
  const module = await import(pathToFileURL(filepath).href);
  return module.default;
}

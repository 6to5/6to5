import { isAsync, waitFor } from "../../gensync-utils/async";
import type { Handler } from "gensync";
import path from "path";
import { pathToFileURL } from "url";

import { endHiddenCallStack } from "../../errors/rewrite-stack-trace";
import ConfigError from "../../errors/config-error";

let import_;
try {
  // Node < 13.3 doesn't support import() syntax.
  import_ = require("./import").default;
} catch {}

export default function* loadCjsOrMjsDefault(
  filepath: string,
  asyncError: string,
): Handler<mixed> {
  switch (guessJSModuleType(filepath)) {
    case "cjs":
      return loadCjsDefault(filepath);
    case "unknown":
      try {
        return loadCjsDefault(filepath);
      } catch (e) {
        if (e.code !== "ERR_REQUIRE_ESM") throw e;
      }
    // fall through
    case "mjs":
      if (yield* isAsync()) {
        return yield* waitFor(loadMjsDefault(filepath));
      }
      throw new ConfigError(asyncError);
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

function loadCjsDefault(filepath: string) {
  const module = (endHiddenCallStack(require)(filepath): mixed);
  // TODO (Babel 8): Remove "undefined" fallback
  return module?.__esModule ? module.default || undefined : module;
}

async function loadMjsDefault(filepath: string) {
  if (!import_) {
    throw new ConfigError(
      "Internal error: Native ECMAScript modules aren't supported" +
        " by this platform.\n",
      filepath,
    );
  }

  // import() expects URLs, not file paths.
  // https://github.com/nodejs/node/issues/31710
  const module = await endHiddenCallStack(import_)(pathToFileURL(filepath));
  return module.default;
}

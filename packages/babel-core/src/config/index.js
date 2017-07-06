// @flow

import type Plugin from "./plugin";
import manageOptions from "./option-manager";

export type ResolvedConfig = {
  options: Object,
  plugins: Array<[Plugin, ?{}]>,
};

/**
 * Standard API for loading Babel configuration data. Not for public consumption.
 */
export default function loadConfig(opts: mixed): ResolvedConfig | null {
  if (opts != null && typeof opts !== "object") {
    throw new Error("Babel options must be an object, null, or undefined");
  }

  return manageOptions(opts || {});
}

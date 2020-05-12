// @flow

import path from "path";
import type { Handler } from "gensync";
import { makeStaticFileCache } from "./utils";

import type { ConfigFile, FilePackageData } from "./types";

import ConfigError from "../../errors/config-error";

const PACKAGE_FILENAME = "package.json";

/**
 * Find metadata about the package that this file is inside of. Resolution
 * of Babel's config requires general package information to decide when to
 * search for .babelrc files
 */
export function* findPackageData(filepath: string): Handler<FilePackageData> {
  let pkg = null;
  const directories = [];
  let isPackage = true;

  let dirname = path.dirname(filepath);
  while (!pkg && path.basename(dirname) !== "node_modules") {
    directories.push(dirname);

    pkg = yield* readConfigPackage(path.join(dirname, PACKAGE_FILENAME));

    const nextLoc = path.dirname(dirname);
    if (dirname === nextLoc) {
      isPackage = false;
      break;
    }
    dirname = nextLoc;
  }

  return { filepath, directories, pkg, isPackage };
}

const readConfigPackage = makeStaticFileCache(
  (filepath, content): ConfigFile => {
    let options;
    try {
      options = JSON.parse(content);
    } catch (err) {
      throw new ConfigError(
        `Error while parsing JSON - ${err.message}`,
        filepath,
      );
    }

    if (typeof options !== "object") {
      throw new ConfigError(
        `Config returned typeof ${typeof options}`,
        filepath,
      );
    }
    if (Array.isArray(options)) {
      throw new ConfigError(`Expected config object but found array`, filepath);
    }

    return {
      filepath,
      dirname: path.dirname(filepath),
      options,
    };
  },
);

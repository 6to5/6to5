// @flow

import semver from "semver";
import { minVersions } from "./available-plugins";

// $FlowIgnore
const has = Function.call.bind(Object.hasOwnProperty);

export function removeUnnecessaryItems(
  items: Set<string>,
  overlapping: { [name: string]: string[] },
) {
  items.forEach(item => {
    overlapping[item]?.forEach(name => items.delete(name));
  });
}
export function removeUnsupportedItems(
  items: Set<string>,
  babelVersion: string,
) {
  items.forEach(item => {
    if (has(minVersions, item) && semver.lt(babelVersion, minVersions[item])) {
      items.delete(item);
    }
  });
}

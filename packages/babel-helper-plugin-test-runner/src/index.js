import testRunner from "babel-helper-transform-fixture-test-runner";
import path from "path";

export default function(loc) {
  const name = path.basename(path.dirname(loc));
  testRunner(loc + "/fixtures", name);
}

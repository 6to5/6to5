import testRunner from "@babel/helper-transform-fixture-test-runner";
import path from "path";
import { URL } from "url";

export default function (loc) {
  if (!process.env.BABEL_8_BREAKING) {
    if (!loc.startsWith("file://")) {
      const name = path.basename(path.dirname(loc));
      testRunner(loc + "/fixtures", name);
      return;
    }
  }

  let fixtures = new URL("./fixtures", loc).pathname;
  if (process.platform === "win32") {
    // Remove the leading / before the drive letter
    // TODO: After dropping Node.js 10 support, use fileURLToPath
    fixtures = fixtures.slice(1);
  }

  const name = path.basename(new URL("..", loc).pathname);

  testRunner(fixtures, name);
}

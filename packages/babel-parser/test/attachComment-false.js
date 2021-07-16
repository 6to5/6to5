import path from "path";
import { runFixtureTestsWithoutExactASTMatch } from "./helpers/runFixtureTests";
import { parseExpression } from "../lib";
import { fileURLToPath } from "url";

runFixtureTestsWithoutExactASTMatch(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "expressions"),
  (input, options = {}) => {
    options.attachComment = false;
    return parseExpression(input, options);
  },
);

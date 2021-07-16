import Benchmark from "benchmark";
import baseline from "@babel/helper-validator-identifier-baseline";
import current from "../lib/index.js";
import { report } from "./util.mjs";

const suite = new Benchmark.Suite();

function benchCases(implementation, name) {
  const { isIdentifierName } = implementation;
  suite.add(name + "#isIdentifierName on 2 short ASCII words", () => {
    isIdentifierName("aforementioned");
    isIdentifierName("zap cannon");
  });

  suite.add(name + "#isIdentifierName on 1 long ASCII words", () => {
    isIdentifierName("Pneumonoultramicroscopicsilicovolcanoconiosis");
  });

  suite.add(name + "#isIdentifierName on 3 non-ASCII words", () => {
    isIdentifierName("مذكور أعلاه");
    isIdentifierName("cañón de zap");
    isIdentifierName("𠡦𠧋𡆠囝〇𠁈𢘑𤯔𠀑埊");
  });
}

benchCases(baseline, "baseline");
benchCases(current, "current");

suite.on("cycle", report).run();

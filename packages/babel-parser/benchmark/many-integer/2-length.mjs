import Benchmark from "benchmark";
import baseline from "@babel-baseline/parser";
import current from "../../lib/index.js";
import { report } from "../util.mjs";

const suite = new Benchmark.Suite();
function createInput(length) {
  return "10;21;32;43;56;67;78;89;".repeat(length / 8);
}
function benchCases(name, implementation, options) {
  for (const length of [64, 128, 256, 512, 1024]) {
    const input = createInput(length);
    const { parse } = implementation;
    suite.add(`${name} ${length} 2-length numeric literals`, () => {
      parse(input, options);
    });
  }
}

benchCases("baseline", baseline);
benchCases("current", current);

suite.on("cycle", report).run();

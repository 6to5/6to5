import Benchmark from "benchmark";
import baseline from "@babel-baseline/parser";
import current from "../../lib/index.js";
import { report } from "../util.mjs";

const suite = new Benchmark.Suite();
function createInput(length) {
  return "0;1;2;3;6;7;8;9;".repeat(length / 8);
}
function benchCases(name, implementation, options) {
  for (const length of [64, 128, 256, 512, 1024]) {
    const input = createInput(length);
    const { parse } = implementation;
    suite.add(`${name} ${length} 1-length numeric literals`, () => {
      parse(input, options);
    });
  }
}

benchCases("baseline", baseline);
benchCases("current", current);

suite.on("cycle", report).run();

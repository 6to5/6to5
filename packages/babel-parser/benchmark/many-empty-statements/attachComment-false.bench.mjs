import Benchmark from "benchmark";
import baseline from "@babel-baseline/parser";
import current from "../../lib/index.js";
import { report } from "../util.mjs";

const suite = new Benchmark.Suite();

function benchCases(name, implementation, options) {
  for (const length of [256, 512, 1024, 2048]) {
    const input = ";".repeat(length);
    suite.add(`${name} ${length} empty statement`, () => {
      implementation.parse(input, options);
    });
  }
}

benchCases("baseline", baseline, { attachComment: true });
benchCases("current + attachComment: false", current, { attachComment: false });

suite.on("cycle", report).run();

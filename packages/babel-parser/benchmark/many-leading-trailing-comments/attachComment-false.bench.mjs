import Benchmark from "benchmark";
import baseline from "@babel-baseline/parser";
import current from "../../lib/index.js";
import { report } from "../util.mjs";

const suite = new Benchmark.Suite();

function createInput(length) {
  return "\n// c\na".repeat(length);
}

function benchCases(name, implementation, options) {
  for (const length of [256, 512, 1024, 2048]) {
    const input = createInput(length);
    const { parse } = implementation;
    suite.add(
      `${name} ${length} leading comments + ${length - 1} trailing comments`,
      () => {
        parse(input, options);
      }
    );
  }
}

benchCases("baseline", baseline, { attachComment: true });
benchCases("current + attachComment: false", current, { attachComment: false });

suite.on("cycle", report).run();

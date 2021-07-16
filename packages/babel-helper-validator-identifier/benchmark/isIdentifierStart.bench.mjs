import Benchmark from "benchmark";
import baseline from "@babel/helper-validator-identifier-baseline";
import current from "../lib/index.js";
import { report } from "./util.mjs";

const suite = new Benchmark.Suite();

function benchCases(implementation, name) {
  const { isIdentifierStart } = implementation;
  suite.add(name + "#isIdentifierStart on 4 ASCII characters", () => {
    isIdentifierStart(0x61);
    isIdentifierStart(0x7b);
    isIdentifierStart(0x5f);
    isIdentifierStart(0x24);
  });

  suite.add(name + "#isIdentifierStart on 4 non-ASCII characters", () => {
    isIdentifierStart(0x80);
    isIdentifierStart(0x0800);
    isIdentifierStart(0x4e00);
    isIdentifierStart(0xffff);
  });

  suite.add(name + "#isIdentifierStart on 2 Astral characters", () => {
    isIdentifierStart(0x10000);
    isIdentifierStart(0x30000);
  });
}

benchCases(baseline, "baseline");
benchCases(current, "current");

suite.on("cycle", report).run();

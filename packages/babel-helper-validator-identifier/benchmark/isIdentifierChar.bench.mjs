import Benchmark from "benchmark";
import baseline from "@babel/helper-validator-identifier-baseline";
import current from "../lib/index.js";
import { report } from "./util.mjs";

const suite = new Benchmark.Suite();

function benchCases(implementation, name) {
  const { isIdentifierChar } = implementation;
  suite.add(name + "#isIdentifierChar on 4 ASCII characters", () => {
    isIdentifierChar(0x61);
    isIdentifierChar(0x7b);
    isIdentifierChar(0x5f);
    isIdentifierChar(0x24);
  });

  suite.add(name + "#isIdentifierChar on 4 non-ASCII characters", () => {
    isIdentifierChar(0x80);
    isIdentifierChar(0x0800);
    isIdentifierChar(0x4e00);
    isIdentifierChar(0xffff);
  });

  suite.add(name + "#isIdentifierChar on 2 Astral characters", () => {
    isIdentifierChar(0x10000);
    isIdentifierChar(0x30000);
  });
}

benchCases(baseline, "baseline");
benchCases(current, "current");

suite.on("cycle", report).run();

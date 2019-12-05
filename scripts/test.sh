#!/bin/bash
set -e

node="node"
jestArgs=()

if [ "$TEST_DEBUG" ]; then
  node="node --inspect-brk"
  jestArgs+=("--runInBand")
fi

if [ -n "$CI" ]; then
  jestArgs+=("--maxWorkers=4")
  jestArgs+=("--ci")
fi

if [ -n "$TEST_GREP" ]; then
  jestArgs+=("-t")
  jestArgs+=("$TEST_GREP")
fi

if [ -n "$TEST_ONLY" ]; then
  jestArgs+=("(packages|codemods|eslint)/.*$TEST_ONLY.*/test")
fi

if [ -n "$TEST_WATCH" ]; then
  jestArgs+=("--watch")
fi

$node node_modules/jest/bin/jest.js "${jestArgs[@]}"

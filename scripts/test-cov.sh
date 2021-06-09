#!/bin/bash
set -e

node="yarn node --experimental-vm-modules"
jestArgs="--coverage"

if [ -n "$CI" ]; then
  jestArgs="${jestArgs} --maxWorkers=4 --ci"
fi

$node "$(yarn bin jest)" $jestArgs

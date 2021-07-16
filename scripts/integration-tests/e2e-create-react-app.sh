#!/bin/bash

#==============================================================================#
#                                  SETUP                                       #
#==============================================================================#

# Start in scripts/integration-tests/ even if run from root directory
cd "$(dirname "$0")" || exit

source utils/local-registry.sh
source utils/cleanup.sh

# Echo every command being executed
set -x

# Clone create-react-app
git clone --depth=1 https://github.com/facebook/create-react-app.git tmp/create-react-app
cd tmp/create-react-app || exit

#==============================================================================#
#                                   TEST                                       #
#==============================================================================#

# !!! WARNING !!!
# create-react-app uses the useBuiltIns: true option of @babel/preset-react,
# removed in Babel 8.0.0. And it does not specify runtime option. The test will break on
# runtime: "automatic", default of Babel 8.
# This change replaces useBuiltIns: true with runtime: "classic"
sed -i 's/useBuiltIns: true/runtime: "classic"/' packages/babel-preset-react-app/create.js

# create-react-app throws if `@babel/eslint-parser` is not pinned, but we
# must upgrade it for test purposes
sed -i "s/'@babel\/eslint-parser',/" packages/react-scripts/scripts/utils/verifyPackageTree.js

bump_deps="$PWD/../../utils/bump-babel-dependencies.js"
node "$bump_deps"
for d in ./packages/*/
do
  (cd "$d"; node "$bump_deps")
done

# Don't use Yarn 2
export YARN_IGNORE_PATH=1

startLocalRegistry "$PWD"/../../verdaccio-config.yml
yarn install

# Test
CI=true yarn test

unset YARN_IGNORE_PATH
cleanup

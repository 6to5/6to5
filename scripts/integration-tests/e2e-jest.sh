#!/bin/bash

#==============================================================================#
#                                  SETUP                                       #
#==============================================================================#

# Start in scripts/integration-tests/ even if run from root directory
cd "$(dirname "$0")" || exit
root="$PWD"

source utils/local-registry.sh
source utils/cleanup.sh

# Echo every command being executed
set -x

# Clone jest
git clone --depth=1 https://github.com/facebook/jest /tmp/jest
cd /tmp/jest || exit

# Update @babel/* dependencies
bump_deps="$root/utils/bump-babel-dependencies.js"
node "$bump_deps"
for d in ./packages/*/
do
  (cd "$d"; node "$bump_deps")
done

#==============================================================================#
#                                 ENVIRONMENT                                  #
#==============================================================================#
node -v
yarn --version
python --version

#==============================================================================#
#                                   TEST                                       #
#==============================================================================#

startLocalRegistry "$root"/verdaccio-config.yml
yarn install
yarn dedupe '@babel/*'

if [ "$BABEL_8_BREAKING" = true ] ; then
  # This option is removed in Babel 8
  sed -i 's/allowDeclareFields: true,\?/\/* allowDeclareFields: true *\//g' babel.config.js

  # Jest depends on @types/babel__traverse for Babel 7, and they contain the removed Noop node
  sed -i 's/t.Noop/any/g' node_modules/@types/babel__traverse/index.d.ts

  node -e "
    var pkg = require('./package.json');
    pkg.resolutions || (pkg.resolutions = {});
    pkg.resolutions['@types/babel__traverse/@babel/types'] = 'latest';
    fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  "
fi

yarn build

# The full test suite takes about 20mins on CircleCI. We run only a few of them
# to speed it up.
# The goals of this e2e test are:
#   1) Check that the typescript compilation isn't completely broken
#   2) Make sure that we don't accidentally break jest's usage of the Babel API
CI=true yarn test-ci-partial packages
CI=true yarn test-ci-partial e2e/__tests__/babel
CI=true yarn test-ci-partial e2e/__tests__/transform

cleanup

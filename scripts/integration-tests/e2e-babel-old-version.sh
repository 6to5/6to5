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

# Go to the root of the monorepo
cd ../..

#==============================================================================#
#                                   TEST                                       #
#==============================================================================#

startLocalRegistry "$PWD"/scripts/integration-tests/verdaccio-config.yml

node "$PWD"/scripts/integration-tests/utils/bump-babel-dependencies.js

(
  # Yarn prints colors on GH actions even if it's piped, unless explicitly disabled
  # https://github.com/yarnpkg/berry/pull/659
  YARN_ENABLE_COLORS=0 yarn why @babel/core | grep -o "@babel/core@npm:.* (via npm:.*)";
  YARN_ENABLE_COLORS=0 yarn why @babel/helpers | grep -o "@babel/helpers@npm:.* (via npm:.*)";
  YARN_ENABLE_COLORS=0 yarn why @babel/traverse | grep -o "@babel/traverse@npm:.* (via npm:.*)"
) | uniq | node -e "
  var pkg = require('./package.json');
  var packages = fs.readFileSync(0, 'utf8').trim().split('\n');

  pkg.devDependencies['@babel/core'] = '7.0.0';

  packages.forEach(desc => {
    const { name, specifier } = desc
      .match(/(?<name>@babel\/[a-z]+).*\(via (?<specifier>npm:[^)]+)\)/)
      .groups;
    pkg.resolutions[name + '@' + specifier] = '7.0.0';
  });

  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# Older @babel/core versions don't support "targets" and "assumptions"
# Let's just remove them when running this e2e test.
node -e "
  var config = fs.readFileSync('./babel.config.js', 'utf8')
    .replace(/assumptions,/, '')
    .replace(/targets,/g, '')
    .replace(/assumptions,/g, '')
    .replace(/assumptions:[^,]*,/g, '')
    .replace(/(?<=envOpts\s+=\s+\{)/, 'targets: { node: \'6.9\' },');
  fs.writeFileSync('./babel.config.js', config);
"

# https://github.com/babel/babel/pull/12331 - This test is fixed in @babel/traverse 7.12.7,
# so it will fail with older versions. We can disable it.
(cd packages/babel-plugin-transform-modules-systemjs/test/fixtures/regression/; mv issue-12329 .issue-12329)

# Update deps, build and test
rm yarn.lock
YARN_ENABLE_IMMUTABLE_INSTALLS=false make -j test-ci

cleanup

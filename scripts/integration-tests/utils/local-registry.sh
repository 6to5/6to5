#!/bin/bash

# Copied from https://github.com/facebook/create-react-app/blob/053f9774d3f592c17741d2a86de66a7ca58f90c0/tasks/local-registry.sh

custom_registry_url=http://localhost:4873
default_verdaccio_package=verdaccio@~4.11.1

function startLocalRegistry {
  # Start local registry
  tmp_registry_log=`mktemp`
  echo "Registry output file: $tmp_registry_log"
  (cd && nohup npx ${VERDACCIO_PACKAGE:-$default_verdaccio_package} -c $1 &>$tmp_registry_log &)
  npm install --global verdaccio-memory@~9.7.2
  # Wait for Verdaccio to boot
  grep -q "http address" <(tail -f $tmp_registry_log)

  # Set registry to local registry
  export NPM_CONFIG_REGISTRY="$custom_registry_url"
  export YARN_NPM_PUBLISH_REGISTRY="$custom_registry_url"
  export YARN_NPM_REGISTRY_SERVER="$custom_registry_url"
  export YARN_NPM_AUTH_IDENT="username:password"
  export YARN_UNSAFE_HTTP_WHITELIST="localhost"
}

function loginLocalRegistry {
  export YARN_NPM_AUTH_IDENT="username:password"
}

function stopLocalRegistry {
  # Restore the original NPM and Yarn registry URLs and stop Verdaccio
  fuser -k 4873/tcp
  unset NPM_CONFIG_REGISTRY
  unset YARN_NPM_PUBLISH_REGISTRY
  unset YARN_NPM_REGISTRY_SERVER
}

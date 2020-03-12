FLOW_COMMIT = a1f9a4c709dcebb27a5084acf47755fbae699c25
TEST262_COMMIT = 28b4fcca4b1b1d278dfe0cc0e69c7d9d59b31aab
TYPESCRIPT_COMMIT = 5fc917be2e4dd64c8e9504d36615cd7fbfdd4cd3

FORCE_PUBLISH = "@babel/runtime,@babel/runtime-corejs2,@babel/runtime-corejs3,@babel/standalone"

# Fix color output until TravisCI fixes https://github.com/travis-ci/travis-ci/issues/7967
export FORCE_COLOR = true

SOURCES = packages codemods eslint

COMMA := ,
EMPTY :=
SPACE := $(EMPTY) $(EMPTY)
COMMA_SEPARATED_SOURCES = $(subst $(SPACE),$(COMMA),$(SOURCES))

YARN := yarn --silent
NODE := $(YARN) node


.PHONY: build build-dist watch lint fix clean test-clean test-only test test-ci publish bootstrap

build: build-bundle
ifneq ("$(BABEL_COVERAGE)", "true")
	$(MAKE) build-standalone
endif

build-bundle: clean clean-lib
	$(YARN) gulp build
	$(MAKE) generate-standalone generate-type-helpers
	# call build again as the generated files might need to be compiled again.
	$(YARN) gulp build
	$(MAKE) build-typings
	$(MAKE) build-dist

build-bundle-ci: bootstrap-only
	$(MAKE) build-bundle

generate-standalone:
	$(NODE) packages/babel-standalone/scripts/generate.js

generate-type-helpers:
	$(NODE) packages/babel-types/scripts/generateTypeHelpers.js

build-typings: build-flow-typings build-typescript-typings

build-flow-typings:
	mkdir -p packages/babel-core/lib packages/babel-generator/lib packages/babel-parser/lib packages/babel-template/lib packages/babel-traverse/lib packages/babel-types/lib
	cp packages/babel-core/index.flow.js packages/babel-core/lib/index.js.flow
	cp packages/babel-generator/index.flow.js packages/babel-generator/lib/index.js.flow
	cp packages/babel-parser/index.flow.js packages/babel-parser/lib/index.js.flow
	cp packages/babel-template/index.flow.js packages/babel-template/lib/index.js.flow
	$(NODE) packages/babel-traverse/scripts/flow.js > packages/babel-traverse/lib/index.js.flow
	$(NODE) packages/babel-types/scripts/generators/flow.js > packages/babel-types/lib/index.js.flow

build-typescript-typings:
	$(NODE) packages/babel-types/scripts/generators/typescript.js > packages/babel-types/lib/index.d.ts

build-standalone: build-babel-standalone

build-standalone-ci: build-bundle-ci
	$(MAKE) build-standalone

build-babel-standalone:
	$(YARN) gulp build-babel-standalone

prepublish-build-standalone:
	BABEL_ENV=production IS_PUBLISH=true $(YARN) gulp build-babel-standalone

build-dist: build-polyfill-dist build-plugin-transform-runtime-dist

build-polyfill-dist:
	cd packages/babel-polyfill; \
	scripts/build-dist.sh

build-plugin-transform-runtime-dist:
	cd packages/babel-plugin-transform-runtime; \
	$(NODE) scripts/build-dist.js

build-no-bundle: clean clean-lib
	BABEL_ENV=development $(YARN) gulp build-no-bundle
	# Ensure that build artifacts for types are created during local
	# development too.
	$(MAKE) generate-type-helpers
	$(MAKE) build-typings

watch: build-no-bundle
	BABEL_ENV=development $(YARN) gulp watch

code-quality-ci: flowcheck-ci lint-ci

flowcheck-ci: bootstrap-flowcheck
	$(MAKE) flow

code-quality: flow lint

flow:
	$(YARN) flow check --strip-root

bootstrap-flowcheck: bootstrap-only
	$(YARN) gulp build-babel-types
	$(MAKE) build-typings

lint-ci: lint-js-ci lint-ts-ci check-compat-data-ci

lint-js-ci: bootstrap-only
	$(MAKE) lint-js

lint-ts-ci: bootstrap-flowcheck
	$(MAKE) lint-ts

check-compat-data-ci: bootstrap-only
	$(MAKE) check-compat-data

lint: lint-js lint-ts

lint-js:
	BABEL_ENV=test $(YARN) eslint scripts $(SOURCES) '*.js' --format=codeframe

lint-ts:
	scripts/lint-ts-typings.sh

fix: fix-json fix-js

fix-js:
	$(YARN) eslint scripts $(SOURCES) '*.js' --format=codeframe --fix

fix-json:
	$(YARN) prettier "{$(COMMA_SEPARATED_SOURCES)}/*/test/fixtures/**/options.json" --write --loglevel warn

check-compat-data:
	cd packages/babel-compat-data; CHECK_COMPAT_DATA=true $(YARN) run build-data

build-compat-data:
	cd packages/babel-compat-data; $(YARN) run build-data

clean: test-clean
	rm -f .npmrc
	rm -rf packages/babel-polyfill/browser*
	rm -rf packages/babel-polyfill/dist
	rm -rf coverage
	rm -rf packages/*/npm-debug*

test-clean:
	$(foreach source, $(SOURCES), \
		$(call clean-source-test, $(source)))

# Does not work on Windows; use "$(YARN) jest" instead
test-only:
	BABEL_ENV=test ./scripts/test.sh
	$(MAKE) test-clean

test: lint test-only

test-ci: jest-ci

jest-ci: build-standalone-ci
	BABEL_ENV=test $(YARN) jest --maxWorkers=4 --ci
	$(MAKE) test-clean

# Does not work on Windows
test-ci-coverage: SHELL:=/bin/bash
test-ci-coverage:
	BABEL_COVERAGE=true BABEL_ENV=test $(MAKE) bootstrap
	BABEL_ENV=test TEST_TYPE=cov ./scripts/test-cov.sh
	bash <(curl -s https://codecov.io/bash) -f coverage/coverage-final.json

bootstrap-flow:
	rm -rf build/flow
	mkdir -p build
	git clone --branch=master --single-branch --shallow-since=2018-11-01 https://github.com/facebook/flow.git build/flow
	cd build/flow && git checkout $(FLOW_COMMIT)

test-flow:
	$(NODE) scripts/parser-tests/flow

test-flow-ci: build-bundle-ci bootstrap-flow
	$(MAKE) test-flow

test-flow-update-whitelist:
	$(NODE) scripts/parser-tests/flow --update-whitelist

bootstrap-typescript:
	rm -rf ./build/typescript
	mkdir -p ./build
	git clone --branch=master --single-branch --shallow-since=2019-09-01 https://github.com/microsoft/TypeScript.git ./build/typescript
	cd build/typescript && git checkout $(TYPESCRIPT_COMMIT)

test-typescript:
	$(NODE) scripts/parser-tests/typescript

test-typescript-ci: build-bundle-ci bootstrap-typescript
	$(MAKE) test-typescript

test-typescript-update-whitelist:
	$(NODE) scripts/parser-tests/typescript --update-whitelist

bootstrap-test262:
	rm -rf build/test262
	mkdir -p build
	git clone --branch=master --single-branch --shallow-since=2019-12-01 https://github.com/tc39/test262.git build/test262
	cd build/test262 && git checkout $(TEST262_COMMIT)

test-test262:
	$(NODE) scripts/parser-tests/test262

test-test262-ci: build-bundle-ci bootstrap-test262
	$(MAKE) test-test262

test-test262-update-whitelist:
	$(NODE) scripts/parser-tests/test262 --update-whitelist

# Does not work on Windows
clone-license:
	./scripts/clone-license.sh

prepublish-build: clean-lib clean-runtime-helpers
	NODE_ENV=production BABEL_ENV=production $(MAKE) build
	$(MAKE) clone-license

prepublish:
	$(MAKE) bootstrap-only
	$(MAKE) prepublish-build
	IS_PUBLISH=true $(MAKE) test

new-version:
	git pull --rebase
	$(YARN) lerna version --force-publish=$(FORCE_PUBLISH)

# NOTE: Run make new-version first
publish: prepublish
	$(YARN) lerna publish from-git
	$(MAKE) clean

publish-ci: prepublish
ifneq ("$(NPM_TOKEN)", "")
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
else
	echo "Missing NPM_TOKEN env var"
	exit 1
endif
	$(YARN) lerna publish from-git --yes
	rm -f .npmrc
	$(MAKE) clean

publish-test:
ifneq ("$(I_AM_USING_VERDACCIO)", "I_AM_SURE")
	echo "You probably don't know what you are doing"
	exit 1
endif
	$(MAKE) prepublish-build
	$(YARN) lerna version patch --force-publish=$(FORCE_PUBLISH)  --no-push --yes --tag-version-prefix="version-e2e-test-"
	$(YARN) lerna publish from-git --registry http://localhost:4873 --yes --tag-version-prefix="version-e2e-test-"
	$(MAKE) clean

publish-eslint:
	$(call set-json-field, ./eslint/$(PKG)/package.json, private, false)
	cd eslint/$(PKG); yarn publish
	$(call set-json-field, ./eslint/$(PKG)/package.json, private, true)

bootstrap-only: lerna-bootstrap

yarn-install: clean-all
	yarn --ignore-engines

lerna-bootstrap: yarn-install
# todo: remove `-- -- --ignore-engines` in Babel 8
	$(YARN) lerna bootstrap -- -- --ignore-engines

bootstrap: bootstrap-only
	$(MAKE) build

clean-lib:
	$(foreach source, $(SOURCES), \
		$(call clean-source-lib, $(source)))

clean-runtime-helpers:
	rm -f packages/babel-runtime/helpers/**/*.js
	rm -f packages/babel-runtime-corejs2/helpers/**/*.js
	rm -f packages/babel-runtime-corejs3/helpers/**/*.js
	rm -rf packages/babel-runtime-corejs2/core-js

clean-all:
	rm -rf node_modules
	rm -rf package-lock.json
	rm -rf .changelog

	$(foreach source, $(SOURCES), \
		$(call clean-source-all, $(source)))

	$(MAKE) clean

update-env-corejs-fixture:
	rm -rf packages/babel-preset-env/node_modules/core-js-compat
	$(YARN) lerna bootstrap
	$(MAKE) build-bundle
	OVERWRITE=true $(YARN) jest packages/babel-preset-env

define clean-source-lib
	rm -rf $(1)/*/lib

endef

define clean-source-test
	rm -rf $(1)/*/test/tmp
	rm -rf $(1)/*/test-fixtures.json

endef

define clean-source-all
	$(call clean-source-lib, $1)
	rm -rf $(1)/*/node_modules
	rm -rf $(1)/*/package-lock.json

endef

define set-json-field
	$(NODE) -e "\
		require('fs').writeFileSync('$1'.trim(), \
			JSON.stringify({ ...require('$1'.trim()), $2: $3 }, null, 2) + '\\n' \
		)"
endef

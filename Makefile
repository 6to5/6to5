MAKEFLAGS = -j1
FLOW_COMMIT = 2ac56861e3ceff9ca406ae586fbafb3480c6c0b7
TEST262_COMMIT = f77b930e6720f8005d5302acaedd434e13bf2fe2

# Fix color output until TravisCI fixes https://github.com/travis-ci/travis-ci/issues/7967
export FORCE_COLOR = true

SOURCES = packages codemods

.PHONY: build build-dist watch lint fix clean test-clean test-only test test-ci publish bootstrap

build: clean clean-lib
	./node_modules/.bin/gulp build
	node ./packages/babel-types/scripts/generateTypeHelpers.js
	# call build again as the generated files might need to be compiled again.
	./node_modules/.bin/gulp build
	# generate flow and typescript typings
	node scripts/generators/flow.js > ./packages/babel-types/lib/index.js.flow
	node scripts/generators/typescript.js > ./packages/babel-types/lib/index.d.ts
	node ./packages/babel-traverse/scripts/generators/typescript.js > ./packages/babel-traverse/lib/index.d.ts
ifneq ("$(BABEL_COVERAGE)", "true")
	make build-standalone
	make build-preset-env-standalone
endif

build-standalone:
	./node_modules/.bin/gulp build-babel-standalone

build-preset-env-standalone:
	./node_modules/.bin/gulp build-babel-preset-env-standalone

prepublish-build-standalone:
	BABEL_ENV=production IS_PUBLISH=true ./node_modules/.bin/gulp build-babel-standalone

prepublish-build-preset-env-standalone:
	BABEL_ENV=production IS_PUBLISH=true ./node_modules/.bin/gulp build-babel-preset-env-standalone

build-dist: build
	cd packages/babel-polyfill; \
	scripts/build-dist.sh
	cd packages/babel-plugin-transform-runtime; \
	node scripts/build-dist.js

watch: clean clean-lib

	# Ensure that build artifacts for types are created during local
	# development too.
	BABEL_ENV=development ./node_modules/.bin/gulp build-no-bundle
	node ./packages/babel-types/scripts/generateTypeHelpers.js
	node scripts/generators/flow.js > ./packages/babel-types/lib/index.js.flow
	BABEL_ENV=development ./node_modules/.bin/gulp watch

flow:
	./node_modules/.bin/flow check --strip-root

lint:
	./node_modules/.bin/eslint scripts $(SOURCES) '*.js' --format=codeframe

fix: fix-json
	./node_modules/.bin/eslint scripts $(SOURCES) '*.js' --format=codeframe --fix

fix-json:
	./node_modules/.bin/prettier "{packages,codemod}/*/test/fixtures/**/options.json" --write --loglevel warn

clean: test-clean
	rm -rf packages/babel-polyfill/browser*
	rm -rf packages/babel-polyfill/dist
	rm -rf coverage
	rm -rf packages/*/npm-debug*

test-clean:
	$(foreach source, $(SOURCES), \
		$(call clean-source-test, $(source)))

test-only:
	BABEL_ENV=test ./scripts/test.sh
	make test-clean

test: lint test-only

test-ci: bootstrap test-only

test-ci-coverage: SHELL:=/bin/bash
test-ci-coverage:
	BABEL_COVERAGE=true BABEL_ENV=test make bootstrap
	BABEL_ENV=test TEST_TYPE=cov ./scripts/test-cov.sh
	bash <(curl -s https://codecov.io/bash) -f coverage/coverage-final.json

bootstrap-flow:
	rm -rf ./build/flow
	mkdir -p ./build
	git clone --branch=master --single-branch --shallow-since=2018-11-01 https://github.com/facebook/flow.git ./build/flow
	cd build/flow && git checkout $(FLOW_COMMIT)

test-flow:
	node scripts/tests/flow/run_babel_parser_flow_tests.js

test-flow-ci: bootstrap test-flow

test-flow-update-whitelist:
	node scripts/tests/flow/run_babel_parser_flow_tests.js --update-whitelist

bootstrap-test262:
	rm -rf ./build/test262
	mkdir -p ./build
	git clone --branch=master --single-branch --shallow-since=2018-11-01 https://github.com/tc39/test262.git ./build/test262
	cd build/test262 && git checkout $(TEST262_COMMIT)

test-test262:
	node scripts/tests/test262/run_babel_parser_test262.js

test-test262-ci: bootstrap test-test262

test-test262-update-whitelist:
	node scripts/tests/test262/run_babel_parser_test262.js --update-whitelist

clone-license:
	./scripts/clone-license.sh

prepublish-build:
	make clean-lib
	rm -rf packages/babel-runtime/helpers
	rm -rf packages/babel-runtime-corejs2/helpers
	rm -rf packages/babel-runtime-corejs2/core-js
	BABEL_ENV=production make build-dist
	make clone-license

prepublish:
	git pull --rebase
	make prepublish-build
	make test

publish: prepublish
	./node_modules/.bin/lerna publish --force-publish="@babel/runtime,@babel/runtime-corejs2,@babel/standalone,@babel/preset-env-standalone" --require-scripts
	make clean

bootstrap: clean-all
	yarn --ignore-engines
	./node_modules/.bin/lerna bootstrap -- --ignore-engines
	make build
	cd packages/babel-plugin-transform-runtime; \
	node scripts/build-dist.js

clean-lib:
	$(foreach source, $(SOURCES), \
		$(call clean-source-lib, $(source)))

clean-all:
	rm -rf node_modules
	rm -rf package-lock.json
	rm -rf .changelog

	$(foreach source, $(SOURCES), \
		$(call clean-source-all, $(source)))

	make clean

define clean-source-lib
	rm -rf $(1)/*/lib

endef

define clean-source-test
	rm -rf $(1)/*/test/tmp
	rm -rf $(1)/*/test-fixtures.json

endef

define clean-source-all
	rm -rf $(1)/*/lib
	rm -rf $(1)/*/node_modules
	rm -rf $(1)/*/package-lock.json

endef

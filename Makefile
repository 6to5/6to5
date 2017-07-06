MAKEFLAGS = -j1

export NODE_ENV = test

# Fix color output until TravisCI fixes https://github.com/travis-ci/travis-ci/issues/7967
export FORCE_COLOR = true

.PHONY: build build-dist watch lint fix clean test-clean test-only test test-ci publish bootstrap

build: clean
	./node_modules/.bin/gulp build

build-dist: build
	cd packages/babel-polyfill; \
	scripts/build-dist.sh
	cd packages/babel-runtime; \
	node scripts/build-dist.js
	node scripts/generate-babel-types-docs.js

watch: clean
	rm -rf packages/*/lib
	BABEL_ENV=development ./node_modules/.bin/gulp watch

lint:
	./node_modules/.bin/eslint scripts packages *.js --format=codeframe

flow:
	./node_modules/.bin/flow check

fix:
	./node_modules/.bin/eslint scripts packages *.js --format=codeframe --fix

clean: test-clean
	rm -rf packages/babel-polyfill/browser*
	rm -rf packages/babel-polyfill/dist
	# rm -rf packages/babel-runtime/helpers
	# rm -rf packages/babel-runtime/core-js
	rm -rf coverage
	rm -rf packages/*/npm-debug*

test-clean:
	rm -rf packages/*/test/tmp
	rm -rf packages/*/test-fixtures.json

clean-all:
	rm -rf packages/*/lib
	rm -rf node_modules
	rm -rf packages/*/node_modules
	make clean

test-only:
	./scripts/test.sh
	make test-clean

test: lint test-only

test-ci:
	make bootstrap
	make test-only

test-ci-coverage:
	BABEL_ENV=cov make bootstrap
	./scripts/test-cov.sh
	./node_modules/.bin/codecov -f coverage/coverage-final.json

publish:
	git pull --rebase
	rm -rf packages/*/lib
	BABEL_ENV=production make build-dist
	make test
	# not using lerna independent mode atm, so only update packages that have changed since we use ^
	# --only-explicit-updates
	./node_modules/.bin/lerna publish --force-publish=* --npm-tag=next --exact --skip-temp-tag
	make clean

bootstrap:
	make clean-all
	yarn
	./node_modules/.bin/lerna bootstrap
	make build
	cd packages/babel-runtime; \
	node scripts/build-dist.js

import browserify from "browserify";
import assert from "assert";
import path from "path";
import vm from "vm";

describe("browserify", function() {
  it("babel/register may be used without breaking browserify", function(done) {
    const bundler = browserify(
      path.join(__dirname, "fixtures/browserify/register.js"),
    );

    bundler.bundle(function(err, bundle) {
      if (err) return done(err);
      assert.ok(bundle.length, "bundle output code");

      // ensure that the code runs without throwing an exception
      vm.runInNewContext("var global = this;\n" + bundle, {});
      done();
    });
  });
});

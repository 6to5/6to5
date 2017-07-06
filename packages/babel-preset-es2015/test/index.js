import es2015 from "../lib";
import { expect } from "chai";

describe("es2015 preset", function() {
  it("doesn't throw with no options passed", function() {
    expect(function() {
      es2015(null);
    }).not.to.throw();
  });

  describe("options", function() {
    describe("loose", function() {
      it("throws on non-boolean value", function() {
        expect(function() {
          es2015(null, { loose: 1 });
        }).to.throw(/must be a boolean/);
      });
    });

    describe("spec", function() {
      it("throws on non-boolean value", function() {
        expect(function() {
          es2015(null, { spec: 1 });
        }).to.throw(/must be a boolean/);
      });
    });

    describe("modules", function() {
      it("doesn't throw when passing one false", function() {
        expect(function() {
          es2015(null, { modules: false });
        }).not.to.throw();
      });

      it("doesn't throw when passing one of: 'commonjs', 'amd', 'umd', 'systemjs", function() {
        expect(function() {
          es2015(null, { modules: "commonjs" });
        }).not.to.throw();

        expect(function() {
          es2015(null, { modules: "amd" });
        }).not.to.throw();

        expect(function() {
          es2015(null, { modules: "umd" });
        }).not.to.throw();

        expect(function() {
          es2015(null, { modules: "systemjs" });
        }).not.to.throw();
      });

      it("throws when passing neither false nor one of: 'commonjs', 'amd', 'umd', 'systemjs'", function() {
        expect(function() {
          es2015(null, { modules: 1 });
        }).to.throw();
      });
    });
  });
});

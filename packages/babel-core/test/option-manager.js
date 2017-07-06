import assert from "assert";
import manageOptions from "../lib/config/option-manager";
import path from "path";

describe("option-manager", () => {
  it("throws for babel 5 plugin", () => {
    return assert.throws(() => {
      manageOptions({
        plugins: [({ Plugin }) => new Plugin("object-assign", {})],
      });
    }, /Babel 5 plugin is being run with Babel 6/);
  });

  describe("mergeOptions", () => {
    it("throws for removed babel 5 options", () => {
      return assert.throws(() => {
        manageOptions({
          randomOption: true,
        });
      }, /Unknown option: base.randomOption/);
    });

    it("throws for removed babel 5 options", () => {
      return assert.throws(
        () => {
          manageOptions({
            auxiliaryComment: true,
            blacklist: true,
          });
        },
        // eslint-disable-next-line max-len
        /Using removed Babel 5 option: base.auxiliaryComment - Use `auxiliaryCommentBefore` or `auxiliaryCommentAfter`/,
      );
    });

    it("throws for resolved but erroring preset", () => {
      return assert.throws(() => {
        manageOptions({
          presets: [
            path.join(__dirname, "fixtures/option-manager/not-a-preset"),
          ],
        });
      }, /While processing: .*option-manager(?:\/|\\\\)not-a-preset\.js/);
    });
  });

  describe("presets", function() {
    function presetTest(name) {
      it(name, function() {
        const { options } = manageOptions({
          presets: [
            path.join(__dirname, "fixtures/option-manager/presets", name),
          ],
        });

        assert.equal(true, Array.isArray(options.plugins));
        assert.equal(1, options.plugins.length);
      });
    }

    function presetThrowsTest(name, msg) {
      it(name, function() {
        assert.throws(
          () =>
            manageOptions({
              presets: [
                path.join(__dirname, "fixtures/option-manager/presets", name),
              ],
            }),
          msg,
        );
      });
    }

    presetTest("es5_function");
    presetTest("es5_object");
    presetTest("es2015_default_function");
    presetTest("es2015_default_object");

    presetThrowsTest(
      "es2015_named",
      /Must export a default export when using ES6 modules/,
    );
    presetThrowsTest("es2015_invalid", /Unsupported format: string/);
    presetThrowsTest("es5_invalid", /Unsupported format: string/);
  });
});

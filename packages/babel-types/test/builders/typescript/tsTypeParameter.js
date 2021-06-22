import * as t from "../../..";

describe("builders", function () {
  describe("typescript", function () {
    describe("tsTypeParameter", function () {
      it("accept name as argument for tsTypeParameter", function () {
        const tsTypeParameter = t.tsTypeParameter(
          t.tsTypeReference(t.identifier("bar")),
          t.tsTypeReference(t.identifier("baz")),
          "foo",
        );
        expect(tsTypeParameter).toMatchSnapshot();
      });
      it("throws when name is missing", function () {
        expect(() => {
          t.tsTypeParameter(
            t.tsTypeReference(t.identifier("bar")),
            t.tsTypeReference(t.identifier("baz")),
          );
        }).toThrow("Property name expected type of string but got undefined");
      });
    });
  });
});

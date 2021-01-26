(process.env.TEST_TYPE === "cov" ? describe.skip : describe)(
  "stage-1 preset",
  () => {
    const Babel = require("../babel");

    it("should parser decimal literal", () => {
      const output = Babel.transform("0.3m", {
        presets: [["stage-1", { decoratorsBeforeExport: true }]],
      }).code;
      expect(output).toBe("0.3m;");
    });
  },
);

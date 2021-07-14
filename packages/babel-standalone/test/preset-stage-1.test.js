import { createRequire } from "module";
const require = createRequire(import.meta.url);

(process.env.TEST_TYPE === "cov" ? describe.skip : describe)(
  "stage-1 preset",
  () => {
    let Babel;
    beforeAll(() => {
      Babel = require("../babel");
    });

    it("should parser decimal literal", () => {
      const output = Babel.transform("0.3m", {
        presets: [["stage-1", { decoratorsBeforeExport: true }]],
      }).code;
      expect(output).toBe("0.3m;");
    });

    it("should support hack pipeline", () => {
      const output = Babel.transform("x |> %", {
        presets: [
          [
            "stage-1",
            {
              pipelineProposal: "hack",
              decoratorsBeforeExport: true,
            },
          ],
        ],
      }).code;
      expect(output).toMatchInlineSnapshot(`
"var _ref;

_ref = x, _ref;"
`);
    });
  },
);

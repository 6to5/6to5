import { loadOptions } from "@babel/core";
import presetReact from "..";

function loadPresetWithOptions(options: any) {
  loadOptions({
    filename: "/fake/test.jsx",
    presets: [[presetReact, options]],
  });
}
(process.platform === "win32" ? describe.skip : describe)(
  "preset-react",
  () => {
    it("should throw when top level options are invalid", () => {
      expect(() => {
        loadPresetWithOptions({ useBuiltins: true });
      }).toThrowErrorMatchingSnapshot();
    });
    it("should throw when boolean options are not provided with boolean values", () => {
      expect(() => {
        loadPresetWithOptions({ useBuiltIns: "true" });
      }).toThrowErrorMatchingSnapshot();
    });
    it("should throw when string options are not provided with string values", () => {
      expect(() => {
        loadPresetWithOptions({ pragma: 0 });
      }).toThrowErrorMatchingSnapshot();
    });
  },
);

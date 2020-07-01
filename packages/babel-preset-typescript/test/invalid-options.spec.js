import { loadOptions } from "@babel/core";
import presetTypeScript from "..";

function loadPresetWithOptions(options: any) {
  loadOptions({
    filename: "/fake/test.ts",
    presets: [[presetTypeScript, options]],
  });
}
(process.platform === "win32" ? describe.skip : describe)(
  "preset-typescript",
  () => {
    it("should throw when top level options are invalid", () => {
      expect(() => {
        loadPresetWithOptions({ jsxpragma: "React.createElement" });
      }).toThrowErrorMatchingSnapshot();
    });
    it("should throw when boolean options are not provided with boolean values", () => {
      expect(() => {
        loadPresetWithOptions({ allowNamespaces: "true" });
      }).toThrowErrorMatchingSnapshot();
    });
    it("should throw when string options are not provided with string values", () => {
      expect(() => {
        loadPresetWithOptions({ jsxPragma: 0 });
      }).toThrowErrorMatchingSnapshot();
    });
    it("should throw when isTSX is supplied", () => {
      expect(() => {
        loadPresetWithOptions({ isTSX: true });
      }).toThrowErrorMatchingSnapshot();
    });
    it("should throw when allExtensions is supplied", () => {
      expect(() => {
        loadPresetWithOptions({ allExtensions: false });
      }).toThrowErrorMatchingSnapshot();
    });
  },
);

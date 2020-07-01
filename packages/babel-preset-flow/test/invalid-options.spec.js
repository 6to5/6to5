import { loadOptions } from "@babel/core";
import presetFlow from "..";

function loadPresetWithOptions(options: any) {
  loadOptions({
    filename: "/fake/test.js",
    presets: [[presetFlow, options]],
  });
}
(process.platform === "win32" ? describe.skip : describe)("preset-flow", () => {
  it("should throw when top level options are invalid", () => {
    expect(() => {
      loadPresetWithOptions({ All: true });
    }).toThrowErrorMatchingSnapshot();
  });
  it("should throw when boolean options are not provided with boolean values", () => {
    expect(() => {
      loadPresetWithOptions({ all: "true" });
    }).toThrowErrorMatchingSnapshot();
  });
});

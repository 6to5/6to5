import { parse } from "../src";

function run(code, options) {
  return parse(code, { sourceType: "module", ...options });
}
describe("keyword test", function () {
  it("change if keyword", function () {
    expect(
      run("if (true) {} otherwise {}", {
        localizedKeywords: {
          else: "otherwise",
        },
      }),
    ).toMatchSnapshot();
  });
  it("change if keyword to another language", function () {
    expect(
      run("如果 (true) {}", {
        localizedKeywords: {
          if: "如果",
        },
      }),
    ).toMatchSnapshot();
  });
  it("change with array of keywords", function () {
    expect(
      run("如果 (true) {} si (true) {}", {
        localizedKeywords: {
          if: ["如果", "si"],
        },
      }),
    ).toMatchSnapshot();
  });
  it("emoji identifier", function () {
    expect(run("var 😁 = 1;", { emoji: true })).toMatchSnapshot();
  });
  it("emoji keywords", function () {
    expect(
      run(`🤞 { await fetch('/api') } 😱 (e) {}`, {
        plugins: ["topLevelAwait"],
        localizedKeywords: {
          try: "🤞",
          catch: "😱",
        },
      }),
    ).toMatchSnapshot();
  });
});

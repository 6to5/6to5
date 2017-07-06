import generator from "../../babel-generator";
import template from "../lib";
import chai from "chai";

const comments = "// Sum two numbers\nconst add = (a, b) => a + b;";

describe("templating", function() {
  it("import statement will cause parser to throw by default", function() {
    chai
      .expect(function() {
        template("import foo from 'foo'")({});
      })
      .to.throw();
  });

  it("import statements are allowed with sourceType: module", function() {
    chai
      .expect(function() {
        template("import foo from 'foo'", { sourceType: "module" })({});
      })
      .not.to.throw();
  });

  it("should strip comments by default", function() {
    const code = "const add = (a, b) => a + b;";
    const output = template(comments)();
    chai.expect(generator(output).code).to.be.equal(code);
  });

  it("should preserve comments with a flag", function() {
    const output = template(comments, { preserveComments: true })();
    chai.expect(generator(output).code).to.be.equal(comments);
  });
});

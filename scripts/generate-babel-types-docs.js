"use strict";

const util = require("util");
const path = require("path");
const fs = require("fs");

const types = require("../packages/babel-types");

const readmePath = path.join(
  __dirname,
  "..",
  "packages",
  "babel-types",
  "README.md"
);
const readmeSrc = fs.readFileSync(readmePath, "utf8");
const readme = [
  readmeSrc.split("<!-- begin generated section -->")[0].trim(),
  "",
  "<!-- begin generated section -->",
  "",
];

const customTypes = {
  ClassMethod: {
    key: "if computed then `Expression` else `Identifier | Literal`",
  },
  Identifier: {
    name: "`string`",
  },
  MemberExpression: {
    property: "if computed then `Expression` else `Identifier`",
  },
  ObjectMethod: {
    key: "if computed then `Expression` else `Identifier | Literal`",
  },
  ObjectProperty: {
    key: "if computed then `Expression` else `Identifier | Literal`",
  },
};
function getType(validator) {
  if (validator.type) {
    return validator.type;
  } else if (validator.oneOfNodeTypes) {
    return validator.oneOfNodeTypes.join(" | ");
  } else if (validator.oneOfNodeOrValueTypes) {
    return validator.oneOfNodeOrValueTypes.join(" | ");
  } else if (validator.oneOf) {
    return validator.oneOf.map(val => util.inspect(val)).join(" | ");
  } else if (validator.chainOf) {
    if (
      validator.chainOf.length === 2 &&
      validator.chainOf[0].type === "array" &&
      validator.chainOf[1].each
    ) {
      return "Array<" + getType(validator.chainOf[1].each) + ">";
    }
    if (
      validator.chainOf.length === 2 &&
      validator.chainOf[0].type === "string" &&
      validator.chainOf[1].oneOf
    ) {
      return validator.chainOf[1].oneOf
        .map(function(val) {
          return JSON.stringify(val);
        })
        .join(" | ");
    }
  }
  const err = new Error("Unrecognised validator type");
  err.code = "UNEXPECTED_VALIDATOR_TYPE";
  err.validator = validator;
  throw err;
}
Object.keys(types.BUILDER_KEYS).sort().forEach(function(key) {
  readme.push("### " + key[0].toLowerCase() + key.substr(1));
  readme.push("```javascript");
  readme.push(
    "t." +
      key[0].toLowerCase() +
      key.substr(1) +
      "(" +
      types.BUILDER_KEYS[key].join(", ") +
      ")"
  );
  readme.push("```");
  readme.push("");
  readme.push(
    "See also `t.is" +
      key +
      "(node, opts)` and `t.assert" +
      key +
      "(node, opts)`."
  );
  readme.push("");
  if (types.ALIAS_KEYS[key] && types.ALIAS_KEYS[key].length) {
    readme.push(
      "Aliases: " +
        types.ALIAS_KEYS[key]
          .map(function(key) {
            return "`" + key + "`";
          })
          .join(", ")
    );
    readme.push("");
  }
  Object.keys(types.NODE_FIELDS[key])
    .sort(function(fieldA, fieldB) {
      const indexA = types.BUILDER_KEYS[key].indexOf(fieldA);
      const indexB = types.BUILDER_KEYS[key].indexOf(fieldB);
      if (indexA === indexB) return fieldA < fieldB ? -1 : 1;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    })
    .forEach(function(field) {
      const defaultValue = types.NODE_FIELDS[key][field].default;
      const fieldDescription = ["`" + field + "`"];
      const validator = types.NODE_FIELDS[key][field].validate;
      if (customTypes[key] && customTypes[key][field]) {
        fieldDescription.push(customTypes[key][field]);
      } else if (validator) {
        try {
          fieldDescription.push(": `" + getType(validator) + "`");
        } catch (ex) {
          if (ex.code === "UNEXPECTED_VALIDATOR_TYPE") {
            console.log("Unrecognised validator type for " + key + "." + field);
            console.dir(ex.validator, { depth: 10, colors: true });
          }
        }
      }
      if (defaultValue !== null || types.NODE_FIELDS[key][field].optional) {
        fieldDescription.push(
          " (default: `" + util.inspect(defaultValue) + "`)"
        );
      } else {
        fieldDescription.push(" (required)");
      }
      readme.push(" - " + fieldDescription.join(""));
    });

  readme.push("");
  readme.push("---");
  readme.push("");
});

readme.push(
  "",
  "<!-- end generated section -->",
  "",
  readmeSrc.split("<!-- end generated section -->")[1].trim()
);

fs.writeFileSync(readmePath, readme.join("\n"));
// console.log(readme.join('\n'));

import { basename, extname } from "path";
import template from "babel-template";
import transformAMD from "babel-plugin-transform-es2015-modules-amd";

const buildPrerequisiteAssignment = template(`
  GLOBAL_REFERENCE = GLOBAL_REFERENCE || {}
`);

const buildGlobalExport = template(`
  var mod = { exports: {} };
  factory(BROWSER_ARGUMENTS);
  PREREQUISITE_ASSIGNMENTS
  GLOBAL_TO_ASSIGN = mod.exports;
`);

const buildWrapper = template(`
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define(MODULE_NAME, AMD_ARGUMENTS, factory);
    } else if (typeof exports !== "undefined") {
      factory(COMMON_ARGUMENTS);
    } else {
      GLOBAL_EXPORT
    }
  })(this, FUNC);
`);

export default function({ types: t }) {
  function isValidDefine(path) {
    if (!path.isExpressionStatement()) return;

    const expr = path.get("expression");
    if (!expr.isCallExpression()) return false;
    if (!expr.get("callee").isIdentifier({ name: "define" })) return false;

    const args = expr.get("arguments");
    if (args.length === 3 && !args.shift().isStringLiteral()) return false;
    if (args.length !== 2) return false;
    if (!args.shift().isArrayExpression()) return false;
    if (!args.shift().isFunctionExpression()) return false;

    return true;
  }

  return {
    inherits: transformAMD,

    visitor: {
      Program: {
        exit(path, state) {
          const last = path.get("body").pop();
          if (!isValidDefine(last)) return;

          const call = last.node.expression;
          const args = call.arguments;

          const moduleName = args.length === 3 ? args.shift() : null;
          const amdArgs = call.arguments[0];
          const func = call.arguments[1];
          const browserGlobals = state.opts.globals || {};

          const commonArgs = amdArgs.elements.map(arg => {
            if (arg.value === "module" || arg.value === "exports") {
              return t.identifier(arg.value);
            } else {
              return t.callExpression(t.identifier("require"), [arg]);
            }
          });

          const browserArgs = amdArgs.elements.map(arg => {
            if (arg.value === "module") {
              return t.identifier("mod");
            } else if (arg.value === "exports") {
              return t.memberExpression(
                t.identifier("mod"),
                t.identifier("exports"),
              );
            } else {
              let memberExpression;

              if (state.opts.exactGlobals) {
                const globalRef = browserGlobals[arg.value];
                if (globalRef) {
                  memberExpression = globalRef
                    .split(".")
                    .reduce(
                      (accum, curr) =>
                        t.memberExpression(accum, t.identifier(curr)),
                      t.identifier("global"),
                    );
                } else {
                  memberExpression = t.memberExpression(
                    t.identifier("global"),
                    t.identifier(t.toIdentifier(arg.value)),
                  );
                }
              } else {
                const requireName = basename(arg.value, extname(arg.value));
                const globalName = browserGlobals[requireName] || requireName;
                memberExpression = t.memberExpression(
                  t.identifier("global"),
                  t.identifier(t.toIdentifier(globalName)),
                );
              }

              return memberExpression;
            }
          });

          const moduleNameOrBasename = moduleName
            ? moduleName.value
            : basename(
                this.file.opts.filename,
                extname(this.file.opts.filename),
              );
          let globalToAssign = t.memberExpression(
            t.identifier("global"),
            t.identifier(t.toIdentifier(moduleNameOrBasename)),
          );
          let prerequisiteAssignments = null;

          if (state.opts.exactGlobals) {
            const globalName = browserGlobals[moduleNameOrBasename];

            if (globalName) {
              prerequisiteAssignments = [];

              const members = globalName.split(".");
              globalToAssign = members.slice(1).reduce((accum, curr) => {
                prerequisiteAssignments.push(
                  buildPrerequisiteAssignment({ GLOBAL_REFERENCE: accum }),
                );
                return t.memberExpression(accum, t.identifier(curr));
              }, t.memberExpression(t.identifier("global"), t.identifier(members[0])));
            }
          }

          const globalExport = buildGlobalExport({
            BROWSER_ARGUMENTS: browserArgs,
            PREREQUISITE_ASSIGNMENTS: prerequisiteAssignments,
            GLOBAL_TO_ASSIGN: globalToAssign,
          });

          last.replaceWith(
            buildWrapper({
              MODULE_NAME: moduleName,
              AMD_ARGUMENTS: amdArgs,
              COMMON_ARGUMENTS: commonArgs,
              GLOBAL_EXPORT: globalExport,
              FUNC: func,
            }),
          );
        },
      },
    },
  };
}

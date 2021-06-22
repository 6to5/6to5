import ruleComposer from "eslint-rule-composer";
import eslint from "eslint";

const OPT_OUT_PATTERN = /^[-[(/+`]/; // One of [(/+-`

const rule = new eslint.Linter().getRules().get("semi");

function isSemicolon(token) {
  return token.type === "Punctuator" && token.value === ";";
}

function isUnnecessarySemicolon(context, lastToken) {
  if (!isSemicolon(lastToken)) {
    return false;
  }

  const nextToken = context.getSourceCode().getTokenAfter(lastToken);

  if (!nextToken) {
    return true;
  }

  const lastTokenLine = lastToken.loc.end.line;
  const nextTokenLine = nextToken.loc.start.line;
  const isOptOutToken =
    OPT_OUT_PATTERN.test(nextToken.value) &&
    nextToken.value !== "++" &&
    nextToken.value !== "--";
  const isDivider = nextToken.value === "}" || nextToken.value === ";";

  return (lastTokenLine !== nextTokenLine && !isOptOutToken) || isDivider;
}

function isOneLinerBlock(context, node) {
  const nextToken = context.getSourceCode().getTokenAfter(node);

  if (!nextToken || nextToken.value !== "}") {
    return false;
  }

  const parent = node.parent;

  return (
    parent &&
    parent.type === "BlockStatement" &&
    parent.loc.start.line === parent.loc.end.line
  );
}

function report(context, node, missing) {
  const lastToken = context.getSourceCode().getLastToken(node);

  let message,
    fix,
    loc = lastToken.loc;

  if (!missing) {
    message = "Missing semicolon.";
    loc = loc.end;
    fix = function (fixer) {
      return fixer.insertTextAfter(lastToken, ";");
    };
  } else {
    message = "Extra semicolon.";
    loc = loc.start;
    fix = function (fixer) {
      return fixer.remove(lastToken);
    };
  }

  context.report({
    node,
    loc,
    message,
    fix,
  });
}

export default ruleComposer.joinReports([
  rule,
  context => ({
    "ClassProperty, ClassPrivateProperty, PropertyDefinition"(node) {
      const options = context.options[1];
      const exceptOneLine = options && options.omitLastInOneLineBlock === true;
      const sourceCode = context.getSourceCode();
      const lastToken = sourceCode.getLastToken(node);

      if (context.options[0] === "never") {
        if (isUnnecessarySemicolon(context, lastToken)) {
          report(context, node, true);
        }
      } else {
        if (!isSemicolon(lastToken)) {
          if (!exceptOneLine || !isOneLinerBlock(context, node)) {
            report(context, node);
          }
        } else {
          if (exceptOneLine && isOneLinerBlock(context, node)) {
            report(context, node, true);
          }
        }
      }
    },
  }),
]);

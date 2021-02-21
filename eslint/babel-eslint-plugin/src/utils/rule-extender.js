export default function ruleExtender(rule, options = {}) {
  if (!rule) {
    throw new Error("No rule to extend found.");
  }

  if (!Object.keys(options).length) {
    throw new Error("No rule extension options supplied.");
  }

  const {
    metaOverrides = {},
    createAdditionalVisitors = () => ({}),
    reportOverrides = () => true,
  } = options;

  return {
    meta: {
      type: metaOverrides.type || rule.meta.type || undefined,
      fixable: metaOverrides.fixable || rule.meta.fixable || false,
      schema: metaOverrides.schema || rule.meta.schema || [],
      docs: { ...rule.meta.docs, ...metaOverrides.docs },
      messages: { ...rule.meta.messages, ...metaOverrides.messages },
    },
    create(context) {
      const duplicateVisitors = {};
      const modifiedContext = Object.create(context, {
        report: {
          enumerable: true,
          value: meta => {
            const overrideResult = reportOverrides(meta, modifiedContext);

            // Override return value is trinary:
            //   - true: report with original metadata (unchanged)
            //   - false: do not report
            //   - report metadata object: report with this metadata instead
            if (overrideResult === true) {
              return context.report(meta);
            }

            if (overrideResult === false) {
              return;
            }

            if (
              overrideResult &&
              typeof overrideResult === "object" &&
              !Array.isArray(overrideResult)
            ) {
              return context.report(overrideResult);
            }

            throw new Error(`ruleExtender.reportOverrides() return value must be one of the following:
  - true: report with original meta (unchanged)
  - false: do not report
  - report metadata object: report with this metadata instead`);
          },
        },
      });

      return Object.entries(createAdditionalVisitors(modifiedContext)).reduce(
        (visitors, [listener, visitor]) => {
          if (visitors[listener]) {
            if (duplicateVisitors[listener]) {
              duplicateVisitors[listener].push(visitor);
            } else {
              duplicateVisitors[listener] = [visitors[listener], visitor];
            }
            visitors[listener] = node =>
              duplicateVisitors[listener].forEach(visitor => visitor(node));
          } else {
            visitors[listener] = visitor;
          }
          return visitors;
        },
        rule.create(modifiedContext),
      );
    },
  };
}

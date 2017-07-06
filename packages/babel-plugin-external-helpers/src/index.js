export default function({ types: t }) {
  return {
    pre(file) {
      file.set("helpersNamespace", t.identifier("babelHelpers"));
    },
  };
}

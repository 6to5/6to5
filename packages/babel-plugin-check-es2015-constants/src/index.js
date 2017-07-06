export default function({ messages }) {
  return {
    visitor: {
      Scope({ scope }) {
        for (const name in scope.bindings) {
          const binding = scope.bindings[name];
          if (binding.kind !== "const" && binding.kind !== "module") continue;

          for (const violation of (binding.constantViolations: Array)) {
            throw violation.buildCodeFrameError(messages.get("readOnly", name));
          }
        }
      },
    },
  };
}

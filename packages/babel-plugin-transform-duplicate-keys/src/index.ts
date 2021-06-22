import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

function getName(key) {
  if (t.isIdentifier(key)) {
    return key.name;
  }
  return key.value.toString();
}

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "transform-duplicate-keys",

    visitor: {
      ObjectExpression(path) {
        const { node } = path;
        const plainProps = node.properties.filter(
          prop => !t.isSpreadElement(prop) && !prop.computed,
        );

        // A property is a duplicate key if:
        // * the property is a data property, and is preceded by a data,
        //   getter, or setter property of the same name.
        // * the property is a getter property, and is preceded by a data or
        //   getter property of the same name.
        // * the property is a setter property, and is preceded by a data or
        //   setter property of the same name.

        const alreadySeenData = Object.create(null);
        const alreadySeenGetters = Object.create(null);
        const alreadySeenSetters = Object.create(null);

        for (const prop of plainProps) {
          const name = getName(prop.key);
          let isDuplicate = false;
          switch (prop.kind) {
            case "get":
              if (alreadySeenData[name] || alreadySeenGetters[name]) {
                isDuplicate = true;
              }
              alreadySeenGetters[name] = true;
              break;
            case "set":
              if (alreadySeenData[name] || alreadySeenSetters[name]) {
                isDuplicate = true;
              }
              alreadySeenSetters[name] = true;
              break;
            default:
              if (
                alreadySeenData[name] ||
                alreadySeenGetters[name] ||
                alreadySeenSetters[name]
              ) {
                isDuplicate = true;
              }
              alreadySeenData[name] = true;
          }

          if (isDuplicate) {
            // Rely on the computed properties transform to split the property
            // assignment out of the object literal.
            prop.computed = true;
            prop.key = t.stringLiteral(name);
          }
        }
      },
    },
  };
});

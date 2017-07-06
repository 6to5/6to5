export default function({ types: t }) {
  function hasRefOrSpread(attrs) {
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (t.isJSXSpreadAttribute(attr)) return true;
      if (isJSXAttributeOfName(attr, "ref")) return true;
    }
    return false;
  }

  function isJSXAttributeOfName(attr, name) {
    return (
      t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name, { name: name })
    );
  }

  function getAttributeValue(attr) {
    let value = attr.value;
    if (!value) return t.identifier("true");
    if (t.isJSXExpressionContainer(value)) value = value.expression;
    return value;
  }

  return {
    visitor: {
      JSXElement(path, file) {
        const { node } = path;

        // filter
        const open = node.openingElement;
        if (hasRefOrSpread(open.attributes)) return;

        // init
        const props = t.objectExpression([]);
        let key = null;
        let type = open.name;

        if (t.isJSXIdentifier(type) && t.react.isCompatTag(type.name)) {
          type = t.stringLiteral(type.name);
        }

        function pushProp(objProps, key, value) {
          objProps.push(t.objectProperty(key, value));
        }

        // props
        for (const attr of (open.attributes: Array<Object>)) {
          if (isJSXAttributeOfName(attr, "key")) {
            key = getAttributeValue(attr);
          } else {
            const name = attr.name.name;
            const propertyKey = t.isValidIdentifier(name)
              ? t.identifier(name)
              : t.stringLiteral(name);
            pushProp(props.properties, propertyKey, getAttributeValue(attr));
          }
        }

        const args = [type, props];
        if (key || node.children.length) {
          const children = t.react.buildChildren(node);
          args.push(
            key || t.unaryExpression("void", t.numericLiteral(0), true),
            ...children,
          );
        }

        const el = t.callExpression(file.addHelper("jsx"), args);
        path.replaceWith(el);
      },
    },
  };
}

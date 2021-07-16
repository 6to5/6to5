
function stringifyKeyOnce(obj) {
  const key = { i: 0, toString() { return String(this.i++); } };
  const { [key]: value, ...rest } = obj;
  return rest[1] + value;
};

expect(stringifyKeyOnce([" value", "correct"])).toBe("correct value");

function stringifyTemplateOnce(obj) {
  const key = { i: 0, toString() { return String(this.i++); } };
  const { [`${key}`]: value, ...rest } = obj;
  return rest[1] + value;
};

expect(stringifyTemplateOnce([" value", "correct"])).toBe("correct value");

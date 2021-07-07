var _ref, _y$z;

// Array destructing
const result = (_ref = [0], (([x]) => x)(_ref));
expect(result).toBe(0); // Object destructuring

const result2 = (_y$z = {
  y: 1,
  z: 2
}, (({
  y,
  z
}) => y + z)(_y$z));
expect(result).toBe(3);

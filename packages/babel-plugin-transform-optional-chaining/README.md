# babel-plugin-transform-optional-chaining

The Optional Chaining Operator allows you to handle properties of deeply nested
objects without worrying about undefined intermediate objects.

## Example

### Accessing deeply nested properties

```js
const obj = {
  foo: {
    bar: {
      baz: 42,
    },
  },
};

const baz = obj?.foo?.bar?.baz; // 42

const safe = obj?.qux?.baz; // undefined

// Optional chaining and normal chaining can be intermixed
obj?.foo.bar?.baz; // Only access `foo` if `obj` exists, and `baz` if
                   // `bar` exists
```

### Calling deeply nested functions

```js
const obj = {
  foo: {
    bar: {
      baz() {
        return 42;
      },
    },
  },
};

const baz = obj?.foo?.bar?.baz(); // 42

const safe = obj?.qux?.baz(); // undefined
const safe2 = obj?.foo.bar.qux?.(); // undefined

const willThrow = obj?.foo.bar.qux(); // Error: not a function

// Top function can be called directly, too.
function test() {
  return 42;
}
test?.(); // 42

exists?.(); // undefined
```

### Constructing deeply nested classes

```js
const obj = {
  foo: {
    bar: {
      baz: class {
      },
    },
  },
};

const baz = new obj?.foo?.bar?.baz(); // baz instance

const safe = new obj?.qux?.baz(); // undefined
const safe2 = new obj?.foo.bar.qux?.(); // undefined

const willThrow = new obj?.foo.bar.qux(); // Error: not a constructor

// Top classes can be called directly, too.
class Test {
}
new Test?.(); // test instance

new exists?.(); // undefined
```

## Installation

```sh
npm install --save-dev babel-plugin-syntax-optional-chaining
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["syntax-optional-chaining"]
}
```

### Via CLI

```sh
babel --plugins syntax-optional-chaining script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["syntax-optional-chaining"]
});
```

## References

* [Proposal: Optional Chaining](https://github.com/tc39/proposal-optional-chaining)

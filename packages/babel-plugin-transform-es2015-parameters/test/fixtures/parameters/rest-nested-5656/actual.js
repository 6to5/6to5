function a(...args) {
  const foo = (...list) => bar(...list);
  foo(...args);
}

function b(...args) {
  const foo = (...args) => bar(...args);
  foo(...args);
}

function c(...args) {
  const foo = (...args) => bar(...args);
  foo([]);
}

function d(thing, ...args) {
  const foo = (...args) => bar(...args);
  {
    let args = thing;
    foo(thing);
  }
}

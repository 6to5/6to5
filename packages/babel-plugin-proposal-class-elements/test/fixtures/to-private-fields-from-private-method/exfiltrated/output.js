var _privateMethod;

let exfiltrated;

class Foo {
  #privateMethod = _privateMethod || (_privateMethod = function () {});

  constructor() {
    if (exfiltrated === undefined) {
      exfiltrated = this.#privateMethod;
    }
  }

}

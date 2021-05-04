let exfiltrated;

class Cl {
  static #privateStaticMethod() {
    return 1017;
  }

  constructor() {
    if (exfiltrated === undefined) {
        exfiltrated = Cl.#privateStaticMethod;
    }
    expect(exfiltrated).toStrictEqual(Cl.#privateStaticMethod);
  }
}

new Cl();
// check for private method function object equality
new Cl();

expect(exfiltrated()).toEqual(1017);
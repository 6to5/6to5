let exfiltrated;

class Cl {
  static #privateStaticMethod() {
    return 1017;
  }

  constructor() {
    if (exfiltrated === undefined) {
        exfiltrated = Cl.#privateStaticMethod;
    }
  }
}

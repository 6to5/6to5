let exfiltrated;

class Cl {
  static #privateStaticMethod = function () {
    return 1017;
  };

  constructor() {
    if (exfiltrated === undefined) {
      exfiltrated = Cl.#privateStaticMethod;
    }
  }

}

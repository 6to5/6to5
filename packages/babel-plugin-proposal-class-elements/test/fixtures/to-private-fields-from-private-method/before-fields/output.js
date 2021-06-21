var _method;

class Cl {
  #method = _method || (_method = function (x) {
    return x;
  });
  prop = this.#method(1);
  #priv = this.#method(2);

  getPriv() {
    return this.#priv;
  }

}

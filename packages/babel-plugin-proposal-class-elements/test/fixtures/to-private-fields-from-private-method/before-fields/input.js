class Cl {
  prop = this.#method(1);

  #priv = this.#method(2);

  #method(x) {
    return x;
  }

  getPriv() {
    return this.#priv;
  }
}

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

expect(new Cl().prop).toBe(1);
expect(new Cl().getPriv()).toBe(2);

class Cl {
  async #foo() {
    return 2;
  }

  test() {
    return this.#foo();
  }
}

return new Cl().test().then(val => {
  expect(val).toBe(2);
});

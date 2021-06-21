class Cl {
  static #privateStaticMethod = async function () {
    return 2;
  };

  test() {
    return Cl.#privateStaticMethod();
  }

}

return new Cl().test().then(val => {
  expect(val).toBe(2);
});

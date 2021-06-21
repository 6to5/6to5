var _foo;

class Cl {
  #foo = _foo || (_foo = async function () {
    return 2;
  });

  test() {
    return this.#foo();
  }

}

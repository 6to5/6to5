const result = 1
 |> class {
    #baz;

    constructor () {
      this.#baz = %;
    }

    #bar () {
      return this.#baz + 2;
    }

    foo () {
      return this.#bar() + 3;
    }
 }
 |> new %
 |> %.foo();

expect(result).toBe(1 + 2 + 3);

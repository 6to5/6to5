const result = 1
 |> class {
    #baz;

    constructor () {
      this.#baz = var;
    }

    #bar () {
      return this.#baz + 2;
    }

    foo () {
      return this.#bar() + 3;
    }
 }
 |> new var
 |> var.foo();

expect(result).toBe(1 + 2 + 3);

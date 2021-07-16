let Child

function dec(cls) {
  Child = class extends cls {}
  return Child
}

function dec2(cls) {
  return class extends cls {}
}

@dec
@dec2
class Parent {
  constructor() {
    this.prop = Parent
  }

  static static() {
    return Parent
  }

  method() {
    return Parent
  }

  #priv() {
    return Parent
  }

  public() {
    return this.#priv()
  }
}

expect(Parent.static()).toBe(Child)

const p = new Parent()

expect(p.prop).toBe(Child)
expect(p.method()).toBe(Child)
expect(p.public()).toBe(Child)
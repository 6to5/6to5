let exfiltrated;
class Foo {
    #privateMethod() {}

    constructor() {
        if (exfiltrated === undefined) {
            exfiltrated = this.#privateMethod;
        }
        expect(exfiltrated).toStrictEqual(this.#privateMethod);
    }
}

new Foo();
// check for private method function object equality
new Foo();
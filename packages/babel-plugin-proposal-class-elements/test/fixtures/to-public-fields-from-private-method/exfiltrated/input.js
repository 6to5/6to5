let exfiltrated;
class Foo {
    #privateMethod() {}

    constructor() {
        if (exfiltrated === undefined) {
            exfiltrated = this.#privateMethod;
        }
    }
}
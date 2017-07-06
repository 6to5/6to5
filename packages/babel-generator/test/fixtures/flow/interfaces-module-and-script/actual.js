interface A {}
interface A extends B {}
interface A<T> extends B<T>, C<T> {}
interface A { foo: () => number; }
interface Dictionary { [index: string]: string; length: number; }
class Foo implements Bar {}
class Foo extends Bar implements Bat, Man<number> {}
class Foo extends class Bar implements Bat {} {}
class Foo extends class Bar implements Bat {} implements Man {}

type A<T = string> = T;
type A<T = *> = T;
type A<T: ?string = string> = T;
type A<S, T: ?string = string> = T;
type A<S = number, T: ?string = string> = T;
class A<T = string> {}
class A<T: ?string = string> {}
class A<S, T: ?string = string> {}
class A<S = number, T: ?string = string> {}
(class A<T = string> {});
(class A<T: ?string = string> {});
(class A<S, T: ?string = string> {});
(class A<S = number, T: ?string = string> {});
declare class A<T = string> {}
declare class A<T: ?string = string> {}
declare class A<S, T: ?string = string> {}
declare class A<S = number, T: ?string = string> {}
interface A<T = string> {}
interface A<T: ?string = string> {}
interface A<S, T: ?string = string> {}
interface A<S = number, T: ?string = string> {}

type FBID = number;
type Foo<T> = Bar<T>;
type Maybe<T> = _Maybe<T, *>;
export type Foo = number;
type union = {
  type: "A"
} | {
  type: "B"
};
type overloads = (x: string) => number & (x: number) => string;
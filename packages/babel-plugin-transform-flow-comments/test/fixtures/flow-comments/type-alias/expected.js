function a() {}

/*:: type A = number;*/

/*:: type B = {
  name: string;
};*/

/*:: type union =
 | {type: "A"}
 | {type: "B"}
;*/

/*:: type overloads =
  & ((x: string) => number)
  & ((x: number) => string)
;*/
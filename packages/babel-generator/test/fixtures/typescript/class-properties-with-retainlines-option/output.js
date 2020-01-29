class ClassName {
  a: {
    a1: number;
    a2: number;
  };
  b: {
    b1: number;
    b2: number;
  };
  c(
  a: number,
  b: number,
  c: number,
  d: {
    d1: number;
    d2: number;
    d3: number;
  })
  : {
    a: number;
    b: number;
    c: number;
    d: number;
  } {
    fn(
    a,
    b,
    c,
    d
    );
    return {
      a,
      b,
      c,
      d
    };
  }
}

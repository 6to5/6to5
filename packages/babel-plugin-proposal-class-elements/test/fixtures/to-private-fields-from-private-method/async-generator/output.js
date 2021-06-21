var _g;

class C {
  #g = _g || (_g = async function* () {
    await 1;
    yield 2;
    return 3;
  });
}

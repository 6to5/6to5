function* asdf() {
  (yield 1) || (yield 2);
  (yield b)();
  new (yield b)();
  (yield 1) ? yield 2 : yield 3;
  yield 1 ? 2 : 3;
  yield yield 1;
}

function* a(b) {
  (yield xhr({
    url: "views/test.html"
  })).data;
}
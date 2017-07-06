async function asdf() {
  (await 1) || (await 2);
  (await b)();
  new (await b)();
  true ? await 1 : await 2;
  await (1 ? 2 : 3);
  await await 1;
  await (a || b);
}

async function a(b) {
  (await xhr({
    url: "views/test.html"
  })).data;
}
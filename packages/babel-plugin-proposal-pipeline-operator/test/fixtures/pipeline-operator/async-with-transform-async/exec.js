var incPromise = (x) => Promise.resolve(x + 1);
var double = (x) => x * 2;

var result = async () => 10 |> await incPromise;
var result2 = async () => 10 |> await incPromise |> double;

function* foo() {
  return 42 |> (yield 10);
}

return Promise.all([result(), result2()]).then((results) => {
  var r = results[0];
  var r2 = results[1];
  assert.equal(r, 11);
  assert.equal(r2, 22);

  var fooGen = foo();
  var amount = fooGen.next().value;
  assert.equal(fooGen.next(x => x + amount).value, 52);
});

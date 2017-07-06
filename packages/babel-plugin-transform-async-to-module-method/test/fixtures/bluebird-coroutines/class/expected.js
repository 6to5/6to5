import { coroutine as _coroutine } from "bluebird";

class Foo {
  foo() {
    return _coroutine(function* () {
      var wat = yield bar();
    })();
  }

}
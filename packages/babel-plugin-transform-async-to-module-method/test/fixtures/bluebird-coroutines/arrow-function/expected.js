import { coroutine as _coroutine } from "bluebird";

_coroutine(function* () {
  yield foo();
})();
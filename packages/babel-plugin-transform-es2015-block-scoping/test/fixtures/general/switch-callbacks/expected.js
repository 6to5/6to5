function fn() {
  while (true) {
    (function () {
      switch (true) {
        default:
          var foo = 4;

          if (true) {
            var bar = function () {
              return foo;
            };

            console.log(bar());
          }

      }
    })();
  }
}
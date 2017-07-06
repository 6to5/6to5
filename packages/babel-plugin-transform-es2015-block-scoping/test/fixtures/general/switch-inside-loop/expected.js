// it shouldn't break on a case-break statement
var i;

var _loop = function () {
  switch (i) {
    case 1:
      break;
  }

  var z = 3; // to force the plugin to convert to loop function call 

  (function () {
    return z;
  });
};

for (i = 0; i < 10; i++) {
  _loop();
}

assert.equal(i, 10); // it should continue on continue statements within switch

var j = 0;

var _loop2 = function () {
  switch (i) {
    case 0:
      return "continue";
  }

  j++;
  var z = 3;

  (function () {
    return z;
  });
};

for (i = 0; i < 10; i++) {
  var _ret = _loop2();

  if (_ret === "continue") continue;
}

assert.equal(j, 9); // it should work with loops nested within switch

j = 0;

var _loop3 = function () {
  switch (i) {
    case 0:
      var _loop4 = function () {
        var z = 3;

        (function () {
          return z;
        });

        j++;
        return "break";
      };

      for (k = 0; k < 10; k++) {
        var _ret2 = _loop4();

        if (_ret2 === "break") break;
      }

      break;
  }

  var z = 3;

  (function () {
    return z;
  });
};

for (i = 0; i < 10; i++) {
  var k;

  _loop3();
}

assert.equal(j, 1);
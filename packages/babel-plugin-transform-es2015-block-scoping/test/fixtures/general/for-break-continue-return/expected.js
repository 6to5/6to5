(function () {
  var _loop2 = function (i) {
    fns.push(function () {
      return i;
    });

    if (i === 1) {
      return "continue";
    } else if (i === 2) {
      return "break";
    } else if (i === 3) {
      return {
        v: i
      };
    }
  };

  _loop: for (var i in nums) {
    var _ret = _loop2(i);

    switch (_ret) {
      case "continue":
        continue;

      case "break":
        break _loop;

      default:
        if (typeof _ret === "object") return _ret.v;
    }
  }
})();
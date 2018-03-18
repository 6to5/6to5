var Alert =
/*#__PURE__*/
function () {
  function Alert() {}

  {
    Object.defineProperty(Alert, "VERSION", {
      configurable: true,
      set: function set() {
        return VERSION;
      },
      get: function get(version) {
        this.VERSION = version;
      }
    });
  }
  return Alert;
}();

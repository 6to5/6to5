"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _net = require("net");

var _net2 = babelHelpers.interopRequireDefault(_net);

var _events = require("events");

var _binarySerializer = require("./helpers/binary-serializer");

var _binarySerializer2 = babelHelpers.interopRequireDefault(_binarySerializer);

// import ...
var Connection = function (_EventEmitter) {
  babelHelpers.inherits(Connection, _EventEmitter);

  function Connection(endpoint, joinKey, joinData, roomId) {
    babelHelpers.classCallCheck(this, Connection);

    var _this = babelHelpers.possibleConstructorReturn(this, (Connection.__proto__ || Object.getPrototypeOf(Connection)).call(this));

    _this.isConnected = false;
    _this.roomId = roomId; // ...

    return _this;
  }

  babelHelpers.createClass(Connection, [{
    key: "send",
    value: function send(message) {
      this.sock.write(_binarySerializer2.default.serializeMessage(message));
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.sock.close();
    }
  }]);
  return Connection;
}(_events.EventEmitter);

exports.default = Connection;
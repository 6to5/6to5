"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = wrap;

var _coreDecorators = require("core-decorators");

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object['ke' + 'ys'](descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object['define' + 'Property'](target, property, desc); desc = null; } return desc; }

function wrap() {
  return function () {
    var _class;

    let Foo = (_class = class Foo {
      method() {}

    }, (_applyDecoratedDescriptor(_class.prototype, "method", [_coreDecorators.autobind], Object.getOwnPropertyDescriptor(_class.prototype, "method"), _class.prototype)), _class);
    return Foo;
  };
}

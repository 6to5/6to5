var _getStatus = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("getStatus");

class Foo {
  constructor(status) {
    Object.defineProperty(this, _getStatus, {
      value: _getStatus2
    });
    this.status = status;
  }

  getCurrentStatus() {
    return babelHelpers.classPrivateFieldLooseBase(this, _getStatus)[_getStatus]();
  }

  setCurrentStatus(newStatus) {
    this.status = newStatus;
  }

  getFakeStatus(fakeStatus) {
    const fakeGetStatus = babelHelpers.classPrivateFieldLooseBase(this, _getStatus)[_getStatus];

    return function () {
      return fakeGetStatus.call({
        status: fakeStatus
      });
    };
  }

  getFakeStatusFunc() {
    return {
      status: 'fake-status',
      getFakeStatus: babelHelpers.classPrivateFieldLooseBase(this, _getStatus)[_getStatus]
    };
  }

}

function _getStatus2() {
  return this.status;
}

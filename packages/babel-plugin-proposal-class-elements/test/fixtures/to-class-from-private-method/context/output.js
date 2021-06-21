var _getStatus = /*#__PURE__*/new WeakSet();

class Foo {
  constructor(status) {
    _getStatus.add(this);

    this.status = status;
  }

  getCurrentStatus() {
    return babelHelpers.classPrivateMethodGet(this, _getStatus, _getStatus2).call(this);
  }

  setCurrentStatus(newStatus) {
    this.status = newStatus;
  }

  getFakeStatus(fakeStatus) {
    const fakeGetStatus = babelHelpers.classPrivateMethodGet(this, _getStatus, _getStatus2);
    return function () {
      return fakeGetStatus.call({
        status: fakeStatus
      });
    };
  }

  getFakeStatusFunc() {
    return {
      status: 'fake-status',
      getFakeStatus: babelHelpers.classPrivateMethodGet(this, _getStatus, _getStatus2)
    };
  }

}

function _getStatus2() {
  return this.status;
}

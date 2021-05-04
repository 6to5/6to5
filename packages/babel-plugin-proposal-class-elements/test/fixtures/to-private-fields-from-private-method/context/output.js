var _getStatus;

class Foo {
  #getStatus = _getStatus || (_getStatus = function () {
    return this.status;
  });

  constructor(status) {
    this.status = status;
  }

  getCurrentStatus() {
    return this.#getStatus();
  }

  setCurrentStatus(newStatus) {
    this.status = newStatus;
  }

  getFakeStatus(fakeStatus) {
    const fakeGetStatus = this.#getStatus;
    return function () {
      return fakeGetStatus.call({
        status: fakeStatus
      });
    };
  }

  getFakeStatusFunc() {
    return {
      status: 'fake-status',
      getFakeStatus: this.#getStatus
    };
  }

}

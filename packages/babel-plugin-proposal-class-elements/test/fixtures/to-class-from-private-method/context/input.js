class Foo {
  constructor(status) {
    this.status = status;
  }

  #getStatus() {
    return this.status;
  }

  getCurrentStatus() {
    return this.#getStatus();
  }

  setCurrentStatus(newStatus) {
    this.status = newStatus;
  }

  getFakeStatus(fakeStatus) {
    const fakeGetStatus = this.#getStatus;
    return function() {
      return fakeGetStatus.call({ status: fakeStatus });
    };
  }

  getFakeStatusFunc() {
    return {
      status: 'fake-status',
      getFakeStatus: this.#getStatus,
    };
  }
}
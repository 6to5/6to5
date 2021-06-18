class Foo {
    constructor(status) {
      this.status = status;
      expect(() => this.#getStatus = null).toThrow(TypeError);
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
      const getStatus = this.#getStatus;
      return function () {
        return getStatus.call({ status: fakeStatus });
      };
    }

    getFakeStatusFunc() {
      return {
        status: 'fake-status',
        getFakeStatus: this.#getStatus,
      };
    }
  }

  const f = new Foo('inactive');
  expect(f.getCurrentStatus()).toBe('inactive');

  f.setCurrentStatus('new-status');
  expect(f.getCurrentStatus()).toBe('new-status');

  expect(f.getFakeStatus('fake')()).toBe('fake');
  expect(f.getFakeStatusFunc().getFakeStatus()).toBe('fake-status');

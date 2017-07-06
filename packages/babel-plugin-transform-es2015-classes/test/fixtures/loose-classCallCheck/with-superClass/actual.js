class B {}

class A extends B {
  constructor(track) {
    if (track !== undefined) super(track);
    else super();
  }
}

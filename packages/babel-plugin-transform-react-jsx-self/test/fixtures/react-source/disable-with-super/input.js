class A { }

class B extends A {
  constructor() {
    <sometag1 />;
    super(<sometag2 />);
    <sometag3 />;
  }
}

class C {
  constructor() {
    <sometag4 />;
    class D extends A {
      constructor() {
        super();
      }
    }
    const E = class extends A {
      constructor() {
        super();
      }
    };
  }
}

class E extends A {
  constructor() {
    this.x = () => <sometag5 />;
    this.y = function () {
      return <sometag6 />;
    };
    function z() {
      return <sometag7 />;
    }
    { <sometag8 /> }
    super();
  }
}

class F {
  constructor() {
    <sometag9 />
  }
}

class G extends A {
  constructor() {
    return <sometag10 />;
  }
}

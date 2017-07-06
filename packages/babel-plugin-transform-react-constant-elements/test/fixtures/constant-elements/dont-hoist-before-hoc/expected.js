import React from "react";

const HOC = component => component;

const Parent = ({}) => _ref;

export default Parent;

var _ref2 = <div className="child">
    ChildTextContent
  </div>;

let Child = () => _ref2;

Child = HOC(Child);

var _ref = <div className="parent">
    <Child />
  </div>;
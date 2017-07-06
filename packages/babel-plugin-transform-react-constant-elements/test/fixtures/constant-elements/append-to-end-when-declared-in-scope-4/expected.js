var _ref = <div>child</div>;

var _ref3 = <p>Parent</p>;

(function () {
  const AppItem = () => {
    return _ref;
  };

  var _ref2 = <div>
          {_ref3}
          <AppItem />
        </div>;

  class App extends React.Component {
    render() {
      return _ref2;
    }

  }
});
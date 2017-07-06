var _ref = <div>child</div>;

const AppItem = () => {
  return _ref;
};

var _ref2 = <div>
        <p>Parent</p>
        <AppItem />
      </div>;

export default class App extends React.Component {
  render() {
    return _ref2;
  }

}